// Home section previews.
// 1. Hovering (or focusing) a pillar row wipes that pillar's card up over the
//    map panel; leaving the list brings the map back. Desktop pointers only.
// 2. The pillar bands below the fold reveal as they scroll into view.
// The cards are built from the bands, so each fact lives in one place.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- 2. band reveals
  var spreads = Array.prototype.slice.call(document.querySelectorAll('.spread'));
  if (!reduce && 'IntersectionObserver' in window) {
    spreads.forEach(function (el) { el.classList.add('will'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
    spreads.forEach(function (el) { io.observe(el); });
  }

  // ---- 1. hover previews over the map
  var peek = document.querySelector('.peek');
  var rows = document.querySelectorAll('.plist a');
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (min-width: 821px)').matches;
  if (!peek || !rows.length || !canHover) return;

  var cards = {};
  spreads.forEach(function (sp) {
    var key = sp.getAttribute('data-pillar');
    var card = document.createElement('div');
    card.className = 'peek-card';
    card.style.setProperty('--accent', getComputedStyle(sp).getPropertyValue('--accent').trim());

    var pf = document.createElement('div');
    pf.className = 'pf';
    var img = sp.querySelector('.spread-fig img');
    if (img) {
      var pi = document.createElement('img');
      pi.dataset.src = img.getAttribute('src');
      pi.alt = '';
      pi.style.objectPosition = img.style.objectPosition; // keep the band's crop
      if (img.closest('.lowres')) pi.className = 'lowres';
      pf.appendChild(pi);
    } else {
      var cap = document.createElement('span');
      cap.className = 'cap';
      cap.textContent = 'Photos coming soon';
      pf.appendChild(cap);
    }

    var pt = document.createElement('div');
    pt.className = 'pt';
    var pk = document.createElement('p');
    pk.className = 'pk';
    pk.textContent = sp.querySelector('.spread-kick').textContent;
    var h = document.createElement('h3');
    h.textContent = sp.querySelector('h2').textContent;
    pt.appendChild(pk);
    pt.appendChild(h);

    var stats = sp.querySelectorAll('.spread-stats > div');
    if (stats.length) {
      var ps = document.createElement('div');
      ps.className = 'ps';
      Array.prototype.slice.call(stats, 0, 2).forEach(function (st) { ps.appendChild(st.cloneNode(true)); });
      pt.appendChild(ps);
    } else {
      var pl = document.createElement('p');
      pl.className = 'pl';
      pl.textContent = sp.querySelector('.spread-line').textContent;
      pt.appendChild(pl);
    }

    card.appendChild(pf);
    card.appendChild(pt);
    peek.appendChild(card);
    cards[key] = card;
  });

  var current = null, hideTimer = null;
  function show(key) {
    clearTimeout(hideTimer);
    var card = cards[key];
    if (!card || card === current) return;
    var img = card.querySelector('img[data-src]');
    if (img && !img.getAttribute('src')) img.src = img.dataset.src;
    if (current) current.classList.remove('on');
    card.classList.add('on');
    current = card;
  }
  function hide() {
    // a short grace period so moving between rows doesn't flash the map
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      if (current) current.classList.remove('on');
      current = null;
    }, 120);
  }

  Array.prototype.forEach.call(rows, function (a) {
    var key = ['env', 'social', 'school', 'work', 'brew'].filter(function (k) { return a.classList.contains(k); })[0];
    a.addEventListener('mouseenter', function () { show(key); });
    a.addEventListener('focus', function () { show(key); });
    a.addEventListener('mouseleave', hide);
    a.addEventListener('blur', hide);
  });
})();
