// Art cards. Clicking a work lifts it out of the gallery, grows it to a readable
// size in the middle of the screen, and flips it over to its statement (with a
// mini version of the piece on the back). Clicking the card, the backdrop, the
// close button, or pressing Escape flips it back into its spot.
// The statement text lives in each card's <figcaption>, so it is in the page
// for screen readers and search even without this script.
(function () {
  var cards = document.querySelectorAll('.art-card');
  if (!cards.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ease = 'cubic-bezier(0.32,0.72,0,1)';
  var open = null;

  function box(el) {
    var r = el.getBoundingClientRect();
    return { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' };
  }
  function target() {
    var w = Math.min(920, window.innerWidth - 32);
    var h = Math.min(window.innerWidth < 720 ? window.innerHeight - 96 : 540, window.innerHeight - 64);
    return { left: (window.innerWidth - w) / 2 + 'px', top: (window.innerHeight - h) / 2 + 'px', width: w + 'px', height: h + 'px' };
  }

  function show(card) {
    if (open) return;
    var btn = card.querySelector('.art-flip');
    var img = card.querySelector('img');
    var info = card.querySelector('.art-info');
    var n = card.getAttribute('data-n');

    var layer = document.createElement('div');
    layer.className = 'flip-layer';
    layer.innerHTML =
      '<div class="flip-backdrop"></div>' +
      '<div class="flip-card" role="dialog" aria-modal="true" tabindex="-1">' +
        '<div class="flip-inner">' +
          '<div class="flip-face flip-front"><img alt=""></div>' +
          '<div class="flip-face flip-back">' +
            '<div class="flip-mini"><img alt=""></div>' +
            '<div class="flip-text"><p class="flip-kick">' + n + ' / ' + String(cards.length).padStart(2, '0') + '</p></div>' +
            '<button type="button" class="flip-close" aria-label="Flip back">↻ Flip back</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    var src = img.currentSrc || img.src;
    layer.querySelectorAll('img').forEach(function (i) { i.src = src; });
    layer.querySelector('.flip-mini img').alt = img.alt;
    var text = layer.querySelector('.flip-text');
    Array.prototype.forEach.call(info.children, function (c) { text.appendChild(c.cloneNode(true)); });
    var dialog = layer.querySelector('.flip-card');
    dialog.setAttribute('aria-label', img.alt);
    document.body.appendChild(layer);
    document.body.classList.add('flip-open');

    var from = box(btn), to = target();
    card.classList.add('is-out');
    open = { card: card, btn: btn, layer: layer, dialog: dialog };

    if (reduce) {
      Object.assign(dialog.style, to);
      dialog.classList.add('flipped');
      layer.classList.add('in');
    } else {
      Object.assign(dialog.style, to);
      dialog.animate([from, to], { duration: 650, easing: ease });
      layer.querySelector('.flip-inner').animate(
        [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(180deg)' }],
        { duration: 650, easing: ease, fill: 'forwards' }
      );
      requestAnimationFrame(function () { layer.classList.add('in'); });
    }
    layer.querySelector('.flip-close').focus({ preventScroll: true });

    layer.querySelector('.flip-backdrop').addEventListener('click', hide);
    dialog.addEventListener('click', function (e) {
      if (!e.target.closest('.flip-text') || e.target.closest('.flip-close')) hide();
    });
  }

  function hide() {
    if (!open || open.closing) return;
    var o = open;
    o.closing = true;
    function done() {
      o.layer.remove();
      o.card.classList.remove('is-out');
      document.body.classList.remove('flip-open');
      o.btn.focus({ preventScroll: true });
      open = null;
    }
    o.layer.classList.remove('in');
    if (reduce) { done(); return; }
    var from = box(o.dialog), to = box(o.btn);
    var inner = o.layer.querySelector('.flip-inner');
    inner.getAnimations().forEach(function (a) { a.cancel(); });
    inner.animate([{ transform: 'rotateY(180deg)' }, { transform: 'rotateY(0deg)' }], { duration: 560, easing: ease, fill: 'forwards' });
    o.dialog.animate([from, to], { duration: 560, easing: ease, fill: 'forwards' }).finished.then(done, done);
  }

  Array.prototype.forEach.call(cards, function (card) {
    card.querySelector('.art-flip').addEventListener('click', function () { show(card); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  window.addEventListener('resize', function () { if (open && !open.closing) Object.assign(open.dialog.style, target()); });
})();
