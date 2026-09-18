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
import {
  Camera,
  Globe,
  Upload,
  Sparkles,
  FlipHorizontal,
  Trash2,
  Check,
  Star,
  Car,
  Home,
  Clock,
  Plane,
  Compass,
  Briefcase,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { MarketCategory, MarketItem } from '../types/models';
import { triggerBigRewardConfetti } from '../utils/confetti';

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
      name: 'Porsche 911 GT3 RS in Guards Red',
      category: 'Cars & Mobility' as MarketCategory,
      realUsd: 285000,
      dPrice: 18500,
      img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85',
      desc: 'Naturally aspirated 4.0L flat-six, lightweight motorsport aerodynamic package, track telemetry.',
      why: 'Symbol of uncompromising mechanical excellence and track-honed precision.',
      step: 'Book a Porsche Track Experience session and calculate amortization schedule.',
    },
    {
      name: 'Lake Como Waterfront Modernist Villa',
      category: 'Homes' as MarketCategory,
      realUsd: 6500000,
      dPrice: 45000,
      img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
      desc: 'Direct private dock, floor-to-ceiling glass pavilions, infinity pool overlooking Bellagio.',
      why: 'Daily sanctuary of absolute peace, natural serenity, and deep creative focus.',
      step: 'Visit Italian lakeside properties and consult with European cross-border wealth advisory.',
    },
    {
      name: 'Patek Philippe Nautilus 5711/1R Rose Gold',
      category: 'Luxury Watches' as MarketCategory,
      realUsd: 145000,
      dPrice: 12000,
      img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=85',
      desc: 'Warm 18k rose gold case, chocolate embossed horizontal dial, mechanical self-winding caliber 26-330 S C.',
      why: 'Generational heirloom anchoring the standard of my time and legacy.',
      step: 'Register profile with authorized Geneva salon and track certified pre-owned auctions.',
    },
    {
      name: 'Riva 68 Diable Mediterranean Yacht',
      category: 'Yachts & Aviation' as MarketCategory,
      realUsd: 3800000,
      dPrice: 32000,
      img: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1600&q=85',
      desc: 'Handcrafted mahogany varnished deck, twin MAN 1,550 hp engines, bespoke owner stateroom.',
      why: 'Total maritime freedom across the Mediterranean and coastal waters.',
      step: 'Obtain international RYA skipper license and charter a weekend sea trial in Cannes.',
    },
    {
      name: 'Minimalist Tokyo High-Rise Creative Penthouse',
      category: 'Homes' as MarketCategory,
      realUsd: 4200000,
      dPrice: 35000,
      img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
      desc: 'Panoramic skyline views of Mount Fuji and Tokyo Tower, tatami tea sanctuary, private cedar sauna.',
      why: 'Harmonious sanctuary blending high-tech metropolis with ancient Zen serenity.',
      step: 'Consult Tokyo luxury real estate broker and structure offshore holding.',
    },
    {
      name: 'Bespoke Executive Creative Studio & Library',
      category: 'Dream Workspace' as MarketCategory,
      realUsd: 85000,
      dPrice: 8500,
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
      desc: 'Solid walnut acoustic paneling, dual Pro Display XDRs, Genelec studio monitors, Herman Miller seating.',
      why: 'Peak cognitive environment designed for deep, uninterrupted creative architecture.',
      step: 'Draft 3D studio floor plan and order custom walnut acoustic isolation panels.',
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
        throw new Error('Camera API is not supported in this browser environment.');
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
          ? 'Camera permission denied. Allow camera access in your browser, or use a web link / image file instead.'
          : 'Could not access the camera. Upload an image from your device or paste a web link instead.'
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
      showToast('Live photo captured and attached to your vision goal! 📸', 'success');
    }
  };

  // Image file drop/upload handler
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please choose a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImageUrl(result);
        stopCamera();
        showToast('Image uploaded.', 'success');
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
    showToast(`"${preset.name}" template applied.`, 'info');
  };

  const handleRealPriceChange = (val: number) => {
    setRealPriceUsd(val);
    setDreamDollarPrice(Math.max(100, Math.round(val * 0.008)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a name for your dream or vision goal.', 'error');
      return;
    }

    try {
      const createdItem = await addCustomDream(
        {
          name: name.trim(),
          category,
          realPriceUsd,
          dreamDollarPrice,
          description: description.trim() || 'A custom vision goal seen in real life or discovered online.',
          illustrationKey: 'custom_dream',
          customImageUrl: imageUrl.trim() || undefined,
          whyWanted: whyWanted.trim() || 'Personal sovereignty, a high standard of living, and focus.',
          firstRealStep: firstRealStep.trim() || 'Plan the first step toward making this dream real.',
        },
        pinToVision
      );

      triggerBigRewardConfetti();
      showToast(
        pinToVision
          ? `"${name.trim()}" added to your Vision Board and Dream Market! ⭐`
          : `"${name.trim()}" added to your Dream Market!`,
        'success'
      );

      if (onSuccess && createdItem) {
        onSuccess(createdItem);
      }

      handleClose();
    } catch (err: any) {
      showToast(err?.message || 'Could not save the vision goal.', 'error');
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add to Vision Board / Dream Market"
      subtitle="Photograph something you saw in real life, or add an image you love from the web, and make it part of your vision."
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Source Media Mode Switcher */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] block">
            Choose an image source:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                startCamera();
              }}
              className={`p-2.5 rounded-[var(--radius-md)] border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                activeTab === 'camera'
                  ? 'border-[var(--color-sage)] bg-[var(--color-sage)]/10 text-[var(--fg)] font-semibold shadow-xs'
                  : 'border-[var(--border)] bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <Camera className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                <span>Live Camera</span>
              </div>
              <span className="text-[10px] text-[var(--fg-subtle)]">Photograph it in real life</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveTab('web_url');
              }}
              className={`p-2.5 rounded-[var(--radius-md)] border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                activeTab === 'web_url'
                  ? 'border-[var(--color-sage)] bg-[var(--color-sage)]/10 text-[var(--fg)] font-semibold shadow-xs'
                  : 'border-[var(--border)] bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <Globe className="w-3.5 h-3.5 text-sky-500" />
                <span>Web Link</span>
              </div>
              <span className="text-[10px] text-[var(--fg-subtle)]">Paste a web URL</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveTab('upload');
              }}
              className={`p-2.5 rounded-[var(--radius-md)] border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-[var(--color-sage)] bg-[var(--color-sage)]/10 text-[var(--fg)] font-semibold shadow-xs'
                  : 'border-[var(--border)] bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <Upload className="w-3.5 h-3.5 text-amber-500" />
                <span>Upload File</span>
              </div>
              <span className="text-[10px] text-[var(--fg-subtle)]">Pick an image from your device</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveTab('preset');
              }}
              className={`p-2.5 rounded-[var(--radius-md)] border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                activeTab === 'preset'
                  ? 'border-[var(--color-sage)] bg-[var(--color-sage)]/10 text-[var(--fg)] font-semibold shadow-xs'
                  : 'border-[var(--border)] bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-coral)]" />
                <span>Quick Inspiration</span>
              </div>
              <span className="text-[10px] text-[var(--fg-subtle)]">Curated templates</span>
            </button>
          </div>
        </div>

        {/* Media Preview & Input Box based on Active Tab */}
        <div className="space-y-2">
          {activeTab === 'camera' && (
            <div>
              {isCameraActive ? (
                <div className="w-full h-64 rounded-[var(--radius-md)] overflow-hidden relative bg-black border-2 border-[var(--color-sage)] shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Camera Active ({cameraFacing === 'user' ? 'Front' : 'Back'})
                  </div>

                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-xs text-white hover:bg-black/90 transition-colors"
                    title="Switch camera"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="bg-black/60 text-white hover:bg-black/90"
                      onClick={stopCamera}
                    >
                      Close Camera
                    </Button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-12 h-12 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 active:scale-95 transition-all shadow-lg flex items-center justify-center cursor-pointer"
                      title="Take photo"
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              ) : imageUrl ? (
                <div className="w-full h-52 rounded-[var(--radius-md)] overflow-hidden relative bg-black border border-[var(--border)] group">
                  <img
                    src={imageUrl}
                    alt="Captured photo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1">
                    <Check className="w-3 h-3 text-[var(--color-sage)]" /> Live Photo Attached
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={Camera}
                      onClick={() => startCamera()}
                      className="bg-black/75 text-white border-0 hover:bg-black"
                    >
                      Retake
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => setImageUrl('')}
                      className="bg-black/75 text-red-400 border-0 hover:bg-black"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--bg-muted)] text-center space-y-2">
                  <Camera className="w-8 h-8 text-[var(--color-sage)] mx-auto" />
                  <div className="text-xs font-semibold text-[var(--fg)]">
                    Photograph Something You See in Real Life
                  </div>
                  <p className="text-[11px] text-[var(--fg-muted)] max-w-sm mx-auto">
                    Spotted a car, a building, a desk or a watch you love? Capture it on the spot.
                  </p>
                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    icon={Camera}
                    onClick={() => startCamera()}
                  >
                    Start Camera & Capture
                  </Button>
                  {cameraError && (
                    <div className="p-2 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded border border-amber-500/20">
                      {cameraError}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'web_url' && (
            <div className="space-y-3">
              <Field
                id="dream-web-url"
                label="Web Image Link (URL)"
                helper="Paste a direct image link from Pinterest, Unsplash, Instagram, architecture magazines or Google Images."
              >
                <Input
                  id="dream-web-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... veya https://..."
                />
              </Field>

              {imageUrl && (
                <div className="w-full h-44 rounded-[var(--radius-md)] overflow-hidden border border-[var(--border)] relative bg-black">
                  <img
                    src={imageUrl}
                    alt="Web preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={() => {
                      showToast('Could not load the image link. Please enter a valid direct image URL.', 'error');
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white">
                    Web Image Preview
                  </div>
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
                <div className="w-full h-44 rounded-[var(--radius-md)] overflow-hidden border border-[var(--border)] relative bg-black">
                  <img
                    src={imageUrl}
                    alt="Uploaded image"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white">
                    File Uploaded
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-black/75 text-white"
                  >
                    Choose Another Image
                  </Button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`p-6 border-2 border-dashed rounded-[var(--radius-md)] text-center transition-all ${
                    isDragOver
                      ? 'border-[var(--color-sage)] bg-[var(--color-sage)]/5'
                      : 'border-[var(--border)] bg-[var(--bg-muted)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <Upload className="w-8 h-8 text-[var(--fg-muted)] mx-auto mb-2" />
                  <div className="text-xs font-semibold text-[var(--fg)]">
                    Drag a Photo Here or Choose a File
                  </div>
                  <p className="text-[11px] text-[var(--fg-subtle)] my-2">
                    PNG, JPG and WEBP are supported.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Upload}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload from Device
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preset' && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[var(--fg-muted)] block">
                Curated Luxury & Vision Templates:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {INSPIRATION_PRESETS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2.5 border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--bg-elevated)] hover:border-[var(--color-sage)] cursor-pointer flex items-center gap-2.5 transition-all group"
                  >
                    <img
                      src={preset.img}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded object-cover border border-[var(--border)] shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-[var(--fg)] truncate">{preset.name}</h5>
                      <span className="text-[10px] text-[var(--fg-muted)] block">{preset.category}</span>
                      <span className="text-[10px] font-mono text-[var(--color-sage)] font-semibold">
                        ${preset.realUsd.toLocaleString()} USD · D$ {preset.dPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dream Details Inputs */}
        <div className="space-y-3.5 pt-2 border-t border-[var(--border)]">
          <Field
            id="dream-name"
            label="Dream / Vision Title"
            required
            helper="e.g. Porsche 911 GT3 RS, Modern Villa on Lake Como, Patek Philippe Nautilus, Minimalist Studio"
          >
            <Input
              id="dream-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ferrari 296 GTB or a custom mountain retreat"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="dream-category" label="Kategori">
              <Select
                id="dream-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as MarketCategory)}
                options={categories.map((c) => ({ value: c, label: c }))}
              />
            </Field>

            <Field
              id="dream-real-price"
              label="Estimated Real-World Value ($ USD)"
              helper="Estimated market or acquisition price."
            >
              <Input
                id="dream-real-price"
                type="number"
                min={50}
                value={realPriceUsd}
                onChange={(e) => handleRealPriceChange(parseInt(e.target.value) || 0)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              id="dream-d-price"
              label="Dream Dollar Price (D$)"
              helper="Suggested: real USD × 0.008"
            >
              <Input
                id="dream-d-price"
                type="number"
                min={50}
                value={dreamDollarPrice}
                onChange={(e) => setDreamDollarPrice(parseInt(e.target.value) || 100)}
              />
            </Field>

            <Field
              id="dream-why"
              label="Why Do You Want This Dream?"
              helper="Your emotional anchor and future-self standard."
            >
              <Input
                id="dream-why"
                value={whyWanted}
                onChange={(e) => setWhyWanted(e.target.value)}
                placeholder="e.g. Focused work discipline and uncompromising personal freedom."
              />
            </Field>
          </div>

          <Field
            id="dream-first-step"
            label="First Concrete Real-World Step"
            helper="What is the first physical move that connects this dream to reality?"
          >
            <Input
              id="dream-first-step"
              value={firstRealStep}
              onChange={(e) => setFirstRealStep(e.target.value)}
              placeholder="e.g. Open a dedicated savings sub-account, book a test drive / visit, or study the floor plans."
            />
          </Field>

          {/* Pin to Vision Board Option */}
          <div className="p-3 bg-[var(--bg-muted)] border border-[var(--border)] rounded-[var(--radius-md)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <div>
                <div className="text-xs font-bold text-[var(--fg)]">
                  Pin to Vision Board as a Priority ⭐
                </div>
                <div className="text-[11px] text-[var(--fg-muted)]">
                  Feature it in your Daily Vision Affirmations on the Home page and on your Vision Board.
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              id="pin-vision-check"
              checked={pinToVision}
              onChange={(e) => setPinToVision(e.target.checked)}
              className="w-4 h-4 text-[var(--color-sage)] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={!name.trim()}>
            Save to Vision & Market
          </Button>
        </div>
      </form>
    </Modal>
  );
};
