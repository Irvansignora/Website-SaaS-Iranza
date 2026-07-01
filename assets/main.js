/* =========================================================================
   GANTI URL FOTO/MOCKUP DI SINI
   Tempel URL Cloudinary kamu di bawah. Slot kosong otomatis pakai placeholder.
   ========================================================================= */
const DEMO_CONFIG = {
  businessSystem: [
     "https://res.cloudinary.com/dyhvx9wit/image/upload/v1782873132/financial_iranza_i0p55f.jpg",
     "https://res.cloudinary.com/dyhvx9wit/image/upload/v1782873131/invoice_iranza_nna4kn.jpg",
     "https://res.cloudinary.com/dyhvx9wit/image/upload/v1782873131/wms_iranza_mvrgqj.jpg",
     "https://res.cloudinary.com/dyhvx9wit/image/upload/v1782873132/coretax_iranza_xnpv0a.jpg",
  ],
  payroll: [
    "https://res.cloudinary.com/dyhvx9wit/image/upload/v1782875112/db_payroll_ig0c5s.jpg",
    "https://res.cloudinary.com/dyhvx9wit/image/upload/v1782875112/run_payroll_ojekpq.jpg",
    "https://res.cloudinary.com/dyhvx9wit/image/upload/v1782875111/payslip_tiuilq.jpg",
    "https://res.cloudinary.com/dyhvx9wit/image/upload/v1782875111/thr_b2phxf.jpg",
  ],
};

const captionMap = {
  businessSystem: [
    "Laporan Keuangan & Neraca",
    "Pembuatan Invoice & Tagihan",
    "Manajemen Stok Gudang (WMS)",
    "Ekspor XML Coretax DJP"
  ],
  payroll: [
    "Database Payroll Karyawan",
    "Proses Perhitungan Gaji & Pajak",
    "Tampilan Slip Gaji Karyawan",
    "Simulasi & Hitung THR Otomatis"
  ]
};

/* Mockup produk full-bleed di hero tile — tempel 1 URL screenshot/mockup terbaik per produk */
const MOCKUP_CONFIG = {
  businessSystem: "https://res.cloudinary.com/dyhvx9wit/image/upload/v1782873131/dashboard_iranza_s8ldvr.jpg",
  payroll: "https://res.cloudinary.com/dyhvx9wit/image/upload/v1782875112/dashboard_payroll_di6w8l.jpg",
};
/* ========================================================================= */

const placeholderSVG = `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="0"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="M21 15l-5-5L5 21"></path></svg>`;

function placeholderBlock(label){
  return `<div class="ph">${placeholderSVG}<span>Screenshot belum diisi<br>tempel URL di DEMO_CONFIG</span></div><div class="cap">${label}</div>`;
}
function renderGalleries(){
  document.querySelectorAll('[data-gallery]').forEach(gal => {
    const key = gal.getAttribute('data-gallery');
    const urls = DEMO_CONFIG[key] || [];
    const caps = captionMap[key] || [];
    gal.querySelectorAll('[data-shot]').forEach(shot => {
      const idx = parseInt(shot.getAttribute('data-shot'), 10);
      const url = urls[idx];
      const label = caps[idx] || (key + '.demo');
      if(url){
        const img = document.createElement('img');
        img.src = url;
        img.alt = key + ' demo screenshot ' + (idx+1);
        img.onerror = () => { shot.innerHTML = placeholderBlock(label); };
        shot.appendChild(img);
        const cap = document.createElement('div');
        cap.className = 'cap';
        cap.textContent = label;
        shot.appendChild(cap);
      } else {
        shot.innerHTML = placeholderBlock(label);
      }
    });
  });
}
renderGalleries();

function renderMockups(){
  document.querySelectorAll('[data-mockup]').forEach(slot => {
    const key = slot.getAttribute('data-mockup');
    const url = MOCKUP_CONFIG[key];
    if(url){
      const img = document.createElement('img');
      img.src = url;
      img.alt = key + ' product mockup';
      img.onerror = () => { slot.innerHTML = mockupPlaceholder(key); };
      slot.appendChild(img);
    } else {
      slot.innerHTML = mockupPlaceholder(key);
    }
  });
}
function mockupPlaceholder(key){
  const name = key === 'payroll' ? 'payroll' : 'business-system';
  return `<div class="ph">${placeholderSVG}<span>Mockup produk belum diisi</span><code>MOCKUP_CONFIG.${key === 'payroll' ? 'payroll' : 'businessSystem'}</code></div>`;
}
renderMockups();

/* nav toggle */
const navtoggle = document.getElementById('navtoggle');
const navlinks = document.getElementById('navlinks');
navtoggle.addEventListener('click', () => navlinks.classList.toggle('open'));
navlinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navlinks.classList.remove('open')));

/* scroll reveal with stagger — elements sharing a parent cascade in */
document.querySelectorAll('.card-grid, .flow, .row-list, .gallery-grid').forEach(group => {
  group.querySelectorAll(':scope > .reveal').forEach((el, i) => {
    el.style.transitionDelay = Math.min(i * 60, 360) + 'ms';
  });
});
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); ro.unobserve(e.target); }});
}, {threshold:0.08});
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

/* =========================================================================
   PARTICLE FIELD — self-contained Canvas 2D particle network (no external
   libraries). Dots drift slowly and draw a connecting line when close
   enough; the field parallaxes gently with the cursor. Used on the hero
   and reused on every dark section via [data-particles-canvas], so all of
   them feel consistent. Each instance pauses itself with an
   IntersectionObserver while its section is off-screen, and respects
   prefers-reduced-motion.
   ========================================================================= */
function createParticleField(canvas){
  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!container) return;

  const areaPerParticle = parseFloat(canvas.dataset.area) || 13000;
  const minCount = parseFloat(canvas.dataset.minCount) || 30;
  const maxCount = parseFloat(canvas.dataset.maxCount) || 260;
  const LINK_DIST = 150;
  const PARALLAX = 18;

  let width, height, dpr, particles = [];
  let mouseX = 0, mouseY = 0, parX = 0, parY = 0;
  let running = false, rafId = null;

  function countFor(w, h){ return Math.max(minCount, Math.min(maxCount, Math.round((w*h) / areaPerParticle))); }

  function resize(){
    width = container.clientWidth;
    height = container.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const n = reduceMotion ? 0 : countFor(width, height);
    particles = new Array(n).fill(0).map(() => ({
      x: Math.random()*width,
      y: Math.random()*height,
      vx: (Math.random()-0.5)*0.22,
      vy: (Math.random()-0.5)*0.22,
      r: 1.1 + Math.random()*1.6
    }));
    ctx.clearRect(0, 0, width, height);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) - 0.5;
    mouseY = ((e.clientY - rect.top) / rect.height) - 0.5;
  });

  function step(){
    if(!running) return;
    parX += (mouseX*PARALLAX - parX) * 0.04;
    parY += (mouseY*PARALLAX - parY) * 0.04;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(parX, parY);

    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x < -20) p.x = width+20; if(p.x > width+20) p.x = -20;
      if(p.y < -20) p.y = height+20; if(p.y > height+20) p.y = -20;
    }

    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < LINK_DIST){
          ctx.strokeStyle = `rgba(0,102,204,${(1-dist/LINK_DIST)*0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for(const p of particles){
      ctx.fillStyle = 'rgba(41,151,255,0.9)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
    rafId = requestAnimationFrame(step);
  }

  function start(){ if(running || reduceMotion) return; running = true; step(); }
  function stop(){ running = false; if(rafId) cancelAnimationFrame(rafId); }

  resize();

  if(reduceMotion){ return; } // static, empty canvas — no motion, no cost

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { e.isIntersecting ? start() : stop(); });
  }, {threshold:0});
  io.observe(container);
}
document.querySelectorAll('canvas.particles-canvas').forEach(createParticleField);



/* =========================================================================
   PRELOADER — hide once page is ready (min display time to avoid flash)
   ========================================================================= */
(function initPreloader(){
  const pre = document.getElementById('preloader');
  if(!pre) return;
  const minShow = 500;
  const start = Date.now();
  function hide(){
    const wait = Math.max(0, minShow - (Date.now() - start));
    setTimeout(() => {
      pre.classList.add('hide');
      document.body.classList.remove('loading');
      setTimeout(() => pre.remove(), 600);
    }, wait);
  }
  if(document.readyState === 'complete') hide();
  else window.addEventListener('load', hide);
  setTimeout(hide, 2500); // safety fallback
})();

/* =========================================================================
   MICRO-INTERACTION — button ripple on click
   ========================================================================= */
document.querySelectorAll('.btn-primary,.btn-secondary-pill,.btn-store-hero,.btn-dark-utility').forEach(btn => {
  btn.addEventListener('click', function(e){
    const rect = this.getBoundingClientRect();
    const r = document.createElement('span');
    const size = Math.max(rect.width, rect.height) * 1.4;
    r.className = 'ripple';
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size/2) + 'px';
    r.style.top = (e.clientY - rect.top - size/2) + 'px';
    this.appendChild(r);
    setTimeout(() => r.remove(), 650);
  });
});

/* =========================================================================
   MICRO-INTERACTION — spotlight cursor glow on tilt-card
   ========================================================================= */
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
  });
});

/* =========================================================================
   FLOATING HEADER — collapses the full-width nav into a rounded, inset
   "pill" once the page scrolls past the top, iOS-style (e.g. Camera app).
   ========================================================================= */
(function initFloatingHeader(){
  const header = document.querySelector('header');
  if(!header) return;
  const THRESHOLD = 24;
  let isScrolled = false;
  let ticking = false;
  function update(){
    const shouldFloat = window.scrollY > THRESHOLD;
    if(shouldFloat !== isScrolled){
      isScrolled = shouldFloat;
      header.classList.toggle('is-scrolled', isScrolled);
    }
    ticking = false;
  }
  function onScroll(){
    if(!ticking){ requestAnimationFrame(update); ticking = true; }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  update();
})();

/* =========================================================================
   SCROLL PROGRESS BAR
   ========================================================================= */
(function initScrollProgress(){
  const bar = document.getElementById('scroll-progress');
  if(!bar) return;
  function update(){
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', update);
  update();
})();

/* =========================================================================
   ANIMATED NUMBER COUNTER (stat-callout)
   ========================================================================= */
(function initCounters(){
  const counters = document.querySelectorAll('[data-count]');
  if(!counters.length) return;
  const co = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-suffix') || '';
      co.unobserve(el);
      const dur = 1200;
      const startTime = performance.now();
      function tick(now){
        const p = Math.min(1, (now - startTime) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if(p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, {threshold:0.5});
  counters.forEach(el => co.observe(el));
})();

/* =========================================================================
   FLOATING WHATSAPP BUTTON — appear after scrolling past hero
   ========================================================================= */
(function initFloatWa(){
  const wa = document.getElementById('floatWa');
  if(!wa) return;
  const hero = document.querySelector('.hero-band, .page-hero');
  if(!hero){ wa.classList.add('show'); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => wa.classList.toggle('show', !e.isIntersecting));
  }, {threshold:0});
  io.observe(hero);
})();
/* =========================================================================
   PARALLAX ON SCROLL — elements with [data-parallax="speed"] drift as the
   page scrolls, offset relative to viewport center for a natural depth feel.
   ========================================================================= */
(function initParallax(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll('[data-parallax]');
  if(!els.length || reduceMotion) return;
  let ticking = false;
  function update(){
    const vh = window.innerHeight;
    els.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      const rect = el.getBoundingClientRect();
      const centerOffset = (rect.top + rect.height/2) - (vh/2);
      el.style.transform = 'translate3d(0,' + (-centerOffset * speed).toFixed(1) + 'px,0)';
    });
    ticking = false;
  }
  function onScroll(){
    if(!ticking){ requestAnimationFrame(update); ticking = true; }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  update();
})();
