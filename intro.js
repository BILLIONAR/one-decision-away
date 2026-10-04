// Opening scene for the iPhone app and the installed web app, shown on the very
// first launch only: later launches go straight from the splash to the app. It
// paints on the first frame, hides the native splash right away so the two blend,
// plays once (about 2.6 s), then fades out as soon as the app has rendered. A tap skips it.
// Kept as a file (not inline) so the Content Security Policy can forbid inline scripts.
(function () {
  try {
    var w = window;
    var cap = w.Capacitor;
    var native = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
    var standalone = w.matchMedia && w.matchMedia('(display-mode: standalone)').matches || w.navigator.standalone === true;
    var params = new URLSearchParams(w.location.search);
    var forced = params.has('intro');
    if (params.has('nointro') || (!native && !standalone && !forced)) return;
    var SEEN = 'oda_intro_seen';
    var seen = false;
    try { seen = localStorage.getItem(SEEN) === '1'; } catch (e) {}
    if (seen && !forced) return;
    try { localStorage.setItem(SEEN, '1'); } catch (e) {}

    var reduced = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var root = document.documentElement;
    root.classList.add('oda-intro-on');

    var count = 7;
    var pieces = '';
    for (var i = 0; i < count; i++) {
      pieces += '<div class="oi-d' + (i === 0 ? ' is-first' : '') + (i === count - 1 ? ' is-last' : '') +
        '" style="--i:' + i + ';--z:' + ((3 - i) * 58) + 'px"><div class="oi-body">' +
        '<div class="oi-f oi-front"><i></i><i></i></div><div class="oi-f oi-back"></div>' +
        '<div class="oi-f oi-right"></div><div class="oi-f oi-left"></div>' +
        '<div class="oi-f oi-top"></div><div class="oi-f oi-bottom"></div></div></div>';
    }
    document.body.insertAdjacentHTML('afterbegin',
      '<div id="oda-intro" aria-hidden="true">' +
        '<div class="oi-stage"><div class="oi-scene"><div class="oi-floor"></div>' + pieces + '</div></div>' +
        '<div class="oi-mark"><div class="oi-word">ODA</div><div class="oi-rule"></div><div class="oi-tag">One Decision Away</div></div>' +
      '</div>');

    var intro = document.getElementById('oda-intro');
    var started = Date.now();
    var minTime = reduced ? 500 : 2650;
    var done = false;

    // The intro matches the splash colours, so the native splash can go now.
    var splash = native && cap.Plugins && cap.Plugins.SplashScreen;
    if (splash && splash.hide) { try { splash.hide({ fadeOutDuration: 180 }); } catch (e) {} }

    function appReady() {
      var app = document.getElementById('root');
      return !!(app && app.firstElementChild);
    }
    function leave() {
      if (done) return;
      done = true;
      intro.classList.add('is-leaving');
      w.setTimeout(function () {
        if (intro.parentNode) intro.parentNode.removeChild(intro);
        root.classList.remove('oda-intro-on');
      }, reduced ? 50 : 520);
    }
    function tick() {
      if (done) return;
      // Never hold the app longer than 8 s, even if it is slow to render.
      if ((Date.now() - started >= minTime && appReady()) || Date.now() - started > 8000) leave();
      else w.setTimeout(tick, 120);
    }
    intro.addEventListener('click', function () { if (appReady()) leave(); });
    w.setTimeout(tick, minTime);
  } catch (e) {
    document.documentElement.classList.remove('oda-intro-on');
  }
})();
