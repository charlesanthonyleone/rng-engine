/* RNG Engine — the bay. A living canvas scene rolled fresh from crypto.getRandomValues on every load.
   No seed is stored and nothing can be replayed: headlands, the inner world, the moon, the stars and the
   lights are all drawn from true randomness, then held to one moonlit palette so the roll stays cohesive. */
(()=>{
'use strict';
const cv=document.getElementById('bay');if(!cv)return;
const ctx=cv.getContext('2d',{alpha:false});
const H_=document.documentElement,Q=new URLSearchParams(location.search);
const STILL=Q.has('still'),RM=matchMedia('(prefers-reduced-motion: reduce)');

/* ---- true randomness ---- */
const pool=new Uint32Array(1024);let pi=pool.length;
const R=()=>{if(pi>=pool.length){crypto.getRandomValues(pool);pi=0}return pool[pi++]/4294967296};
const rr=(a,b)=>a+(b-a)*R();
const roll=(()=>{const b=new Uint8Array(4);crypto.getRandomValues(b);return[...b].map(x=>x.toString(16).padStart(2,'0')).join('')})();
window.RNG_ROLL=roll;
/* value noise over a permutation table filled by crypto */
const perm=new Uint8Array(512),grad=new Float32Array(256);
{const p=new Uint8Array(256);for(let i=0;i<256;i++)p[i]=i;for(let i=255;i>0;i--){const j=Math.floor(R()*(i+1));[p[i],p[j]]=[p[j],p[i]]}for(let i=0;i<512;i++)perm[i]=p[i&255];for(let i=0;i<256;i++)grad[i]=R()*2-1}
const n1=x=>{const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return grad[perm[i&255]]*(1-u)+grad[perm[(i+1)&255]]*u};
const fbm=(x,o=5,g=.5)=>{let s=0,a=1,t=0;for(let k=0;k<o;k++){s+=a*n1(x+k*31.7);t+=a;x*=2.03;a*=g}return s/t};

/* ---- the roll: one composition, many possible worlds ---- */
const side=R()<.5?-1:1;                     // which side the moon hangs
const world={
  moonX:side<0?rr(.14,.3):rr(.7,.86), moonY:rr(.12,.2), moonR:rr(.9,1.15),
  mwAng:side<0?rr(-.62,-.32):rr(.32,.62), mwX:rr(.35,.65), mwA:rr(.5,.7),
  inner:rr(.42,.58), innerW:rr(.2,.28), innerH:rr(.07,.12), peak:rr(.3,.7),
  lH:rr(.22,.34), rH:rr(.22,.34), lTip:rr(.2,.3), rTip:rr(.2,.3),
  far:rr(.04,.08), lights:Math.floor(rr(38,64)), warm:rr(.86,.96),
  tint:rr(0,1), wind:rr(.6,1.3)*(R()<.5?-1:1), haze:rr(.55,.9)
};
H_.dataset.roll=roll;

/* ---- images (real photographs: ESO/S. Brunier Milky Way, lunar disc) ---- */
const img=s=>new Promise(r=>{const i=new Image();i.decoding='async';i.onload=()=>r(i);i.onerror=()=>r(null);i.src=s});
let MW=null,MOON=null;

let W=0,H=0,dpr=1,hy=0,portrait=false,lands=[],stars=[],lights=[],glints=[],sky=null,refl=null,land=null,ready=false;
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,w);c.height=Math.max(1,h);return c};

/* star sprite, ported from the portfolio sky */
const COL=["175,200,255","205,220,255","240,244,255","255,244,222","255,214,170"];
const spr=COL.map(c=>{const f=mk(64,64),m=f.getContext('2d'),h=m.createRadialGradient(32,32,0,32,32,32);
 h.addColorStop(0,'rgba(255,255,255,1)');h.addColorStop(.1,`rgba(${c},.85)`);h.addColorStop(.28,`rgba(${c},.22)`);h.addColorStop(.55,`rgba(${c},.05)`);h.addColorStop(1,`rgba(${c},0)`);m.fillStyle=h;m.beginPath();m.arc(32,32,32,0,7);m.fill();return f});
const glow=(c)=>{const f=mk(64,64),m=f.getContext('2d'),h=m.createRadialGradient(32,32,0,32,32,32);h.addColorStop(0,`rgba(${c},1)`);h.addColorStop(.18,`rgba(${c},.5)`);h.addColorStop(.5,`rgba(${c},.08)`);h.addColorStop(1,`rgba(${c},0)`);m.fillStyle=h;m.fillRect(0,0,64,64);return f};
const GRAIN=(()=>{const g=mk(192,192),x=g.getContext('2d'),d=x.createImageData(192,192),b=new Uint8Array(192*192);crypto.getRandomValues(b);for(let i=0;i<b.length;i++){const v=b[i];d.data[i*4]=v>128?40:0;d.data[i*4+1]=v>128?60:0;d.data[i*4+2]=v>128?90:0;d.data[i*4+3]=Math.abs(v-128)/128*40}x.putImageData(d,0,0);return g})();
const GOLD=glow('255,206,140'),MINT=glow('127,230,218'),WHITE=glow('235,240,255');

/* ---- landmasses: ridge(x) top line and base(x) waterline, in device px ---- */
function buildLands(){
  lands=[];const fr=world;
  // far shore: a long low range across the back of the bay, beyond the inner world
  const far={kind:'far',x0:0,x1:W,base:x=>hy,top:x=>{const u=x/W;return hy-H*(fr.far*(.55+.45*fbm(u*3.1+2,4))+.012*fbm(u*23,3))-H*.035*Math.exp(-Math.pow((u-fr.inner)/.16,2))}};
  // the inner world: a promontory the bay wraps around on three sides
  const cx=fr.inner*W,iw=fr.innerW*W*(portrait?1.9:1),ih=fr.innerH*H*(portrait?1.1:1.1),ib=hy+H*(portrait?.022:.026);
  const pk1=(fr.peak-.5)*1.1,pk2=-pk1*.7+rr(-.2,.2);
  const inner={kind:'inner',x0:cx-iw,x1:cx+iw,
    base:x=>{const u=(x-cx)/iw;return hy+(ib-hy)*Math.sqrt(Math.max(0,1-u*u))+H*.002*fbm(x/W*40,2)},
    top:x=>{const u=(x-cx)/iw;if(Math.abs(u)>=1)return hy;const e=Math.pow(1-u*u,.75);
      const pk=Math.exp(-Math.pow((u-pk1)/.26,2))+.62*Math.exp(-Math.pow((u-pk2)/.2,2));
      return hy-ih*e*(.22+.62*pk+.2*fbm(u*2.4+7,4))-H*.007*e*Math.abs(fbm(x/W*80,3))-H*.002*fbm(x/W*300,2)}};
  // headlands spilling past the frame on both sides
  const head=(s,h,tip)=>{const t=tip*W*(portrait?1.05:1),edge=hy+H*(portrait?.17:.2);
    const xe=s<0?0:W,xt=s<0?t:W-t,span=Math.abs(xt-xe),U=x=>Math.min(1,Math.abs(x-xe)/span);
    const B=x=>{const u=U(x);return edge+(hy+H*.004-edge)*Math.pow(u,.7)+H*.003*fbm(x/W*30+s*9,3)};
    return{kind:'head',s,x0:s<0?-2:W-t,x1:s<0?t:W+2,base:B,
      top:x=>{const u=U(x);const rise=H*(h+.14)*Math.pow(1-u,1.5)*(.8+.35*fbm(u*2.6+s*4,4))+H*.018*Math.pow(1-u,.5);
        return B(x)-rise-H*.016*fbm(x/W*48+s,3)*(1-u*.6)-H*.005*Math.abs(fbm(x/W*260,2))}}};
  lands.push(far,inner,head(-1,fr.lH,fr.lTip),head(1,fr.rH,fr.rTip));
}

/* ---- static layers ---- */
function paintSky(){
  sky=mk(W,Math.ceil(hy+2));const s=sky.getContext('2d');
  const g=s.createLinearGradient(0,0,0,hy);
  const t=world.tint;g.addColorStop(0,'#01030a');g.addColorStop(.45,`rgb(${4+t*2|0},${9+t*3|0},${22+t*6|0})`);g.addColorStop(.8,'#0c1d38');g.addColorStop(1,'#1b3a5c');
  s.fillStyle=g;s.fillRect(0,0,W,hy+2);
  // airglow band above the horizon
  const a=s.createLinearGradient(0,hy*.7,0,hy);a.addColorStop(0,'rgba(40,120,110,0)');a.addColorStop(1,'rgba(60,150,140,.10)');s.fillStyle=a;s.fillRect(0,hy*.7,W,hy*.3);
  // Milky Way photograph, laid across the sky at a rolled angle
  if(MW){s.save();s.globalCompositeOperation='screen';const L=Math.hypot(W,hy)*1.5,Hh=L*.5;s.translate(world.mwX*W,hy*.46);s.rotate(world.mwAng);
    s.globalAlpha=world.mwA;s.drawImage(MW,-L/2,-Hh/2,L,Hh);s.restore();
    // fade it into the horizon haze
    const f=s.createLinearGradient(0,hy*.55,0,hy);f.addColorStop(0,'rgba(11,26,51,0)');f.addColorStop(1,'rgba(14,34,60,.85)');s.fillStyle=f;s.fillRect(0,hy*.55,W,hy*.45+2)}
  // dense faint field stars
  const n=Math.round(W*hy/(700*dpr));s.fillStyle='#dfe8ff';
  for(let i=0;i<n;i++){const x=R()*W,y=Math.pow(R(),1.15)*hy*.97;s.globalAlpha=(.08+.45*Math.pow(R(),3))*(1-y/hy*.7);const r=(R()<.96?.5:1)*dpr;s.fillRect(x,y,r,r)}
  s.globalAlpha=1;
  // moon halo + disc
  const mx=(portrait?(side<0?rr(.1,.15):rr(.85,.9)):world.moonX)*W,my=portrait?(108+rr(-6,10))*dpr:world.moonY*hy*1.6,mr=Math.min(W,H)*.034*world.moonR*(portrait?1.25:1);world._m=[mx,my,mr];
  const h=s.createRadialGradient(mx,my,mr*.9,mx,my,mr*9);h.addColorStop(0,'rgba(210,222,245,.22)');h.addColorStop(.3,'rgba(160,185,230,.06)');h.addColorStop(1,'rgba(120,150,210,0)');
  s.fillStyle=h;s.fillRect(0,0,W,hy);
  if(MOON){s.drawImage(MOON,mx-mr,my-mr,mr*2,mr*2)}else{s.fillStyle='#e8ecf4';s.beginPath();s.arc(mx,my,mr,0,7);s.fill()}
}
function landShape(c,L,lift=0){c.beginPath();const step=Math.max(1,2*dpr|0);c.moveTo(L.x0,L.base(L.x0));for(let x=L.x0;x<=L.x1;x+=step)c.lineTo(x,L.top(x)-lift);c.lineTo(L.x1,L.top(L.x1));for(let x=L.x1;x>=L.x0;x-=step)c.lineTo(x,L.base(x));c.closePath()}
function paintLand(){
  land=mk(W,H);const c=land.getContext('2d');const [mx]=world._m;
  const fill=(L,top,bot,rim)=>{landShape(c,L);const tY=Math.min(...[L.x0,(L.x0+L.x1)/2,L.x1].map(L.top))-H*.1;const g=c.createLinearGradient(0,tY,0,hy+H*.3);g.addColorStop(0,top);g.addColorStop(1,bot);c.fillStyle=g;c.fill();
    // moonlit rim: the ridge band (shape minus itself shifted down), softened, brightest toward the moon
    {const b=mk(W,H),x=b.getContext('2d');landShape(x,L);x.fillStyle='#fff';x.fill();x.globalCompositeOperation='destination-out';x.translate(0,2.5*dpr);landShape(x,L);x.fill();
     x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-in';const rg=x.createLinearGradient(mx-W*.75,0,mx+W*.75,0);rg.addColorStop(0,'rgba(150,180,230,0)');rg.addColorStop(.5,rim);rg.addColorStop(1,'rgba(150,180,230,0)');x.fillStyle=rg;x.fillRect(0,0,W,H);
     c.save();landShape(c,L);c.clip();c.globalCompositeOperation='lighter';c.filter=`blur(${1.6*dpr}px)`;c.globalAlpha=.75;c.drawImage(b,0,0);c.filter='none';c.globalAlpha=.25;c.drawImage(b,0,0);c.restore()}
    // grain so the land never reads as a flat vector fill
    c.save();landShape(c,L);c.clip();c.globalAlpha=.5;c.fillStyle=c.createPattern(GRAIN,'repeat');c.fillRect(0,0,W,H);c.restore()};
  const [far,inner,hl,hr]=lands;
  fill(far,'#132a45','#0d1c31','rgba(150,180,230,.16)');
  // haze between the far shore and the inner world
  const hz=c.createLinearGradient(0,hy-H*.08,0,hy);hz.addColorStop(0,'rgba(30,60,90,0)');hz.addColorStop(1,`rgba(40,80,110,${.22*world.haze})`);c.fillStyle=hz;c.fillRect(0,hy-H*.08,W,H*.08);
  fill(inner,'#0f2137','#07101d','rgba(180,205,250,.26)');
  // mist pooled at the inner world's feet
  {const m=c.createLinearGradient(0,hy-H*.03,0,hy+H*.02);m.addColorStop(0,'rgba(90,120,160,0)');m.addColorStop(.7,'rgba(90,120,160,.10)');m.addColorStop(1,'rgba(90,120,160,0)');c.fillStyle=m;c.fillRect(0,hy-H*.03,W,H*.05)}
  fill(hl,'#07101d','#02050b','rgba(160,190,240,.24)');
  fill(hr,'#07101d','#02050b','rgba(160,190,240,.24)');
  // canopy texture on the near headlands: tiny tree crowns along the ridges
  for(const L of[hl,hr]){c.fillStyle='#03070f';for(let x=L.x0;x<L.x1;x+=rr(1.2,3)*dpr){const y=L.top(x);c.beginPath();c.arc(x,y+1.6*dpr,rr(.8,2.2)*dpr,0,7);c.fill()}}
}
function buildLights(){
  lights=[];const [far,inner,hl,hr]=lands;
  const put=(L,n,dens)=>{const towns=[0,1,2].map(()=>rr(L.x0+(L.x1-L.x0)*.15,L.x1-(L.x1-L.x0)*.15));
    for(let i=0;i<n;i++){const x=R()<.65?towns[i%3]+(R()+R()-1)*(L.x1-L.x0)*.06:rr(L.x0+(L.x1-L.x0)*.08,L.x1-(L.x1-L.x0)*.08);const t=L.top(x),b=L.base(x);if(b-t<4*dpr)continue;
    const y=b-2*dpr-(b-t-3*dpr)*Math.pow(R(),dens);const warm=R()<world.warm;lights.push({x,y,b,s:rr(.6,1.5)*dpr*(L.kind==='inner'?1:.7),warm,ph:R()*7,f:rr(.3,1.6),a:rr(.45,1)})}};
  put(inner,world.lights,1.8);put(far,Math.round(world.lights*.35),2.6);
  put(hl,Math.round(world.lights*.12),3);put(hr,Math.round(world.lights*.12),3);
}
function paintRefl(){
  // mirror of sky + land about each waterline, darkened into the water
  const wh=H-hy;refl=mk(W,Math.ceil(wh));const r=refl.getContext('2d');
  r.save();r.translate(0,0);r.scale(1,-1);r.drawImage(sky,0,-hy,W,hy);r.restore();
  // mirrored land: each band flipped about its own waterline
  const step=Math.max(1,dpr|0);
  for(const L of lands){r.save();landShape(r,{...L,top:x=>L.base(x)-hy,base:x=>L.base(x)-hy+ (L.base(x)-L.top(x))*.92});r.clip();
    r.translate(0,0);
    for(let x=Math.max(0,Math.floor(L.x0));x<Math.min(W,L.x1);x+=step*3){const t=L.top(x),b=L.base(x),h=b-t;if(h<=0)continue;r.save();r.translate(0,2*(b-hy));r.scale(1,-1);r.drawImage(land,x,t,step*3,h,x,t-hy,step*3,h);r.restore()}
    r.restore()}
  // darken and tint toward deep water
  const g=r.createLinearGradient(0,0,0,wh);g.addColorStop(0,'rgba(6,16,30,.3)');g.addColorStop(.18,'rgba(4,12,24,.64)');g.addColorStop(.6,'rgba(3,8,18,.8)');g.addColorStop(1,'rgba(2,5,12,.9)');r.fillStyle=g;r.fillRect(0,0,W,wh);
  // moon glitter path baked faintly; animated glints ride on top
  // wavelets: fine light strokes, denser and finer toward the horizon
  r.globalCompositeOperation='lighter';const nw=Math.round(W*wh/(260*dpr*dpr));
  for(let i=0;i<nw;i++){const v=Math.pow(R(),1.5),y=v*wh,l=(4+v*60)*dpr*rr(.4,1.4),x=R()*W;r.globalAlpha=(.05+.09*R())*(1-v*.5);r.fillStyle=R()<.5?'#3a5a86':'#2a4366';r.fillRect(x,y,l,Math.max(1,dpr*(.5+v)))}
  r.globalAlpha=1;
  const [mx]=world._m;
  for(let y=0;y<wh;y+=2){const v=y/wh,sp=W*(.012+.1*v)*(portrait?1.7:1),a=.16*(1-v*.4);const p=r.createLinearGradient(mx-sp,0,mx+sp,0);p.addColorStop(0,'rgba(190,210,245,0)');p.addColorStop(.5,`rgba(200,216,248,${a})`);p.addColorStop(1,'rgba(190,210,245,0)');r.fillStyle=p;r.fillRect(mx-sp,y,sp*2,2)}
  r.globalCompositeOperation='source-over';
  // glints in a cone under the moon, widening toward the viewer
  glints=[];const N=Math.round((portrait?520:900)*Math.min(1.4,W/(1440*dpr)+.4));
  for(let i=0;i<N;i++){const v=Math.pow(R(),1.15),y=hy+v*wh*.98;const spread=W*(.008+.1*v)*(portrait?1.7:1);const x=mx+(R()+R()+R()+R()-2)*spread;
    glints.push({x,y,v,w:(.8+v*5)*dpr*rr(.5,1.3),f:rr(.8,2.8),ph:R()*7,a:rr(.3,1)*(1-v*.25)})}
}
function build(){
  const vw=innerWidth,vh=Math.max(innerHeight,(window.visualViewport&&visualViewport.height)||0);
  portrait=vw/vh<.8;dpr=Math.min(window.devicePixelRatio||1,portrait?1.75:2);
  W=Math.round(vw*dpr);H=Math.round(vh*dpr);cv.width=W;cv.height=H;
  hy=Math.round(H*(portrait?.62:.6));
  buildLands();paintSky();paintLand();buildLights();paintRefl();
  // twinkling bright stars (animated layer)
  stars=[];const n=Math.round(Math.min(420,vw*vh/2600));
  for(let i=0;i<n;i++){const m=Math.pow(R(),5);const s=R();stars.push({x:R()*W,y:Math.pow(R(),1.2)*hy*.93,m,c:s<.15?0:s<.4?1:s<.8?2:s<.93?3:4,f1:rr(1.2,4.5),f2:rr(4,10),p:R()*7})}
  ready=true;
}

/* ---- motion ---- */
const V=[],RP=[];let nS=rr(2,5),nL=rr(4,9),nC=rr(18,40);
const spawn=t=>{
  if(t>nS){const d=R()<.5?-1:1,sp=rr(520,980)*dpr,a=rr(.2,.6);V.push({x:W*rr(.1,.9),y:hy*rr(.05,.5),vx:Math.cos(a)*sp*d,vy:Math.sin(a)*sp,life:rr(.4,.9),age:0,len:rr(90,210)*dpr});nS=t+rr(2.5,7.5)}
  if(t>nL){ // a meteor that reaches the water: small ripples, the bay is far below
    const tx=world._m[0]+rr(-.3,.3)*W,ty=hy+(H-hy)*rr(.05,.4),dur=rr(1.2,1.9),sx=tx+(R()<.5?-1:1)*W*rr(.15,.32),sy=H*.03;
    V.push({x:sx,y:sy,vx:(tx-sx)/dur,vy:(ty-sy)/dur,life:dur,age:0,len:220*dpr,lands:1,tx,ty});nL=t+rr(11,24)}
  if(t>nC){const d=R()<.5?-1:1;V.push({x:d>0?-80*dpr:W+80*dpr,y:hy*rr(.12,.42),vx:d*rr(22,38)*dpr,vy:rr(1,4)*dpr,life:(W+160*dpr)/(28*dpr),age:0,len:rr(150,240)*dpr,comet:1});nC=t+rr(60,110)}
};
function streak(e,s){const sp=Math.hypot(s.vx,s.vy);if(!(sp>0))return;const ux=s.vx/sp,uy=s.vy/sp,u=s.age/s.life,a=s.comet?Math.min(1,s.age/3,(s.life-s.age)/3)*.55:s.lands?Math.min(1,s.age*4):Math.sin(Math.min(1,u)*Math.PI);
  const L=Math.min(s.len,sp*s.age),y=e.createLinearGradient(s.x,s.y,s.x-ux*L,s.y-uy*L);y.addColorStop(0,`rgba(255,255,255,${a})`);y.addColorStop(.2,`rgba(190,215,255,${.55*a})`);y.addColorStop(1,'rgba(160,190,255,0)');
  e.strokeStyle=y;e.lineCap='round';e.lineWidth=(s.lands?2:s.comet?3:1.3)*dpr;e.beginPath();e.moveTo(s.x,s.y);e.lineTo(s.x-ux*L,s.y-uy*L);e.stroke();
  const c=(s.lands?5+u*4:4)*dpr;e.globalAlpha=a;e.drawImage(WHITE,s.x-c,s.y-c,c*2,c*2);e.globalAlpha=1}
function ripples(dt){for(let i=RP.length-1;i>=0;i--){const r=RP[i];r.age+=dt;if(r.age>2.2){RP.splice(i,1);continue}const k=r.age/2.2,sc=(.5+(r.y-hy)/(H-hy))*dpr;
  if(r.age<.3){ctx.globalAlpha=.7*(1-r.age/.3);ctx.drawImage(WHITE,r.x-10*sc,r.y-4*sc,20*sc,8*sc);ctx.globalAlpha=1}
  for(let j=0;j<3;j++){const kk=k-j*.17;if(kk<=0)continue;const rad=(5+14*kk)*sc;ctx.strokeStyle=`rgba(225,235,255,${.34*(1-kk)})`;ctx.lineWidth=.8*dpr;ctx.beginPath();ctx.ellipse(r.x,r.y,rad,rad*.28,0,0,7);ctx.stroke()}}}

let T=rr(20,200),last=0,raf=0,visible=true,scrollY_=0;
function frame(now){
  const dt=last?Math.min(.05,(now-last)/1e3):0;last=now;const mo=motionOn();if(mo)T+=dt;
  if(!ready){raf=0;return}
  const wh=H-hy,[mx,my,mr]=world._m;
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  ctx.drawImage(sky,0,0);
  // twinkle
  ctx.globalCompositeOperation='lighter';
  for(let i=0;i<stars.length;i++){const s=stars[i];const tw=Math.max(0,.62+.38*Math.sin(T*s.f1+s.p)*Math.sin(T*s.f2+s.p*1.7)),r=(1+s.m*6)*(.75+.45*tw)*dpr;ctx.globalAlpha=Math.min(1,(.22+.8*s.m)*tw*(1-s.y/hy*.5));ctx.drawImage(spr[s.c],s.x-r,s.y-r,r*2,r*2)}
  // moon glimmer
  const pulse=.5+.5*Math.sin(T*2*Math.PI/6);ctx.globalAlpha=.10+.08*pulse;ctx.drawImage(WHITE,mx-mr*3.2,my-mr*3.2,mr*6.4,mr*6.4);ctx.globalAlpha=1;
  // meteors (sky)
  if(mo){spawn(T);for(const s of V){s.age+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt}for(let i=V.length-1;i>=0;i--){const s=V[i];if(s.age>=s.life){if(s.lands)RP.push({x:s.tx,y:s.ty,age:0});V.splice(i,1)}}}
  ctx.save();ctx.beginPath();ctx.rect(0,0,W,hy);ctx.clip();for(const s of V)if(!s.lands)streak(ctx,s);ctx.restore();
  ctx.globalCompositeOperation='source-over';
  // water: base + rippling reflection strips
  ctx.fillStyle='#030914';ctx.fillRect(0,hy,W,wh);
  const st=Math.max(2,Math.round(2*dpr));const wnd=world.wind;
  for(let y=0;y<wh;y+=st){const v=y/wh,amp=(.6+v*v*26)*dpr,off=Math.sin(y/(3.2*dpr+v*14*dpr)+T*1.4*wnd)*amp+Math.sin(y/(9*dpr)-T*.9)*amp*.45;
    ctx.drawImage(refl,0,y,W,st,off,hy+y,W,st)}
  // glitter under the moon
  ctx.globalCompositeOperation='lighter';
  for(const g of glints){const k=Math.sin(T*g.f*2+g.ph+g.y*.02/dpr);if(k<.35)continue;const a=(k-.35)/.65*g.a;const x=g.x+Math.sin(T*.7+g.ph)*g.w*.6;ctx.globalAlpha=a*.7;ctx.fillStyle='#eef2ff';ctx.fillRect(x-g.w/2,g.y,g.w,Math.max(1,dpr*(.5+g.v*1.1)))}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  // land over water
  ctx.drawImage(land,0,0);
  // lights and their streaks on the water
  ctx.globalCompositeOperation='lighter';
  for(const l of lights){const fl=.78+.22*Math.sin(T*l.f*3+l.ph)*Math.sin(T*l.f*1.3+l.ph*2);const sp=l.warm?GOLD:MINT,s=l.s*7;ctx.globalAlpha=l.a*fl*.9;ctx.drawImage(sp,l.x-s,l.y-s,s*2,s*2);
    ctx.globalAlpha=l.a*fl;ctx.fillStyle=l.warm?'#ffe2b0':'#c8fff6';ctx.fillRect(l.x-l.s*.5,l.y-l.s*.5,l.s,l.s);
    // reflection: a short broken streak at the mirrored point
    const ym=l.b+(l.b-l.y)*.9,len=(4+(l.b-l.y)/dpr*.25)*dpr;for(let k=0;k<3;k++){const yy=ym+k*len/3,wv=Math.sin(T*2.2+k*1.7+l.ph)*1.1*dpr;ctx.globalAlpha=l.a*fl*.26*(1-k/3);ctx.fillRect(l.x-l.s*.7+wv,yy,l.s*1.4,Math.max(dpr,len/5))}}
  ctx.globalAlpha=1;
  // shoreline foam: a breathing mint line along every waterline that faces the bay
  const br=.5+.5*Math.sin(T*.8);
  for(const L of lands){if(L.kind==='far')continue;ctx.strokeStyle=`rgba(127,230,218,${(L.kind==='inner'?.07:.09)*(.6+.4*br)})`;ctx.lineWidth=.9*dpr;ctx.beginPath();let first=true;
    let a0=L.x0,a1=L.x1;if(L.kind==='head'){const span=L.x1-L.x0;if(L.s<0)a0=L.x1-span*.45;else a1=L.x0+span*.45}
    for(let x=Math.max(0,a0);x<=Math.min(W,a1);x+=3*dpr){const y=L.base(x)+Math.sin(x*.02/dpr+T*1.2)*.8*dpr;first?ctx.moveTo(x,y):ctx.lineTo(x,y);first=false}ctx.stroke()}
  ripples(dt);
  // meteors that reach the water draw over the land
  for(const s of V)if(s.lands)streak(ctx,s);
  ctx.globalCompositeOperation='source-over';
  // low mist drifting across the bay
  const mg=ctx.createLinearGradient(0,hy-H*.05,0,hy+H*.06);mg.addColorStop(0,'rgba(120,150,190,0)');mg.addColorStop(.5,`rgba(120,150,190,${.05+.025*Math.sin(T*.25)})`);mg.addColorStop(1,'rgba(120,150,190,0)');ctx.fillStyle=mg;ctx.fillRect(0,hy-H*.05,W,H*.11);
  // vignette
  const vg=ctx.createRadialGradient(W/2,H*.45,Math.min(W,H)*.35,W/2,H*.5,Math.hypot(W,H)*.65);vg.addColorStop(0,'rgba(1,3,8,0)');vg.addColorStop(1,'rgba(1,3,8,.62)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  raf=(mo&&visible&&!document.hidden)?requestAnimationFrame(frame):0;
}
const motionOn=()=>!STILL&&H_.classList.contains('m-bay');
const go=()=>{if(!raf){last=0;raf=requestAnimationFrame(frame)}};
window.bayRedraw=()=>{if(!raf)raf=requestAnimationFrame(frame)};
addEventListener('bayfx',go);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)go()});
// pause when an opaque section fully covers the scene
const cover=document.querySelectorAll('[data-covers-bay]');
if('IntersectionObserver'in window&&cover.length){const on=new Set();const io=new IntersectionObserver(es=>{for(const e of es){e.intersectionRatio>=.999||(e.boundingClientRect.top<=0&&e.boundingClientRect.bottom>=innerHeight)?on.add(e.target):on.delete(e.target)}const was=visible;visible=on.size===0;if(visible&&!was)go()},{threshold:[0,.5,.999,1]});cover.forEach(c=>io.observe(c))}
let rt=0;const relayout=()=>{clearTimeout(rt);rt=setTimeout(()=>{const nw=Math.round(innerWidth*dpr);if(Math.abs(nw-W)<2&&Math.abs(Math.round(innerHeight*dpr)-H)<120*dpr&&ready)return;build();go();window.bayRedraw()},120)};
addEventListener('resize',relayout);addEventListener('orientationchange',relayout);
Promise.all([img('assets/img/milkyway.webp'),img('assets/img/moon.webp')]).then(([a,b])=>{MW=a;MOON=b;build();H_.classList.add('bay-ready');go();window.bayRedraw()});
})();
