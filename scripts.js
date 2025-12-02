// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

  // Año automático en footer
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Menú hamburguesa accesible
  const hamburger = document.getElementById('hamburger');
  const navList = document.getElementById('menu'); // Apuntamos al <ul> con id "menu"
  
  if (hamburger && navList) {
    hamburger.addEventListener('click', () => {
      // Alterna la clase 'active' en la lista <ul>
      const open = navList.classList.toggle('active');
      
      // Actualiza el atributo ARIA para accesibilidad
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Opcional: Cierra el menú si se hace clic en un enlace (útil en 'one-page')
    navList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (navList.classList.contains('active')) {
          navList.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

 // Reveal on scroll (Efecto de aparición)
const reveals = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in'); // ← cambio clave ('show' → 'in')
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach((el) => io.observe(el));
} else {
  // Si IntersectionObserver no es compatible (navegadores muy antiguos)
  reveals.forEach((el) => el.classList.add('in'));
}
}); // Fin del 'DOMContentLoaded'
// ===== CATEGORÍAS — Interacciones & Accesibilidad =====
(function(){
  const grid = document.querySelector('.categorias-grid');
  if (!grid) return;

  // a) Scroll suave a la sección destino
  grid.addEventListener('click', function(e){
    const a = e.target.closest('a.cat-card[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, "", '#' + id);
      // Opcional: resaltar destino
      target.classList.add('highlight');
      setTimeout(()=> target.classList.remove('highlight'), 800);
    }
  });

  // b) Aparición suave (IntersectionObserver)
  const cards = Array.from(document.querySelectorAll('.cat-card'));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced && 'IntersectionObserver' in window) {
    cards.forEach(c=> c.classList.add('is-hidden'));
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.classList.remove('is-hidden');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    cards.forEach(c=> io.observe(c));
  }

  // c) Accesibilidad: si se navega con teclado, muestra focus
  document.addEventListener('keydown', (ev)=>{
    if (ev.key === 'Tab') document.body.classList.add('using-keyboard');
  });
})();
// --- Scroll suave solo para anclas internas ---
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if (!el) return; // Si no hay destino, no hacemos nada
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
// === Sticky header: añade/quita .is-sticky según el scroll ===============
(() => {
  const hdr = document.querySelector('header');
  if (!hdr) return;
  const THRESHOLD = 8; // px de scroll para activar

  const onScroll = () => {
    if (window.scrollY > THRESHOLD) hdr.classList.add('is-sticky');
    else hdr.classList.remove('is-sticky');
  };

  // primer cálculo y listeners
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
// Ordenar y filtrar
(() => {
  const grid = document.getElementById('grid');
  const ord = document.getElementById('ord');
  const fil = document.getElementById('fil');
  if (!grid) return;

  const apply = () => {
    const cards = Array.from(grid.querySelectorAll('.producto'));
    // filtro
    const f = fil ? fil.value : 'all';
    cards.forEach(c=>{
      const mat = (c.getAttribute('data-badge')||'').toLowerCase();
      c.style.display = (f==='all' || f===mat) ? '' : 'none';
    });
    // orden
    const by = ord ? ord.value : 'def';
    const vis = cards.filter(c=>c.style.display!=='none');
    vis.sort((a,b)=>{
      const pa = +a.getAttribute('data-price')||0;
      const pb = +b.getAttribute('data-price')||0;
      if (by==='asc') return pa-pb;
      if (by==='desc') return pb-pa;
      return 0;
    }).forEach(el=>grid.appendChild(el));
  };
  ord && ord.addEventListener('change', apply);
  fil && fil.addEventListener('change', apply);
  apply();
})();

// Skeleton: marca .media como loaded cuando la imagen carga
document.querySelectorAll('.producto .media').forEach(box=>{
  const img = box.querySelector('img');
  const done = () => box.classList.add('loaded');
  if (img.complete) done(); else img.addEventListener('load', done, {once:true});
});
/* ==== Reveal on scroll ==== */
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .1 });
  els.forEach(el => io.observe(el));
})();
/* ==== Tema Navidad automático + overrides por URL ==== */
(() => {
  const now = new Date(); 
  const y = now.getFullYear();
  const start = new Date(y, 10, 1); // 1 nov
  const end   = new Date(y+1, 0, 7, 23, 59, 59); // 7 ene
  const qs = new URLSearchParams(location.search);
  const force = qs.get('theme'); // ?theme=xmas / ?theme=off
  const body = document.body;

  const enableXmas = () => { body.classList.add('theme-xmas'); /* opcional nieve: */ body.classList.add('snow'); };
  const disableXmas = () => { body.classList.remove('theme-xmas','snow'); };

  if (force === 'xmas') enableXmas();
  else if (force === 'off') disableXmas();
  else if (now >= start && now <= end) enableXmas();
})();
