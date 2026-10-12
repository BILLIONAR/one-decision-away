// Explicit public locale URLs take precedence over a saved app language.
// App data and analytics consent are never changed here.
(function () {
  function handover() {
    var app = document.getElementById('root');
    var preview = document.getElementById('oda-public-preview');
    if (!app || !preview) return true;
    var inApp = location.hash.indexOf('#/app') === 0 || /\/app(?:\/|$)/.test(location.pathname);
    if (inApp || app.querySelector('.oda-landing, .oda-web-not-found')) {
      preview.remove(); app.hidden = false; return true;
    }
    return false;
  }
  function start() {
    if (handover()) return;
    var observer = new MutationObserver(function () { if (handover()) observer.disconnect(); });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
