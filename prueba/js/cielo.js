// Cielo físico (Preetham) con sol según la hora, nubes procedurales y luz ambiental calculada del propio cielo.
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

export function crearCielo(renderer, scene) {
  const sky = new Sky(); sky.scale.setScalar(4000); sky.renderOrder = -2;
  const su = sky.material.uniforms;
  su.turbidity.value = 5.5; su.rayleigh.value = 1.4; su.mieCoefficient.value = 0.004; su.mieDirectionalG.value = 0.82;
  if (su.cloudCoverage) su.cloudCoverage.value = 0;   // las nubes van en su propia cúpula (más control)
  scene.add(sky);

  const nubes = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), new THREE.ShaderMaterial({
    uniforms: { uSun: { value: new THREE.Vector3() }, uTime: { value: 0 }, uCover: { value: 0.52 }, uLight: { value: new THREE.Color() }, uShade: { value: new THREE.Color() } },
    vertexShader: `varying vec3 vD; void main(){ vD=normalize(position); vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position=p; gl_Position.z=gl_Position.w; }`,
    fragmentShader: /* glsl */`
      uniform vec3 uSun, uLight, uShade; uniform float uTime, uCover; varying vec3 vD;
      float h(vec2 p){ vec3 q=fract(vec3(p.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
      float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
      float fb(vec2 p){ float s=0.,a=.5; for(int i=0;i<6;i++){ s+=a*n(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return s; }
      void main(){
        vec3 d=normalize(vD); if(d.y<0.){ discard; }
        vec2 p = d.xz/(d.y+.12)*1.6 + vec2(uTime*.006, uTime*.002);
        float c = fb(p), c2 = fb(p+uSun.xz*.08);
        float dens = smoothstep(uCover, uCover+.28, c);
        float lit = clamp(.55 + (c-c2)*3.5, 0., 1.);
        float sc = pow(max(dot(d,uSun),0.), 6.);
        vec3 col = mix(uShade, uLight, lit) * (1. + sc*1.5);
        float a = dens * smoothstep(.0,.18,d.y) * .92;
        gl_FragColor = vec4(col, a);
      }`,
    transparent: true, depthWrite: false, side: THREE.BackSide,
  }));
  nubes.renderOrder = -1; nubes.frustumCulled = false; scene.add(nubes);

  const sol = new THREE.DirectionalLight(0xffffff, 3); sol.castShadow = true;
  const sc = sol.shadow.camera; sc.left = -70; sc.right = 70; sc.top = 70; sc.bottom = -70; sc.near = 1; sc.far = 600;
  sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.5;
  scene.add(sol, sol.target);

  const envScene = new THREE.Scene(), skyEnv = new Sky(); skyEnv.material = sky.material; skyEnv.scale.setScalar(1000); envScene.add(skyEnv);
  const pmrem = new THREE.PMREMGenerator(renderer); let envRT = null;
  const dir = new THREE.Vector3(), col = new THREE.Color();
  const estado = { hora: 9, dir, elev: 0 };

  function setHora(hora) {
    estado.hora = hora;
    // salida 6:00, puesta 18:00; acimut del este (amanecer) al oeste
    const t = (hora - 6) / 12, elev = Math.sin(Math.PI * t) * 68 - 4, az = 100 - 200 * t;
    estado.elev = elev;
    dir.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - elev), THREE.MathUtils.degToRad(az));
    su.sunPosition.value.copy(dir);
    nubes.material.uniforms.uSun.value.copy(dir);
    const k = THREE.MathUtils.smoothstep(elev, -3, 25), warm = 1 - THREE.MathUtils.smoothstep(elev, 2, 30);
    col.setRGB(1, 0.93 - 0.32 * warm, 0.85 - 0.55 * warm);
    sol.color.copy(col); sol.intensity = 4.6 * k;
    nubes.material.uniforms.uLight.value.copy(col).multiplyScalar(0.25 + 1.1 * k);
    nubes.material.uniforms.uShade.value.setRGB(0.35, 0.39, 0.46).multiplyScalar(0.12 + 0.55 * k);
    su.turbidity.value = 4.5 + 4 * warm;
    if (envRT) envRT.dispose();
    envRT = pmrem.fromScene(envScene, 0.035);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.42 + 0.1 * k;   // mínimo de luz de cielo al amanecer y al atardecer
  }

  function update(t, camPos) {
    sky.position.copy(camPos); nubes.position.copy(camPos);
    nubes.material.uniforms.uTime.value = t;
    // la sombra sigue a la cámara, alineada a texeles para que no tiemble
    const s = 140 / sol.shadow.mapSize.x, tx = Math.round(camPos.x / s) * s, tz = Math.round(camPos.z / s) * s;
    sol.target.position.set(tx, camPos.y - 10, tz);
    sol.position.copy(sol.target.position).addScaledVector(dir, 300);
  }
  return { sky, nubes, sol, setHora, update, estado };
}
