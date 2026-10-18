// Animated front page for Biology lessons: rotating DNA helix, floating topic particles and the Values Team.
(function () {
  const s1 = document.getElementById('s1');
  if (!s1 || !s1.classList.contains('hero')) return;
  const path = location.pathname;
  const topic = /\/b9-/.test(path) ? 'cell' : /\/b11-/.test(path) ? 'leaf' : 'chromo';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const css = `
  .hero .inner{position:relative;z-index:2}
  .bioart{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
  .bioart canvas{position:absolute;inset:0;width:100%;height:100%}
  .bioteam{position:absolute;right:max(2vw,calc((100vw - 1200px)/2 - 40px));top:150px;width:min(34vw,440px);height:min(64vh,560px)}
  .bioav{position:absolute;width:92px;text-align:center;animation:bioFloat 6s ease-in-out infinite}
  .bioav img{width:92px;height:92px;border-radius:50%;border:4px solid #fff;box-shadow:0 10px 26px rgba(0,0,0,.35);background:var(--cc,#7a2424);display:block}
  .bioav span{display:inline-block;margin-top:-12px;position:relative;background:#fff;color:#1b2470;font:800 .82rem/1 "Nunito",system-ui,sans-serif;padding:6px 12px;border-radius:999px;box-shadow:0 4px 10px rgba(0,0,0,.25)}
  .bioav:nth-child(2){animation-delay:-1.2s;animation-duration:7s}
  .bioav:nth-child(3){animation-delay:-2.4s;animation-duration:5.5s}
  .bioav:nth-child(4){animation-delay:-3.6s;animation-duration:6.5s}
  .bioav:nth-child(5){animation-delay:-4.8s;animation-duration:7.5s}
  @keyframes bioFloat{0%,100%{transform:translate(0,0) rotate(-2deg)}50%{transform:translate(6px,-16px) rotate(2deg)}}
  .bioteam.tight .bioav,.bioteam.tight .bioav img{width:70px}.bioteam.tight .bioav img{height:70px}.bioteam.tight .bioav span{font-size:.72rem;padding:4px 9px}
  @media (max-width:1050px){.bioteam{display:none}}
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
    d.innerHTML = `<img src="img/av-${k}.webp" alt=""><span>${n}</span>`; team.appendChild(d);
  });
  art.appendChild(team);
  s1.insertBefore(art, s1.firstChild);

  const cx = cv.getContext('2d');
  const COLS = ['#7a5cff', '#3b82f6', '#14a38b', '#c026d3', '#d97706', '#ec4899', '#0ea5e9', '#f97316', '#eab308', '#6366f1'];
  let helixH = 500, topY = 150, W = 0, H = 0, dpr = 1, parts = [], t = 0, raf = null, visible = true;

  function size() {
    const r = s1.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = Math.max(r.height, s1.scrollHeight);
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px'; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // keep the team and helix clear of a long title
    const teamL = team.getBoundingClientRect().left || (r.right - 480);
    const inner = s1.querySelector('.inner'); topY = 150;
    if (inner) for (const el of inner.children) {
      if (el.classList.contains('teacher')) break;
      if (el.classList.contains('lo')) continue;
      const rg = document.createRange(); rg.selectNodeContents(el); const b = rg.getBoundingClientRect();
      if (b.right > teamL - 20) topY = Math.max(topY, b.bottom - r.top + 20);
    }
    team.style.top = topY + 'px';
    const avail = Math.min(s1.clientHeight, innerHeight - 110) - topY - 10;
    team.style.height = Math.max(280, Math.min(560, avail)) + 'px'; team.classList.toggle('tight', avail < 420); helixH = Math.max(260, Math.min(600, avail + 40));
    if (!parts.length) for (let i = 0; i < 26; i++) parts.push({ x: Math.random(), y: Math.random(), s: 10 + Math.random() * 22, v: .00025 + Math.random() * .0006, a: Math.random() * 6.3, r: (Math.random() - .5) * .01, c: COLS[i % COLS.length] });
  }

  function particle(p) {
    const x = p.x * W, y = p.y * H; cx.save(); cx.translate(x, y); cx.rotate(p.a); cx.globalAlpha = .22;
    if (topic === 'cell') {
      cx.fillStyle = p.c; cx.beginPath(); cx.ellipse(0, 0, p.s, p.s * .78, 0, 0, 7); cx.fill();
      cx.globalAlpha = .45; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(p.s * .2, -p.s * .1, p.s * .3, 0, 7); cx.fill();
    } else if (topic === 'leaf') {
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

  function helix() {
    const wide = W > 1050;
    const hx = wide ? Math.min(W - 230, W / 2 + 600 - 220) : W - Math.min(110, W * .28);
    const top = wide ? topY + 20 : 120, h = wide ? helixH : Math.min(H - 220, 640);
    const R = wide ? 130 : 70, n = wide ? 20 : 18, gap = h / (n - 1);
    cx.save(); cx.globalAlpha = wide ? 1 : .25;
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
