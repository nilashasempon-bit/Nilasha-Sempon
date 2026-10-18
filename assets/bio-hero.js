// Animated front page for Biology lessons: rotating DNA helix, floating topic particles and the Values Team.
(function () {
  let s1 = document.getElementById('s1');
  const home = !s1 && document.querySelector('header.hero');
  if (home) s1 = home;
  if (!s1 || !s1.classList.contains('hero')) return;
  const path = location.pathname;
  const topic = home ? 'mix' : /\/b9-/.test(path) ? 'cell' : /\/b11-/.test(path) ? 'leaf' : 'chromo';
  const imgDir = home ? 'assets/' : 'img/';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const css = `
  .hero .inner,.hero > .wrap{position:relative;z-index:2}
  .bioart{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
  .bioart canvas{position:absolute;inset:0;width:100%;height:100%}
  .bioteam{position:absolute;top:150px;height:min(64vh,560px)}
  .bioteam.off{display:none}
  .bioband{position:relative;height:var(--bh,170px);margin:4px 0;pointer-events:none;display:none}
  .bioband.on{display:block}
  .bioband canvas{position:absolute;inset:0;width:100%;height:100%}
  .bioband .bioav{top:50%;margin-top:calc(var(--av) / -2 - 8px)}
  .bioav{position:absolute;width:var(--av,92px);text-align:center;animation:bioFloat 6s ease-in-out infinite}
  .bioav img{width:var(--av,92px);height:var(--av,92px);border-radius:50%;border:4px solid #fff;box-shadow:0 10px 26px rgba(0,0,0,.35);background:var(--cc,#7a2424);display:block}
  .bioav span{display:inline-block;margin-top:-12px;position:relative;background:#fff;color:#1b2470;font:800 .82rem/1 "Nunito",system-ui,sans-serif;padding:6px 12px;border-radius:999px;box-shadow:0 4px 10px rgba(0,0,0,.25)}
  .bioav:nth-child(2){animation-delay:-1.2s;animation-duration:7s}
  .bioav:nth-child(3){animation-delay:-2.4s;animation-duration:5.5s}
  .bioav:nth-child(4){animation-delay:-3.6s;animation-duration:6.5s}
  .bioav:nth-child(5){animation-delay:-4.8s;animation-duration:7.5s}
  @keyframes bioFloat{0%,100%{transform:translate(0,0) rotate(-2deg)}50%{transform:translate(6px,-16px) rotate(2deg)}}
  .bioteam.tight .bioav span{font-size:.72rem;padding:4px 9px}
  @media (prefers-reduced-motion:reduce){.bioav{animation:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const art = document.createElement('div'); art.className = 'bioart'; art.setAttribute('aria-hidden', 'true');
  const cv = document.createElement('canvas'); art.appendChild(cv);
  const team = document.createElement('div'); team.className = 'bioteam';
  // positions around the helix (percent of the team box)
  const T = [['shahin', 'Shahin', '#4b6b2f', 2, 2], ['fahim', 'Fahim', '#1f5f8b', 74, 10], ['maha', 'Maha', '#a3343a', 70, 52],
             ['ahmed', 'Ahmed', '#1d6b5b', 0, 46], ['hessa', 'Hessa', '#b07a0a', 36, 74]];
  T.forEach(([k, n, c, x, y]) => {
    const d = document.createElement('div'); d.className = 'bioav'; d.style.left = x + '%'; d.style.top = y + '%'; d.style.setProperty('--cc', c);
    d.innerHTML = `<img src="${imgDir}av-${k}.webp" alt=""><span>${n}</span>`; team.appendChild(d);
  });
  art.appendChild(team);
  const band = document.createElement('div'); band.className = 'bioband'; band.setAttribute('aria-hidden', 'true');
  const bcv = document.createElement('canvas'); band.appendChild(bcv);
  const bteam = [];
  T.forEach(([k, n, c], i) => {
    const d = document.createElement('div'); d.className = 'bioav'; d.style.left = (4 + i * 21) + '%'; d.style.setProperty('--cc', c);
    d.innerHTML = `<img src="${imgDir}av-${k}.webp" alt=""><span>${n}</span>`; band.appendChild(d); bteam.push(d);
  });
  const anchor = s1.querySelector('.banner') || (s1.querySelector('.bannerbtn') || {}).parentElement;
  if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(band, anchor);
  const bcx = bcv.getContext('2d');
  s1.insertBefore(art, s1.firstChild);

  const cx = cv.getContext('2d');
  const COLS = ['#7a5cff', '#3b82f6', '#14a38b', '#c026d3', '#d97706', '#ec4899', '#0ea5e9', '#f97316', '#eab308', '#6366f1'];
  let BW = 0, BH = 0, wide = true, hxC = 0, hxR = 130, helixH = 500, topY = 150, W = 0, H = 0, dpr = 1, parts = [], t = 0, raf = null, visible = true;

  function size() {
    const r = s1.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = Math.max(r.height, s1.scrollHeight);
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px'; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // find the free space to the right of the lesson content
    const inner = s1.querySelector('.inner, .wrap'); topY = home ? 60 : 150;
    const boxes = [];
    if (inner) for (const el of inner.querySelectorAll(':scope > *, :scope > div > *')) {
      if (el.classList.contains('lo') || el.children.length && el.tagName === 'DIV' && !el.matches('.charter,.mystery,.row')) continue;
      let b;
      if (el.matches('img,.charter,.bannerbtn,.banner,.mystery')) b = el.getBoundingClientRect();
      else { const rg = document.createRange(); rg.selectNodeContents(el); b = rg.getBoundingClientRect(); }
      if (b.width) boxes.push({ r: b.right - r.left, t: b.top - r.top, b: b.bottom - r.top, big: el.matches('img,.charter,.bannerbtn,.banner,.mystery,.row') });
    }
    const viewH = home ? s1.clientHeight : Math.min(s1.clientHeight, innerHeight - 110);
    const lowR = Math.max(0, ...boxes.filter(x => x.big).map(x => x.r));       // banner / charter column
    const allR = Math.max(lowR, ...boxes.map(x => x.r));
    let left = allR + 24;
    if (W - left < 300) {                                                       // long title: go below it
      left = lowR + 24;
      boxes.forEach(x => { if (x.r > left - 10 && !x.big) topY = Math.max(topY, x.b + 16); });
    }
    const width = Math.min(440, W - left - 16);
    wide = width >= 260 && viewH - topY >= 300;
    team.classList.toggle('off', !wide);
    band.classList.toggle('on', !wide);
    if (!wide) {
      const bw = band.clientWidth || W - 32, bav = Math.round(Math.max(46, Math.min(84, bw / 9)));
      band.style.setProperty('--av', bav + 'px'); band.style.setProperty('--bh', Math.round(bav * 1.9) + 'px');
      band.querySelectorAll('.bioav').forEach((d, i) => { d.style.left = `calc(${(i + .5) * 20}% - ${bav / 2}px)`; });
      BW = band.clientWidth; BH = band.clientHeight; bcv.width = BW * dpr; bcv.height = BH * dpr; bcx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    team.style.left = left + 'px'; team.style.width = Math.max(0, width) + 'px';
    const av = Math.round(Math.max(58, Math.min(92, width * .21)));
    team.style.setProperty('--av', av + 'px');
    hxC = left + width / 2; hxR = Math.min(130, width * .3);
    team.style.top = topY + 'px';
    const avail = viewH - topY - (home ? 70 : 10);
    team.style.height = Math.max(280, Math.min(560, avail)) + 'px'; team.classList.toggle('tight', avail < 420 || av < 80); helixH = Math.max(260, Math.min(600, avail + 40));
    if (!parts.length) for (let i = 0; i < 26; i++) parts.push({ x: Math.random(), y: Math.random(), s: 10 + Math.random() * 22, v: .00025 + Math.random() * .0006, a: Math.random() * 6.3, r: (Math.random() - .5) * .01, k: i % 3, c: COLS[i % COLS.length] });
  }

  function particle(p) {
    const x = p.x * W, y = p.y * H; cx.save(); cx.translate(x, y); cx.rotate(p.a); cx.globalAlpha = .22;
    const kind = topic === 'mix' ? ['cell', 'leaf', 'chromo'][p.k] : topic;
    if (kind === 'cell') {
      cx.fillStyle = p.c; cx.beginPath(); cx.ellipse(0, 0, p.s, p.s * .78, 0, 0, 7); cx.fill();
      cx.globalAlpha = .45; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(p.s * .2, -p.s * .1, p.s * .3, 0, 7); cx.fill();
    } else if (kind === 'leaf') {
      cx.fillStyle = p.c === '#eab308' ? '#22c55e' : (p.x > .5 ? '#22c55e' : '#a3e635');
      cx.beginPath(); cx.moveTo(0, -p.s); cx.quadraticCurveTo(p.s * .8, 0, 0, p.s); cx.quadraticCurveTo(-p.s * .8, 0, 0, -p.s); cx.fill();
      cx.globalAlpha = .4; cx.strokeStyle = '#fff'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(0, -p.s); cx.lineTo(0, p.s); cx.stroke();
    } else {
      cx.strokeStyle = p.c; cx.lineCap = 'round'; cx.lineWidth = p.s * .32;
      cx.beginPath(); cx.moveTo(-p.s * .5, -p.s); cx.quadraticCurveTo(0, 0, -p.s * .5, p.s); cx.moveTo(p.s * .5, -p.s); cx.quadraticCurveTo(0, 0, p.s * .5, p.s); cx.stroke();
      cx.globalAlpha = .4; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(0, 0, p.s * .18, 0, 7); cx.fill();
    }
    cx.restore();
  }

  function bandHelix() {
    if (wide || !BW) return;
    bcx.clearRect(0, 0, BW, BH);
    const n = Math.max(14, Math.round(BW / 34)), gap = (BW - 20) / (n - 1), R = BH * .36, cy = BH / 2;
    const rows = [];
    for (let i = 0; i < n; i++) { const ph = t * 1.1 + i * .45; rows.push({ x: 10 + i * gap, s: Math.sin(ph), z: Math.cos(ph), c: COLS[i % COLS.length] }); }
    rows.forEach(r => { bcx.strokeStyle = r.c; bcx.globalAlpha = .5 * (.6 + .4 * Math.abs(r.z)); bcx.lineWidth = 4; bcx.lineCap = 'round';
      bcx.beginPath(); bcx.moveTo(r.x, cy + R * r.s); bcx.lineTo(r.x, cy - R * r.s); bcx.stroke(); });
    rows.forEach(r => { [[cy + R * r.s, r.z], [cy - R * r.s, -r.z]].forEach(([y, z]) => {
      bcx.globalAlpha = .55 + .45 * (z + 1) / 2; bcx.fillStyle = r.c; bcx.beginPath(); bcx.arc(r.x, y, 5 + 4 * (z + 1) / 2, 0, 7); bcx.fill();
      bcx.globalAlpha *= .5; bcx.fillStyle = '#fff'; bcx.beginPath(); bcx.arc(r.x - 2, y - 2, 2 + (z + 1) * .8, 0, 7); bcx.fill(); }); });
    bcx.globalAlpha = 1;
  }

  function helix() {
    if (!wide) return bandHelix();
    const hx = wide ? hxC : W - Math.min(110, W * .28);
    const top = wide ? topY + 20 : 120, h = wide ? helixH : Math.min(H - 220, 640);
    const R = wide ? hxR : 70, n = wide ? 20 : 18, gap = h / (n - 1);
    cx.save(); cx.globalAlpha = wide ? 1 : (W > 700 ? .45 : .25);
    const g = cx.createRadialGradient(hx, top + h / 2, 10, hx, top + h / 2, R * 2.4);
    g.addColorStop(0, 'rgba(255,194,26,.18)'); g.addColorStop(1, 'rgba(255,194,26,0)');
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    const rows = [];
    for (let i = 0; i < n; i++) { const ph = t * 1.1 + i * .48; rows.push({ y: top + i * gap, s: Math.sin(ph), z: Math.cos(ph), c: COLS[i % COLS.length] }); }
    // back-to-front: draw rungs, then ends sorted by depth
    rows.forEach(r => {
      const x1 = hx + R * r.s, x2 = hx - R * r.s;
      cx.strokeStyle = r.c; cx.globalAlpha = (wide ? .55 : .25) * (.6 + .4 * Math.abs(r.z)); cx.lineWidth = 5; cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(x1, r.y); cx.lineTo(x2, r.y); cx.stroke();
    });
    rows.forEach(r => {
      [[hx + R * r.s, r.z], [hx - R * r.s, -r.z]].forEach(([x, z]) => {
        cx.globalAlpha = (wide ? 1 : .4) * (.55 + .45 * (z + 1) / 2);
        cx.fillStyle = r.c; cx.beginPath(); cx.arc(x, r.y, 7 + 5 * (z + 1) / 2, 0, 7); cx.fill();
        cx.globalAlpha *= .5; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(x - 3, r.y - 3, 2.5 + (z + 1), 0, 7); cx.fill();
      });
    });
    cx.restore();
  }

  function draw() {
    cx.clearRect(0, 0, W, H);
    parts.forEach(p => { if (!reduce) { p.y -= p.v; p.a += p.r; if (p.y < -.05) { p.y = 1.05; p.x = Math.random(); } } particle(p); });
    helix();
    if (!reduce) t += .016;
    raf = visible && !reduce ? requestAnimationFrame(draw) : null;
  }

  size(); draw();
  addEventListener('resize', () => { size(); if (!raf) draw(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf) { size(); draw(); } }).observe(s1);
  }
})();
