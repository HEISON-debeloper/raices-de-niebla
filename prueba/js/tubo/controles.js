// Controles del tubo. PC: clic para mirar con el ratón, WASD o flechas, Shift corre, Espacio salta, F vuela.
// Celular: mitad izquierda = palanca, mitad derecha = arrastrar para mirar, ▲ salta / sube, ▼ baja.
// Física del cilindro que gira (lo que da la "gravedad"): el peso es la fuerza centrífuga, g(r) = g0·r/R, así que al
// acercarse al eje se pesa menos y en el eje se flota; y hay efecto Coriolis: lo que cae o salta se desvía de lado.
// Coordenadas planas (mundo.js): x arco (sin bordes: da la vuelta), y altura hacia el eje, z a lo largo (infinito).
import * as THREE from 'three';
import { R, envolver } from './mundo.js';

const G0 = 9.81, OMEGA = Math.sqrt(G0 / R), ARRASTRE = 0.003, OJOS = 1.65;

/** terr: { heightAt(x,z), waterAt(x,z) } */
export function crearControles(cam, dom, terr) {
  const st = { yaw: 0, pitch: -0.05, keys: new Set(), joy: null, look: null, mx: 0, mz: 0, run: false, activo: true, volar: false, vel: 60, sube: 0,
    nadando: false, bajoAgua: false, aire: false, v: new THREE.Vector3(), pies: 0, saltoListo: true, agua: 0, g: G0 };
  const e = new THREE.Euler(0, 0, 0, 'YXZ');
  addEventListener('keydown', ev => { st.keys.add(ev.code); if (ev.code.startsWith('Shift')) st.run = true; });
  addEventListener('keyup', ev => { st.keys.delete(ev.code); if (ev.code.startsWith('Shift')) st.run = false; });
  dom.addEventListener('click', () => { if (matchMedia('(pointer: fine)').matches && dom.requestPointerLock) dom.requestPointerLock(); });
  addEventListener('mousemove', ev => { if (document.pointerLockElement === dom) { st.yaw -= ev.movementX * 0.0022; st.pitch -= ev.movementY * 0.0022; } });
  const joyEl = document.getElementById('joy'), knob = joyEl && joyEl.firstElementChild;
  dom.addEventListener('touchstart', ev => {
    for (const t of ev.changedTouches) {
      if (t.clientX < innerWidth * 0.45 && !st.joy) { st.joy = { id: t.identifier, x: t.clientX, y: t.clientY }; if (joyEl) { joyEl.style.display = 'block'; joyEl.style.left = t.clientX + 'px'; joyEl.style.top = t.clientY + 'px'; } }
      else if (!st.look) st.look = { id: t.identifier, x: t.clientX, y: t.clientY };
    }
    ev.preventDefault();
  }, { passive: false });
  dom.addEventListener('touchmove', ev => {
    for (const t of ev.changedTouches) {
      if (st.joy && t.identifier === st.joy.id) {
        let dx = (t.clientX - st.joy.x) / 50, dy = (t.clientY - st.joy.y) / 50; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
        st.mx = dx; st.mz = dy; st.run = l > 1.6; if (knob) knob.style.transform = `translate(${dx * 40}px,${dy * 40}px)`;
      } else if (st.look && t.identifier === st.look.id) {
        st.yaw -= (t.clientX - st.look.x) * 0.0045; st.pitch -= (t.clientY - st.look.y) * 0.0045; st.look.x = t.clientX; st.look.y = t.clientY;
      }
    }
    ev.preventDefault();
  }, { passive: false });
  const fin = ev => { for (const t of ev.changedTouches) { if (st.joy && t.identifier === st.joy.id) { st.joy = null; st.mx = st.mz = 0; st.run = false; if (joyEl) joyEl.style.display = 'none'; } if (st.look && t.identifier === st.look.id) st.look = null; } };
  dom.addEventListener('touchend', fin); dom.addEventListener('touchcancel', fin);

  const p = cam.position;
  function update(dt) {
    if (!st.activo) return;
    st.pitch = Math.max(-1.35, Math.min(1.35, st.pitch));
    let fx = st.mx, fz = st.mz;
    if (st.keys.has('KeyW') || st.keys.has('ArrowUp')) fz -= 1;
    if (st.keys.has('KeyS') || st.keys.has('ArrowDown')) fz += 1;
    if (st.keys.has('KeyA') || st.keys.has('ArrowLeft')) fx -= 1;
    if (st.keys.has('KeyD') || st.keys.has('ArrowRight')) fx += 1;
    const l = Math.hypot(fx, fz); if (l > 1) { fx /= l; fz /= l; }
    const s = Math.sin(st.yaw), c = Math.cos(st.yaw);
    let up = st.sube; if (st.keys.has('Space') || st.keys.has('KeyE')) up += 1; if (st.keys.has('KeyQ') || st.keys.has('KeyC')) up -= 1;
    const suelo = terr.heightAt(p.x, p.z), agua = terr.waterAt(p.x, p.z); st.agua = agua;
    if (st.volar) {
      // vuelo libre: avanza hacia donde mira (incluida la inclinación); ▲/Espacio sube, ▼/Q baja; Shift ×3
      const v = st.vel * (st.run && !st.joy ? 3 : 1) * dt, cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
      p.x += (fx * c + fz * s * cp) * v; p.z += (-fx * s + fz * c * cp) * v; p.y += (-fz * sp + up * 0.6) * v;
      p.y = Math.min(R - 10, Math.max(p.y, Math.max(terr.heightAt(p.x, p.z), terr.waterAt(p.x, p.z)) + 1.5));
      st.pies = p.y - OJOS; st.v.set(0, 0, 0); st.aire = false; st.nadando = false;
    } else {
      st.nadando = suelo + OJOS < agua - 0.15 && st.pies + 0.3 < agua;   // el agua tapa más que los ojos
      if (st.nadando) {
        st.aire = false; st.v.set(0, 0, 0);
        const v = (st.run ? 3.2 : 2.2) * dt, cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
        p.x += (fx * c + fz * s * cp) * v; p.z += (-fx * s + fz * c * cp) * v;
        let y = p.y + (-fz * sp + up * 0.8) * v + (fz === 0 && up === 0 ? 0.6 * dt : 0);   // quieto, sube despacio a flotar
        const f2 = terr.heightAt(p.x, p.z), a2 = terr.waterAt(p.x, p.z);
        y = Math.min(a2 + 0.12, Math.max(f2 + 0.5, y)); p.y = y; st.pies = y - OJOS;
      } else if (st.aire) {
        // caída libre en el marco que gira: centrífuga g0·r/R hacia afuera, Coriolis y arrastre del aire
        const r = R - p.y, v = st.v;
        st.g = G0 * r / R;
        const ax = 2 * OMEGA * v.y - ARRASTRE * v.x * Math.abs(v.x), ay = -st.g - 2 * OMEGA * v.x - ARRASTRE * v.y * Math.abs(v.y), az = -ARRASTRE * v.z * Math.abs(v.z);
        v.x += ax * dt; v.y += ay * dt; v.z += az * dt;
        p.x += v.x * dt; p.z += v.z * dt; st.pies += v.y * dt;
        const h2 = terr.heightAt(p.x, p.z), a2 = terr.waterAt(p.x, p.z);
        if (st.pies <= h2) { st.pies = h2; st.aire = false; st.golpe = -v.y; v.set(0, 0, 0); }   // aterriza (golpe = velocidad de impacto, para la salud)
        else if (st.pies + OJOS < a2 - 0.3 && h2 + OJOS < a2 - 0.15) { st.aire = false; v.set(0, 0, 0); st.nadando = true; }   // cae al agua
        p.y = st.pies + OJOS;
      } else {
        // caminar: pisa el suelo; un escalón de más de 60 cm bloquea; un desnivel hacia abajo de más de 50 cm = caer
        const v = (st.run ? 9 : 4.2) * dt, nx = p.x + (fx * c + fz * s) * v, nz = p.z + (-fx * s + fz * c) * v;
        const h2 = terr.heightAt(nx, nz);
        if (h2 <= st.pies + 0.6) {
          p.x = nx; p.z = nz;
          if (h2 < st.pies - 0.5) { st.aire = true; st.v.set((fx * c + fz * s) * v / Math.max(dt, 1e-3), 0, (-fx * s + fz * c) * v / Math.max(dt, 1e-3)); }
          else st.pies = h2;
        }
        if (up > 0 && st.saltoListo && !st.aire) { st.aire = true; st.v.set((fx * c + fz * s) * (st.run ? 9 : 4.2), 4.2, (-fx * s + fz * c) * (st.run ? 9 : 4.2)); st.saltoListo = false; }
        if (up <= 0) st.saltoListo = true;
        // en agua poco profunda se camina por el fondo; hundido hasta el pecho ya se nada (arriba)
        p.y = st.pies + OJOS;
      }
    }
    p.x = envolver(p.x);   // una vuelta completa al tubo = mismo lugar
    st.bajoAgua = p.y < st.agua - 0.02;
    e.set(st.pitch, st.yaw, 0); cam.quaternion.setFromEuler(e);
  }
  function poner(x, y, z) { p.set(x, y, z); st.pies = y - OJOS; st.v.set(0, 0, 0); st.aire = false; }
  /** Al apagar el vuelo: queda en el aire y cae. */
  function soltar() { st.pies = p.y - OJOS; st.v.set(0, 0, 0); st.aire = true; st.nadando = false; }
  return { st, update, poner, soltar, mirarA(x, y, z) { const d = new THREE.Vector3(x, y, z).sub(cam.position); st.yaw = Math.atan2(-d.x, -d.z); st.pitch = Math.atan2(d.y, Math.hypot(d.x, d.z)); } };
}
