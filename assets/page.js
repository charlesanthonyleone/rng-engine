/* Page behaviour: roll id, reroll, scene settings, reveals, and the strata sea (marine snow below, caustics in the shallows). */
(()=>{
'use strict';
const H=document.documentElement,$=id=>document.getElementById(id),rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const rid=$('roll-id');if(rid)rid.textContent=window.RNG_ROLL||'--------';
const rr=$('reroll');if(rr)rr.addEventListener('click',()=>{const u=new URL(location.href);u.hash='';location.replace(u.toString())});
// settings
const cb=$('set-bay'),g=$('gear'),pn=$('scene-panel');
if(cb){cb.checked=H.classList.contains('m-bay');cb.addEventListener('change',()=>{H.classList.toggle('m-bay',cb.checked);try{localStorage.setItem('rng-bay',cb.checked?'1':'0')}catch{}dispatchEvent(new Event('bayfx'));window.bayRedraw&&window.bayRedraw();seaGo()})}
if(g&&pn){g.addEventListener('click',()=>{const h=pn.hidden;pn.hidden=!h;g.setAttribute('aria-expanded',String(h))});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pn.hidden){pn.hidden=true;g.setAttribute('aria-expanded','false');g.focus()}})}
// reveals
const rv=document.querySelectorAll('.rv');
if('IntersectionObserver'in window&&!rm){const io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}},{rootMargin:'0px 0px -8% 0px',threshold:.08});rv.forEach(r=>io.observe(r))}else rv.forEach(r=>r.classList.add('in'));
// strata sea
const sea=$('sea'),sec=document.querySelector('.strata');if(!sea||!sec)return;
const c=sea.getContext('2d');let W=0,Hh=0,d=1,P=[],raf=0,on=false,last=0,T=0;
const R=(()=>{const b=new Uint32Array(512);let i=b.length;return()=>{if(i>=b.length){crypto.getRandomValues(b);i=0}return b[i++]/4294967296}})();
const size=()=>{d=Math.min(devicePixelRatio||1,1.75);W=Math.round(sea.clientWidth*d);Hh=Math.round(sea.clientHeight*d);sea.width=W;sea.height=Hh;
  const n=Math.round(Math.min(220,sea.clientWidth*sea.clientHeight/5200));P=Array.from({length:n},()=>({x:R()*W,y:R()*Hh,z:.3+R()*.7,s:.4+R()*1.4,ph:R()*7,vx:(R()-.5)*4}))};
const depth=()=>{const r=sec.getBoundingClientRect();return Math.min(1,Math.max(0,(innerHeight*.5-r.top)/r.height))}; // 0 = top of strata (surface), 1 = land
const draw=(now)=>{const dt=last?Math.min(.05,(now-last)/1e3):0;last=now;const mo=H.classList.contains('m-bay');if(mo)T+=dt;
  c.clearRect(0,0,W,Hh);const k=depth();
  // marine snow: strongest in the deep (k ~ .1-.45), gone by the shore
  const snow=Math.max(0,1-Math.abs(k-.28)/.32);
  if(snow>0){c.fillStyle='#cfe9ff';for(const p of P){if(mo){p.y+=(6+10*p.z)*dt*d;p.x+=Math.sin(T*.4+p.ph)*p.vx*dt*d;if(p.y>Hh+4)p.y=-4,p.x=R()*W}
    c.globalAlpha=snow*.32*p.z*(.6+.4*Math.sin(T*1.3+p.ph));const s=p.s*p.z*d;c.fillRect(p.x,p.y,s,s)}}
  // caustics: shifting light nets in the shallows (k ~ .55-.75)
  const cs=Math.max(0,1-Math.abs(k-.66)/.13);
  if(cs>0){c.globalAlpha=1;c.globalCompositeOperation='lighter';c.lineWidth=1.1*d;const rows=9;
    for(let j=0;j<rows;j++){const y0=Hh*(j/rows);c.strokeStyle=`rgba(150,240,230,${.05*cs})`;c.beginPath();
      for(let x=0;x<=W;x+=14*d){const y=y0+Math.sin(x/(60*d)+T*.6+j)*18*d+Math.sin(x/(23*d)-T*.9+j*2.1)*7*d;x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}
    c.globalCompositeOperation='source-over'}
  // fireflies over the land (k > .85)
  const ff=Math.max(0,(k-.84)/.16);
  if(ff>0){c.globalCompositeOperation='lighter';for(let i=0;i<P.length;i+=4){const p=P[i];const x=(p.x+Math.sin(T*.3+p.ph)*30*d)%W,y=Hh*.15+((p.y*.7+Math.cos(T*.25+p.ph)*20*d)%(Hh*.8));const a=ff*.5*Math.max(0,Math.sin(T*.9+p.ph*3));
    const g=c.createRadialGradient(x,y,0,x,y,5*d);g.addColorStop(0,`rgba(255,214,150,${a})`);g.addColorStop(1,'rgba(255,214,150,0)');c.fillStyle=g;c.fillRect(x-5*d,y-5*d,10*d,10*d)}c.globalCompositeOperation='source-over'}
  c.globalAlpha=1;
  raf=on&&mo&&!document.hidden?requestAnimationFrame(draw):0};
function seaGo(){if(on&&!raf){last=0;raf=requestAnimationFrame(draw)}}
size();addEventListener('resize',()=>{size();seaGo();if(!raf)requestAnimationFrame(draw)});
new IntersectionObserver(es=>{on=es[0].isIntersecting;seaGo()}).observe(sec);
addEventListener('scroll',()=>{if(on&&!raf)requestAnimationFrame(draw)},{passive:true});
document.addEventListener('visibilitychange',seaGo);
})();
