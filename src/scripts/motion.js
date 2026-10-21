// Movimento do site (viviroque.com.br). Regras: o conteúdo já está no HTML e aparece sem JavaScript;
// o movimento só acompanha a leitura (revela o que entra na tela, mostra o progresso, dá peso ao retrato) e some com
// prefers-reduced-motion. Nada fica em loop.
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bar = document.querySelector('.rd');
  var hd = document.querySelector('[data-hd]');
  var photo = document.querySelector('.hero-photo img');
  var ticking = false;

  function frame() {
    ticking = false;
    var y = window.pageYOffset || doc.scrollTop;
    var max = doc.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')';
    if (hd) hd.classList.toggle('is-scrolled', y > 8);
    if (photo && !reduce && y < window.innerHeight) photo.style.setProperty('--py', (y * 0.07).toFixed(1));
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  frame();

  if (reduce || !('IntersectionObserver' in window)) return;

  // Revelação da leitura: cada bloco entra uma vez, com pequena defasagem entre irmãos
  var sel = '.sec h2, .sec .read, .prose > *, .facts li, .beliefs li, .list-art li, .steps li, .build > div, .faq details, .two > div, .cred li, .founder > *';
  var els = [].slice.call(document.querySelectorAll(sel)).filter(function (el) { return !el.closest('.hero') && !el.closest('.tl-sec') && !el.closest('.page-hero'); });
  var groups = new Map();
  els.forEach(function (el) {
    var p = el.parentNode; var n = groups.get(p) || 0; groups.set(p, n + 1);
    el.classList.add('rv'); el.style.setProperty('--d', Math.min(n, 5) * 70 + 'ms');
  });
  doc.classList.add('rv-on');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach(function (el) { io.observe(el); });
  // rede de segurança: nada fica escondido se o observador falhar
  setTimeout(function () { els.forEach(function (el) { el.classList.add('in'); }); }, 6000);
})();
