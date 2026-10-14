/* =========================================================
   LATINO ARTE · capa de tema sobre Rider7
   Decora las portadas que arma app.js (no lo modifica):
   numeración, esténcil, destellos, sello giratorio, trazo de pincel,
   cinta marquesina y giro 3D de las portadas al hacer scroll en celular.
   ========================================================= */
(function () {
  'use strict';

  var covers = document.querySelector('.covers');
  if (!covers) return;
  var home = document.querySelector('.view-home');
  var mobileMQ = matchMedia('(max-width: 760px)');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var uid = 0;

  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var SPARK = '<svg viewBox="0 0 24 24"><path d="M12 0c.9 6.6 4.4 10.6 12 12-7.6 1.4-11.1 5.4-12 12-.9-6.6-4.4-10.6-12-12C7.6 10.6 11.1 6.6 12 0z"/></svg>';

  function stencil() {
    return '<svg class="la-stencil" aria-hidden="true" preserveAspectRatio="none">' +
      '<rect class="la-st-dash" x="0" y="0" width="100%" height="100%" rx="10"/>' +
      '<rect class="la-st-line" x="0" y="0" width="100%" height="100%" rx="10" pathLength="100"/>' +
    '</svg>';
  }

  function badge(title) {
    var id = 'la-c' + (++uid);
    var txt = (title + ' ✦ Latino Arte ✦ ').toUpperCase();
    return '<span class="la-badge" aria-hidden="true"><svg viewBox="0 0 100 100">' +
      '<defs><path id="' + id + '" d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0"/></defs>' +
      '<circle cx="50" cy="50" r="49" class="la-b-bg"/>' +
      '<circle cx="50" cy="50" r="27" class="la-b-ring"/>' +
      '<text><textPath href="#' + id + '" textLength="230" lengthAdjust="spacing">' + esc(txt) + '</textPath></text>' +
      '<path class="la-b-star" d="M50 36c.7 6 4 9.3 10 10-6 .7-9.3 4-10 10-.7-6-4-9.3-10-10 6-.7 9.3-4 10-10z"/>' +
    '</svg></span>';
  }

  var UNDERLINE = '<svg class="la-brush" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">' +
    '<path pathLength="100" d="M6 16C60 9 120 6 178 8c40 1.4 80 4 116 2"/>' +
    '<path pathLength="100" class="thin" d="M30 21c50-5 120-8 200-6"/>' +
  '</svg>';

  /* ---------- Decorar cada portada ---------- */
  function decorate() {
    var list = Array.prototype.slice.call(covers.querySelectorAll('.cover'));
    if (!list.length) return;
    var total = list.length;
    list.forEach(function (el, i) {
      if (el.getAttribute('data-la')) return;
      el.setAttribute('data-la', '1');
      el.style.setProperty('--i', i);
      var h2 = el.querySelector('h2');
      var title = h2 ? h2.textContent : '';

      el.insertAdjacentHTML('afterbegin',
        '<span class="la-num" aria-hidden="true"><b>' + pad(i + 1) + '</b><i>/' + pad(total) + '</i></span>');

      // El libro va dentro de un envoltorio que lleva los adornos
      var book = el.querySelector('.cover-book');
      if (book) {
        var wrap = document.createElement('div');
        wrap.className = 'la-wrap';
        book.parentNode.insertBefore(wrap, book);
        wrap.appendChild(book);
        wrap.insertAdjacentHTML('afterbegin', stencil());
        wrap.insertAdjacentHTML('beforeend',
          '<span class="la-spark s1" aria-hidden="true">' + SPARK + '</span>' +
          '<span class="la-spark s2" aria-hidden="true">' + SPARK + '</span>' +
          '<span class="la-spark s3" aria-hidden="true">' + SPARK + '</span>' +
          badge(title));
        book.insertAdjacentHTML('beforeend', '<span class="la-sheen" aria-hidden="true"></span>');
        // Proporción de la tapa: el CSS la usa para que entre entera en la pantalla del celular
        var img = book.querySelector('img');
        var setR = function () { if (img.naturalWidth) wrap.style.setProperty('--r', (img.naturalWidth / img.naturalHeight).toFixed(4)); requestTick(); };
        if (img) { if (img.complete) setR(); else img.addEventListener('load', setR); }
      }
      if (h2) h2.insertAdjacentHTML('afterend', UNDERLINE);
    });

    tape(list);
    fitTitles();
    observe(list);
    requestTick();
  }

  /* ---------- Cinta marquesina antes del pie ---------- */
  function tape(list) {
    var old = home.querySelector('.la-tape');
    if (old) old.remove();
    if (list.length < 2) return;
    var words = list.map(function (el) { var h = el.querySelector('h2'); return h ? h.textContent : ''; }).filter(Boolean);
    var item = words.concat(['Latino Arte']).map(function (w) { return '<span>' + esc(w) + '</span><em>✦</em>'; }).join('');
    var row = item + item + item;
    home.insertAdjacentHTML('beforeend',
      '<div class="la-tape" aria-hidden="true">' +
        '<div class="la-band b2"><div class="la-track">' + row + row + '</div></div>' +
        '<div class="la-band b1"><div class="la-track">' + row + row + '</div></div>' +
      '</div>');
  }

  /* ---------- Títulos: que ninguna palabra se corte ni se salga ---------- */
  function fitTitles() {
    covers.querySelectorAll('.cover-info h2').forEach(function (h) {
      h.style.fontSize = '';
      var size = parseFloat(getComputedStyle(h).fontSize), n = 0;
      while (h.scrollWidth > h.clientWidth + 1 && n++ < 16) {
        size *= 0.92;
        h.style.fontSize = size + 'px';
      }
    });
  }

  /* ---------- Entrada animada de cada parte ---------- */
  var io = null;
  function observe(list) {
    var parts = [];
    list.forEach(function (el) {
      var a = el.querySelector('.la-wrap'), b = el.querySelector('.cover-info');
      if (a) parts.push(a);
      if (b) parts.push(b);
    });
    if (reduce || !('IntersectionObserver' in window)) {
      parts.forEach(function (p) { p.classList.add('la-in'); });
      return;
    }
    document.body.classList.add('la-anim');
    if (io) io.disconnect();
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('la-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.3 });
    parts.forEach(function (p) { io.observe(p); });
  }

  /* ---------- Giro 3D y brillo según el scroll (celular) ---------- */
  var ticking = false;
  function tick() {
    ticking = false;
    if (home.hidden) return;
    var vh = window.innerHeight;
    covers.querySelectorAll('.cover').forEach(function (el) {
      var w = el.querySelector('.la-wrap');
      if (!w) return;
      var r = w.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      // -1 = entrando por abajo · 0 = centrado · 1 = saliendo por arriba
      var t = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
      t = Math.max(-1, Math.min(1, t));
      el.style.setProperty('--t', t.toFixed(4));
      el.style.setProperty('--ta', Math.abs(t).toFixed(4));
    });
  }
  function requestTick() {
    if (ticking || reduce) return;
    ticking = true;
    requestAnimationFrame(tick);
  }

  new MutationObserver(decorate).observe(covers, { childList: true });
  window.addEventListener('scroll', requestTick, { passive: true });
  var rz = null;
  window.addEventListener('resize', function () {
    requestTick();
    clearTimeout(rz);
    rz = setTimeout(fitTitles, 150);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitles);
  if (document.fonts) document.fonts.addEventListener && document.fonts.addEventListener('loadingdone', fitTitles);
  if (mobileMQ.addEventListener) mobileMQ.addEventListener('change', fitTitles);
  decorate();
})();
