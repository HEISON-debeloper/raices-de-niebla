#!/usr/bin/env python3
"""Convierte una versión del juego (el HTML publicado en Claude) en el index.html del repositorio.

Uso:  python3 tools/desde-artefacto.py versiones/raices-de-niebla-vX.Y.Z.html

Hace tres cosas:
1. Copia el archivo a index.html cambiando las 4 líneas que cargan Three.js r128 desde CDN por la copia local
   de vendor/ (con el CDN como respaldo). Así el juego funciona sin internet dentro del APK y carga más rápido en la web.
2. Regenera CHANGELOG.md desde la constante CHANGELOG del juego (necesita node).
3. Verifica que los 5 bloques <script> sean JavaScript válido (necesita node).
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CDN = [
    '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>',
    '<script>if(!window.THREE)document.write(\'<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\\/script>\')</script>',
    '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/objects/Sky.js"></script>',
    '<script>if(window.THREE&&!THREE.Sky)document.write(\'<script src="https://unpkg.com/three@0.128.0/examples/js/objects/Sky.js"><\\/script>\')</script>',
]
LOCAL = [
    '<script src="vendor/three.min.js"></script>',
    '<script>if(!window.THREE)document.write(\'<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"><\\/script>\')</script>',
    '<script src="vendor/Sky.js"></script>',
    '<script>if(window.THREE&&!THREE.Sky)document.write(\'<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/objects/Sky.js"><\\/script>\')</script>',
]


def main(src):
    s = open(src, encoding='utf-8').read()
    for a, b in zip(CDN, LOCAL):
        if s.count(a) != 1:
            sys.exit('No encontré exactamente una vez la línea: ' + a[:80])
        s = s.replace(a, b)
    m = re.search(r"const VERSION='([^']+)'", s)
    if not m:
        sys.exit('No encontré const VERSION en el archivo')
    ver = m.group(1)
    open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(s)

    js = r"""
const fs=require('fs');const s=fs.readFileSync(process.argv[1],'utf8');
const sc=[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);let bad=0;
for(const c of sc){try{new Function(c)}catch(e){bad++;console.error('JS inválido:',e.message)}}
const i=s.indexOf('const CHANGELOG=[');let d=0,j=i+'const CHANGELOG='.length;
for(;j<s.length;j++){const c=s[j];if(c==='['||c==='{'||c==='(')d++;else if(c===']'||c==='}'||c===')'){d--;if(d===0)break}else if(c==="'"||c==='"'||c==='`'){const q=c;j++;while(j<s.length&&s[j]!==q){if(s[j]==='\\')j++;j++}}}
const CL=Function('return '+s.slice(i+'const CHANGELOG='.length,j+1))();
console.log(JSON.stringify({bad,n:sc.length,cl:CL}));
"""
    out = subprocess.run(['node', '-e', js, os.path.join(ROOT, 'index.html')], capture_output=True, text=True)
    if out.returncode != 0:
        sys.exit(out.stderr)
    r = json.loads(out.stdout)
    if r['bad']:
        sys.exit('%d bloques de script con errores de sintaxis' % r['bad'])
    lines = ['# Registro de cambios', '', 'Generado desde la constante `CHANGELOG` del juego con `tools/desde-artefacto.py`.', '']
    for v in r['cl']:
        lines.append('## %s · %s' % (v[0], v[1]))
        lines.append('')
        lines += ['- ' + x for x in v[2]]
        lines.append('')
    open(os.path.join(ROOT, 'CHANGELOG.md'), 'w', encoding='utf-8').write('\n'.join(lines))
    print('index.html = versión %s · %d scripts válidos · %d versiones en CHANGELOG.md' % (ver, r['n'], len(r['cl'])))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
