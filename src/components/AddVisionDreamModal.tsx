import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/useApp';
import {
  Modal,
  Button,
  Field,
  Input,
  Textarea,
  Select,
} from './ui';
import { Camera, Globe, Upload, Sparkles, FlipHorizontal, Trash2 } from 'lucide-react';
import { MarketCategory, MarketItem } from '../types/models';
import { triggerBigRewardConfetti } from '../utils/confetti';
import { useT } from '../i18n';

interface AddVisionDreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPinToVision?: boolean;
  onSuccess?: (item: MarketItem) => void;
}

type MediaSourceMode = 'camera' | 'web_url' | 'upload' | 'preset';

export const AddVisionDreamModal: React.FC<AddVisionDreamModalProps> = ({
  isOpen,
  onClose,
  defaultPinToVision = true,
  onSuccess,
}) => {
  const t = useT();
  const { data, addCustomDream, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<MediaSourceMode>('camera');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MarketCategory>('Homes');
  const [realPriceUsd, setRealPriceUsd] = useState<number>(350000);
  const [dreamDollarPrice, setDreamDollarPrice] = useState<number>(25000);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [whyWanted, setWhyWanted] = useState('');
  const [firstRealStep, setFirstRealStep] = useState('');
  const [pinToVision, setPinToVision] = useState(defaultPinToVision);

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlImageStatus, setUrlImageStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Curated inspiration presets with real web imagery
  const INSPIRATION_PRESETS = [
    {
      name: t('Porsche 911 GT3 RS in Guards Red'),
      category: 'Cars & Mobility' as MarketCategory,
      realUsd: 285000,
      dPrice: 18500,
      img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85',
      desc: t('Naturally aspirated 4.0L flat-six, lightweight motorsport aerodynamic package, track telemetry.'),
      why: t('Symbol of uncompromising mechanical excellence and track-honed precision.'),
      step: t('Book a Porsche Track Experience session and calculate amortization schedule.'),
    },
    {
      name: t('Lake Como Waterfront Modernist Villa'),
      category: 'Homes' as MarketCategory,
      realUsd: 6500000,
      dPrice: 45000,
      img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
      desc: t('Direct private dock, floor-to-ceiling glass pavilions, infinity pool overlooking Bellagio.'),
      why: t('Daily sanctuary of absolute peace, natural serenity, and deep creative focus.'),
      step: t('Visit Italian lakeside properties and consult with European cross-border wealth advisory.'),
    },
    {
      name: t('Patek Philippe Nautilus 5711/1R Rose Gold'),
      category: 'Luxury Watches' as MarketCategory,
      realUsd: 145000,
      dPrice: 12000,
      img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=85',
      desc: t('Warm 18k rose gold case, chocolate embossed horizontal dial, mechanical self-winding caliber 26-330 S C.'),
      why: t('Generational heirloom anchoring the standard of my time and legacy.'),
      step: t('Register profile with authorized Geneva salon and track certified pre-owned auctions.'),
    },
    {
      name: t('Riva 68 Diable Mediterranean Yacht'),
      category: 'Yachts & Aviation' as MarketCategory,
      realUsd: 3800000,
      dPrice: 32000,
      img: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1600&q=85',
      desc: t('Handcrafted mahogany varnished deck, twin MAN 1,550 hp engines, bespoke owner stateroom.'),
      why: t('Total maritime freedom across the Mediterranean and coastal waters.'),
      step: t('Obtain international RYA skipper license and charter a weekend sea trial in Cannes.'),
    },
    {
      name: t('Minimalist Tokyo High-Rise Creative Penthouse'),
      category: 'Homes' as MarketCategory,
      realUsd: 4200000,
      dPrice: 35000,
      img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
      desc: t('Panoramic skyline views of Mount Fuji and Tokyo Tower, tatami tea sanctuary, private cedar sauna.'),
      why: t('Harmonious sanctuary blending high-tech metropolis with ancient Zen serenity.'),
      step: t('Consult Tokyo luxury real estate broker and structure offshore holding.'),
    },
    {
      name: t('Bespoke Executive Creative Studio & Library'),
      category: 'Dream Workspace' as MarketCategory,
      realUsd: 85000,
      dPrice: 8500,
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
      desc: t('Solid walnut acoustic paneling, dual Pro Display XDRs, Genelec studio monitors, Herman Miller seating.'),
      why: t('Peak cognitive environment designed for deep, uninterrupted creative architecture.'),
      step: t('Draft 3D studio floor plan and order custom walnut acoustic isolation panels.'),
    },
  ];

  // Stop camera helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  // Start Camera feed
  const startCamera = async (facing: 'user' | 'environment' = cameraFacing) => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(t('Camera API is not supported in this browser environment.'));
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera failed to start:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? t('Camera permission denied. Allow camera access in your browser, or use a web link / image file instead.')
          : t('Could not access the camera. Upload an image from your device or paste a web link instead.')
      );
      setIsCameraActive(false);
    }
  };

  // Switch between front/back cameras
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  // Snap photo from camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (cameraFacing === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImageUrl(dataUrl);
      stopCamera();
      showToast(t('Photo attached.'), 'success');
    }
  };

  // Image file drop/upload handler
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast(t('Please choose a valid image file (PNG, JPG, WEBP).'), 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImageUrl(result);
        stopCamera();
        showToast(t('Image uploaded.'), 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyPreset = (preset: typeof INSPIRATION_PRESETS[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setRealPriceUsd(preset.realUsd);
    setDreamDollarPrice(preset.dPrice);
    setImageUrl(preset.img);
    setDescription(preset.desc);
    setWhyWanted(preset.why);
    setFirstRealStep(preset.step);
    showToast(t('"{name}" applied.', { name: preset.name }), 'info');
  };

  const handleRealPriceChange = (val: number) => {
    setRealPriceUsd(val);
    setDreamDollarPrice(Math.max(100, Math.round(val * 0.008)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast(t('Please enter a name for your dream or vision goal.'), 'error');
      return;
    }

    try {
      const createdItem = await addCustomDream(
        {
          name: name.trim(),
          category,
          realPriceUsd,
          dreamDollarPrice,
          description: description.trim() || t('A custom vision goal seen in real life or discovered online.'),
          illustrationKey: 'custom_dream',
          customImageUrl: imageUrl.trim() || undefined,
          whyWanted: whyWanted.trim() || t('Personal sovereignty, a high standard of living, and focus.'),
          firstRealStep: firstRealStep.trim() || t('Plan the first step toward making this dream real.'),
        },
        pinToVision
      );

      triggerBigRewardConfetti();
      showToast(
        pinToVision
          ? t('"{name}" added to your Vision Board.', { name: name.trim() })
          : t('"{name}" added to your dreams.', { name: name.trim() }),
        'success'
      );

      if (onSuccess && createdItem) {
        onSuccess(createdItem);
      }

      handleClose();
    } catch (err: any) {
      showToast(err?.message || t('Could not save the vision goal.'), 'error');
    }
  };

  const handleClose = () => {
    stopCamera();
    setName('');
    setDescription('');
    setImageUrl('');
    setWhyWanted('');
    setFirstRealStep('');
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const categories: MarketCategory[] = [
    'Homes',
    'Cars & Mobility',
    'Luxury Watches',
    'Yachts & Aviation',
    'Experiences',
    'Dream Workspace',
    'Travel',
    'Business',
    'Health & Wellness',
    'Giving',
  ];

  const sourceTabs: { id: MediaSourceMode; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; onSelect: () => void }[] = [
    {
      id: 'camera',
      label: t('Camera'),
      icon: Camera,
      onSelect: () => {
        setActiveTab('camera');
        startCamera();
      },
    },
    {
      id: 'web_url',
      label: t('Link'),
      icon: Globe,
      onSelect: () => {
        stopCamera();
        setActiveTab('web_url');
      },
    },
    {
      id: 'upload',
      label: t('Upload'),
      icon: Upload,
      onSelect: () => {
        stopCamera();
        setActiveTab('upload');
      },
    },
    {
      id: 'preset',
      label: t('Ideas'),
      icon: Sparkles,
      onSelect: () => {
        stopCamera();
        setActiveTab('preset');
      },
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('Add a dream')}
      subtitle={t('Photograph something you saw, or add an image you love.')}
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Image source */}
        <div className="space-y-3">
          <span className="block text-[13px] font-medium text-[var(--fg-muted)]">{t('Image')}</span>
          <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--bg-muted)] rounded-[var(--radius-sm)]">
            {sourceTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={tab.onSelect}
                  className={`h-10 rounded-[var(--radius-xs)] flex items-center justify-center gap-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[var(--bg)] text-[var(--fg)] shadow-[var(--shadow-md)]'
                      : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === 'camera' && (
            <div>
              {isCameraActive ? (
                <div className="w-full h-64 rounded-[var(--radius-md)] overflow-hidden relative bg-[#111111]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                    title={t('Switch camera')}
                  >
                    <FlipHorizontal className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="absolute top-3 left-3 h-10 px-3.5 rounded-full bg-black/60 text-white text-[13px] font-medium hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    {t('Close')}
                  </button>
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-14 h-14 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                      title={t('Take photo')}
                    >
                      <Camera className="w-5 h-5 text-white" strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              ) : imageUrl ? (
                <div className="w-full h-52 rounded-[var(--radius-md)] overflow-hidden relative bg-[var(--bg-muted)]">
                  <img
                    src={imageUrl}
                    alt={t('Captured photo')}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="h-10 px-3.5 rounded-full bg-black/60 text-white text-[13px] font-medium hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      {t('Retake')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                      title={t('Remove')}
                    >
                      <Trash2 className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-[var(--radius-md)] bg-[var(--bg-muted)] text-center space-y-3">
                  <Camera className="w-6 h-6 text-[var(--fg-subtle)] mx-auto" strokeWidth={1.8} />
                  <p className="text-[14px] text-[var(--fg-muted)] max-w-sm mx-auto leading-relaxed">
                    {t('Spotted a car, a home, a desk or a watch you love? Capture it on the spot.')}
                  </p>
                  <Button type="button" variant="secondary" icon={Camera} onClick={() => startCamera()}>
                    {t('Open camera')}
                  </Button>
                  {cameraError && <p className="text-[13px] text-[var(--danger)]">{cameraError}</p>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'web_url' && (
            <div className="space-y-3">
              <Field
                id="dream-web-url"
                label={t('Image link')}
                helper={t('Paste a direct image link from Pinterest, Unsplash or anywhere on the web.')}
              >
                <Input
                  id="dream-web-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://"
                />
              </Field>
              {imageUrl && (
                <div className="w-full h-44 rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-muted)]">
                  <img
                    src={imageUrl}
                    alt={t('Web preview')}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={() => {
                      showToast(t('Could not load the image link. Please enter a valid direct image URL.'), 'error');
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processImageFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              {imageUrl ? (
                <div className="w-full h-44 rounded-[var(--radius-md)] overflow-hidden relative bg-[var(--bg-muted)]">
                  <img
                    src={imageUrl}
                    alt={t('Uploaded image')}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-3 right-3 h-10 px-3.5 rounded-full bg-black/60 text-white text-[13px] font-medium hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    {t('Choose another')}
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`p-6 rounded-[var(--radius-md)] text-center space-y-3 transition-colors border ${
                    isDragOver
                      ? 'border-[var(--border-strong)] bg-[var(--bg-inset)]'
                      : 'border-transparent bg-[var(--bg-muted)]'
                  }`}
                >
                  <Upload className="w-6 h-6 text-[var(--fg-subtle)] mx-auto" strokeWidth={1.8} />
                  <p className="text-[14px] text-[var(--fg-muted)] leading-relaxed">
                    {t('Drop an image here, or choose a file. PNG, JPG and WEBP work.')}
                  </p>
                  <Button type="button" variant="secondary" icon={Upload} onClick={() => fileInputRef.current?.click()}>
                    {t('Choose file')}
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preset' && (
            <div className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] overflow-hidden max-h-72 overflow-y-auto">
              {INSPIRATION_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`w-full min-h-[56px] px-4 py-2.5 flex items-center gap-3 text-left cursor-pointer hover:bg-[var(--bg-inset)] transition-colors ${
                    idx > 0 ? 'border-t border-[var(--border)]' : ''
                  }`}
                >
                  <img
                    src={preset.img}
                    alt={preset.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-[var(--radius-xs)] object-cover shrink-0 bg-[var(--bg-inset)]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-medium text-[var(--fg)] truncate">{preset.name}</div>
                    <div className="text-[13px] text-[var(--fg-muted)] truncate">
                      {t(preset.category)} · D$ {preset.dPrice.toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <Field id="dream-name" label={t('Name')} required>
            <Input
              id="dream-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('e.g. Porsche 911 GT3 RS')}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="dream-category" label={t('Category')}>
              <Select
                id="dream-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as MarketCategory)}
                options={categories.map((c) => ({ value: c, label: t(c) }))}
              />
            </Field>

            <Field id="dream-real-price" label={t('Real price (USD)')}>
              <Input
                id="dream-real-price"
                type="number"
                min={50}
                value={realPriceUsd}
                onChange={(e) => handleRealPriceChange(parseInt(e.target.value) || 0)}
              />
            </Field>
          </div>

          <Field id="dream-d-price" label={t('Dream Dollar price')} helper={t('Suggested from the real price.')}>
            <Input
              id="dream-d-price"
              type="number"
              min={50}
              value={dreamDollarPrice}
              onChange={(e) => setDreamDollarPrice(parseInt(e.target.value) || 100)}
            />
          </Field>

          <Field id="dream-why" label={t('Why you want it')}>
            <Input
              id="dream-why"
              value={whyWanted}
              onChange={(e) => setWhyWanted(e.target.value)}
              placeholder={t('One honest sentence.')}
            />
          </Field>

          <Field id="dream-first-step" label={t('First real step')}>
            <Input
              id="dream-first-step"
              value={firstRealStep}
              onChange={(e) => setFirstRealStep(e.target.value)}
              placeholder={t('e.g. Open a savings account, book a test drive.')}
            />
          </Field>

          {/* Pin to Vision Board */}
          <label
            htmlFor="pin-vision-check"
            className="min-h-[56px] px-4 py-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="min-w-0">
              <div className="text-[15px] font-medium text-[var(--fg)]">{t('Pin to Vision Board')}</div>
              <div className="text-[13px] text-[var(--fg-muted)]">{t('Shows in your daily vision and on the board.')}</div>
            </div>
            <input
              type="checkbox"
              id="pin-vision-check"
              checked={pinToVision}
              onChange={(e) => setPinToVision(e.target.checked)}
              className="w-5 h-5 accent-[var(--accent)] cursor-pointer shrink-0"
            />
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" type="button" onClick={handleClose}>
            {t('Cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={!name.trim()}>
            {t('Save dream')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
