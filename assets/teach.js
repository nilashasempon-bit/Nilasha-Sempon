// Shared helpers for lesson plan, virtual lab and practice pages
(function(){
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  // confetti
  const cv=document.createElement('canvas');cv.id='confetti';document.body.appendChild(cv);const cx=cv.getContext('2d');let parts=[],raf=null;
  function boom(n){cv.width=innerWidth;cv.height=innerHeight;const cols=['#ffc21a','#e5484d','#1fa75a','#2563eb','#7a3ff0'];
    for(let i=0;i<(n||80);i++)parts.push({x:innerWidth/2,y:innerHeight/3,vx:(Math.random()-.5)*14,vy:Math.random()*-12-4,s:4+Math.random()*6,c:cols[i%5],r:Math.random()*6,life:90});
    if(!raf)tick()}
  function tick(){cx.clearRect(0,0,cv.width,cv.height);parts=parts.filter(p=>p.life-->0);parts.forEach(p=>{p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.r+=.2;cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);cx.restore()});raf=parts.length?requestAnimationFrame(tick):null}
  function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),1600)}
  const PRAISE=['Excellent! 🎉','Well done! ⭐','Brilliant! 🏆','Great job! 👏','Super! 🌟'];
  window.TEACH={boom,toast};
  // virtual lab: load iframe on demand
  $$('[data-load]').forEach(b=>b.onclick=()=>{const box=b.closest('.labbox');const f=document.createElement('iframe');f.className='lab-frame';f.src=b.dataset.load;f.title=b.dataset.title||'Virtual lab';f.allow='fullscreen';box.querySelector('.lab-ph').replaceWith(f);b.remove()});
  $$('[data-print]').forEach(b=>b.onclick=()=>print());
  // practice
  const P=window.PRACTICE;if(!P)return;
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const box=$('#practice'),sc=$('#pscore'),bar=$('#pbar i');let right=0,done=0,total=0;
  function upd(){sc.textContent=`Score: ${right} / ${total}`;bar.style.width=(total?100*done/total:0)+'%';if(total&&done===total){if(right===total){boom(160);toast('Perfect score! 🏆')}else toast(`Finished: ${right} / ${total}`)}}
  function mcqEl(q,i){const d=document.createElement('div');d.className='q';const opts=q.shuffle===false?q.opts.map((o,k)=>[o,k]):shuffle(q.opts.map((o,k)=>[o,k]));
    d.innerHTML=`<div class="qt">${i+1}. ${q.q}</div><div class="opts">${opts.map(([o,k])=>`<button class="opt" data-k="${k}">${o}</button>`).join('')}</div><div class="fb" hidden></div>`;
    let tries=0,first=true;
    $$('.opt',d).forEach(b=>b.onclick=()=>{if(d.dataset.done)return;const ok=+b.dataset.k===q.ok;const fb=$('.fb',d);
      if(ok){b.classList.add('right');d.dataset.done=1;done++;if(first)right++;fb.hidden=false;fb.className='fb ok';fb.innerHTML='✓ '+PRAISE[Math.floor(Math.random()*PRAISE.length)]+(q.why?' '+q.why:'');boom(50);upd()}
      else{first=false;tries++;b.classList.add('wrong');d.classList.remove('bad');void d.offsetWidth;d.classList.add('bad');fb.hidden=false;fb.className='fb no';fb.innerHTML='✗ Not quite. '+(q.hint||'Try again!');
        if(tries>=2){const rb=$$('.opt',d).find(x=>+x.dataset.k===q.ok);rb.classList.add('right');d.dataset.done=1;done++;fb.innerHTML+=' The answer is shown in green.';upd()}}})
    return d}
  function build(mode){box.innerHTML='';right=0;done=0;let qs=[];
    if(mode==='mix')qs=shuffle(P.mcq.concat(P.tf.map(t=>({q:t.q,opts:['True','False'],ok:t.a==='T'?0:1,why:t.why,shuffle:false})))).slice(0,10);
    if(mode==='mcq')qs=shuffle(P.mcq);
    if(mode==='tf')qs=shuffle(P.tf).map(t=>({q:t.q,opts:['True','False'],ok:t.a==='T'?0:1,why:t.why,shuffle:false}));
    if(mode==='kw'){const k=P.kw;qs=shuffle(k).map(x=>{const others=shuffle(k.filter(y=>y!==x)).slice(0,3).map(y=>y.d);const opts=[x.d].concat(others);return{q:`What does <b>${x.w}</b> mean?`,opts,ok:0}})}
    if(mode==='cards'){total=0;sc.textContent='Tap a card to flip it';bar.style.width='0';const g=document.createElement('div');g.className='flash';P.kw.forEach(x=>{const b=document.createElement('button');b.className='fc';b.innerHTML=`<div class="in"><div class="f">${x.w}</div><div class="b">${x.d}</div></div>`;b.onclick=()=>b.classList.toggle('on');g.appendChild(b)});box.appendChild(g);return}
    total=qs.length;qs.forEach((q,i)=>box.appendChild(mcqEl(q,i)));upd()}
  $$('[data-mode]').forEach(b=>b.onclick=()=>{$$('[data-mode]').forEach(x=>x.classList.toggle('on',x===b));build(b.dataset.mode)});
  $('#again').onclick=()=>{const on=$('[data-mode].on');build(on?on.dataset.mode:'mix')};
  build('mix');
})();
