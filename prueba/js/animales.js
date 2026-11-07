// Venados (modelos CC0 de Quaternius con esqueleto y animaciones): pastan, caminan, descansan y huyen del jugador.
import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const ANIM = { andar: 'Walk', correr: 'Gallop', comer: 'Eating', quieto: 'Idle_2' };

export class Manada {
  constructor(terr, rnd) { this.terr = terr; this.rnd = rnd; this.lista = []; this.grupo = new THREE.Group(); }

  agregar(gltf, n, centro, altura) {
    const box = new THREE.Box3().setFromObject(gltf.scene), esc = altura / (box.max.y - box.min.y);
    for (let i = 0; i < n; i++) {
      const o = SkeletonUtils.clone(gltf.scene); o.scale.setScalar(esc * (0.9 + this.rnd() * 0.2));
      o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; if (m.material) { m.material = m.material.clone(); m.material.roughness = 0.85; m.material.metalness = 0; } } });
      const mixer = new THREE.AnimationMixer(o), acc = {};
      for (const [k, nom] of Object.entries(ANIM)) { const c = THREE.AnimationClip.findByName(gltf.animations, nom); if (c) acc[k] = mixer.clipAction(c); }
      const a = { o, mixer, acc, estado: '', t: 0, dir: this.rnd() * Math.PI * 2, vel: 0, meta: null, centro: centro.clone() };
      o.position.set(centro.x + (this.rnd() - 0.5) * 20, 0, centro.z + (this.rnd() - 0.5) * 20);
      this.cambiar(a, this.rnd() < 0.6 ? 'comer' : 'quieto');
      a.mixer.update(this.rnd() * 5);
      this.grupo.add(o); this.lista.push(a);
    }
  }

  cambiar(a, e) {
    if (a.estado === e) return;
    const prev = a.acc[ANIM[a.estado] ? a.estado : ''], next = a.acc[e] || a.acc.quieto;
    if (next) { next.reset().setEffectiveTimeScale(e === 'correr' ? 1.25 : 1).fadeIn(0.35).play(); }
    if (a.acc[a.estado] && a.acc[a.estado] !== next) a.acc[a.estado].fadeOut(0.35);
    a.estado = e; a.t = e === 'comer' ? 5 + this.rnd() * 7 : e === 'quieto' ? 2 + this.rnd() * 4 : 0;
    if (e === 'andar') { const r = 8 + this.rnd() * 22, an = this.rnd() * Math.PI * 2; a.meta = new THREE.Vector3(a.centro.x + Math.cos(an) * r, 0, a.centro.z + Math.sin(an) * r); }
  }

  update(dt, jugador) {
    const T = this.terr;
    for (const a of this.lista) {
      const p = a.o.position, dj = Math.hypot(p.x - jugador.x, p.z - jugador.z);
      if (dj < 13 && a.estado !== 'correr') { this.cambiar(a, 'correr'); const an = Math.atan2(p.x - jugador.x, p.z - jugador.z); a.meta = new THREE.Vector3(p.x + Math.sin(an) * 40, 0, p.z + Math.cos(an) * 40); }
      if (a.estado === 'comer' || a.estado === 'quieto') { a.t -= dt; a.vel *= 0.9; if (a.t <= 0) this.cambiar(a, this.rnd() < 0.55 ? 'andar' : this.rnd() < 0.5 ? 'comer' : 'quieto'); }
      if ((a.estado === 'andar' || a.estado === 'correr') && a.meta) {
        const dx = a.meta.x - p.x, dz = a.meta.z - p.z, d = Math.hypot(dx, dz);
        const objetivo = Math.atan2(dx, dz); let dd = objetivo - a.dir; while (dd > Math.PI) dd -= 2 * Math.PI; while (dd < -Math.PI) dd += 2 * Math.PI;
        a.dir += dd * Math.min(1, dt * 2.5);
        a.vel += ((a.estado === 'correr' ? 7.5 : 1.25) - a.vel) * Math.min(1, dt * 3);
        if (d < 1.5 || (a.estado === 'correr' && dj > 45)) { a.centro.set(p.x, 0, p.z); this.cambiar(a, a.estado === 'correr' ? 'quieto' : (this.rnd() < 0.7 ? 'comer' : 'quieto')); }
      }
      let nx = p.x + Math.sin(a.dir) * a.vel * dt, nz = p.z + Math.cos(a.dir) * a.vel * dt;
      if (T.heightAt(nx, nz) < 0.4 || T.normalAt(nx, nz).y < 0.8) { a.dir += Math.PI * 0.6; nx = p.x; nz = p.z; }   // no entra al río ni a laderas
      p.x = nx; p.z = nz; p.y = T.heightAt(p.x, p.z);
      const n = T.normalAt(p.x, p.z);
      // inclina el cuerpo según la pendiente: hacia adelante (cabeceo) y de lado (alabeo)
      const fx = Math.sin(a.dir), fz = Math.cos(a.dir);
      a.o.rotation.set(Math.atan((n.x * fx + n.z * fz) / n.y) * 0.85, a.dir, -Math.atan((n.x * fz - n.z * fx) / n.y) * 0.5, 'YXZ');
      a.mixer.update(dt);
    }
  }
}
