// Nav motion. A shared underline glides between links, and clicking a section
// link (or a home pillar row) floods its color out of the link until it covers
// the page, then navigates. The next page opens covered in that color and the
// cover pulls back up into its current link.
// Without JS or with reduced motion, links are plain links.
(function () {
  var root = document.documentElement;
  var nav = document.querySelector('.nav');
  var active = nav && nav.querySelector('a.on');
  var ease = 'cubic-bezier(0.32,0.72,0,1)';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canAnimate = !reduce && typeof Element.prototype.animate === 'function';

  // keep the current link visible when the nav scrolls sideways on phones
  if (nav && active && nav.scrollWidth > nav.clientWidth) {
    nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
  }

  // phone menu: a Contact button and a menu button in the header, opening a
  // full-screen list of the same links. The sheet lives on <body> because the
  // header's backdrop-filter would otherwise trap a fixed child inside it.
  var header = document.querySelector('.site-header');
  if (header && nav) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-btn';
    btn.setAttribute('aria-label', 'Open menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'menu-sheet');
    btn.innerHTML = '<span></span><span></span><span></span>';

    var cta = document.createElement('a');
    cta.className = 'menu-cta';
    cta.href = 'contact.html';
    cta.textContent = 'Contact';

    var sheet = document.createElement('nav');
    sheet.className = 'menu-sheet';
    sheet.id = 'menu-sheet';
    sheet.setAttribute('aria-label', 'Sections');
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a, i) {
      var link = document.createElement('a');
      link.href = a.getAttribute('href');
      if (a.classList.contains('on')) link.setAttribute('aria-current', 'page');
      link.innerHTML = '<span class="n">' + String(i + 1).padStart(2, '0') + '</span>';
      link.appendChild(document.createTextNode(a.textContent.trim()));
      sheet.appendChild(link);
    });

    header.appendChild(cta);
    header.appendChild(btn);
    document.body.appendChild(sheet);
    root.classList.add('has-menu');

    var setOpen = function (open) {
      document.body.classList.toggle('menu-open', open);
      header.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) sheet.querySelector('a').focus({ preventScroll: true });
    };
    btn.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('menu-open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        setOpen(false);
        btn.focus();
      }
    });
    sheet.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    window.addEventListener('pageshow', function () { setOpen(false); });
  }

  // one shared underline that glides to whichever link is hovered or focused,
  // takes that link's pillar color, and settles back under the current page
  if (nav) {
    var ink = document.createElement('span');
    ink.className = 'nav-ink no-anim';
    ink.setAttribute('aria-hidden', 'true');
    nav.appendChild(ink);
    nav.classList.add('has-ink');

    var moveTo = function (a) {
      if (!a) { ink.style.setProperty('--s', 0); return; }
      ink.style.setProperty('--x', a.offsetLeft + 'px');
      ink.style.setProperty('--s', a.offsetWidth / 100);
      ink.style.setProperty('--ink', getComputedStyle(a).getPropertyValue('--accent').trim());
    };
    var home = function () { moveTo(active); };
    home();
    // settle without animating on first paint, and again once webfonts change link widths
    requestAnimationFrame(function () { ink.classList.remove('no-anim'); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        ink.classList.add('no-anim'); home();
        requestAnimationFrame(function () { ink.classList.remove('no-anim'); });
      });
    }
    window.addEventListener('resize', home);

    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
      a.addEventListener('mouseenter', function () { moveTo(a); });
      a.addEventListener('focus', function () { moveTo(a); });
      a.addEventListener('blur', home);
    });
    nav.addEventListener('mouseleave', home);
  }

  // clip-path that shrinks the full-screen layer down to one element's box
  function insetTo(el) {
    if (!el) return 'inset(0px 0px 100% 0px)';
    var r = el.getBoundingClientRect();
    var w = root.clientWidth, h = window.innerHeight;
    return 'inset(' + r.top + 'px ' + (w - r.right) + 'px ' + (h - r.bottom) + 'px ' + r.left + 'px)';
  }

  function makeFlood(color) {
    var el = document.createElement('div');
    el.className = 'flood';
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--flood', color);
    document.body.appendChild(el);
    return el;
  }

  function clearFloods() {
    root.removeAttribute('data-flood');
    Array.prototype.forEach.call(document.querySelectorAll('.flood'), function (el) { el.remove(); });
  }

  // arrival: the head script left a painted cover; swap it for a real layer and retract it
  if (root.hasAttribute('data-flood')) {
    var color = root.style.getPropertyValue('--flood');
    if (!canAnimate) {
      clearFloods();
    } else {
      var cover = makeFlood(color);
      root.removeAttribute('data-flood');
      requestAnimationFrame(function () {
        var anim = cover.animate(
          [{ clipPath: 'inset(0px 0px 0px 0px round 0px)' }, { clipPath: insetTo(active) }],
          { duration: 560, easing: ease, fill: 'forwards' }
        );
        anim.finished.then(function () {
          cover.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' })
            .finished.then(function () { cover.remove(); });
        }, function () { cover.remove(); });
      });
    }
  }

  // back/forward cache can restore a page still covered by an outgoing flood
  window.addEventListener('pageshow', function (e) { if (e.persisted) clearFloods(); });

  if (!canAnimate) return;

  function onClick(e) {
    var a = e.currentTarget;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.classList.contains('on')) return;
    e.preventDefault();

    var tint = getComputedStyle(a).getPropertyValue('--accent').trim() || '#2A211C';
    var flood = makeFlood(tint);
    var href = a.href;
    var gone = false;
    function go() {
      if (gone) return;
      gone = true;
      try { sessionStorage.setItem('flood', tint); } catch (err) {}
      window.location.href = href;
    }
    flood.animate(
      [{ clipPath: insetTo(a) }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }],
      { duration: 420, easing: ease, fill: 'forwards' }
    ).finished.then(go, go);
    setTimeout(go, 700);
  }

  Array.prototype.forEach.call(document.querySelectorAll('.nav a, .plist a'), function (a) {
    a.addEventListener('click', onClick);
  });
})();
