// This small shell still explains an entry-module failure before React can start.
(function () {
  var copy = {
    en: ['Loading ODA...', 'ODA could not open. Check your connection and reload. Your saved record has not been reset.', 'Reload ODA'],
    tr: ['ODA açılıyor...', 'ODA açılamadı. Bağlantını kontrol edip yeniden yükle. Kaydettiğin kayıtlar sıfırlanmadı.', 'ODA’yı yeniden yükle'],
    es: ['Abriendo ODA...', 'No se pudo abrir ODA. Comprueba tu conexión y recarga. Tus datos guardados no se han restablecido.', 'Recargar ODA'],
    fr: ['Ouverture d’ODA...', 'ODA n’a pas pu s’ouvrir. Vérifie ta connexion et recharge. Tes données enregistrées n’ont pas été réinitialisées.', 'Recharger ODA'],
    de: ['ODA wird geöffnet...', 'ODA konnte nicht geöffnet werden. Prüfe deine Verbindung und lade neu. Deine gespeicherten Daten wurden nicht zurückgesetzt.', 'ODA neu laden'],
    it: ['Apertura di ODA...', 'Non è stato possibile aprire ODA. Controlla la connessione e ricarica. I tuoi dati salvati non sono stati azzerati.', 'Ricarica ODA'],
  };
  var root = document.documentElement;
  var hash = window.location.hash || '';
  function linkLanguage(query) { return query ? new URLSearchParams(query).get('lang') : null; }
  var requested = linkLanguage(window.location.search) || linkLanguage(hash.indexOf('?') < 0 ? '' : hash.slice(hash.indexOf('?') + 1));
  // The shared index also serves member routes. Its public language marker must
  // not override a saved preference when the app entry cannot download.
  var path = window.location.pathname || '/';
  if (document.currentScript && document.currentScript.src) {
    var base = new URL(document.currentScript.src).pathname.replace(/startup-fallback\.js$/, '');
    if (path.indexOf(base) === 0) path = '/' + path.slice(base.length);
  }
  var route = hash.indexOf('#/') === 0 ? hash.slice(1).split('?')[0] : path;
  var publicEntry = /^\/(?:index\.html)?$/.test(route) || /^\/(privacy|terms|support)\/?$/.test(route)
    || /^\/(en|tr|es|fr|de|it)\/(?:index\.html|(?:(?:privacy|terms|support)\/(?:index\.html)?))?$/.test(route);
  var locale = copy[requested] ? requested : publicEntry && root.hasAttribute && root.hasAttribute('data-oda-public-locale') && copy[root.lang] ? root.lang : null;
  if (!locale) try { locale = localStorage.getItem('oda_locale'); } catch (error) {}
  if (!copy[locale]) locale = (navigator.languages || [navigator.language || 'en']).map(function (value) { return value.toLowerCase().split(/[-_]/)[0]; }).find(function (value) { return !!copy[value]; }) || 'en';
  var text = copy[locale];
  var message = document.getElementById('oda-startup-message');
  var retry = document.getElementById('oda-startup-retry');
  if (!message || !retry) return;
  document.documentElement.lang = locale;
  message.textContent = text[0]; retry.textContent = text[2];
  retry.onclick = function () { window.location.reload(); };
  function fail() {
    if (!document.getElementById('oda-startup-fallback')) return;
    message.textContent = text[1]; retry.hidden = false;
  }
  var timer = window.setTimeout(fail, 20000);
  window.addEventListener('error', function (event) {
    if (event.target && event.target.tagName === 'SCRIPT' && event.target.type === 'module') fail();
  }, true);
  var observer = new MutationObserver(function () {
    if (document.getElementById('oda-startup-fallback')) return;
    window.clearTimeout(timer); observer.disconnect();
  });
  observer.observe(document.getElementById('root'), { childList: true });
})();
