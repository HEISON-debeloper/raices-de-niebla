// Copia GLSL de mundo.js (mismas fórmulas, mismo orden). Si cambias una, cambia la otra: tools/paridad lo comprueba.
import { GLSL_RUIDO } from './ruido3.js';

export const GLSL_MUNDO = GLSL_RUIDO + /* glsl */`
#define TR 1000.
#define TC 6283.185307179586
#define PZ 16000.
#define ZMAR 8000.
#define SW 1500.
#define LX (TC/6.)
#define LZ 1024.
#define VX (TC/3.)
#define VZ 3000.
#define NIEVE 400.
#define ARBOL_MAX 320.
float smt(float a, float b, float x){ float t=clamp((x-a)/(b-a),0.,1.); return t*t*(3.-2.*t); }
float envolver(float x){ return x - TC*floor(x/TC+.5); }
float fc(vec2 p, float s, vec3 o, int oct){ float a=p.x/TR; return fbm3(vec3(TR*cos(a)/s, TR*sin(a)/s, p.y/s)+o, oct); }
float rioU(float k, float z){ return k*TC/3.+300.+70.*sin(z/260.+k*2.1)+25.*sin(z/83.+k*1.3); }
vec3 rio(vec2 p){
  float m=1e9, k=0.;
  for(int i=0;i<3;i++){ float d=abs(envolver(p.x-rioU(float(i),p.y))); if(d<m){ m=d; k=float(i); } }
  float base = k<.5 ? 45. : (k<1.5 ? 16. : 7.);
  return vec3(m, k, base*(.8+.4*sin(p.y/350.+2.1*k)));
}
vec2 mar(float z){ float dz=abs(z-(floor((z-ZMAR)/PZ+.5)*PZ+ZMAR)); return vec2(dz, 1.-smt(SW,SW+600.,dz)); }
float hsuave(vec2 p, vec3 r){
  float d=r.x, t=clamp((d-60.)/1000.,0.,1.);
  float reg=.85+.3*fc(p,1100.,vec3(7.3,-2.9,1.1),3), amp=340.*(.5+.9*fc(p,2600.,vec3(-11.2,4.4,2.7),2));
  float h=1.2+.03*d+amp*pow(t,1.4)*reg;
  h+=45.*(fc(p,600.,vec3(3.3,-8.1,5.5),3)-.5)*smt(80.,400.,d)+18.*(fc(p,260.,vec3(1.7,5.1,-3.3),4)-.5)*smt(40.,320.,d);
  vec2 M=mar(p.y);
  if(M.y>0.){ float hm=-8.-55.*(1.-smt(500.,1400.,M.x))+270.*max(0.,fc(p,700.,vec3(-2.2,6.6,-4.4),3)-.62); h=h*(1.-M.y)+hm*M.y; }
  return h;
}
// Lago/nacedero de la celda (i, j). pz: z del punto que pregunta (rechazo barato a más de 170 m); pz<-1e8 = sin rechazo.
// A=(cx,cz,rL,L) B=(sgn,Len,ws,ds) Cc=(f1,f2,nF,0) Dd=(sF1,sF2,HF1,HF2)
bool lagoDe(int i, int j, float pz, out vec4 A, out vec4 B, out vec4 Cc, out vec4 Dd){
  int im=i-6*int(floor(float(i)/6.));
  float pr=hash3(ivec3(im,j,501)); if(pr>=.8) return false;
  bool nac=pr>=.62;
  float cx=(float(i)+.15+.7*hash3(ivec3(im,j,502)))*LX, cz=(float(j)+.15+.7*hash3(ivec3(im,j,503)))*LZ;
  if(pz>-1e8 && abs(pz-cz)>170.) return false;
  vec3 rr=rio(vec2(cx,cz)); float hc=hsuave(vec2(cx,cz),rr);
  if(!(mar(cz).x>SW+900. && rr.x>260. && hc>80.)) return false;
  float dx=envolver(rioU(rr.y,cz)-cx), sgn=dx<0.?-1.:1., rL=nac?3.:30.+70.*hash3(ivec3(im,j,504));
  float Len=abs(dx)-rr.z*.5;
  A=vec4(cx,cz,rL,hc-(nac?.8:6.)); B=vec4(sgn,Len,1.5+3.*hash3(ivec3(im,j,505)),1.+.9*hash3(ivec3(im,j,506)));
  Cc=vec4(hash3(ivec3(im,j,507))*6.2832, hash3(ivec3(im,j,508))*6.2832, floor(hash3(ivec3(im,j,509))*3.), 0.);
  Dd=vec4(Len*(.2+.3*hash3(ivec3(im,j,510))), Len*(.55+.3*hash3(ivec3(im,j,512))), 6.+18.*hash3(ivec3(im,j,511)), 6.+18.*hash3(ivec3(im,j,513)));
  return true;
}
bool lagoCerca(float cx, float cz, float rV){
  int li=int(floor(cx/LX)), lj=int(floor(cz/LZ));
  for(int dj=-1;dj<=1;dj++) for(int di=-2;di<=2;di++){
    vec4 A,B,Cc,Dd; if(!lagoDe(li+di,lj+dj,-1e9,A,B,Cc,Dd)) continue;
    float dx=envolver(cx-A.x), dz=cz-A.y;
    if(length(vec2(dx,dz))<rV+60.) return true;
    float rc=rV*.18*2.5+40., sv=dx*B.x; if(abs(dz)<rc && sv>-rc && sv<B.y+rc) return true;
  }
  return false;
}
// h altura, W nivel de agua local, lava 0/1, nieve, pantano, volcan, bosque
void datos(vec2 p, out float h, out float W, out float lava, out float nieve, out float pantano, out float volc, out float bosque){
  vec3 r=rio(p); vec2 M=mar(p.y); float d=r.x;
  h=hsuave(p,r);
  h+=6.*(fc(p,60.,vec3(0.),4)-.5)*smt(12.,40.,d)+4.*(fc(p,55.,vec3(-4.2,2.2,8.8),3)-.5)*smt(30.,200.,d);
  float sw=smt(.56,.68,fc(p,220.,vec3(9.9,-1.1,3.7),3))*max((1.-smt(60.,160.,d))*(r.y<.5?1.:.3), smt(SW+150.,SW+500.,M.x)*(1.-smt(SW+600.,SW+900.,M.x)));
  sw*=(1.-smt(3.,8.,h))*(1.-M.y);
  if(sw>0.) h=h*(1.-sw)+(.25+1.4*(fc(p,16.,vec3(2.5,7.5,-1.5),2)-.5))*sw;
  W=0.; lava=0.; float vm=0.;
  int ci=int(floor(p.x/LX)), cj=int(floor(p.y/LZ));
  for(int dj=-1;dj<=1;dj++) for(int di=-1;di<=1;di++){
    vec4 A,B,Cc,Dd; if(!lagoDe(ci+di,cj+dj,p.y,A,B,Cc,Dd)) continue;
    float cx=A.x, cz=A.y, rL=A.z, L=A.w, sgn=B.x, Len=B.y, ws=B.z, ds=B.w, f1=Cc.x, f2=Cc.y; int nF=int(Cc.z); vec2 sF=Dd.xy, HF=Dd.zw;
    float dzp=p.y-cz, dxp=envolver(p.x-cx), dl=length(vec2(dxp,dzp));
    if(dl<rL+60.){
      float bowl=L-1.-9.*(1.-smt(0.,rL,dl)), hb=min(h,bowl), wIn=1.-smt(0.,1.,(dl-rL)/(2.+2.5*(h-hb)));
      h=h*(1.-wIn)+hb*wIn;
      float dr=max(0.,L+2.5-h), o=rL+max(20.,8.+1.3*dr), wRim=smt(rL,rL+3.+1.3*dr,dl)*(1.-smt(o,o+4.+2.5*dr,dl));
      h=h*(1.-wRim)+(h+dr)*wRim;
      W=max(W,L);
    }
    float s=clamp(dxp*sgn,0.,Len), mnd=25.*sin(s/90.+f1)+10.*sin(s/37.+f2), lat=abs(dzp-mnd);
    if(s>rL*.5 && lat<70. && s<Len-.01){
      float Ws=1e9; for(int q=0;q<5;q++){ float sq=max(rL*.5, s-40.*float(q)); vec2 pq=vec2(cx+sgn*sq, cz+25.*sin(sq/90.+f1)+10.*sin(sq/37.+f2)); Ws=min(Ws,hsuave(pq,rio(pq))); }
      Ws=min(Ws-1.5,L); Ws=min(Ws,max(0.,(d-r.z*.6)*.3));
      float D=0.; for(int q=0;q<2;q++){ if(q>=nF) break; D+=HF[q]*(1.-smt(sF[q]-3.,sF[q],s))*smt(sF[q]-220.,sF[q]-30.,s); }
      Ws+=D; h+=D*(1.-smt(40.,70.,lat));
      float fondo=Ws-ds*(1.-smt(0.,ws,lat)), hc=min(h,fondo);
      float cw=1.-smt(ws,ws+2.+1.5*(h-hc),lat);
      h=h*(1.-cw)+hc*cw;
      float dr=max(0.,Ws+.35-h), bw=smt(ws*.6,ws*.9,lat)*(1.-smt(ws*1.8,ws*1.8+1.+1.5*dr,lat))*smt(rL*.95,rL+5.,dl);
      h=h*(1.-bw)+(h+dr)*bw;
      if(lat<ws*1.5) W=max(W,Ws);
    }
  }
  int vi=int(floor(p.x/VX)), vj=int(floor(p.y/VZ));
  for(int dj=-1;dj<=1;dj++) for(int di=-1;di<=1;di++){
    int i=vi+di, j=vj+dj, im=i-3*int(floor(float(i)/3.));
    float pr=hash3(ivec3(im,j,701)); if(pr>=.45) continue;
    float cx=(float(i)+.25+.5*hash3(ivec3(im,j,702)))*VX, cz=(float(j)+.25+.5*hash3(ivec3(im,j,703)))*VZ, rV=250.+450.*hash3(ivec3(im,j,704));
    float dl=length(vec2(envolver(p.x-cx), p.y-cz)); if(dl>rV) continue;
    vec3 rr=rio(vec2(cx,cz)); if(!(mar(cz).x>SW+rV+300. && rr.x>rV*.5 && !lagoCerca(cx,cz,rV))) continue;
    float HV=rV*(.18+.12*hash3(ivec3(im,j,705))), rc=rV*.18, base=hsuave(vec2(cx,cz),rr);
    float cono=HV*pow(1.-smt(0.,rV,dl),1.6)-.25*HV*(1.-smt(rc*.8,rc*1.3,dl));
    h+=cono*(1.+.03*(fc(p,40.,vec3(1.),2)-.5)); vm=max(vm,1.-smt(rV*.85,rV*1.05,dl));
    if(dl<rc*1.2){ W=max(W,base+.74*HV); lava=1.; }
  }
  float w=r.z, c=1.-smt(w*.5,w*.5+max(.8*w,14.),d);
  if(c>0.){ float hondo=r.y<.5?8.:(r.y<1.5?5.5:3.), anchoB=r.y<.5?45.:(r.y<1.5?16.:7.); float fondo=-1.5-hondo*(w/anchoB)*pow(1.-smt(0.,w*.45,d),.8)+.8*(fc(p,9.,vec3(3.1,1.9,-6.2),2)-.5); h=h*(1.-c)+fondo*c; }
  nieve=smt(NIEVE-25.,NIEVE+25.,h+25.*(fc(p,80.,vec3(5.),2)-.5))*(1.-vm);
  float hum=fc(p,900.,vec3(-7.7,1.2,9.3),2);
  float sel=smt(.42,.55,fc(p,140.,vec3(11.,-7.,2.),3))*(1.-smt(90.,140.,h))*(.6+.4*hum);
  float bos=smt(.45,.58,fc(p,90.,vec3(-5.,3.,9.),3))*smt(25.,60.,h)*(1.-smt(ARBOL_MAX-30.,ARBOL_MAX+30.,h));
  bosque=max(sel,bos*.85)*(1.-nieve)*(1.-vm)*(1.-M.y)*(1.-.7*sw)*smt(.6,1.8,h-W);
  pantano=sw; volc=vm;
}
float alturaFn(vec2 p){ float h,W,l,n,s,v,b; datos(p,h,W,l,n,s,v,b); return h; }
`;
