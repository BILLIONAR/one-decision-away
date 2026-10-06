// Apply the saved theme before the app loads, so there is no light flash in dark mode.
// Kept as a file (not inline) so the Content Security Policy can forbid inline scripts.
(function () {
  try {
    var pref = localStorage.getItem('oda_theme') || 'light';
    var dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (dark) root.classList.add('dark');
    root.style.colorScheme = dark ? 'dark' : 'light';
    var meta = document.querySelector('meta[name="theme-color"]');
    var tone = localStorage.getItem('oda_tone');
    if (tone === 'champagne' || tone === 'ivory') root.setAttribute('data-tone', tone);
    var bars = { champagne: '#F5E2B4', ivory: '#F8EDD0' };
    if (meta) meta.setAttribute('content', dark ? '#120C0C' : (bars[tone] || '#F3DDA8'));
  } catch (e) {}
})();
