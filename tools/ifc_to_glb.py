#!/usr/bin/env python3
"""تبدیل خروجی IFC رویت به فایل GLB سبک برای نمایش روی سایت (بدون نیاز به Blender).

آماده‌سازی (یک بار):
    pip install ifcopenshell numpy

اجرا:
    python tools/ifc_to_glb.py mehregan.ifc mehregan.glb

گزینه‌های مفید:
    --budget 250000     حداکثر تعداد مثلث (پیش‌فرض ۲۵۰ هزار؛ برای موبایل مناسب است)
    --min-size 0.15     حذف اجزای ریزتر از این اندازه (متر) مثل پیچ و مهره
    --drop IfcRailing   دستهٔ اضافه برای حذف (چندبار قابل تکرار)
    --keep IfcSpace     دسته‌ای که به‌صورت پیش‌فرض حذف می‌شود ولی می‌خواهید بماند
    --report            فقط گزارش اندازهٔ هر دسته را چاپ کن و فایل نساز

تست بدون IFC (برای اطمینان از سالم بودن ابزار):
    python tools/ifc_to_glb.py --demo demo.glb

خروجی: یک GLB که اجزای مدل در سه «لایه» جدا هستند (structure، envelope، details)
تا بعداً روی سایت دکمهٔ روشن/خاموش کردن لایه‌ها ساخته شود.
"""
import argparse, json, os, struct, sys, time

try:
    import numpy as np
except ImportError:
    sys.exit('numpy نصب نیست. اجرا کنید:  pip install numpy')

# ---------------------------------------------------------------------------
# تنظیمات قابل ویرایش
# ---------------------------------------------------------------------------
# دسته‌هایی از IFC که روی سایت لازم نیستند و حجم را زیاد می‌کنند (با --keep برگردانده می‌شوند)
DROP_DEFAULT = ['IfcSpace', 'IfcOpeningElement', 'IfcFurnishingElement', 'IfcDistributionElement',
                'IfcAnnotation', 'IfcGrid', 'IfcVirtualElement', 'IfcReinforcingElement', 'IfcTransportElement']
# گروه‌بندی لایه‌ها: اولین گروهی که دسته با آن جور شد انتخاب می‌شود
LAYERS = [
    ('structure', ['IfcColumn', 'IfcBeam', 'IfcMember', 'IfcSlab', 'IfcFooting', 'IfcPile']),
    ('envelope',  ['IfcWall', 'IfcCurtainWall', 'IfcWindow', 'IfcDoor', 'IfcRoof', 'IfcPlate', 'IfcCovering']),
]
DEFAULT_LAYER = 'details'     # بقیه: پله، نرده، اجزای متفرقه
DEFAULT_COLOR = (0.72, 0.74, 0.78, 1.0)
MAX_CELL = 0.4                # بزرگ‌ترین اندازهٔ سلول ساده‌سازی (متر)

# ---------------------------------------------------------------------------
# ساده‌سازی و کار با مش (numpy)
# ---------------------------------------------------------------------------
def cluster_simplify(v, f, cell):
    """ادغام رأس‌هایی که در یک سلول cell×cell×cell (متر) هستند؛ مثلث‌های تبهگن حذف می‌شوند."""
    if cell <= 0 or len(f) == 0:
        return v, f
    key = np.round(v / cell).astype(np.int64)
    _, inv, cnt = np.unique(key, axis=0, return_inverse=True, return_counts=True)
    inv = inv.reshape(-1)
    nv = np.zeros((len(cnt), 3), np.float64)
    for k in range(3):
        nv[:, k] = np.bincount(inv, weights=v[:, k], minlength=len(cnt)) / cnt
    nf = inv[f]
    ok = (nf[:, 0] != nf[:, 1]) & (nf[:, 1] != nf[:, 2]) & (nf[:, 0] != nf[:, 2])
    nf = nf[ok]
    used = np.unique(nf)
    remap = -np.ones(len(nv), np.int64); remap[used] = np.arange(len(used))
    return nv[used], remap[nf]


def count_tris(groups):
    return sum(len(f) for g in groups.values() for (_, v, f) in g)


def simplify_all(groups, budget, log=print):
    """اگر تعداد مثلث‌ها از budget بیشتر بود، اندازهٔ سلول را آن‌قدر بزرگ می‌کند تا به بودجه برسد."""
    total = count_tris(groups)
    log(f'  مثلث‌ها: {total:,} (بودجه: {budget:,})')
    if total <= budget:
        return groups
    cell = 0.02
    while cell <= MAX_CELL:
        out = {k: [(m, *cluster_simplify(v, f, cell)) for (m, v, f) in parts] for k, parts in groups.items()}
        t = count_tris(out)
        log(f'  سلول {cell*100:.0f} سانتی‌متر ← {t:,} مثلث')
        if t <= budget:
            return out
        cell *= 1.5
    log(f'  هشدار: با سلول {MAX_CELL} متر هم به بودجه نرسید؛ مدل در Revit ساده‌تر شود (اجزای ریز را مخفی کنید).')
    return out

# ---------------------------------------------------------------------------
# نوشتن GLB
# ---------------------------------------------------------------------------
def _pad(b, ch=b'\x00'):
    return b + ch * ((4 - len(b) % 4) % 4)


def write_glb(path, groups):
    """groups: {نام لایه: [(مواد=(r,g,b,a)، رأس‌ها Nx3، مثلث‌ها Mx3), ...]}"""
    blob = bytearray(); views = []; accs = []; mats = []; matkey = {}; meshes = []; nodes = []

    def add_view(data, target):
        off = len(blob); blob.extend(data); blob.extend(b'\x00' * ((4 - len(data) % 4) % 4))
        views.append({'buffer': 0, 'byteOffset': off, 'byteLength': len(data), 'target': target}); return len(views) - 1

    def mat_index(c):
        c = tuple(round(float(x), 3) for x in c)
        if c not in matkey:
            m = {'pbrMetallicRoughness': {'baseColorFactor': list(c), 'metallicFactor': 0.0, 'roughnessFactor': 0.85}}
            if c[3] < 0.999: m['alphaMode'] = 'BLEND'; m['doubleSided'] = True
            matkey[c] = len(mats); mats.append(m)
        return matkey[c]

    for name, parts in groups.items():
        prims = []
        for (c, v, f) in parts:
            if len(f) == 0: continue
            v32 = np.ascontiguousarray(v, np.float32); f32 = np.ascontiguousarray(f, np.uint32)
            va = add_view(v32.tobytes(), 34962); ia = add_view(f32.tobytes(), 34963)
            accs.append({'bufferView': va, 'componentType': 5126, 'count': int(len(v32)), 'type': 'VEC3',
                         'min': [float(x) for x in v32.min(0)], 'max': [float(x) for x in v32.max(0)]})
            accs.append({'bufferView': ia, 'componentType': 5125, 'count': int(f32.size), 'type': 'SCALAR'})
            prims.append({'attributes': {'POSITION': len(accs) - 2}, 'indices': len(accs) - 1, 'material': mat_index(c)})
        if not prims: continue
        meshes.append({'name': name, 'primitives': prims})
        nodes.append({'name': 'layer:' + name, 'mesh': len(meshes) - 1, 'extras': {'layer': name}})
    if not nodes:
        raise SystemExit('هیچ هندسه‌ای باقی نماند؛ فیلترها را بررسی کنید.')
    gltf = {'asset': {'version': '2.0', 'generator': 'ISB ifc_to_glb'}, 'scene': 0, 'scenes': [{'nodes': list(range(len(nodes)))}],
            'nodes': nodes, 'meshes': meshes, 'materials': mats, 'accessors': accs, 'bufferViews': views,
            'buffers': [{'byteLength': len(blob)}]}
    js = _pad(json.dumps(gltf, separators=(',', ':')).encode('utf-8'), b' ')
    total = 12 + 8 + len(js) + 8 + len(blob)
    with open(path, 'wb') as fh:
        fh.write(struct.pack('<III', 0x46546C67, 2, total))
        fh.write(struct.pack('<II', len(js), 0x4E4F534A)); fh.write(js)
        fh.write(struct.pack('<II', len(blob), 0x004E4942)); fh.write(bytes(blob))
    return total

# ---------------------------------------------------------------------------
# ورودی: خواندن IFC (نیازمند ifcopenshell)
# ---------------------------------------------------------------------------
def layer_of(product):
    for name, classes in LAYERS:
        if any(product.is_a(c) for c in classes):
            return name
    return DEFAULT_LAYER


def read_ifc(path, drop, min_size, log=print):
    try:
        import ifcopenshell, ifcopenshell.geom
    except ImportError:
        sys.exit('ifcopenshell نصب نیست. اجرا کنید:  pip install ifcopenshell')
    log(f'خواندن {os.path.basename(path)} ({os.path.getsize(path)/1e6:.0f} مگابایت)…')
    f = ifcopenshell.open(path)
    s = ifcopenshell.geom.settings()
    for call in (lambda: s.set(s.USE_WORLD_COORDS, True), lambda: s.set('use-world-coords', True), lambda: s.set('USE_WORLD_COORDS', True)):
        try: call(); break
        except Exception: continue
    else:
        sys.exit('تنظیم مختصات جهانی در این نسخهٔ ifcopenshell ممکن نشد؛ نسخهٔ 0.7 یا 0.8 را نصب کنید.')
    try: threads = os.cpu_count() or 2; it = ifcopenshell.geom.iterator(s, f, threads)
    except Exception: it = ifcopenshell.geom.iterator(s, f)
    raw = {}      # (لایه, رنگ) ← فهرست (رأس، مثلث)
    seen = skipped = tiny = 0
    t0 = time.time()
    if it.initialize():
        while True:
            sh = it.get(); seen += 1
            try: prod = f.by_id(sh.id)
            except Exception: prod = None
            if prod is not None and any(prod.is_a(c) for c in drop):
                skipped += 1
            else:
                g = sh.geometry
                v = np.array(g.verts, np.float64).reshape(-1, 3); fc = np.array(g.faces, np.int64).reshape(-1, 3)
                if len(fc):
                    diag = float(np.linalg.norm(v.max(0) - v.min(0)))
                    if diag < min_size: tiny += 1
                    else:
                        lay = layer_of(prod) if prod is not None else DEFAULT_LAYER
                        mids = np.array(g.material_ids, np.int64) if len(g.material_ids) else np.full(len(fc), -1)
                        colors = []
                        for m in g.materials:
                            try:
                                d = m.diffuse; a = 1.0 - float(getattr(m, 'transparency', 0) or 0)
                                colors.append((float(d.r()), float(d.g()), float(d.b()), a))
                            except Exception:
                                try: colors.append((float(m.diffuse[0]), float(m.diffuse[1]), float(m.diffuse[2]), 1.0))
                                except Exception: colors.append(DEFAULT_COLOR)
                        for mi in np.unique(mids):
                            col = colors[mi] if 0 <= mi < len(colors) else DEFAULT_COLOR
                            raw.setdefault((lay, tuple(round(x, 3) for x in col)), []).append((v, fc[mids == mi]))
            if seen % 2000 == 0: log(f'  {seen:,} عنصر… ({time.time()-t0:.0f}s)')
            if not it.next(): break
    log(f'عناصر: {seen:,} | حذف‌شده با فیلتر: {skipped:,} | ریز: {tiny:,}')
    # ادغام همهٔ تکه‌های یک (لایه، رنگ) و تبدیل محور Z-up (IFC) به Y-up (وب)
    groups = {}
    allv = []
    for (lay, col), items in raw.items():
        vs, fs, off = [], [], 0
        for v, fc in items:
            vs.append(v); fs.append(fc + off); off += len(v)
        V = np.concatenate(vs); F = np.concatenate(fs)
        V = np.stack([V[:, 0], V[:, 2], -V[:, 1]], 1)
        used = np.unique(F); remap = -np.ones(len(V), np.int64); remap[used] = np.arange(len(used))
        V, F = V[used], remap[F]
        groups.setdefault(lay, []).append((col, V, F)); allv.append(V)
    return center(groups, allv)


def center(groups, allv):
    """مدل را وسط (X و Z) می‌گذارد و کف آن را روی Y=0 می‌نشاند."""
    if not allv: return groups
    A = np.concatenate(allv); lo, hi = A.min(0), A.max(0)
    shift = np.array([(lo[0] + hi[0]) / 2, lo[1], (lo[2] + hi[2]) / 2])
    return {k: [(c, v - shift, f) for (c, v, f) in parts] for k, parts in groups.items()}

# ---------------------------------------------------------------------------
# نمونهٔ آزمایشی (بدون IFC)
# ---------------------------------------------------------------------------
def box(x0, y0, z0, x1, y1, z1):
    v = np.array([[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]], np.float64)
    f = np.array([[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[2,3,7],[2,7,6],[1,2,6],[1,6,5],[3,0,4],[3,4,7]], np.int64)
    return v, f


def merge(parts):
    vs, fs, off = [], [], 0
    for v, f in parts: vs.append(v); fs.append(f + off); off += len(v)
    return np.concatenate(vs), np.concatenate(fs)


def demo_groups(floors=6):
    """یک ساختمان مسکونی ساده: ستون‌ها و سقف‌ها (structure)، دیوار و شیشه (envelope)، نرده بالکن (details)."""
    W, D, H = 18.0, 12.0, 3.1
    struct, wall, glass, rail = [], [], [], []
    struct.append(box(-W/2-1, -0.6, -D/2-1, W/2+1, 0, D/2+1))
    for i in range(floors):
        y = i * H
        struct.append(box(-W/2, y, -D/2, W/2, y + 0.25, D/2))
        for cx in (-W/2+0.3, 0, W/2-0.3):
            for cz in (-D/2+0.3, D/2-0.3): struct.append(box(cx-0.25, y+0.25, cz-0.25, cx+0.25, y+H, cz+0.25))
        wall.append(box(-W/2, y+0.25, -D/2, W/2, y+H, -D/2+0.25))                 # دیوار پشت
        wall.append(box(-W/2, y+0.25, -D/2, -W/2+0.25, y+H, D/2)); wall.append(box(W/2-0.25, y+0.25, -D/2, W/2, y+H, D/2))
        for k in range(5): glass.append(box(-W/2+1.2+k*3.3, y+0.9, D/2-0.08, -W/2+3.6+k*3.3, y+2.6, D/2-0.04))   # شیشه نما
        wall.append(box(-W/2, y+0.25, D/2-0.25, W/2, y+0.9, D/2)); wall.append(box(-W/2, y+2.6, D/2-0.25, W/2, y+H, D/2))
        rail.append(box(-W/2, y+0.25, D/2, W/2, y+1.2, D/2+0.04))
    struct.append(box(-W/2, floors*H, -D/2, W/2, floors*H+0.3, D/2))
    return {'structure': [((0.62, 0.64, 0.68, 1.0),) + merge(struct)], 'envelope': [((0.9, 0.88, 0.82, 1.0),) + merge(wall), ((0.35, 0.6, 0.8, 0.45),) + merge(glass)],
            'details': [((0.2, 0.2, 0.22, 1.0),) + merge(rail)]}

# ---------------------------------------------------------------------------
def report(groups, label):
    print(f'\n— {label} —')
    for k, parts in groups.items():
        t = sum(len(f) for _, _, f in parts); v = sum(len(v) for _, v, _ in parts)
        print(f'  {k:10s} {t:>10,} مثلث   {v:>10,} رأس')
    print(f'  {"جمع":10s} {count_tris(groups):>10,} مثلث')


def main():
    ap = argparse.ArgumentParser(description='IFC → GLB سبک برای سایت ISB')
    ap.add_argument('input', nargs='?'); ap.add_argument('output', nargs='?')
    ap.add_argument('--budget', type=int, default=250000); ap.add_argument('--min-size', type=float, default=0.15)
    ap.add_argument('--drop', action='append', default=[]); ap.add_argument('--keep', action='append', default=[])
    ap.add_argument('--report', action='store_true'); ap.add_argument('--demo', metavar='OUT.glb')
    a = ap.parse_args()
    if a.demo:
        g = center(demo_groups(), [v for ps in demo_groups().values() for _, v, _ in ps])
        n = write_glb(a.demo, g); report(g, 'نمونهٔ آزمایشی'); print(f'\n✓ {a.demo} ساخته شد ({n/1e6:.2f} مگابایت)'); return
    if not a.input or not a.output and not a.report:
        ap.error('مسیر ورودی IFC و خروجی GLB را بدهید، مثال: python tools/ifc_to_glb.py model.ifc model.glb')
    if not os.path.isfile(a.input):
        sys.exit(f'فایل IFC پیدا نشد: {a.input}\n'
                 f'پوشهٔ فعلی: {os.getcwd()}\n'
                 'یا فایل .ifc را داخل همین پوشه بگذارید، یا مسیر کامل آن را بدهید، مثال:\n'
                 '  python tools/ifc_to_glb.py "C:\\Users\\Lenovo\\Desktop\\mehregan.ifc" mehregan.glb')
    drop = [d for d in DROP_DEFAULT if d not in a.keep] + a.drop
    g = read_ifc(a.input, drop, a.min_size); report(g, 'پس از فیلتر')
    if a.report: return
    g = simplify_all(g, a.budget); report(g, 'پس از ساده‌سازی')
    n = write_glb(a.output, g)
    print(f'\n✓ {a.output} ساخته شد: {n/1e6:.2f} مگابایت')
    if n > 10e6: print('  هشدار: بیش از ۱۰ مگابایت است. --budget را کمتر کنید یا در Revit اجزای ریز را مخفی کنید.')


if __name__ == '__main__':
    main()
