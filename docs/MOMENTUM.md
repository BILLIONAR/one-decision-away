# Momentum: erteleyen birinin gerçekten başlaması için

24 Eyl 2026'da eklenen davranış değişimi katmanı. Mantık `src/services/momentum.ts` (saf fonksiyonlar, `tests/momentum.test.ts`), arayüz `src/components/momentum/` ve `src/pages/Evidence.tsx`.

| Özellik | Nerede | Dayanak |
| --- | --- | --- |
| Duygu kontrolü + öz şefkat cümlesi | Karar planı, 1. adım | Erteleme bir duygu düzenleme sorunudur (Sirois & Pychyl 2013) |
| Engel + "eğer-o zaman" planı | Karar planı, 2–3. adım; karar kurulunca otomatik açılır | Uygulama niyetleri meta-analizi (Gollwitzer & Sheeran 2006), WOOP / zihinsel karşıtlama (Oettingen) |
| "Başla · sadece 2 dakika" | Karar kartı | Başlama eşiğini düşürmek; `startedAt` kaydedilir |
| Şefkatli dönüş | Today üstü kart (1 gün kaçırınca / 3+ gün aradan sonra) | Tek kaçırılan gün alışkanlığı bozmaz (Lally ve ark. 2010); kendini affetmek sonraki ertelemeyi azaltır (Wohl, Pychyl & Bennett 2010) |
| Temiz sayfa | Pazartesi ve ayın 1'i | Fresh start etkisi (Dai, Milkman & Riis 2014) |
| Kanıt defteri | Today şeridi + `/app/evidence` | Kimlik temelli motivasyon: tutulan her karar "sözümü tutarım" kanıtı |
| Bir kişiye söyle | Karar kartı (paylaş / kopyala) | Hesap verebilirlik |
| İlk hafta sade mod | Today; 7 gün veya 3 tutulan karar sonra açılır, "Hepsini göster" ile kapatılır | Yeni kullanıcıyı kalabalıkla boğmamak |
| Hayal için "Gerçeğe dönüştür" | Dreams → hayal detayı | Sadece olumlu hayal etmek enerjiyi düşürebilir (Kappes & Oettingen 2011) |
| 14. gün sorusu | Today kartı; e-posta uygulamasıyla ekibe gönderilebilir | Etkinin gerçek ölçüsü: "Ertelediğin bir şeye başladın mı?" |

Veri: `Mission.plan`, `Mission.startedAt`, `UserData.dreamPlans`, `Profile.simpleModeOff`, `Profile.twoWeekCheckIn` — hepsi normal kayıt ve bulut senkronu ile taşınır. Tarihler yerel takvim günüdür.

## 25 Sep 2026: first-day package (from free competitor research, docs in the project: `oda-rakip-analizi`)

Ideas were taken from free sources (Botsi onboarding library, growth.design, RevenueCat and Adapty) and ranked with the Jev decision model for impact and fit with ODA's no-guilt line.

- **20-second demo before sign-up** (Structured, Noom): pick an easy decision, a two-minute start compressed to a few seconds, "I did it", first leaf on the tree. Skippable.
- **"Who do you want to become?"** (aspirational framing; Headspace's problem-list framing is the counter-example). Stored as `profile.intent`; puts the matching course first ("Suggested for you"), picks the easy starter decisions and is passed to the coach.
- **Easy starter decisions** (Fabulous, Finch, TickTick) on the last sign-up step and whenever today's decision is empty. Stored as English source strings so they translate.
- **Kept moment** after a decision: first proof celebration with the tree, "choose tomorrow's decision now" (`profile.nextDecisionDraft`, shown as "You chose this last night"), and a one-time reminder offer after a success instead of a cold ask (Habit Tracker, Productive). Before this, reminders could only be switched on in Settings.
- **Smart timing** (`profile.nudgeMode = 'smart'`, Duolingo): at most two local reminders a day, morning only if nothing is chosen, one about 30 minutes before the usual kept time (`usualReminderTime`, median of the last 14, needs 3), nothing once kept. Server push still uses the six fixed times until the Supabase function is redeployed.
- **Forgiving chain** (`decisionChain`): one missed day per rolling week is a flex day, two in a row start a new chain ("never miss twice", Lally 2010). Shown on Today and Evidence; the missed-once card says the chain is safe.
- **Comeback in one tap** (Duolingo "happy path"): three very easy decisions on the welcome-back card.
- **Evidence tree** (Finch): one leaf per kept decision, grows from sapling to full tree at 60, then blossoms.
- **ODA voice** (`data/odaVoice.ts`): warm friend, no guilt, no streak threats, no fake urgency; used by reminders, the kept card and the coach prompt.
- Course source links were removed at the owner's request (sources stay as plain text).
