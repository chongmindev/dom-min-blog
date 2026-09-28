// Progressive scroll-reveal. If JS or IntersectionObserver is missing,
// nothing is hidden (the .reveal class is only added here), so content
// always renders.
(function () {
  // One orchestrated entrance only (the page intro / home), not every section.
  var sel = '.page-intro, .home-left, .home-map';
  var targets = Array.prototype.slice.call(document.querySelectorAll(sel));
  if (!targets.length) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  targets.forEach(function (t) { t.classList.add('reveal'); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  targets.forEach(function (t) { io.observe(t); });
})();
