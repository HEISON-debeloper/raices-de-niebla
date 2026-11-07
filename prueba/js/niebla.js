// Niebla de montaña como pase de posproceso: reconstruye la posición de cada píxel desde la profundidad y aplica
// niebla por altura (más densa en el fondo del valle), bancos de niebla que se mueven y bruma por distancia.
// Se aplica igual a todo (terreno, agua, árboles, animales, cielo), antes del mapeo de tonos.
import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

export class PaseNiebla extends Pass {
  constructor(camera) {
    super();
    this.camera = camera;
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null }, tDepth: { value: null }, uInvProj: { value: new THREE.Matrix4() }, uCamWorld: { value: new THREE.Matrix4() },
        uCamPos: { value: new THREE.Vector3() }, uSun: { value: new THREE.Vector3(0, 1, 0) }, uFog: { value: new THREE.Color(0.5, 0.56, 0.62) },
        uSunCol: { value: new THREE.Color(1, 0.9, 0.7) }, uDens: { value: 0.012 }, uFall: { value: 0.045 }, uBase: { value: 4 }, uDist: { value: 0.00055 }, uTime: { value: 0 }, uTubo: { value: 0 }, uAgua: { value: 0 }, uLuz: { value: 1 },
      },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse, tDepth; uniform mat4 uInvProj, uCamWorld; uniform vec3 uCamPos, uSun, uFog, uSunCol;
        uniform float uDens, uFall, uBase, uDist, uTime, uTubo, uAgua, uLuz; varying vec2 vUv;
        float h(vec3 p){ p=fract(p*.1031); p+=dot(p,p.zyx+31.32); return fract((p.x+p.y)*p.z); }
        float n3(vec3 p){ vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
                     mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
        void main(){
          vec3 col = texture2D(tDiffuse,vUv).rgb; float d = texture2D(tDepth,vUv).x; bool sky = d >= .99999;
          // valores inválidos (NaN o infinito: en GPU de Apple salen como puntos de color) → negro; y tope de brillo
          if (!(col.r < 1e4 && col.g < 1e4 && col.b < 1e4) || col.r != col.r || col.g != col.g || col.b != col.b) col = vec3(0.);
          col = min(col, vec3(6.));
          vec4 vp = uInvProj*vec4(vUv*2.-1., d*2.-1., 1.); vp/=vp.w;
          float dist = sky ? (uTubo > .5 ? 9000. : 2600.) : length(vp.xyz);
          vec3 rd = normalize((uCamWorld*vec4(vp.xyz,0.)).xyz);
          float ry = abs(rd.y)<1e-3 ? 1e-3*sign(rd.y+1e-6) : rd.y;
          float dh = uTubo > .5 ? min(dist, 700.) : dist;   // tubo: la niebla por altura solo vale cerca (lejos el suelo se curva)
          float fh = uDens/uFall*exp(-(uCamPos.y-uBase)*uFall)*(1.-exp(-dh*ry*uFall))/ry;
          vec3 mp = uCamPos + rd*min(dist,260.)*.6;
          float banks = n3(mp*vec3(.018,.06,.018) + vec3(uTime*.012,0.,uTime*.006)) * .7 + n3(mp*.05 - uTime*.01)*.3;
          fh *= mix(.35, 1.75, smoothstep(.25,.8,banks));
          float f = 1.-(exp(-max(fh,0.)))*exp(-dist*uDist);
          if (uTubo > .5) f = max(f, smoothstep(2400., 3900., abs(rd.z*dist)));   // fondo del tubo a lo largo del eje: se pierde en la bruma
          else if (sky) f *= smoothstep(.32,0.,rd.y)*.9;
          float s = pow(max(dot(rd,uSun),0.),6.);
          vec3 fc = mix(uFog, uSunCol, s*.55);
          vec3 res = mix(col, fc, clamp(f,0.,1.));
          if (uAgua > .5) {   // bajo el agua: se ve a ~12 m, luz que se apaga con la profundidad y ondas de luz
            float prof = max(0., -uCamPos.y), wf = 1.-exp(-(sky ? 40. : dist)*.17);
            vec3 wc = vec3(.025,.085,.08) * uLuz * exp(-prof*.12);
            float caust = .85 + .15*sin(vUv.x*40.+uTime*2.) * sin(vUv.y*30.-uTime*1.7);
            res = mix(col*vec3(.55,.85,.8)*caust, wc, clamp(wf,0.,1.));
          }
          gl_FragColor = vec4(min(res, vec3(8.)), 1.);
        }`,
    });
    this.fsQuad = new FullScreenQuad(this.material);
  }
  render(renderer, writeBuffer, readBuffer) {
    const u = this.material.uniforms, c = this.camera;
    u.tDiffuse.value = readBuffer.texture; u.tDepth.value = readBuffer.depthTexture;
    u.uInvProj.value.copy(c.projectionMatrixInverse); u.uCamWorld.value.copy(c.matrixWorld); u.uCamPos.value.copy(c.position);
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    if (this.clear) renderer.clear();
    this.fsQuad.render(renderer);
  }
  dispose() { this.material.dispose(); this.fsQuad.dispose(); }
}
