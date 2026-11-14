/* Living illustrations: entropy readout, the orchard, the seven layer glyphs and the imagine-it toy.
   Everything draws from crypto.getRandomValues. One loop, paused off-screen and when motion is off. */
(()=>{
'use strict';
const H=document.documentElement,$=id=>document.getElementById(id);
const R=(()=>{const b=new Uint32Array(1024);let i=b.length;return()=>{if(i>=b.length){crypto.getRandomValues(b);i=0}return b[i++]/4294967296}})();
const rr=(a,b)=>a+(b-a)*R();
const mint='127,230,218',gold='242,221,180',blue='120,170,255';
const motion=()=>H.classList.contains('m-bay');
document.querySelectorAll('[data-reroll]').forEach(b=>b.addEventListener('click',()=>{const u=new URL(location.href);u.hash='';location.replace(u.toString())}));

/* ---------- registry + loop ---------- */
const items=[];
function add(cv,make,opt={}){if(!cv)return;const it={cv,c:cv.getContext('2d'),w:0,h:0,d:1,on:false,t:0,st:null,make,opt};items.push(it);size(it);it.st=make(it);io.observe(cv);return it}
function size(it){const d=Math.min(devicePixelRatio||1,2);const w=it.cv.clientWidth,h=it.cv.clientHeight;if(!w||!h)return;it.d=d;it.w=w;it.h=h;it.cv.width=Math.round(w*d);it.cv.height=Math.round(h*d);it.c.setTransform(d,0,0,d,0,0)}
const io=new IntersectionObserver(es=>{for(const e of es){const it=items.find(i=>i.cv===e.target);if(it){it.on=e.isIntersecting;if(it.on&&!motion())still(it)}}kick()},{rootMargin:'120px 0px'});
let raf=0,last=0;
function frame(now){const dt=last?Math.min(.05,(now-last)/1e3):0;last=now;raf=0;let any=false;
  if(motion()&&!document.hidden){for(const it of items)if(it.on){it.t+=dt;it.st.draw(it.c,it.w,it.h,it.t,dt);any=true}}
  if(any)raf=requestAnimationFrame(frame);else last=0}
function kick(){if(!raf&&motion())raf=requestAnimationFrame(frame)}
function still(it){it.c.clearRect(0,0,it.w,it.h);const n=it.opt.stillSteps||90;for(let i=0;i<n;i++){it.t+=1/30;it.st.draw(it.c,it.w,it.h,it.t,1/30,i<n-1)}}
addEventListener('resize',()=>{for(const it of items){size(it);if(it.st.resize)it.st.resize(it);if(!motion())still(it)}kick()});
addEventListener('bayfx',()=>{if(motion())kick();else items.forEach(still)});
document.addEventListener('visibilitychange',kick);

/* ---------- live entropy readout ---------- */
const en=$('entropy');
if(en){const b=new Uint8Array(8);const put=()=>{crypto.getRandomValues(b);en.textContent=[...b].map(x=>x.toString(16).padStart(2,'0')).join(' ')};put();setInterval(()=>{if(motion()&&!document.hidden)put()},140)}

/* ---------- the orchard: a seeded tree vs a rolled tree ---------- */
const mul=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
function tree(rnd){const S=[],A=[];const go=(x,y,a,l,d,w)=>{const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l;S.push({x,y,x2,y2,d,w});
  if(d>=6||l<.03){if(rnd()<.28)A.push({x:x2,y:y2+.012,r:.016+rnd()*.012,d});return}
  const k=rnd()<.4?3:2;for(let i=0;i<k;i++){const sp=(i-(k-1)/2)*(.42+rnd()*.3)+(rnd()-.5)*.4;go(x2,y2,a+sp,l*(.66+rnd()*.16),d+1,w*.68)}};
  go(0,0,-Math.PI/2+(rnd()-.5)*.12,.26+rnd()*.05,0,.022);return{S,A}}
add($('orchard'),it=>{let seededN=1,rolledN=1,L=tree(mul(7)),Rt=tree(R),ph=0;const lab1=$('o-left'),lab2=$('o-right');
  const drawTree=(c,T,cx,by,sc,p,fade,tint)=>{c.save();c.translate(cx,by);c.globalAlpha=fade;
    for(const s of T.S){const st=s.d/7,q=Math.min(1,Math.max(0,(p-st)*7));if(q<=0)continue;c.strokeStyle=`rgba(${tint},${.55+.3*(1-s.d/7)})`;c.lineWidth=Math.max(.6,s.w*sc);c.lineCap='round';c.beginPath();c.moveTo(s.x*sc,s.y*sc);c.lineTo((s.x+(s.x2-s.x)*q)*sc,(s.y+(s.y2-s.y)*q)*sc);c.stroke()}
    const ap=Math.min(1,Math.max(0,(p-.86)/.14));if(ap>0)for(const a of T.A){const r=a.r*sc*ap;const g=c.createRadialGradient(a.x*sc,a.y*sc,0,a.x*sc,a.y*sc,r*3);g.addColorStop(0,'rgba(255,170,120,.35)');g.addColorStop(1,'rgba(255,170,120,0)');c.fillStyle=g;c.fillRect(a.x*sc-r*3,a.y*sc-r*3,r*6,r*6);c.fillStyle='#e8735a';c.beginPath();c.arc(a.x*sc,a.y*sc,r,0,7);c.fill();c.fillStyle='rgba(255,230,200,.7)';c.beginPath();c.arc(a.x*sc-r*.35,a.y*sc-r*.35,r*.3,0,7);c.fill()}
    c.restore()};
  return{draw(c,w,h,t,dt){ph+=dt;const cyc=6.4;if(ph>cyc){ph=0;seededN++;rolledN++;L=tree(mul(7));Rt=tree(R);lab1.textContent=`regrowth ${seededN} · identical`;lab2.textContent=`regrowth ${rolledN} · never seen before`}
    const p=Math.min(1,ph/3.4),fade=ph>cyc-.7?(cyc-ph)/.7:Math.min(1,ph/.3);
    c.clearRect(0,0,w,h);const by=h*.9,sc=Math.min(h*1.15,w*.4);
    // ground + soft water line
    for(const cx of[w*.25,w*.75]){const g=c.createRadialGradient(cx,by,0,cx,by,w*.22);g.addColorStop(0,'rgba(127,230,218,.12)');g.addColorStop(1,'rgba(127,230,218,0)');c.fillStyle=g;c.fillRect(cx-w*.22,by-12,w*.44,30)}
    c.strokeStyle='rgba(127,230,218,.18)';c.lineWidth=1;c.beginPath();c.moveTo(w*.04,by+.5);c.lineTo(w*.96,by+.5);c.stroke();
    c.strokeStyle='rgba(242,221,180,.14)';c.setLineDash([3,5]);c.beginPath();c.moveTo(w/2,h*.08);c.lineTo(w/2,by-6);c.stroke();c.setLineDash([]);
    drawTree(c,L,w*.25,by,sc,p,fade,'170,190,215');drawTree(c,Rt,w*.75,by,sc,p,fade,gold)}}},{stillSteps:120});

/* ---------- layer glyphs ---------- */
const G={
substrate(it){let cells=[];const init=(w,h)=>{const cs=10,nx=Math.floor(w/cs),ny=Math.floor(h/cs);cells=Array.from({length:nx*ny},()=>({v:R(),tg:R()}));return{cs,nx,ny}};let g=init(it.w,it.h);
  return{resize(it){g=init(it.w,it.h)},draw(c,w,h,t,dt){c.clearRect(0,0,w,h);const{cs,nx,ny}=g;const ox=(w-nx*cs)/2,oy=(h-ny*cs)/2;
    for(let i=0;i<cells.length;i++){const e=cells[i];if(R()<.04)e.tg=R()<.5?0:R();e.v+=(e.tg-e.v)*Math.min(1,dt*9);const x=ox+(i%nx)*cs,y=oy+Math.floor(i/nx)*cs;
      const a=.06+e.v*.6;c.fillStyle=e.v>.86?`rgba(${gold},${a})`:`rgba(${mint},${a*.8})`;const s=2+e.v*4.5;c.fillRect(x+(cs-s)/2,y+(cs-s)/2,s,s)}}}},
clock(){let pts=[],gh=[],acc=0;return{draw(c,w,h,t,dt){const sp=26;if(!pts.length)pts=[{x:w*.06,y:h/2}];for(const p of pts)p.x-=sp*dt;for(const g of gh){g.x1-=sp*dt;g.x2-=sp*dt;g.a-=dt*.35}
    gh=gh.filter(g=>g.a>0);pts=pts.filter((p,i)=>p.x>-40||i>=pts.length-2);acc+=dt;const head=pts[pts.length-1];
    if(head.x<w*.82&&acc>.55){acc=0;const step=rr(30,44);const opts=[0,1,2].map(()=>Math.max(h*.14,Math.min(h*.86,head.y+rr(-.32,.32)*h)));const pick=Math.floor(R()*3);
      opts.forEach((y,i)=>{if(i!==pick)gh.push({x1:head.x,y1:head.y,x2:head.x+step,y2:y,a:1})});pts.push({x:head.x+step,y:opts[pick]})}
    c.clearRect(0,0,w,h);for(const g of gh){c.strokeStyle=`rgba(${mint},${.32*g.a})`;c.setLineDash([3,4]);c.lineWidth=1;c.beginPath();c.moveTo(g.x1,g.y1);c.lineTo(g.x2,g.y2);c.stroke();c.setLineDash([]);c.fillStyle=`rgba(${mint},${.4*g.a})`;c.beginPath();c.arc(g.x2,g.y2,1.6,0,7);c.fill()}
    c.lineWidth=1.6;c.strokeStyle=`rgba(${gold},.85)`;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
    for(const p of pts){c.fillStyle=`rgba(${gold},.9)`;c.beginPath();c.arc(p.x,p.y,2,0,7);c.fill()}
    const hd=pts[pts.length-1],gg=c.createRadialGradient(hd.x,hd.y,0,hd.x,hd.y,14);gg.addColorStop(0,`rgba(${gold},.6)`);gg.addColorStop(1,`rgba(${gold},0)`);c.fillStyle=gg;c.fillRect(hd.x-14,hd.y-14,28,28)}}},
sim(){let rocks=[],acc=1.3;return{draw(c,w,h,t,dt){const gy=h*.84;acc+=dt;if(acc>1.3){acc=0;rocks.push({x:w*.08,y:gy-4,vx:w*rr(.32,.4),vy:-h*rr(1.05,1.25),tr:[],age:0,e:rr(.35,.62),hue:R()});if(rocks.length>6)rocks.shift()}
    c.clearRect(0,0,w,h);c.strokeStyle=`rgba(${mint},.2)`;c.beginPath();c.moveTo(0,gy+.5);c.lineTo(w,gy+.5);c.stroke();
    rocks.forEach((r,i)=>{r.age+=dt;if(r.x<w+10){r.vy+=h*1.9*dt;r.x+=r.vx*dt;r.y+=r.vy*dt;if(r.y>gy-3){r.y=gy-3;r.vy*=-r.e;r.vx*=.8+R()*.25}r.tr.push([r.x,r.y]);if(r.tr.length>200)r.tr.shift()}
      const a=(i+1)/rocks.length;c.strokeStyle=r.hue>.5?`rgba(${gold},${.5*a})`:`rgba(${mint},${.5*a})`;c.lineWidth=1.2;c.beginPath();r.tr.forEach((p,j)=>j?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();
      c.fillStyle=`rgba(240,240,235,${.4+.6*a})`;c.beginPath();c.arc(r.x,r.y,2.6,0,7);c.fill()});
    c.fillStyle=`rgba(${gold},.9)`;c.beginPath();c.arc(w*.08,gy-4,3.4,0,7);c.fill()}}},
repr(){let A=[],B=[],k=0,nx=26,ny=14;const field=()=>{const o=[];for(let i=0;i<nx*ny;i++)o.push(R());for(let p=0;p<2;p++)for(let i=0;i<o.length;i++){const x=i%nx,y=(i/nx)|0;let s=o[i],n=1;if(x)s+=o[i-1],n++;if(x<nx-1)s+=o[i+1],n++;if(y)s+=o[i-nx],n++;if(y<ny-1)s+=o[i+nx],n++;o[i]=s/n}return o};A=field();B=field();
  return{draw(c,w,h,t,dt){k+=dt*.45;if(k>=1){k=0;A=B;B=field()}const e=k*k*(3-2*k);c.clearRect(0,0,w,h);const cs=Math.min(w/nx,h/ny),ox=(w-cs*nx)/2,oy=(h-cs*ny)/2;
    for(let i=0;i<A.length;i++){const v=A[i]+(B[i]-A[i])*e,x=ox+(i%nx+.5)*cs,y=oy+(((i/nx)|0)+.5)*cs;const q=Math.min(1,Math.max(0,(v-.3)*2.6));const r=cs*.12+q*cs*.4;
      c.fillStyle=q>.75?`rgba(${gold},${.25+q*.55})`:`rgba(${q>.4?mint:blue},${.15+q*.6})`;c.beginPath();c.arc(x,y,r,0,7);c.fill()}}}},
struct(it){const N=13;let P=[];const init=(w,h)=>{P=Array.from({length:N},()=>({x:rr(.1,.9)*w,y:rr(.15,.85)*h,vx:0,vy:0,alive:R()<.5?1:0,l:R()}))};init(it.w,it.h);
  return{resize(it){init(it.w,it.h)},draw(c,w,h,t,dt){for(const p of P){if(R()<dt*.25)p.alive=1-p.alive;p.l+=(p.alive-p.l)*Math.min(1,dt*2.5)}
    for(const p of P){let fx=(w/2-p.x)*.02,fy=(h/2-p.y)*.03;for(const q of P){if(p===q)continue;const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy)+1;fx+=(-dx/d)*900/(d*d)+dx*.003*q.l;fy+=(-dy/d)*900/(d*d)+dy*.003*q.l}
      p.vx=(p.vx+fx*dt*6)*.92;p.vy=(p.vy+fy*dt*6)*.92;p.x=Math.max(8,Math.min(w-8,p.x+p.vx*dt*10));p.y=Math.max(8,Math.min(h-8,p.y+p.vy*dt*10))}
    c.clearRect(0,0,w,h);c.lineWidth=1;
    for(const p of P){const live=P.filter(q=>q!==p&&q.l>.5).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,2);
      for(const q of live){c.strokeStyle=`rgba(${q.l>.5&&p.l>.5?gold:mint},${.12+.3*Math.min(p.l+.3,q.l)})`;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke()}}
    for(const p of P){const r=2+p.l*3;if(p.l>.2){const g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,r*4);g.addColorStop(0,`rgba(${gold},${.45*p.l})`);g.addColorStop(1,`rgba(${gold},0)`);c.fillStyle=g;c.fillRect(p.x-r*4,p.y-r*4,r*8,r*8)}
      c.fillStyle=p.l>.5?`rgba(${gold},.95)`:`rgba(${mint},.55)`;c.beginPath();c.arc(p.x,p.y,r,0,7);c.fill()}}}},
behav(it){let A=[],goal={x:0,y:0,tx:0,ty:0};const init=(w,h)=>{A=Array.from({length:16},()=>({x:rr(0,w),y:rr(0,h),a:R()*7,tr:[]}));goal={x:w*.7,y:h*.5,tx:w*.7,ty:h*.5}};init(it.w,it.h);
  return{resize(it){init(it.w,it.h)},draw(c,w,h,t,dt){if(Math.hypot(goal.tx-goal.x,goal.ty-goal.y)<6||R()<dt*.15){goal.tx=rr(.15,.85)*w;goal.ty=rr(.2,.8)*h}goal.x+=(goal.tx-goal.x)*dt*.6;goal.y+=(goal.ty-goal.y)*dt*.6;
    c.clearRect(0,0,w,h);for(const b of A){const want=Math.atan2(goal.y-b.y,goal.x-b.x);let da=((want-b.a+Math.PI*3)%(Math.PI*2))-Math.PI;b.a+=da*dt*1.6+(R()-.5)*dt*7;const sp=34+R()*14;b.x+=Math.cos(b.a)*sp*dt;b.y+=Math.sin(b.a)*sp*dt;
      b.tr.push([b.x,b.y]);if(b.tr.length>26)b.tr.shift();c.strokeStyle=`rgba(${mint},.28)`;c.lineWidth=1;c.beginPath();b.tr.forEach((p,j)=>j?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();c.fillStyle=`rgba(${mint},.85)`;c.beginPath();c.arc(b.x,b.y,1.8,0,7);c.fill()}
    const g=c.createRadialGradient(goal.x,goal.y,0,goal.x,goal.y,18);g.addColorStop(0,`rgba(${gold},.55)`);g.addColorStop(1,`rgba(${gold},0)`);c.fillStyle=g;c.fillRect(goal.x-18,goal.y-18,36,36);c.fillStyle=`rgba(${gold},1)`;c.beginPath();c.arc(goal.x,goal.y,3,0,7);c.fill()}}},
social(){let pulses=[],acc=0;return{draw(c,w,h,t,dt){const cx=w/2,cy=h/2,n=9,rx=Math.min(w*.42,h*.95),ry=h*.38;const P=[...Array(n)].map((_,i)=>{const a=i/n*Math.PI*2+t*.05;return{x:cx+Math.cos(a)*rx,y:cy+Math.sin(a)*ry}});
    acc+=dt;if(acc>.9){acc=0;const s=Math.floor(R()*n);pulses.push({from:s,to:-1,k:0})}
    c.clearRect(0,0,w,h);c.lineWidth=1;for(const p of P){c.strokeStyle=`rgba(${mint},.16)`;c.beginPath();c.moveTo(cx,cy);c.lineTo(p.x,p.y);c.stroke()}
    const nx=[];for(const q of pulses){q.k+=dt*1.3;const a=q.to<0?P[q.from]:{x:cx,y:cy},b=q.to<0?{x:cx,y:cy}:P[q.to];const e=Math.min(1,q.k);const x=a.x+(b.x-a.x)*e,y=a.y+(b.y-a.y)*e;
      c.fillStyle=q.to<0?`rgba(${mint},.95)`:`rgba(${gold},.95)`;c.beginPath();c.arc(x,y,2.4,0,7);c.fill();if(q.k>=1){if(q.to<0){for(let i=0;i<n;i++)nx.push({from:-1,to:i,k:0});q.done=1;q.flash=1}else q.done=1}}
    pulses=pulses.filter(q=>!q.done).concat(nx);
    for(const p of P){c.fillStyle=`rgba(${mint},.8)`;c.beginPath();c.arc(p.x,p.y,3,0,7);c.fill()}
    const g=c.createRadialGradient(cx,cy,0,cx,cy,20);g.addColorStop(0,`rgba(${gold},.55)`);g.addColorStop(1,`rgba(${gold},0)`);c.fillStyle=g;c.fillRect(cx-20,cy-20,40,40);c.fillStyle=`rgba(${gold},1)`;c.beginPath();c.arc(cx,cy,4.2,0,7);c.fill()}}}
};
document.querySelectorAll('canvas.glyph').forEach(cv=>{const f=G[cv.dataset.g];if(f)add(cv,f,{stillSteps:150})});

/* ---------- imagine-it toy ---------- */
const toy=$('toy'),read=$('toy-read'),form=$('imagine-form'),inp=$('imagine-in');
if(toy){let api={};
  const hex=()=>Math.floor(R()*65536).toString(16).padStart(4,'0');
  function makeObj(prompt){const p=(prompt||'').toLowerCase();let kind=/surf|board/.test(p)?'board':/ship|rocket|craft|plane|space|jet/.test(p)?'ship':/skelet|creature|animal|beast|dragon|horse|dog|cat|fish|bird|neck|leg|body|monster/.test(p)?'creature':null;
    const guessed=!kind;if(!kind)kind=['board','ship','creature'][Math.floor(R()*3)];const PAL=[[42,30,88,168],[190,20,90,40],[350,25,86,175],[160,22,84,25],[220,18,90,345]];const pal=PAL[Math.floor(R()*PAL.length)];const hue=pal[0];const o={kind,hue,pal,id:hex(),prompt:prompt||'',guessed,y:0,vy:0,x:0,tilt:0,born:0,parts:[]};
    if(kind==='board'){o.len=rr(150,230);o.wid=rr(.18,.27);o.fins=1+Math.floor(R()*3);o.stripe=R();o.hover=rr(.42,.55);o.thrust=rr(.8,1.3);o.desc=`flying surfboard · ${Math.round(o.len/30*10)/10} ft · ${o.fins} fin${o.fins>1?'s':''} · hover thrust ${o.thrust.toFixed(2)}`}
    if(kind==='ship'){o.len=rr(190,280);o.span=rr(.35,.7);o.eng=1+Math.floor(R()*3);o.swept=rr(.1,.5);o.hover=rr(.3,.45);o.desc=`spaceship · ${o.eng} engine${o.eng>1?'s':''} · wing sweep ${Math.round(o.swept*90)}° · span ${Math.round(o.span*100)}%`}
    if(kind==='creature'){const pairs=/\b(six|6)\b/.test(p)?3:/\b(eight|8)\b/.test(p)?4:/\b(two|2|biped)\b/.test(p)?1:/\b(four|4)\b/.test(p)?2:(R()<.6?2:3);
      o.verts=Math.round(rr(7,12));o.neck=/neck|giraffe/.test(p)?rr(.9,1.3):rr(.25,.7);o.pairs=pairs;o.seg=rr(13,18);o.leg=rr(34,52);o.gait=rr(1.6,2.6);o.tail=rr(.4,1);o.skull=rr(.8,1.3);o.lig=0;o.desc=''}
    return o}
  function lerp(a,b,k){return a+(b-a)*k}
  function sky(c,w,h,t,hy){const g=c.createLinearGradient(0,0,0,hy);g.addColorStop(0,'#050b18');g.addColorStop(1,'#0d1d36');c.fillStyle=g;c.fillRect(0,0,w,hy);
    if(!sky.st||sky.w!==w){sky.w=w;sky.st=Array.from({length:Math.round(w*hy/1800)},()=>[R()*w,R()*hy*.95,R()*1.2+.3,R()*7])}
    for(const s of sky.st){c.fillStyle=`rgba(230,240,255,${.25+.35*Math.sin(t*1.3+s[3])**2})`;c.fillRect(s[0],s[1],s[2],s[2])}
    const wg=c.createLinearGradient(0,hy,0,h);wg.addColorStop(0,'#0b1a30');wg.addColorStop(1,'#02060d');c.fillStyle=wg;c.fillRect(0,hy,w,h-hy);
    // far land behind, headlands left and right: the bay
    c.fillStyle='#050a14';c.beginPath();c.moveTo(0,hy);for(let x=0;x<=w;x+=8){const k=x/w;c.lineTo(x,hy-(8+Math.sin(k*9+1)*5+Math.sin(k*23)*2)*(k>.2&&k<.8?1:.4))}c.lineTo(w,hy);c.fill();
    c.fillStyle='#03070f';c.beginPath();c.moveTo(0,h);c.lineTo(0,hy-h*.22);c.quadraticCurveTo(w*.08,hy-h*.12,w*.16,hy+2);c.lineTo(w*.05,h);c.fill();
    c.beginPath();c.moveTo(w,h);c.lineTo(w,hy-h*.2);c.quadraticCurveTo(w*.92,hy-h*.1,w*.84,hy+2);c.lineTo(w*.95,h);c.fill();
    c.strokeStyle='rgba(180,210,255,.07)';c.lineWidth=1;for(let i=0;i<14;i++){const y=hy+6+i*i*1.3;const x0=(Math.sin(t*.3+i)*.5+.5)*w*.6;c.beginPath();c.moveTo(x0,y);c.lineTo(x0+40+i*12,y);c.stroke()}}
  function drawBoard(c,o,x,y,ang,t){c.save();c.translate(x,y);c.rotate(ang);const L=o.len,W=L*o.wid;
    const bg=c.createLinearGradient(0,-W/2,0,W/2);bg.addColorStop(0,`hsl(${o.pal[0]},${o.pal[1]}%,${o.pal[2]}%)`);bg.addColorStop(1,`hsl(${o.pal[0]},${o.pal[1]}%,${o.pal[2]-22}%)`);c.fillStyle=bg;c.beginPath();c.moveTo(-L/2,0);c.bezierCurveTo(-L*.42,-W*.55,L*.3,-W*.6,L/2,-W*.05);c.bezierCurveTo(L*.3,W*.5,-L*.42,W*.5,-L/2,0);c.fill();
    c.strokeStyle=`hsla(${o.pal[3]},55%,62%,.9)`;c.lineWidth=W*.08;c.beginPath();c.moveTo(-L*.42,0);c.quadraticCurveTo(0,-W*.18*(o.stripe-.5)*2,L*.42,-W*.03);c.stroke();
    c.fillStyle=`hsl(${o.hue},25%,40%)`;for(let i=0;i<o.fins;i++){const fx=-L*.36+i*8-(o.fins-1)*4;c.beginPath();c.moveTo(fx-10,W*.3);c.lineTo(fx+4,W*.3);c.lineTo(fx-6,W*.3+16);c.fill()}
    c.restore()}
  function drawShip(c,o,x,y,ang,t){c.save();c.translate(x,y);c.rotate(ang);const L=o.len,S=L*o.span;
    c.fillStyle=`hsl(${o.hue},18%,62%)`;c.beginPath();c.moveTo(-L*.1,0);c.lineTo(-L*.1-L*o.swept,-S*.5);c.lineTo(-L*.1-L*o.swept+22,-S*.5);c.lineTo(L*.16,-8);c.closePath();c.fill();
    c.fillStyle=`hsl(${o.hue},14%,72%)`;c.beginPath();c.moveTo(L*.52,0);c.quadraticCurveTo(L*.2,-L*.1,-L*.42,-L*.07);c.lineTo(-L*.46,L*.05);c.quadraticCurveTo(L*.2,L*.08,L*.52,0);c.fill();
    c.fillStyle=`hsl(${o.hue},18%,52%)`;c.beginPath();c.moveTo(-L*.1,2);c.lineTo(-L*.1-L*o.swept*.7,S*.3);c.lineTo(-L*.1-L*o.swept*.7+18,S*.3);c.lineTo(L*.12,6);c.fill();
    const cg=c.createLinearGradient(L*.15,-L*.07,L*.35,0);cg.addColorStop(0,'rgba(127,230,218,.9)');cg.addColorStop(1,'rgba(40,90,120,.9)');c.fillStyle=cg;c.beginPath();c.ellipse(L*.26,-L*.04,L*.1,L*.03,-.08,0,7);c.fill();
    for(let i=0;i<o.eng;i++){const ey=(i-(o.eng-1)/2)*L*.045;const fl=1+.25*Math.sin(t*30+i*2);const g=c.createRadialGradient(-L*.47,ey,0,-L*.47,ey,L*.16*fl);g.addColorStop(0,'rgba(255,240,210,.95)');g.addColorStop(.3,'rgba(127,230,218,.6)');g.addColorStop(1,'rgba(127,230,218,0)');c.fillStyle=g;c.fillRect(-L*.66,ey-L*.16,L*.36,L*.32)}
    c.restore()}
  function drawCreature(c,o,x,y,t,w){const k=Math.min(1,(t-o.born)/1.8);o.lig=k;const sp=[];const n=o.verts,seg=o.seg;
    // spine: neck rises at front, tail drops
    for(let i=0;i<n;i++){const u=i/(n-1);const bob=Math.sin(t*o.gait*2+i*.5)*2;sp.push({x:x+(u-.5)*seg*n,y:y-60+bob+Math.sin(u*Math.PI)*-6})}
    const neck=[],nn=4;let a=-Math.PI*(.2+o.neck*.22),px=sp[n-1].x,py=sp[n-1].y;for(let i=0;i<nn;i++){const sw=Math.sin(t*1.1+i*.6)*.08;px+=Math.cos(a+sw)*seg*(.8+o.neck*.7);py+=Math.sin(a+sw)*seg*(.8+o.neck*.7);neck.push({x:px,y:py});a+=.12}
    const tail=[];px=sp[0].x;py=sp[0].y;let ta=Math.PI+.25;for(let i=0;i<5;i++){ta+=Math.sin(t*1.6+i)*.12+.06;px+=Math.cos(ta)*seg*o.tail*.9;py+=Math.sin(ta)*seg*o.tail*.9;tail.push({x:px,y:py})}
    const legs=[];for(let j=0;j<o.pairs;j++){const idx=Math.round(lerp(1,n-2,o.pairs>1?j/(o.pairs-1):.5));const hip=sp[idx];for(let s=0;s<2;s++){const ph=t*o.gait*2+j*Math.PI*.7+s*Math.PI;const sw=Math.sin(ph)*.45;const lift=Math.max(0,Math.cos(ph))*10;
      const ky=hip.y+o.leg*.55-lift*.5,kx=hip.x+Math.sin(sw)*o.leg*.5+(s?4:-4);const fy=y-lift,fx=hip.x+Math.sin(sw)*o.leg*.95+(s?6:-6);legs.push({hip,knee:{x:kx,y:ky},foot:{x:fx,y:fy},back:s===0})}}
    const bone=(a,b,wd,al)=>{c.strokeStyle=`rgba(236,230,214,${al})`;c.lineWidth=wd;c.lineCap='round';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke()};
    const ligs=[];const pairs=(arr)=>{for(let i=1;i<arr.length;i++)ligs.push([arr[i-1],arr[i]])};
    // draw back legs dim
    for(const l of legs)if(l.back){bone(l.hip,l.knee,3,.35);bone(l.knee,l.foot,2.4,.35)}
    const chain=[...tail.slice().reverse(),...sp,...neck];for(let i=1;i<chain.length;i++)bone(chain[i-1],chain[i],3.2,.9);
    for(const v of sp){c.fillStyle='rgba(236,230,214,.95)';c.beginPath();c.arc(v.x,v.y,3.1,0,7);c.fill();bone(v,{x:v.x,y:v.y-9},1.6,.6)}
    for(const l of legs)if(!l.back){bone(l.hip,l.knee,3.4,.92);bone(l.knee,l.foot,2.8,.92)}
    const hd=neck[nn-1];c.fillStyle='rgba(236,230,214,.95)';c.beginPath();c.ellipse(hd.x+9*o.skull,hd.y-2,12*o.skull,7*o.skull,.25,0,7);c.fill();c.fillStyle='#0a1424';c.beginPath();c.arc(hd.x+11*o.skull,hd.y-4,2,0,7);c.fill();
    // ligaments: form progressively, glow with stretch
    for(let i=1;i<chain.length;i++)ligs.push([chain[i-1],chain[i],1]);for(let i=2;i<chain.length;i+=2)ligs.push([chain[i-2],chain[i],1.4]);for(const l of legs){ligs.push([l.hip,l.knee,1]);ligs.push([l.knee,l.foot,1]);ligs.push([l.hip,l.foot,.6]);const nb=sp.reduce((m,v)=>Math.abs(v.x-l.hip.x)<Math.abs(m.x-l.hip.x)&&v!==l.hip?v:m,sp[0]);ligs.push([nb,l.knee,.8])}
    const shown=Math.floor(ligs.length*k);ligs.slice(0,shown).forEach(([a,b,bend],i)=>{const d=Math.hypot(b.x-a.x,b.y-a.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2,nx=-(b.y-a.y)/(d||1),ny=(b.x-a.x)/(d||1);const fl=Math.sin(t*o.gait*2+i)*.5+.5;const off=(4+fl*4)*bend*(i%2?1:-1);
      c.strokeStyle=`rgba(${i%3?mint:'255,150,140'},${.25+.45*fl})`;c.lineWidth=1+fl*.8;c.beginPath();c.moveTo(a.x,a.y);c.quadraticCurveTo(mx+nx*off,my+ny*off,b.x,b.y);c.stroke()});
    o.desc=`creature · ${n} vertebrae · ${o.pairs*2} legs · ${ligs.length} ligaments${k<1?' forming':''}`;return chain.concat(legs.map(l=>l.foot))}
  add(toy,it=>{let o=makeObj(''),T=0,parts=[],tx=0;o.born=0;
    const set=pr=>{o=makeObj(pr);o.born=T;o.y=it.h*.18;o.vy=0;o.x=it.w*.5;parts=[];};
    api.set=set;
    return{draw(c,w,h,t,dt,skip){T=t;const hy=h*.62;if(skip&&!motion())return;
      sky(c,w,h,t,hy);const head=read;
      if(o.kind==='board'||o.kind==='ship'){const ty=h*o.hover+Math.sin(t*.9)*h*.03;o.vy+=((ty-o.y)*7-o.vy*2.2)*dt;o.y+=o.vy*dt;const txx=w*(.5+Math.sin(t*.35)*.12);o.x+=(txx-o.x)*dt*.8;const ang=Math.max(-.25,Math.min(.25,o.vy*.004))+(o.kind==='ship'?Math.sin(t*.7)*.04:Math.sin(t*1.2)*.05);
        // reflection
        c.save();c.globalAlpha=.18;c.translate(0,hy*2+ (h-hy)*.15);c.scale(1,-1);o.kind==='board'?drawBoard(c,o,o.x,o.y,-ang,t):drawShip(c,o,o.x,o.y,-ang,t);c.restore();
        if(motion()&&R()<.8)for(let i=0;i<3;i++)parts.push({x:o.x+(o.kind==='ship'?-o.len*.46:rr(-o.len*.3,o.len*.3)),y:o.y+(o.kind==='ship'?0:8),vx:o.kind==='ship'?-rr(60,140):rr(-15,15),vy:o.kind==='ship'?rr(-10,10):rr(40,90),a:1});
        parts=parts.filter(p=>(p.a-=dt*1.4)>0);c.globalCompositeOperation='lighter';for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.y>hy){p.y=hy;p.vy*=-.2;p.vx*=1.5}c.fillStyle=`rgba(${mint},${p.a*.6})`;c.fillRect(p.x,p.y,2,2)}c.globalCompositeOperation='source-over';
        // hover disturbance on the water
        const ry=hy+(h-hy)*.15;c.strokeStyle=`rgba(${mint},.25)`;for(let i=0;i<3;i++){const r=((t*40+i*30)%90);c.globalAlpha=1-r/90;c.beginPath();c.ellipse(o.x,ry,r*1.6,r*.25,0,0,7);c.stroke()}c.globalAlpha=1;
        o.kind==='board'?drawBoard(c,o,o.x,o.y,ang,t):drawShip(c,o,o.x,o.y,ang,t)}
      else{const gy=hy+(h-hy)*.28;c.fillStyle='rgba(20,34,52,.9)';c.beginPath();c.ellipse(w/2,gy+6,w*.42,(h-hy)*.12,0,0,7);c.fill();c.strokeStyle=`rgba(${mint},.25)`;c.beginPath();c.ellipse(w/2,gy+6,w*.42,(h-hy)*.12,0,Math.PI,0);c.stroke();
        if(!o.walk)o.walk=w*.5;o.walk+=dt*(o.gait*9);if(o.walk>w*.72)o.walk=w*.28;const sc=Math.min(1.5,w/560);c.save();c.translate(o.walk,gy);c.scale(sc,sc);drawCreature(c,o,0,0,t,w);c.restore();
        c.save();c.globalAlpha=.12;c.translate(o.walk,gy+12);c.scale(sc,-sc*.6);drawCreature(c,o,0,0,t,w);c.restore()}
      head.textContent=`roll ${o.id} · ${o.guessed&&o.prompt?`“${o.prompt}” → `:''}${o.desc}`}}},{stillSteps:70});
  const go=p=>{api.set&&api.set(p);if(!motion()){const it=items.find(i=>i.cv===toy);still(it)}};
  form.addEventListener('submit',e=>{e.preventDefault();go(inp.value.trim()||inp.placeholder)});
  document.querySelectorAll('.chips button').forEach(b=>b.addEventListener('click',()=>{inp.value=b.dataset.p;go(b.dataset.p)}));
  const first=['a flying surfboard','a spaceship','a long-necked creature'][Math.floor(R()*3)];inp.placeholder=first;go(first);
}
kick();
})();
