// Apply the saved theme before the app loads, so there is no light flash in dark mode.
// Kept as a file (not inline) so the Content Security Policy can forbid inline scripts.
(function () {
  try {
    var pref = 'light';
    var tone = 'beast';
    try {
      pref = localStorage.getItem('oda_theme') || 'light';
      var savedTone = localStorage.getItem('oda_tone');
      if (savedTone === 'beast' || savedTone === 'gold' || savedTone === 'champagne' || savedTone === 'ivory') tone = savedTone;
    } catch (e) { /* Use the default look when storage is unavailable. */ }
    // Beast, the default look, is always dark.
    var dark = tone === 'beast' || pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
    var meta = document.querySelector('meta[name="theme-color"]');
    root.setAttribute('data-tone', tone);
    var bars = { champagne: '#F5E2B4', ivory: '#F8EDD0' };
    if (meta) meta.setAttribute('content', tone === 'beast' ? '#0B0908' : dark ? '#120C0C' : (bars[tone] || '#F3DDA8'));
  } catch (e) {}
})();
