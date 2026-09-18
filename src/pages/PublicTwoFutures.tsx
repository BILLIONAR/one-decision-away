import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/useApp';
import { Button, Card, Field, Input, Textarea, Progress, Disclaimer } from '../components/ui';
import { ArrowLeft, ArrowRight, Download, Share2, Sparkles, CheckCircle } from 'lucide-react';

const ALLOWING_QUESTIONS = [
  { id: 'q1', title: '1. Quiet Dissatisfaction', prompt: 'What dissatisfaction have you quietly agreed to live with?' },
  { id: 'q2', title: '2. Unchanged Complaints', prompt: 'What do you complain about but never actually take action to change?' },
  { id: 'q3', title: '3. A Tuesday in 5 Years', prompt: 'If nothing changes, describe an ordinary Tuesday five years from now — wake-up to lights-out.' },
  { id: 'q4', title: '4. Closed Doors in 10 Years', prompt: 'Ten years on this default path — which doors have quietly closed for good?' },
  { id: 'q5', title: '5. Late Life Regret', prompt: 'At the end of your life, what would you deeply regret not trying?' },
  { id: 'q6', title: '6. Identity to Release', prompt: 'Which outdated version of yourself would you need to let go of to change?' },
  { id: 'q7', title: '7. The Shield', prompt: 'What fear, discomfort, or judgment are your current avoidance habits protecting you from?' },
  { id: 'q8', title: '8. The Real Price', prompt: 'What is that protection actually costing you in time, dignity, and potential?' },
];

const BUILDING_QUESTIONS = [
  { id: 'b1', title: '1. A Day in the Built Life', prompt: 'Describe an ordinary day in the life you want, three years from now.' },
  { id: 'b2', title: '2. Reputation & Mastery', prompt: 'What are you known for, and by whom?' },
  { id: 'b3', title: '3. Sovereignty & Money', prompt: 'What does financial autonomy let you say "no" to?' },
  { id: 'b4', title: '4. Inner Circle', prompt: 'Who is around you, and how do you show up for them?' },
];

export const PublicTwoFutures: React.FC = () => {
  const { data, saveTwoFutures, setActiveRoute } = useApp();

  const [step, setStep] = useState<number>(0); // 0: intro, 1..8: allowing, 9..12: building, 13: synthesis, 14: result card
  const [allowingAnswers, setAllowingAnswers] = useState<Record<string, string>>(() => {
    return data?.twoFutures?.allowingAnswers || {};
  });
  const [buildingAnswers, setBuildingAnswers] = useState<Record<string, string>>(() => {
    return data?.twoFutures?.buildingAnswers || {};
  });

  const [antiVision, setAntiVision] = useState(
    data?.twoFutures?.antiVision || 'I refuse to become someone who leaves their best potential in draft notes and lets distraction decide their fate.'
  );
  const [vision, setVision] = useState(
    data?.twoFutures?.vision || 'I am building a life where I do deep work with calm focus, achieve complete financial autonomy, and show up fully for the people I care about.'
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

    // Background
    ctx.fillStyle = '#F7F6F2';
    ctx.fillRect(0, 0, w, h);

    // Frame
    ctx.strokeStyle = '#E2DFD6';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, w - 100, h - 100);

    // Inner Card
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(80, 80, w - 160, h - 160, 28);
    ctx.fill();
    ctx.strokeStyle = '#CFCBC0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Brand Tag
    ctx.fillStyle = '#708879';
    ctx.font = '600 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ONE DECISION AWAY', w / 2, 170);

    ctx.fillStyle = '#8A969C';
    ctx.font = '400 22px Inter, sans-serif';
    ctx.fillText('by AurelyStudio · Two Futures Compass', w / 2, 210);

    // Divider
    ctx.strokeStyle = '#E2DFD6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(140, 250);
    ctx.lineTo(w - 140, 250);
    ctx.stroke();

    let currentY = 320;

    // 1. The Life You're Allowing (Anti-Vision)
    if (includeAntiVisionOnCard) {
      ctx.fillStyle = '#9A8F86';
      ctx.font = '600 22px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText("THE LIFE YOU'RE ALLOWING (ANTI-VISION)", 140, currentY);

      currentY += 40;
      ctx.fillStyle = '#263238';
      ctx.font = 'italic 34px Fraunces, Georgia, serif';

      // Multi-line wrap
      const words = antiVision.split(' ');
      let line = '';
      for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > w - 280) {
          ctx.fillText(line, 140, currentY);
          line = word + ' ';
          currentY += 46;
        } else {
          line = test;
        }
      }
      ctx.fillText(line, 140, currentY);

      currentY += 80;
      ctx.strokeStyle = '#E2DFD6';
      ctx.beginPath();
      ctx.moveTo(140, currentY);
      ctx.lineTo(w - 140, currentY);
      ctx.stroke();
      currentY += 60;
    }

    // 2. The Life You're Building (Vision)
    ctx.fillStyle = '#708879';
    ctx.font = '600 22px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("THE LIFE YOU'RE BUILDING (VISION)", 140, currentY);

    currentY += 40;
    ctx.fillStyle = '#263238';
    ctx.font = 'bold 36px Fraunces, Georgia, serif';

    const vWords = vision.split(' ');
    let vLine = '';
    for (const word of vWords) {
      const test = vLine + word + ' ';
      if (ctx.measureText(test).width > w - 280) {
        ctx.fillText(vLine, 140, currentY);
        vLine = word + ' ';
        currentY += 48;
      } else {
        vLine = test;
      }
    }
    ctx.fillText(vLine, 140, currentY);

    // Bottom Badge
    ctx.fillStyle = '#EFEDE7';
    ctx.beginPath();
    ctx.roundRect(140, h - 230, w - 280, 80, 16);
    ctx.fill();

    ctx.fillStyle = '#5C6A72';
    ctx.font = '600 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DESIGNED ON ONEDECISIONAWAY.APP', w / 2, h - 180);

    setCardImage(canvas.toDataURL('image/png'));
  }, [step, antiVision, vision, includeAntiVisionOnCard]);

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
    a.download = 'two-futures-compass.png';
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
          title: 'My Two Futures — One Decision Away',
          text: `My Vision: ${vision}`,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-3xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[var(--border)]">
        <div>
          <button
            onClick={() => setActiveRoute('/')}
            className="text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </button>
          <span className="font-display font-bold text-lg text-[var(--fg)] block mt-1">
            Two Futures Compass
          </span>
        </div>

        {step > 0 && step <= 13 && (
          <div className="text-right">
            <span className="text-xs text-[var(--fg-subtle)]">Step {step} of 13</span>
            <div className="w-24 sm:w-32 mt-1">
              <Progress value={(step / 13) * 100} variant="sage" />
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto w-full py-8 sm:py-12 my-auto">
        {/* Step 0: Intro */}
        {step === 0 && (
          <Card padding="lg" className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--success-soft)] text-[var(--color-sage)] mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold font-display text-[var(--fg)]">
                The Two Futures Exercise
              </h1>
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed max-w-lg mx-auto">
                Lasting discipline doesn't come from willpower. It comes from looking directly at the price of inaction, and defining the exact life you are building instead.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
              <div className="p-4 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)]">
                <span className="text-xs font-bold uppercase text-[#9A8F86]">Part 1</span>
                <div className="font-bold text-sm text-[var(--fg)] mt-1">The Default Future</div>
                <p className="text-xs text-[var(--fg-muted)] mt-1">What happens if you change nothing for 5 to 10 years.</p>
              </div>

              <div className="p-4 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)]">
                <span className="text-xs font-bold uppercase text-[var(--color-sage)]">Part 2</span>
                <div className="font-bold text-sm text-[var(--fg)] mt-1">The Built Future</div>
                <p className="text-xs text-[var(--fg-muted)] mt-1">The daily reality you are actively working toward.</p>
              </div>
            </div>

            <Button variant="accent" size="lg" onClick={() => setStep(1)} className="w-full sm:w-auto">
              Begin Exercise (5 mins)
            </Button>
          </Card>
        )}

        {/* Steps 1..8: The Life You're Allowing */}
        {step >= 1 && step <= 8 && (
          <Card padding="lg" className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9A8F86]">
                The Life You're Allowing
              </span>
              <span className="text-xs text-[var(--fg-subtle)]">Question {step} of 8</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display text-[var(--fg)]">
                {ALLOWING_QUESTIONS[step - 1].prompt}
              </h2>
              <p className="text-xs text-[var(--fg-muted)]">
                Be radically honest. Nobody else sees these answers unless you choose to share your summary card.
              </p>
            </div>

            <Textarea
              id={`allowing-${ALLOWING_QUESTIONS[step - 1].id}`}
              value={allowingAnswers[ALLOWING_QUESTIONS[step - 1].id] || ''}
              onChange={(e) =>
                setAllowingAnswers({
                  ...allowingAnswers,
                  [ALLOWING_QUESTIONS[step - 1].id]: e.target.value,
                })
              }
              placeholder="Write your honest observation here..."
              rows={4}
            />

            <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
              <Button variant="ghost" size="sm" onClick={handlePrev}>
                Back
              </Button>
              <Button variant="primary" size="md" onClick={handleNext} icon={ArrowRight} iconPosition="right">
                Next
              </Button>
            </div>
          </Card>
        )}

        {/* Steps 9..12: The Life You're Building */}
        {step >= 9 && step <= 12 && (
          <Card padding="lg" className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-sage)]">
                The Life You're Building
              </span>
              <span className="text-xs text-[var(--fg-subtle)]">Question {step - 8} of 4</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display text-[var(--fg)]">
                {BUILDING_QUESTIONS[step - 9].prompt}
              </h2>
              <p className="text-xs text-[var(--fg-muted)]">
                Describe specifics: sensory details, rhythms, boundaries, and concrete freedom.
              </p>
            </div>

            <Textarea
              id={`building-${BUILDING_QUESTIONS[step - 9].id}`}
              value={buildingAnswers[BUILDING_QUESTIONS[step - 9].id] || ''}
              onChange={(e) =>
                setBuildingAnswers({
                  ...buildingAnswers,
                  [BUILDING_QUESTIONS[step - 9].id]: e.target.value,
                })
              }
              placeholder="Describe your vision concretely..."
              rows={4}
            />

            <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
              <Button variant="ghost" size="sm" onClick={handlePrev}>
                Back
              </Button>
              <Button variant="primary" size="md" onClick={handleNext} icon={ArrowRight} iconPosition="right">
                Next
              </Button>
            </div>
          </Card>
        )}

        {/* Step 13: Synthesis Sentences */}
        {step === 13 && (
          <Card padding="lg" className="space-y-6">
            <div className="space-y-2 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-coral)]">
                Final Synthesis
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-[var(--fg)]">
                Distill Your Two Futures
              </h2>
              <p className="text-xs text-[var(--fg-muted)] max-w-md mx-auto">
                Condense your answers into two clear, non-negotiable declarations.
              </p>
            </div>

            <div className="space-y-4">
              <Field
                id="anti-vision-synthesis"
                label="Anti-Vision: What you refuse to become"
                helper="Begin with 'I refuse to become someone who...'"
              >
                <Textarea
                  id="anti-vision-synthesis"
                  value={antiVision}
                  onChange={(e) => setAntiVision(e.target.value)}
                  rows={3}
                />
              </Field>

              <Field
                id="vision-synthesis"
                label="Vision: The life you are building"
                helper="Begin with 'I am building a life where...'"
              >
                <Textarea
                  id="vision-synthesis"
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  rows={3}
                />
              </Field>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
              <Button variant="ghost" size="sm" onClick={handlePrev}>
                Back
              </Button>
              <Button variant="accent" size="lg" onClick={() => setStep(14)}>
                Generate Shareable Card
              </Button>
            </div>
          </Card>
        )}

        {/* Step 14: Result Card & Migration CTA */}
        {step === 14 && (
          <div className="space-y-6">
            <canvas ref={canvasRef} className="hidden" />

            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-[var(--fg)]">
                Your Two Futures Compass
              </h2>
              <p className="text-xs text-[var(--fg-muted)]">
                Save or share this compass as an honest anchor. Private question answers remain on your device.
              </p>
            </div>

            {/* Generated Canvas Preview */}
            {cardImage && (
              <div className="p-2 bg-[var(--bg-muted)] border border-[var(--border)] rounded-[var(--radius-xl)] flex justify-center shadow-[var(--shadow-md)]">
                <img
                  src={cardImage}
                  alt="Two Futures Compass"
                  className="max-h-[480px] object-contain rounded-[var(--radius-lg)]"
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs text-[var(--fg-muted)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAntiVisionOnCard}
                  onChange={(e) => setIncludeAntiVisionOnCard(e.target.checked)}
                  className="rounded text-[var(--color-slate)]"
                />
                <span>Include Anti-Vision on Card</span>
              </label>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button variant="outline" size="sm" icon={Download} onClick={handleDownload} className="flex-1 sm:flex-initial">
                  Download PNG
                </Button>
                <Button variant="secondary" size="sm" icon={Share2} onClick={handleShare} className="flex-1 sm:flex-initial">
                  Share Card
                </Button>
              </div>
            </div>

            {/* Migration & Next Step Call to Action */}
            <Card padding="lg" className="bg-[var(--bg-elevated)] border-[var(--color-sage)]/40 space-y-4 text-center">
              <div className="w-10 h-10 rounded-full bg-[var(--success-soft)] text-[var(--color-sage)] mx-auto flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-display text-[var(--fg)]">
                Track This Direction Every Day in Life OS
              </h3>
              <p className="text-xs text-[var(--fg-muted)] max-w-md mx-auto leading-relaxed">
                Your vision is now drafted. Continue into Life OS to set your daily One Decision, earn Dream Dollars, and build your future world step by step.
              </p>
              <Button variant="accent" size="lg" onClick={handleMigrateAndOpenApp} className="w-full sm:w-auto">
                Enter Life OS (Save & Continue)
              </Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};
