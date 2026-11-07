#!/usr/bin/env python3
"""Descarga recursos CC0 de Poly Haven según prueba/assets.json (lo corre GitHub Actions).
Guarda en prueba/assets/{tex,hdri,models}/ y escribe prueba/assets/_catalogo.json con la lista de modelos,
texturas y cielos disponibles (nombre, categorías) para elegir los siguientes."""
import json, os, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'prueba', 'assets')
UA = {'User-Agent': 'raices-de-niebla-assets/1.0'}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
        return r.read()


def save(url, path):
    path = os.path.join(OUT, path)
    if os.path.exists(path):
        return 0
    os.makedirs(os.path.dirname(path), exist_ok=True)
    data = get(url)
    open(path, 'wb').write(data)
    return len(data)


def main():
    cfg = json.load(open(os.path.join(ROOT, 'prueba', 'assets.json')))
    log, total = [], 0
    cat = {}
    for t in ('models', 'textures', 'hdris'):
        d = json.loads(get('https://api.polyhaven.com/assets?t=' + t))
        cat[t] = {k: {'name': v.get('name'), 'categories': v.get('categories'), 'tags': v.get('tags', [])[:8]} for k, v in d.items()}
    os.makedirs(OUT, exist_ok=True)
    json.dump(cat, open(os.path.join(OUT, '_catalogo.json'), 'w'), ensure_ascii=False, indent=0)

    def files(i):
        return json.loads(get('https://api.polyhaven.com/files/' + i))

    T = cfg['textures']
    for i in T['ids']:
        try:
            f = files(i)
            for m in T['maps']:
                res = T['res'] if m != 'Rough' else '1k'
                u = f[m][res]['jpg']['url']
                total += save(u, 'tex/%s/%s.jpg' % (i, m))
            log.append('textura ' + i)
        except Exception as e:
            log.append('FALLA textura %s: %s' % (i, e))
    H = cfg['hdris']
    for i in H['ids']:
        try:
            total += save(files(i)['hdri'][H['res']]['hdr']['url'], 'hdri/%s.hdr' % i)
            log.append('cielo ' + i)
        except Exception as e:
            log.append('FALLA cielo %s: %s' % (i, e))
    M = cfg['models']
    for i in M['ids']:
        try:
            g = files(i)['gltf'][M['res']]['gltf']
            total += save(g['url'], 'models/%s/%s' % (i, os.path.basename(g['url'])))
            for p, inc in g.get('include', {}).items():
                total += save(inc['url'], 'models/%s/%s' % (i, p))
            log.append('modelo ' + i)
        except Exception as e:
            log.append('FALLA modelo %s: %s' % (i, e))
    log.append('descargados %.1f MB' % (total / 1e6))
    open(os.path.join(OUT, '_log.txt'), 'w').write('\n'.join(log) + '\n')
    print('\n'.join(log))


if __name__ == '__main__':
    main()
