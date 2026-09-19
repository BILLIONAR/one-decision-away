import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../store/useApp';
import { Modal, Field, Input, Textarea, Select, Button } from './ui';
import { Camera, Upload, FlipHorizontal, X } from 'lucide-react';
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
      showToast(t('Photo attached.'), 'success');
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
      showToast(t('Saved to your journal.'), 'success');
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
      title={t('Quick note')}
      maxWidth="md"
    >
      <div onKeyDown={handleKeyDown}>
        <form onSubmit={handleSave} className="space-y-6">
          <Field id="quick-journal-title" label={t('Title')} required>
            <Input
              id="quick-journal-title"
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('What happened?')}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="quick-journal-mood" label={t('Mood')}>
              <Select
                id="quick-journal-mood"
                value={mood}
                onChange={(e) => setMood(e.target.value as JournalMood)}
                options={[
                  { value: 'focused', label: t('Focused') },
                  { value: 'triumphant', label: t('Triumphant') },
                  { value: 'grateful', label: t('Grateful') },
                  { value: 'visionary', label: t('Visionary') },
                  { value: 'breakthrough', label: t('Breakthrough') },
                ]}
              />
            </Field>

            <Field id="quick-journal-dream" label={t('Dream (optional)')}>
              <Select
                id="quick-journal-dream"
                value={linkedDreamId}
                onChange={(e) => setLinkedDreamId(e.target.value)}
                options={[
                  { value: '', label: t('None') },
                  ...allAvailableDreams.map((d) => ({
                    value: d.id,
                    label: t(d.name),
                  })),
                ]}
              />
            </Field>
          </div>

          <Field id="quick-journal-content" label={t('Notes')} required>
            <Textarea
              id="quick-journal-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('The insight, the shift, or the next decision.')}
              rows={4}
            />
          </Field>

          {/* Photo */}
          <div className="space-y-2">
            <span className="block text-[13px] font-medium text-[var(--fg-muted)]">{t('Photo (optional)')}</span>

            {isCameraActive ? (
              <div className="w-full h-56 rounded-[var(--radius-md)] overflow-hidden relative bg-[#111111]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                />
                <button
                  type="button"
                  onClick={stopCamera}
                  className="absolute top-3 left-3 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                  title={t('Close camera')}
                  aria-label={t('Close camera')}
                >
                  <X className="w-[18px] h-[18px]" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                  title={t('Switch camera')}
                  aria-label={t('Switch camera')}
                >
                  <FlipHorizontal className="w-[18px] h-[18px]" strokeWidth={1.8} />
                </button>
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-14 h-14 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    title={t('Take photo')}
                    aria-label={t('Take photo')}
                  >
                    <Camera className="w-5 h-5 text-white" strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            ) : photoDataUrl ? (
              <div className="relative w-full h-44 rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-muted)]">
                <img
                  src={photoDataUrl}
                  alt={t('Attached photo')}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoDataUrl('')}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                  title={t('Remove photo')}
                  aria-label={t('Remove photo')}
                >
                  <X className="w-[18px] h-[18px]" strokeWidth={1.8} />
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
                className={`p-4 rounded-[var(--radius-md)] border transition-colors ${
                  isDragOver
                    ? 'border-[var(--border-strong)] bg-[var(--bg-inset)]'
                    : 'border-transparent bg-[var(--bg-muted)]'
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
                <div className="flex items-center justify-center gap-2">
                  <Button type="button" variant="secondary" size="sm" icon={Camera} onClick={() => startCamera('user')}>
                    {t('Camera')}
                  </Button>
                  <Button type="button" variant="secondary" size="sm" icon={Upload} onClick={() => fileInputRef.current?.click()}>
                    {t('Upload')}
                  </Button>
                </div>
              </div>
            )}

            {cameraError && <p className="text-[13px] text-[var(--danger)]">{cameraError}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[12px] text-[var(--fg-subtle)] hidden sm:block">
              {isMac ? t('⌘ Enter to save') : t('Ctrl Enter to save')}
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="ghost"
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
                disabled={isSubmitting || !title.trim() || !content.trim()}
              >
                {isSubmitting ? t('Saving…') : t('Save')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
