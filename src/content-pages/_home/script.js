(function () {
  var tl = document.querySelector('[data-tl]'); if (!tl) return;
  var items = [].slice.call(tl.querySelectorAll('li')), btns = items.map(function (li) { return li.querySelector('.tl-btn'); });
  var wide = function () { return window.matchMedia('(min-width: 960px)').matches; };
  function open(i, toggle) {
    items.forEach(function (li, j) {
      var on = j === i && !(toggle && li.classList.contains('open') && !wide());
      li.classList.toggle('open', on); btns[j].setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  }
  btns.forEach(function (b, i) {
    b.addEventListener('click', function () { open(i, true); });
    b.addEventListener('keydown', function (e) {
      var k = e.key, n = btns.length, t = -1;
      if (k === 'ArrowRight' || k === 'ArrowDown') t = (i + 1) % n; else if (k === 'ArrowLeft' || k === 'ArrowUp') t = (i - 1 + n) % n; else if (k === 'Home') t = 0; else if (k === 'End') t = n - 1;
      if (t > -1) { e.preventDefault(); btns[t].focus(); }
    });
  });
  // o fio dourado se desenha uma vez, quando a linha do tempo entra na tela (sem JS ou com movimento reduzido: já desenhado)
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { tl.classList.remove('pre'); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { tl.classList.add('drawn'); setTimeout(function () { tl.classList.remove('pre'); }, 3200); io.disconnect(); } }); }, { threshold: 0.25 });
  io.observe(tl);
})();
