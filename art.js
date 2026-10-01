// Art cards. Clicking a work lifts it out of the gallery, grows it to a readable
// size in the middle of the screen, and flips it over to its statement (with a
// mini version of the piece on the back). The ← → buttons or arrow keys step to
// the previous or next work without flipping back (they stop at the first and
// last work; no wrap-around). Clicking the card, the backdrop, the close button,
// or pressing Escape flips it back into the spot of whichever work is showing.
// The statement text lives in each card's <figcaption>, so it is in the page
// for screen readers and search even without this script.
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.art-card'));
  if (!cards.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ease = 'cubic-bezier(0.32,0.72,0,1)';
  var total = String(cards.length).padStart(2, '0');
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

  // put one work's picture, number, and statement onto the open card
  function fill(layer, card) {
    var img = card.querySelector('img');
    var src = img.currentSrc || img.src;
    layer.querySelector('.flip-front img').src = src;
    var mini = layer.querySelector('.flip-mini img');
    mini.src = src;
    mini.alt = img.alt;
    var text = layer.querySelector('.flip-text');
    text.innerHTML = '<p class="flip-kick">' + card.getAttribute('data-n') + ' / ' + total + '</p>';
    Array.prototype.forEach.call(card.querySelector('.art-info').children, function (c) { text.appendChild(c.cloneNode(true)); });
    text.scrollTop = 0;
    layer.querySelector('.flip-card').setAttribute('aria-label', img.alt);
    var i = cards.indexOf(card);
    layer.querySelector('.flip-prev').disabled = i === 0;
    layer.querySelector('.flip-next').disabled = i === cards.length - 1;
  }

  function show(card) {
    if (open) return;
    var btn = card.querySelector('.art-flip');
    var layer = document.createElement('div');
    layer.className = 'flip-layer';
    layer.innerHTML =
      '<div class="flip-backdrop"></div>' +
      '<div class="flip-card" role="dialog" aria-modal="true" tabindex="-1">' +
        '<div class="flip-inner">' +
          '<div class="flip-face flip-front"><img alt=""></div>' +
          '<div class="flip-face flip-back">' +
            '<div class="flip-mini"><img alt=""></div>' +
            '<div class="flip-text"></div>' +
            '<div class="flip-foot">' +
              '<button type="button" class="flip-close" aria-label="Flip back">↻ Flip back</button>' +
              '<div class="flip-nav">' +
                '<button type="button" class="flip-prev" aria-label="Previous work">←</button>' +
                '<button type="button" class="flip-next" aria-label="Next work">→</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    fill(layer, card);
    var dialog = layer.querySelector('.flip-card');
    document.body.appendChild(layer);
    document.body.classList.add('flip-open');

    var from = box(btn), to = target();
    card.classList.add('is-out');
    open = { card: card, btn: btn, layer: layer, dialog: dialog };

    Object.assign(dialog.style, to);
    if (reduce) {
      layer.classList.add('in');
    } else {
      dialog.animate([from, to], { duration: 650, easing: ease });
      layer.querySelector('.flip-inner').animate(
        [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(180deg)' }],
        { duration: 650, easing: ease, fill: 'forwards' }
      );
      requestAnimationFrame(function () { layer.classList.add('in'); });
    }
    layer.querySelector('.flip-close').focus({ preventScroll: true });

    layer.querySelector('.flip-backdrop').addEventListener('click', hide);
    // a mouse click on ← → hands focus back to the card, so the arrow keys that follow don't
    // light up the button with the keyboard focus ring (keyboard presses keep focus on the button)
    function nav(dir) {
      return function (e) {
        step(dir);
        if (e.detail) dialog.focus({ preventScroll: true });
      };
    }
    layer.querySelector('.flip-prev').addEventListener('click', nav(-1));
    layer.querySelector('.flip-next').addEventListener('click', nav(1));
    dialog.addEventListener('click', function (e) {
      if (e.target.closest('.flip-nav')) return;
      if (!e.target.closest('.flip-text') || e.target.closest('.flip-close')) hide();
    });
  }

  // previous / next work on the open card; stops at either end
  function step(dir) {
    if (!open || open.closing || open.stepping) return;
    var next = cards[cards.indexOf(open.card) + dir];
    if (!next) return;
    var o = open;
    o.card.classList.remove('is-out');
    next.classList.add('is-out');
    o.card = next;
    o.btn = next.querySelector('.art-flip');
    var parts = [o.layer.querySelector('.flip-mini'), o.layer.querySelector('.flip-text')];
    if (reduce) { fill(o.layer, next); return; }
    o.stepping = true;
    var out = parts.map(function (el) {
      return el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + (-24 * dir) + 'px)' }],
        { duration: 160, easing: 'ease-in', fill: 'forwards' });
    });
    out[0].finished.then(function () {
      fill(o.layer, next);
      out.forEach(function (a) { a.cancel(); });
      parts.forEach(function (el) {
        el.animate([{ opacity: 0, transform: 'translateX(' + (24 * dir) + 'px)' }, { opacity: 1, transform: 'none' }],
          { duration: 260, easing: ease });
      });
      o.stepping = false;
    }, function () { o.stepping = false; });
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
    // after stepping, the work to fly back to may be off screen: unlock the page scroll and
    // bring it into view first, so the card lands on it
    document.body.classList.remove('flip-open');
    o.btn.scrollIntoView({ block: 'center', behavior: 'instant' });
    if (reduce) { done(); return; }
    var from = box(o.dialog), to = box(o.btn);
    var inner = o.layer.querySelector('.flip-inner');
    inner.getAnimations().forEach(function (a) { a.cancel(); });
    inner.animate([{ transform: 'rotateY(180deg)' }, { transform: 'rotateY(0deg)' }], { duration: 560, easing: ease, fill: 'forwards' });
    o.dialog.animate([from, to], { duration: 560, easing: ease, fill: 'forwards' }).finished.then(done, done);
  }

  cards.forEach(function (card) {
    card.querySelector('.art-flip').addEventListener('click', function () { show(card); });
  });
  document.addEventListener('keydown', function (e) {
    if (!open) return;
    if (e.key === 'Escape') hide();
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });
  window.addEventListener('resize', function () { if (open && !open.closing) Object.assign(open.dialog.style, target()); });
})();
