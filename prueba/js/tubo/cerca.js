// Datos del suelo cercano para el pasto: la GPU calcula la altura exacta (la misma función del terreno), la densidad
// de pasto y el bosque en una textura de 128 m × 128 m alrededor de la cámara. Se recalcula al moverse 16 m (≈0,2 ms).
// Se guarda la altura RELATIVA a la del centro: así cabe en media precisión con error < 3 cm.
import * as THREE from 'three';
import { GLSL_MUNDO, alturaFn } from './mundo.js';

export function crearCerca(renderer, W = 128, N = 256) {
  const rt = new THREE.WebGLRenderTarget(N, N, { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const rect = new THREE.Vector4(1e9, 1e9, W, 0);   // centro x, centro z, lado, altura de referencia
  const mat = new THREE.ShaderMaterial({
    uniforms: { uRect: { value: rect } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
    fragmentShader: GLSL_MUNDO + /* glsl */`
      uniform vec4 uRect; varying vec2 vUv;
      void main(){
        vec2 p = uRect.xy + (vUv-.5)*uRect.z;
        float h = alturaFn(p), e = .5, hx = alturaFn(p+vec2(e,0.)), hz = alturaFn(p+vec2(0.,e));
        float ny = e/length(vec3(h-hx, e, h-hz)), f = bosqueFn(p, h);
        float g = smt(.8,.9,ny)*smt(.7,1.6,h)*(1.-smt(330.,370.,h))*(1.-.65*f);   // nada de pasto en el agua ni en roca
        gl_FragColor = vec4(h-uRect.w, g, f, 1.);
      }`,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat), sc = new THREE.Scene(), oc = new THREE.OrthographicCamera();
  quad.frustumCulled = false; sc.add(quad);
  return {
    tex: rt.texture, rect,
    update(cam) {
      if (Math.abs(cam.x - rect.x) < 16 && Math.abs(cam.z - rect.y) < 16) return false;
      rect.x = Math.round(cam.x / 4) * 4; rect.y = Math.round(cam.z / 4) * 4; rect.w = alturaFn(rect.x, rect.y);
      const prev = renderer.getRenderTarget(); renderer.setRenderTarget(rt); renderer.render(sc, oc); renderer.setRenderTarget(prev);
      return true;
    },
  };
}
