import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/useApp';
import { ArrowLeft, ArrowRight, Download, Share2 } from 'lucide-react';
import { useT, N_ } from '../i18n';

const ALLOWING_QUESTIONS = [
  { id: 'q1', title: N_('Quiet dissatisfaction'), prompt: N_('What dissatisfaction have you quietly agreed to live with?') },
  { id: 'q2', title: N_('Unchanged complaints'), prompt: N_('What do you complain about but never actually take action to change?') },
  { id: 'q3', title: N_('A Tuesday in five years'), prompt: N_('If nothing changes, describe an ordinary Tuesday five years from now, from waking up to lights out.') },
  { id: 'q4', title: N_('Closed doors in ten years'), prompt: N_('Ten years on this path, which doors have quietly closed for good?') },
  { id: 'q5', title: N_('Late regret'), prompt: N_('At the end of your life, what would you deeply regret not trying?') },
  { id: 'q6', title: N_('Identity to release'), prompt: N_('Which outdated version of yourself would you need to let go of to change?') },
  { id: 'q7', title: N_('The shield'), prompt: N_('What fear, discomfort or judgment are your avoidance habits protecting you from?') },
  { id: 'q8', title: N_('The real price'), prompt: N_('What is that protection actually costing you in time, dignity and potential?') },
];

const BUILDING_QUESTIONS = [
  { id: 'b1', title: N_('A day in the built life'), prompt: N_('Describe an ordinary day in the life you want, three years from now.') },
  { id: 'b2', title: N_('Reputation'), prompt: N_('What are you known for, and by whom?') },
  { id: 'b3', title: N_('Money'), prompt: N_('What does financial autonomy let you say no to?') },
  { id: 'b4', title: N_('Inner circle'), prompt: N_('Who is around you, and how do you show up for them?') },
];

const primaryBtn =
  'h-12 px-5 inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] font-semibold text-[15px]';
const secondaryBtn =
  'h-12 px-5 inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-transparent text-[var(--fg)] font-medium text-[15px]';
const textareaCls =
  'w-full p-3 bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[15px] focus:outline-none focus:border-[var(--fg)] resize-y min-h-[120px] leading-relaxed placeholder:text-[var(--fg-subtle)]';

export const PublicTwoFutures: React.FC = () => {
  const { data, saveTwoFutures, setActiveRoute } = useApp();
  const t = useT();

  const [step, setStep] = useState<number>(0); // 0: intro, 1..8: allowing, 9..12: building, 13: synthesis, 14: result card
  const [allowingAnswers, setAllowingAnswers] = useState<Record<string, string>>(() => {
    return data?.twoFutures?.allowingAnswers || {};
  });
  const [buildingAnswers, setBuildingAnswers] = useState<Record<string, string>>(() => {
    return data?.twoFutures?.buildingAnswers || {};
  });

  const [antiVision, setAntiVision] = useState(
    data?.twoFutures?.antiVision || t('I refuse to become someone who leaves their best potential in draft notes and lets distraction decide their fate.')
  );
  const [vision, setVision] = useState(
    data?.twoFutures?.vision || t('I am building a life where I do deep work with calm focus, achieve complete financial autonomy, and show up fully for the people I care about.')
  );

  const [cardImage, setCardImage] = useState<string>('');
  const [includeAntiVisionOnCard, setIncludeAntiVisionOnCard] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const totalSteps = 14;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  // Generate shareable card when on result step
  useEffect(() => {
    if (step !== 14) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 1200;
    const h = 1400;
    canvas.width = w;
    canvas.height = h;

    const FG = '#111111';
    const MUTED = '#6F6F6C';
    const ACCENT = '#1F5F3F';
    const LINE = '#C9C9C6';
    const FONT = 'Geist, system-ui, sans-serif';

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = ACCENT;
    ctx.font = `600 28px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('One Decision Away', 120, 160);

    ctx.fillStyle = MUTED;
    ctx.font = `400 22px ${FONT}`;
    ctx.fillText(t('Two futures'), 120, 200);

    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, 250);
    ctx.lineTo(w - 120, 250);
    ctx.stroke();

    let currentY = 330;

    const wrap = (text: string, lineHeight: number) => {
      const words = text.split(' ');
      let line = '';
      for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > w - 240) {
          ctx.fillText(line, 120, currentY);
          line = word + ' ';
          currentY += lineHeight;
        } else {
          line = test;
        }
      }
      ctx.fillText(line, 120, currentY);
    };

    if (includeAntiVisionOnCard) {
      ctx.fillStyle = MUTED;
      ctx.font = `500 22px ${FONT}`;
      ctx.fillText(t('If nothing changes'), 120, currentY);

      currentY += 50;
      ctx.fillStyle = FG;
      ctx.font = `500 34px ${FONT}`;
      wrap(t(antiVision), 46);

      currentY += 80;
      ctx.strokeStyle = LINE;
      ctx.beginPath();
      ctx.moveTo(120, currentY);
      ctx.lineTo(w - 120, currentY);
      ctx.stroke();
      currentY += 70;
    }

    ctx.fillStyle = ACCENT;
    ctx.font = `500 22px ${FONT}`;
    ctx.fillText(t('What I am building'), 120, currentY);

    currentY += 50;
    ctx.fillStyle = FG;
    ctx.font = `600 38px ${FONT}`;
    wrap(t(vision), 50);

    ctx.fillStyle = MUTED;
    ctx.font = `400 20px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('onedecisionaway.app', 120, h - 120);

    setCardImage(canvas.toDataURL('image/png'));
  }, [step, antiVision, vision, includeAntiVisionOnCard, t]);

  const handleMigrateAndOpenApp = async () => {
    await saveTwoFutures({
      allowingAnswers,
      buildingAnswers,
      antiVision,
      vision,
    });
    setActiveRoute('/app');
  };

  const handleDownload = () => {
    if (!cardImage) return;
    const a = document.createElement('a');
    a.href = cardImage;
    a.download = 'two-futures.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (!cardImage) return;
    try {
      if (navigator.share) {
        const blob = await (await fetch(cardImage)).blob();
        const file = new File([blob], 'two-futures.png', { type: 'image/png' });
        await navigator.share({
          title: t('My two futures'),
          text: t('My vision: {vision}', { vision: t(vision) }),
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  const NavRow: React.FC<{ onNext: () => void; nextLabel: string }> = ({ onNext, nextLabel }) => (
    <div className="flex justify-between items-center pt-2">
      <button type="button" onClick={handlePrev} className="h-12 px-3 text-[15px] text-[var(--fg-muted)]">
        {t('Back')}
      </button>
      <button type="button" onClick={onNext} className={primaryBtn}>
        {nextLabel}
        <ArrowRight className="w-[18px] h-[18px]" strokeWidth={1.8} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col px-4 py-5 sm:px-8">
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setActiveRoute('/')}
          className="h-11 -ml-2 px-2 text-sm text-[var(--fg-muted)] flex items-center gap-1.5"
        >
          <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={1.8} /> {t('Home')}
        </button>

        {step > 0 && step <= 13 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--fg-muted)]">{step} / 13</span>
            <div className="w-24 h-1.5 bg-[var(--border-strong)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${(step / 13) * 100}%` }} />
            </div>
          </div>
        )}
      </header>

      <main className="max-w-2xl mx-auto w-full py-8 sm:py-12 my-auto">
        {step === 0 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--fg)]">{t('Two futures')}</h1>
              <p className="text-[15px] text-[var(--fg-muted)] leading-relaxed">
                {t('Discipline does not come from willpower. It comes from looking at the cost of changing nothing, and naming the life you want instead.')}
              </p>
            </div>

            <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] divide-y divide-[var(--border)]">
              <div className="px-4 py-3 min-h-[56px]">
                <div className="text-[15px] font-medium text-[var(--fg)]">{t('Part 1. If nothing changes')}</div>
                <div className="text-sm text-[var(--fg-muted)]">{t('Eight questions. About five minutes.')}</div>
              </div>
              <div className="px-4 py-3 min-h-[56px]">
                <div className="text-[15px] font-medium text-[var(--fg)]">{t('Part 2. What you are building')}</div>
                <div className="text-sm text-[var(--fg-muted)]">{t('Four questions. Then two sentences.')}</div>
              </div>
            </div>

            <button type="button" onClick={() => setStep(1)} className={`${primaryBtn} w-full`}>
              {t('Start')}
            </button>
          </div>
        )}

        {step >= 1 && step <= 8 && (
          <div className="space-y-5">
            <div className="text-sm text-[var(--fg-muted)]">
              {t('If nothing changes')} · {step} / 8
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--fg)] leading-snug">
              {t(ALLOWING_QUESTIONS[step - 1].prompt)}
            </h2>
            <p className="text-sm text-[var(--fg-muted)]">
              {t('Be honest. Nobody sees these answers unless you share your card.')}
            </p>
            <textarea
              id={`allowing-${ALLOWING_QUESTIONS[step - 1].id}`}
              value={allowingAnswers[ALLOWING_QUESTIONS[step - 1].id] || ''}
              onChange={(e) =>
                setAllowingAnswers({
                  ...allowingAnswers,
                  [ALLOWING_QUESTIONS[step - 1].id]: e.target.value,
                })
              }
              placeholder={t('Write here')}
              rows={4}
              className={textareaCls}
            />
            <NavRow onNext={handleNext} nextLabel={t('Next')} />
          </div>
        )}

        {step >= 9 && step <= 12 && (
          <div className="space-y-5">
            <div className="text-sm text-[var(--fg-muted)]">
              {t('What you are building')} · {step - 8} / 4
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--fg)] leading-snug">
              {t(BUILDING_QUESTIONS[step - 9].prompt)}
            </h2>
            <p className="text-sm text-[var(--fg-muted)]">
              {t('Be specific. Details, rhythms, boundaries.')}
            </p>
            <textarea
              id={`building-${BUILDING_QUESTIONS[step - 9].id}`}
              value={buildingAnswers[BUILDING_QUESTIONS[step - 9].id] || ''}
              onChange={(e) =>
                setBuildingAnswers({
                  ...buildingAnswers,
                  [BUILDING_QUESTIONS[step - 9].id]: e.target.value,
                })
              }
              placeholder={t('Write here')}
              rows={4}
              className={textareaCls}
            />
            <NavRow onNext={handleNext} nextLabel={t('Next')} />
          </div>
        )}

        {step === 13 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{t('Two sentences')}</h2>
              <p className="text-sm text-[var(--fg-muted)]">{t('Condense your answers into two clear statements.')}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="anti-vision-synthesis" className="block text-sm text-[var(--fg-muted)]">
                  {t('I refuse to become someone who...')}
                </label>
                <textarea
                  id="anti-vision-synthesis"
                  value={antiVision}
                  onChange={(e) => setAntiVision(e.target.value)}
                  rows={3}
                  className={textareaCls}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="vision-synthesis" className="block text-sm text-[var(--fg-muted)]">
                  {t('I am building a life where...')}
                </label>
                <textarea
                  id="vision-synthesis"
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  rows={3}
                  className={textareaCls}
                />
              </div>
            </div>

            <NavRow onNext={() => setStep(14)} nextLabel={t('Make card')} />
          </div>
        )}

        {step === 14 && (
          <div className="space-y-6">
            <canvas ref={canvasRef} className="hidden" />

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{t('Your card')}</h2>
              <p className="text-sm text-[var(--fg-muted)]">
                {t('Save or share it. Your answers stay on your device.')}
              </p>
            </div>

            {cardImage && (
              <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-3 flex justify-center">
                <img
                  src={cardImage}
                  alt={t('Two futures')}
                  className="max-h-[480px] object-contain rounded-[var(--radius-sm)]"
                />
              </div>
            )}

            <label className="flex items-center gap-3 min-h-[44px] text-sm text-[var(--fg)] cursor-pointer">
              <input
                type="checkbox"
                checked={includeAntiVisionOnCard}
                onChange={(e) => setIncludeAntiVisionOnCard(e.target.checked)}
                className="w-5 h-5 accent-[var(--accent)]"
              />
              <span>{t('Include the "if nothing changes" line')}</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={handleDownload} className={secondaryBtn}>
                <Download className="w-[18px] h-[18px]" strokeWidth={1.8} />
                {t('Download')}
              </button>
              <button type="button" onClick={handleShare} className={secondaryBtn}>
                <Share2 className="w-[18px] h-[18px]" strokeWidth={1.8} />
                {t('Share')}
              </button>
            </div>

            <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-3">
              <h3 className="text-lg font-semibold tracking-tight text-[var(--fg)]">{t('Keep going')}</h3>
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                {t('Save this and continue into the app to set your one decision for today.')}
              </p>
              <button type="button" onClick={handleMigrateAndOpenApp} className={`${primaryBtn} w-full`}>
                {t('Save and continue')}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
