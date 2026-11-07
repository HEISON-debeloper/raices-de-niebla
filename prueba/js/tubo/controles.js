// Tubo: sin bordes (x da la vuelta, z es infinito); volando no se pasa de 120 m antes del eje.
// Caminar en primera persona. PC: clic para mirar con el ratón, WASD o flechas, Shift corre.
// Celular: mitad izquierda = palanca para caminar, mitad derecha = arrastrar para mirar.
import * as THREE from 'three';
import { R, envolver } from './mundo.js';

export function crearControles(cam, dom, terr, waterY) {
  const st = { yaw: 0, pitch: -0.05, keys: new Set(), joy: null, look: null, mx: 0, mz: 0, run: false, activo: true, y: null, volar: false, vel: 60, sube: 0, nadando: false, bajoAgua: false };
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
    if (st.volar) {
      // vuelo libre: avanza hacia donde mira (incluida la inclinación); Espacio/E sube, Q/C baja; Shift ×3
      const v = st.vel * (st.run && !st.joy ? 3 : 1) * dt, cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
      let up = st.sube; if (st.keys.has('Space') || st.keys.has('KeyE')) up += 1; if (st.keys.has('KeyQ') || st.keys.has('KeyC')) up -= 1;
      cam.position.x += (fx * c + fz * s * cp) * v; cam.position.z += (-fx * s + fz * c * cp) * v;
      cam.position.y += (-fz * sp + up * 0.6) * v;
      cam.position.y = Math.min(R - 120, Math.max(cam.position.y, Math.max(terr.heightAt(cam.position.x, cam.position.z), waterY) + 1.5));
      st.y = cam.position.y;
    } else {
      const fondo = terr.heightAt(cam.position.x, cam.position.z);
      st.nadando = fondo + 1.65 < waterY - 0.15;            // el agua cubre más que la altura de los ojos
      if (st.nadando) {
        // nadar: se avanza hacia donde se mira (mirar abajo = bucear), ▲/Espacio sube; flota en la superficie
        const v = (st.run ? 3.2 : 2.2) * dt, cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
        let up = st.sube; if (st.keys.has('Space') || st.keys.has('KeyE')) up += 1; if (st.keys.has('KeyQ') || st.keys.has('KeyC')) up -= 1;
        cam.position.x += (fx * c + fz * s * cp) * v; cam.position.z += (-fx * s + fz * c * cp) * v;
        const y0 = st.y == null ? waterY + 0.12 : st.y;
        st.y = y0 + (-fz * sp + up * 0.8) * v + (fz === 0 && up === 0 ? 0.6 * dt : 0);   // quieto, sube despacio a flotar
        const f2 = terr.heightAt(cam.position.x, cam.position.z);
        st.y = Math.min(waterY + 0.12, Math.max(f2 + 0.5, st.y));
        cam.position.y = st.y;
      } else {
        const v = (st.run ? 9 : 4.2) * dt;
        cam.position.x += (fx * c + fz * s) * v; cam.position.z += (-fx * s + fz * c) * v;
        const suelo = terr.heightAt(cam.position.x, cam.position.z) + 1.65;
        st.y = st.y == null ? suelo : st.y + (suelo - st.y) * Math.min(1, dt * 10);
        cam.position.y = st.y;
      }
    }
    cam.position.x = envolver(cam.position.x);   // una vuelta completa al tubo = mismo lugar
    st.bajoAgua = cam.position.y < waterY - 0.02;
    e.set(st.pitch, st.yaw, 0); cam.quaternion.setFromEuler(e);
  }
  return { st, update, mirarA(x, y, z) { const d = new THREE.Vector3(x, y, z).sub(cam.position); st.yaw = Math.atan2(-d.x, -d.z); st.pitch = Math.atan2(d.y, Math.hypot(d.x, d.z)); st.y = null; } };
}
