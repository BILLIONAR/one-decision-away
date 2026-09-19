import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../store/useApp';
import {
  Modal,
  Field,
  Input,
  Textarea,
  Select,
  Button,
  Badge,
} from './ui';
import {
  BookOpen,
  Camera,
  Upload,
  Sparkles,
  FlipHorizontal,
  X,
  Check,
  Command,
  CornerDownLeft,
} from 'lucide-react';
import { SEED_MARKET_ITEMS } from '../data/seed';
import { MarketItem } from '../types/models';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { useT } from '../i18n';

type JournalMood = 'triumphant' | 'focused' | 'grateful' | 'visionary' | 'breakthrough';

interface QuickDreamJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickDreamJournalModal: React.FC<QuickDreamJournalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { data, addDreamJournalEntry, showToast } = useApp();
  const t = useT();

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [mood, setMood] = useState<JournalMood>('focused');
  const [linkedDreamId, setLinkedDreamId] = useState<string>('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const isMac = useMemo(() => {
    if (typeof navigator !== 'undefined') {
      return /Mac|iPod|iPhone|iPad/.test(navigator.platform || '');
    }
    return false;
  }, []);

  const allAvailableDreams: MarketItem[] = useMemo(() => {
    if (!data) return SEED_MARKET_ITEMS;
    return [...SEED_MARKET_ITEMS, ...data.customMarketItems];
  }, [data]);

  // Focus title input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

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
      console.warn('Camera stream failed:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? t('Camera access was denied. Please allow permissions or upload an image.')
          : t('Could not access camera. You can upload an image from your device.')
      );
      setIsCameraActive(false);
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setPhotoDataUrl(dataUrl);
      stopCamera();
      soundSynthesizer.playTapChime();
      showToast(t('📸 Photo captured from camera!'), 'success');
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast(t('Please select a valid image file (PNG, JPG, WEBP).'), 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPhotoDataUrl(result);
        stopCamera();
        soundSynthesizer.playTapChime();
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

  const resetForm = () => {
    stopCamera();
    setTitle('');
    setContent('');
    setMood('focused');
    setLinkedDreamId('');
    setPhotoDataUrl('');
    setIsSubmitting(false);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast(t('Please provide both a title and reflection notes.'), 'error');
      return;
    }

    setIsSubmitting(true);
    const linkedDream = allAvailableDreams.find((d) => d.id === linkedDreamId);

    try {
      await addDreamJournalEntry({
        title: title.trim(),
        content: content.trim(),
        mood,
        dreamId: linkedDream?.id,
        dreamName: linkedDream?.name,
        photoDataUrl: photoDataUrl || undefined,
      });

      soundSynthesizer.playTapChime();
      showToast(t('✨ Dream Journal entry captured!'), 'success');
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      showToast(t('Failed to save journal entry.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Allow Cmd+Enter or Ctrl+Enter to save immediately while in modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={t('Quick Dream Journal Capture')}
      subtitle={t('Capture immediate inspirations, mindset breakthroughs, or future reflections instantly from anywhere in the app.')}
      maxWidth="lg"
    >
      <div onKeyDown={handleKeyDown} className="space-y-4">
        {/* Top Shortcut Pill */}
        <div className="flex items-center justify-between p-2.5 bg-[var(--bg-muted)] border border-[var(--border)] rounded-[var(--radius-sm)] text-xs text-[var(--fg-muted)]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[var(--color-sage)]/10 text-[var(--color-sage)] flex items-center justify-center shrink-0">
              <BookOpen className="w-3 h-3" />
            </div>
            <span className="font-medium">
              {t('Global Quick Capture Active')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[var(--fg)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded border border-[var(--border)]">
            <span>{isMac ? '⌘K' : 'Ctrl+K'}</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Field
            id="quick-journal-title"
            label={t('Inspiration Title')}
            required
            helper={t('What decision, vision moment, or realization happened?')}
          >
            <Input
              id="quick-journal-title"
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('e.g. Breakthrough clarity on high-leverage quarterly milestone')}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="quick-journal-mood" label={t('Current State of Mind')}>
              <Select
                id="quick-journal-mood"
                value={mood}
                onChange={(e) => setMood(e.target.value as JournalMood)}
                options={[
                  { value: 'focused', label: t('🎯 Deep Focus') },
                  { value: 'triumphant', label: t('🏆 Triumphant Win') },
                  { value: 'grateful', label: t('🌿 Grateful & Grounded') },
                  { value: 'visionary', label: t('✨ Visionary Expansion') },
                  { value: 'breakthrough', label: t('⚡ Breakthrough Realization') },
                ]}
              />
            </Field>

            <Field
              id="quick-journal-dream"
              label={t('Linked Vision Target (Optional)')}
              helper={t('Connect to a specific future milestone.')}
            >
              <Select
                id="quick-journal-dream"
                value={linkedDreamId}
                onChange={(e) => setLinkedDreamId(e.target.value)}
                options={[
                  { value: '', label: t('— General Future Life Progress —') },
                  ...allAvailableDreams.map((d) => ({
                    value: d.id,
                    label: `${d.name} (${d.category})`,
                  })),
                ]}
              />
            </Field>
          </div>

          <Field
            id="quick-journal-content"
            label={t('Reflection Notes')}
            required
            helper={t('Describe the insight, mindset shift, or execution victory.')}
          >
            <Textarea
              id="quick-journal-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('Jot down the specific circumstances, thoughts, or next decision to solidify...')}
              rows={4}
            />
          </Field>

          {/* Camera / Photo Attachment */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[var(--fg)] block">
              {t('Visual Anchor (Optional Photo)')}
            </span>

            {isCameraActive ? (
              <div className="w-full h-56 rounded-[var(--radius-md)] overflow-hidden relative bg-black border-2 border-[var(--color-sage)] shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                />
                
                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {t('Live Viewfinder ({facing})', { facing: cameraFacing === 'user' ? t('Front') : t('Back') })}
                </div>

                <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-2 rounded-full bg-black/70 backdrop-blur-xs text-white hover:bg-black transition-colors cursor-pointer"
                    title={t('Switch Camera')}
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-4 py-2 bg-[var(--color-sage)] text-[var(--color-slate)] font-bold text-xs rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" /> {t('Take Snapshot')}
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="p-2 rounded-full bg-black/70 backdrop-blur-xs text-white hover:bg-black transition-colors cursor-pointer"
                    title={t('Cancel Camera')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : photoDataUrl ? (
              <div className="relative w-full h-44 rounded-[var(--radius-md)] overflow-hidden border border-[var(--border)] bg-black group">
                <img
                  src={photoDataUrl}
                  alt={t('Journal Anchor')}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPhotoDataUrl('')}
                    className="p-1.5 rounded-full bg-black/80 text-white hover:bg-red-600 transition-colors cursor-pointer"
                    title={t('Remove Photo')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`p-4 border-2 border-dashed rounded-[var(--radius-md)] text-center transition-colors ${
                  isDragOver
                    ? 'border-[var(--color-sage)] bg-[var(--color-sage)]/5'
                    : 'border-[var(--border)] bg-[var(--bg-muted)] hover:border-[var(--border-strong)]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processImageFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startCamera('user')}
                      className="px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg)] hover:border-[var(--fg)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                      <span>{t('Take Photo')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg)] hover:border-[var(--fg)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-[var(--color-coral)]" />
                      <span>{t('Upload File')}</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-[var(--fg-subtle)]">
                    {t('Drag and drop an image or use your device camera')}
                  </span>
                </div>
              </div>
            )}

            {cameraError && (
              <p className="text-xs text-rose-500 font-medium">{cameraError}</p>
            )}
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--fg-subtle)]">
              <span>{t('Shortcut hint:')}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-muted)] border border-[var(--border)] font-mono text-[10px] font-semibold text-[var(--fg)]">
                {isMac ? '⌘ + Enter' : 'Ctrl + Enter'}
              </kbd>
              <span>{t('to save')}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
              >
                {t('Cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Check}
                disabled={isSubmitting || !title.trim() || !content.trim()}
              >
                {isSubmitting ? t('Saving...') : t('Save to Journal')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
