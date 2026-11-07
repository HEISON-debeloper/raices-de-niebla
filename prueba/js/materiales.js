// Reflejo especular moderado para materiales naturales (suelo, pasto, hojas, corteza, rocas).
// El valor por defecto (F0 0,04 y Fresnel rasante 1,0) convierte cualquier superficie vista de canto en un espejo del
// cielo: al amanecer, con el sol de frente, salían puntos claros en el pasto lejano y hojas grisáceas en los árboles.
import * as THREE from 'three';

const CHUNK = THREE.ShaderChunk.lights_physical_fragment
  .replace('material.specularColor = vec3( 0.04 );', 'material.specularColor = vec3( 0.015 );')
  .replace('material.specularF90 = 1.0;', 'material.specularF90 = 0.35;');

/** Aplica el ajuste dentro de un onBeforeCompile (shader = parámetro de onBeforeCompile). */
export function mate(shader) {
  shader.fragmentShader = shader.fragmentShader.replace('#include <lights_physical_fragment>', CHUNK);
}

/** Para materiales sin onBeforeCompile propio. */
export function hacerMate(m) {
  if (!m.isMeshStandardMaterial) return m;
  const prev = m.onBeforeCompile && m.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile ? m.onBeforeCompile : null;
  m.onBeforeCompile = (s, r) => { if (prev) prev(s, r); mate(s); };
  const key = m.customProgramCacheKey ? m.customProgramCacheKey.bind(m) : () => '';
  m.customProgramCacheKey = () => key() + '|mate';
  return m;
}
