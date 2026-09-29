// App Store screenshots (6 per language, 1290x2796). Needs: npm run build, vite preview on :4173, a seeded data dump at /tmp/oda-data.json and local Unsplash thumbs. Output folder is set in OUT.
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://localhost:4173';
const OUT = process.env.OUT || '/tmp/store-screenshots';
const RAW = '/tmp/store-raw';
fs.mkdirSync(RAW, { recursive: true });
const FONTS = '/home/claude/oda-gh/dist/assets/';
const font = n => 'file://' + FONTS + fs.readdirSync(FONTS).find(f => f.startsWith(n));

const L = {
  en: {
    name: 'Maya', today: 'Write the first page of the report',
    past: ['Call the dentist back', 'Ten minutes on the budget', 'Send the email I was avoiding', 'Walk before lunch'],
    caps: [
      ['One decision a day.', 'Pick it, start it in two minutes, keep the evidence.'],
      ['Courses that change habits', '18 guided courses built on research, not hype.'],
      ['Understand why it works', 'Clear visuals, real examples, honest sources.'],
      ['Watch your evidence grow', 'Every kept decision proves who you are becoming.'],
      ['Calm on demand', 'Sounds for focus, rest and sleep.'],
      ['Beautiful by day and night', 'A quiet, private space. No feed, no noise.'],
    ],
  },
  tr: {
    name: 'Elif', today: 'Raporun ilk sayfasını yazacağım',
    past: ['Dişçiyi geri arayacağım', 'Bütçeye on dakika bakacağım', 'Ertelediğim e-postayı göndereceğim', 'Öğleden önce yürüyeceğim'],
    caps: [
      ['Günde tek karar.', 'Seç, iki dakikada başla, kanıtını biriktir.'],
      ['Alışkanlığı değiştiren kurslar', 'Abartıya değil araştırmaya dayanan 18 rehberli kurs.'],
      ['Neden işe yaradığını anla', 'Net görseller, gerçekçi örnekler, dürüst kaynaklar.'],
      ['Kanıtın büyüsün', 'Tuttuğun her karar, olmak istediğin kişinin kanıtı.'],
      ['İstediğin an sakinlik', 'Odak, dinlenme ve uyku için sesler.'],
      ['Gündüz de gece de zarif', 'Sessiz ve sana ait bir alan. Akış yok, gürültü yok.'],
    ],
  },
  es: {
    name: 'Lucía', today: 'Escribir la primera página del informe',
    past: ['Devolver la llamada al dentista', 'Diez minutos con el presupuesto', 'Enviar el correo que evitaba', 'Caminar antes del almuerzo'],
    caps: [
      ['Una decisión al día.', 'Elígela, empieza en dos minutos, guarda la evidencia.'],
      ['Cursos que cambian hábitos', '18 cursos guiados basados en investigación, no en promesas.'],
      ['Entiende por qué funciona', 'Visuales claros, ejemplos reales, fuentes honestas.'],
      ['Mira crecer tu evidencia', 'Cada decisión cumplida demuestra en quién te conviertes.'],
      ['Calma cuando la necesites', 'Sonidos para enfocarte, descansar y dormir.'],
      ['Precioso de día y de noche', 'Un espacio tranquilo y privado. Sin feed, sin ruido.'],
    ],
  },
};

const seed = JSON.parse(fs.readFileSync('/tmp/oda-data.json', 'utf8'));
const dayKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function dataFor(loc) {
  const c = L[loc];
  const d = structuredClone(seed);
  d.profile.displayName = c.name; d.profile.locale = loc;
  const now = new Date();
  const today = d.missions.find(m => m.isOneDecision);
  today.title = c.today; today.scheduledFor = dayKey(now);
  const kept = [1, 2, 4, 5].map((ago, i) => {
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ago, 9 + i, 12);
    return { ...today, id: `one-decision-${ago}`, title: c.past[i], status: 'completed', scheduledFor: dayKey(t), createdAt: t.toISOString(), startedAt: t.toISOString(), completedAt: new Date(t.getTime() + 600000).toISOString() };
  });
  d.missions = [today, ...kept, ...d.missions.filter(m => !m.isOneDecision)];
  d.transactions.push({ id: 'tx-seed', walletId: 'wallet-demo', userId: 'demo-user', kind: 'mission_reward', amount: 2500, dayKey: dayKey(now), memo: 'seed', createdAt: now.toISOString() });
  return JSON.stringify(d);
}

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const log = [];

async function capture(loc, theme, route, name, prep) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: loc, serviceWorkers: 'block', colorScheme: theme });
  const p = await ctx.newPage();
  p.on('pageerror', e => log.push(`${loc} ${name} ERR ${e.message}`));
  const TH = '/tmp/claude-0/-home-claude/5bbcdf74-b984-5b37-9ddc-97510c6e2616/scratchpad/th/_thumbs/';
  await p.route('https://images.unsplash.com/**', r => { const id = new URL(r.request().url()).pathname.replace('/photo-', ''); const f = TH + id + '.jpg'; return fs.existsSync(f) ? r.fulfill({ path: f, contentType: 'image/jpeg' }) : r.abort(); });
  await p.addInitScript(([data, loc, theme]) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('one_decision_away_app_data_v1', data); localStorage.setItem('oda_locale', loc); localStorage.setItem('oda_theme', theme);
      sessionStorage.setItem('seeded', '1');
    }
  }, [dataFor(loc), loc, theme]);
  await p.goto(BASE + '/app'); await p.waitForTimeout(1500);
  for (let i = 0; i < 3; i++) if (await p.locator('[role=dialog]').count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(300); }
  if (route !== '/app') { await p.evaluate(r => { history.pushState({}, '', r); dispatchEvent(new PopStateEvent('popstate')); }, route); await p.waitForTimeout(1200); }
  for (let i = 0; i < 3; i++) if (await p.locator('[role=dialog]').count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(300); }
  if (prep) await prep(p);
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${RAW}/${loc}-${name}.png` });
  await ctx.close();
}

const openLesson = (courseIndex, scroll) => async p => {
  await p.locator('.oda-course-row').nth(courseIndex).click(); await p.waitForTimeout(900);
  if (scroll) { await p.locator(scroll).first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -120)); }
};

async function compose(loc, i, shot, theme) {
  const [h, s] = L[loc].caps[i];
  const dark = theme === 'dark';
  const bg = dark ? 'radial-gradient(120% 70% at 80% 0%, #2A241D 0%, #15130F 55%, #0F0E0C 100%)' : 'linear-gradient(165deg,#DDEBE2 0%,#F4F0E8 46%,#F6E2D6 100%)';
  const ink = dark ? '#EDE6DA' : '#1C201D';
  const sub = dark ? '#A39A8C' : '#5B625D';
  const img = fs.readFileSync(`${RAW}/${loc}-${shot}.png`).toString('base64');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:NR;src:url(${font('newsreader-latin-opsz-normal')}) format('woff2');}
@font-face{font-family:NR;src:url(${font('newsreader-latin-ext-opsz-normal')}) format('woff2');unicode-range:U+0100-024F,U+1E00-1EFF;}
@font-face{font-family:HG;src:url(${font('hanken-grotesk-latin-wght')}) format('woff2');}
@font-face{font-family:HG;src:url(${font('hanken-grotesk-latin-ext-wght')}) format('woff2');unicode-range:U+0100-024F,U+1E00-1EFF;}
html,body{margin:0;width:1290px;height:2796px;overflow:hidden;background:${bg};}
.wrap{position:relative;width:1290px;height:2796px;display:flex;flex-direction:column;align-items:center;}
h1{font-family:NR,Georgia,serif;font-weight:400;font-size:112px;line-height:1.06;letter-spacing:-0.015em;color:${ink};text-align:center;margin:190px 90px 0;}
p{font-family:HG,-apple-system,sans-serif;font-size:50px;line-height:1.35;color:${sub};text-align:center;margin:44px 130px 0;}
.phone{margin-top:110px;width:1010px;height:2186px;border-radius:120px;padding:22px;box-sizing:border-box;background:${dark ? '#2B2620' : '#FFFFFF'};box-shadow:0 60px 120px -40px rgba(${dark ? '0,0,0,0.8' : '40,60,50,0.35'}),0 0 0 2px rgba(${dark ? '214,183,126,0.18' : '0,0,0,0.05'});}
.phone img{width:966px;height:2091px;border-radius:98px;display:block;object-fit:cover;object-position:top;}
</style></head><body><div class="wrap"><h1>${h}</h1><p>${s}</p><div class="phone"><img src="data:image/png;base64,${img}"></div></div></body></html>`;
  const f = `/tmp/store-compose-${loc}-${i}.html`; fs.writeFileSync(f, html);
  const ctx = await b.newContext({ viewport: { width: 1290, height: 2796 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); await p.goto('file://' + f); await p.waitForTimeout(500);
  fs.mkdirSync(`${OUT}/${loc}`, { recursive: true });
  await p.screenshot({ path: `${OUT}/${loc}/${String(i + 1).padStart(2, '0')}.png` });
  await ctx.close();
}

const LOCS = (process.argv[2] || 'en,tr,es').split(',');
for (const loc of LOCS) {
  await capture(loc, 'light', '/app', 'today');
  await capture(loc, 'light', '/app/courses', 'courses');
  await capture(loc, 'light', '/app/courses', 'lesson', openLesson(16, '.oda-course-visual'));
  await capture(loc, 'light', '/app/evidence', 'evidence');
  await capture(loc, 'light', '/app/sound', 'sound');
  await capture(loc, 'dark', '/app', 'today-dark');
  const plan = [['today', 'light'], ['courses', 'light'], ['lesson', 'light'], ['evidence', 'light'], ['sound', 'light'], ['today-dark', 'dark']];
  for (let i = 0; i < plan.length; i++) await compose(loc, i, plan[i][0], plan[i][1]);
}
await b.close();
console.log(log.join('\n') || 'no errors');
