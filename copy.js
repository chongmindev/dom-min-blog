// Contact: email addresses copy to the clipboard instead of opening a mail app
// (mailto links do nothing for people who use webmail). The address and its copy
// icon are one button; on click the icon turns into a check and a small "Copied!"
// tip pops up for a moment. Screen readers hear it through the status line.
(function () {
  var status = document.querySelector('.copy-status');

  function write(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    // older browsers / plain http: a hidden textarea and the legacy copy command
    return new Promise(function (resolve, reject) {
      var t = document.createElement('textarea');
      t.value = text;
      t.setAttribute('readonly', '');
      t.style.position = 'fixed';
      t.style.opacity = '0';
      document.body.appendChild(t);
      t.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      t.remove();
      ok ? resolve() : reject();
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.copy'), function (btn) {
    var tip = btn.querySelector('.copy-tip');
    var timer;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      write(text).then(function () {
        tip.textContent = 'Copied!';
        btn.classList.add('copied');
        if (status) status.textContent = text + ' copied to clipboard';
      }, function () {
        // copying blocked: select the address so it can be copied by hand
        var r = document.createRange();
        r.selectNodeContents(btn.querySelector('.copy-addr'));
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
        tip.textContent = 'Press ⌘C';
        btn.classList.add('copied');
      });
      clearTimeout(timer);
      timer = setTimeout(function () {
        btn.classList.remove('copied');
        if (status) status.textContent = '';
      }, 1500);
    });
  });
})();
