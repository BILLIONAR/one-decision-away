import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../store/useApp';
import { Button, Modal, Field, Input, Textarea, Select, Empty } from './ui';
import {
  Camera,
  FlipHorizontal,
  Upload,
  Plus,
  Trash2,
  Search,
  X,
  BookOpen,
  SlidersHorizontal,
} from 'lucide-react';
import { DreamJournalEntry, MarketItem } from '../types/models';
import { SEED_MARKET_ITEMS } from '../data/seed';
import { useT, N_ } from '../i18n';

type JournalMood = 'triumphant' | 'focused' | 'grateful' | 'visionary' | 'breakthrough';
type DateRangePreset = 'all' | 'today' | '7days' | '30days' | 'thisMonth' | 'custom';

const MOOD_CONFIG: Record<JournalMood, { label: string }> = {
  focused: { label: N_('Focused') },
  triumphant: { label: N_('Triumphant') },
  grateful: { label: N_('Grateful') },
  visionary: { label: N_('Visionary') },
  breakthrough: { label: N_('Breakthrough') },
};

const DATE_PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: 'all', label: N_('All dates') },
  { id: 'today', label: N_('Today') },
  { id: '7days', label: N_('Last 7 days') },
  { id: '30days', label: N_('Last 30 days') },
  { id: 'thisMonth', label: N_('This month') },
  { id: 'custom', label: N_('Custom') },
];

export const DreamJournal: React.FC<{ limit?: number; showHeaderAction?: boolean }> = ({
  limit,
  showHeaderAction = true,
}) => {
  const { data, addDreamJournalEntry, deleteDreamJournalEntry, showToast } = useApp();
  const t = useT();

  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<DreamJournalEntry | null>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<DateRangePreset>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [mood, setMood] = useState<JournalMood>('focused');
  const [linkedDreamId, setLinkedDreamId] = useState<string>('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');

  // Camera & Capture State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!data) return null;

  const entries: DreamJournalEntry[] = data.dreamJournal || [];

  const allAvailableDreams: MarketItem[] = useMemo(() => {
    return [...SEED_MARKET_ITEMS, ...data.customMarketItems];
  }, [data.customMarketItems]);

  // Clean stop camera helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  // Start Camera
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
          ? t('Camera access was denied. Please allow camera permissions in your browser or upload an image file.')
          : t('Could not access camera device. You can upload an image from your device.')
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

  // Take Snap
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If front camera, mirror back for natural look
      if (cameraFacing === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setPhotoDataUrl(dataUrl);
      stopCamera();
      showToast(t('Photo captured from camera!'), 'success');
    }
  };

  // File Upload Handlers (Drag & Drop + Click)
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Handle Submit
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast(t('Please provide both a title and reflection notes.'), 'error');
      return;
    }

    const linkedDream = allAvailableDreams.find((d) => d.id === linkedDreamId);

    await addDreamJournalEntry({
      title: title.trim(),
      content: content.trim(),
      mood,
      dreamId: linkedDream?.id,
      dreamName: linkedDream?.name,
      photoDataUrl: photoDataUrl || undefined,
    });

    // Reset & close
    stopCamera();
    setTitle('');
    setContent('');
    setPhotoDataUrl('');
    setLinkedDreamId('');
    setIsComposeOpen(false);
  };

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Filtered entries by keyword, date range, and mood
  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = new Date();

    return entries.filter((entry) => {
      // 1. Keyword search
      const matchesSearch =
        !q ||
        entry.title.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q) ||
        (entry.dreamName && entry.dreamName.toLowerCase().includes(q)) ||
        (entry.mood && entry.mood.toLowerCase().includes(q));

      // 2. Mood filter
      const matchesMood = selectedMoodFilter === 'all' || entry.mood === selectedMoodFilter;

      // 3. Date range filter
      const entryDate = new Date(entry.createdAt);
      let matchesDate = true;

      if (datePreset === 'today') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        matchesDate = entryDate >= startOfToday;
      } else if (datePreset === '7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
        matchesDate = entryDate >= sevenDaysAgo;
      } else if (datePreset === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
        matchesDate = entryDate >= thirtyDaysAgo;
      } else if (datePreset === 'thisMonth') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        matchesDate = entryDate >= startOfMonth;
      } else if (datePreset === 'custom') {
        if (startDate) {
          const start = new Date(`${startDate}T00:00:00`);
          if (entryDate < start) matchesDate = false;
        }
        if (endDate) {
          const end = new Date(`${endDate}T23:59:59.999`);
          if (entryDate > end) matchesDate = false;
        }
      }

      return matchesSearch && matchesMood && matchesDate;
    });
  }, [entries, searchQuery, selectedMoodFilter, datePreset, startDate, endDate]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    selectedMoodFilter !== 'all' ||
    datePreset !== 'all' ||
    startDate ||
    endDate
  );

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedMoodFilter('all');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
  };

  const displayedEntries = limit ? filteredEntries.slice(0, limit) : filteredEntries;

  // Text highlight helper
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={i} className="bg-[var(--accent-soft)] text-[var(--fg)] rounded-[2px] px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const moodOptions = [
    { value: 'focused', label: t('Focused') },
    { value: 'triumphant', label: t('Triumphant') },
    { value: 'grateful', label: t('Grateful') },
    { value: 'visionary', label: t('Visionary') },
    { value: 'breakthrough', label: t('Breakthrough') },
  ];

  const dateInputClass =
    'w-full h-11 px-3.5 text-[15px] bg-[var(--bg-muted)] border border-transparent rounded-[var(--radius-sm)] text-[var(--fg)] focus:outline-none focus:border-[var(--border-strong)]';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Journal')}</h3>
          <p className="text-[13px] text-[var(--fg-muted)]">
            {entries.length === 1
              ? t('{n} entry', { n: entries.length })
              : t('{n} entries', { n: entries.length })}
            {hasActiveFilters && filteredEntries.length !== entries.length
              ? ` · ${t('{n} shown', { n: filteredEntries.length })}`
              : ''}
          </p>
        </div>
        {showHeaderAction && (
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsComposeOpen(true)}>
            {t('New entry')}
          </Button>
        )}
      </div>

      {/* Search & filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)]"
              strokeWidth={1.8}
            />
            <input
              type="text"
              placeholder={t('Search entries')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-11 text-[15px] bg-[var(--bg-muted)] border border-transparent rounded-[var(--radius-sm)] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none focus:border-[var(--border-strong)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
                title={t('Clear search')}
                aria-label={t('Clear search')}
              >
                <X className="w-4 h-4" strokeWidth={1.8} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`w-11 h-11 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
              showAdvancedFilters || hasActiveFilters
                ? 'bg-[var(--fg)] text-[var(--bg)]'
                : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
            title={t('Filters')}
            aria-label={t('Filters')}
          >
            <SlidersHorizontal className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </button>
        </div>

        {(showAdvancedFilters || datePreset === 'custom') && (
          <div className="space-y-4 p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)]">
            {/* Date */}
            <div className="space-y-2">
              <span className="block text-[13px] font-medium text-[var(--fg-muted)]">{t('Date')}</span>
              <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
                {DATE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setDatePreset(p.id);
                      if (p.id === 'custom') setShowAdvancedFilters(true);
                    }}
                    className={`h-9 px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      datePreset === p.id
                        ? 'bg-[var(--fg)] text-[var(--bg)]'
                        : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
                    }`}
                  >
                    {t(p.label)}
                  </button>
                ))}
              </div>
              {datePreset === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    aria-label={t('From')}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setDatePreset('custom');
                    }}
                    className={`${dateInputClass} bg-[var(--bg)]`}
                  />
                  <input
                    type="date"
                    value={endDate}
                    aria-label={t('To')}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setDatePreset('custom');
                    }}
                    className={`${dateInputClass} bg-[var(--bg)]`}
                  />
                </div>
              )}
            </div>

            {/* Mood */}
            <div className="space-y-2">
              <span className="block text-[13px] font-medium text-[var(--fg-muted)]">{t('Mood')}</span>
              <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedMoodFilter('all')}
                  className={`h-9 px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    selectedMoodFilter === 'all'
                      ? 'bg-[var(--fg)] text-[var(--bg)]'
                      : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
                  }`}
                >
                  {t('All')}
                </button>
                {(Object.keys(MOOD_CONFIG) as JournalMood[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMoodFilter(m)}
                    className={`h-9 px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      selectedMoodFilter === m
                        ? 'bg-[var(--fg)] text-[var(--bg)]'
                        : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
                    }`}
                  >
                    {t(MOOD_CONFIG[m].label)}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="h-9 text-[13px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
              >
                {t('Clear filters')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Entries */}
      {displayedEntries.length > 0 ? (
        <div className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] overflow-hidden">
          {displayedEntries.map((entry, idx) => {
            const moodInfo = entry.mood ? MOOD_CONFIG[entry.mood] : MOOD_CONFIG.focused;
            const formattedDate = new Date(entry.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={entry.id} className={`px-4 py-3.5 ${idx > 0 ? 'border-t border-[var(--border)]' : ''}`}>
                <div className="flex items-start gap-3">
                  {entry.photoDataUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedPhotoModal(entry)}
                      className="w-14 h-14 rounded-[var(--radius-sm)] overflow-hidden shrink-0 bg-[var(--bg-inset)] cursor-pointer"
                      title={t('View photo')}
                    >
                      <img
                        src={entry.photoDataUrl}
                        alt={entry.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[15px] font-medium text-[var(--fg)] leading-snug">
                        {renderHighlightedText(entry.title, searchQuery)}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteDreamJournalEntry(entry.id)}
                        className="w-9 h-9 -mr-2 -mt-1.5 rounded-full flex items-center justify-center shrink-0 text-[var(--fg-subtle)] hover:text-[var(--danger)] hover:bg-[var(--bg-inset)] transition-colors cursor-pointer"
                        title={t('Delete entry')}
                        aria-label={t('Delete entry')}
                      >
                        <Trash2 className="w-[18px] h-[18px]" strokeWidth={1.8} />
                      </button>
                    </div>
                    <div className="text-[13px] text-[var(--fg-muted)] mt-0.5 truncate">
                      {formattedDate} · {t(moodInfo.label)}
                      {entry.dreamName ? <> · {renderHighlightedText(t(entry.dreamName), searchQuery)}</> : null}
                    </div>
                    <p className="text-[14px] text-[var(--fg-muted)] leading-relaxed mt-2 whitespace-pre-line line-clamp-4">
                      {renderHighlightedText(entry.content, searchQuery)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : entries.length > 0 ? (
        <Empty
          icon={Search}
          title={t('No matches')}
          description={t('Try a different search, mood or date.')}
          actionLabel={t('Clear filters')}
          onAction={resetAllFilters}
        />
      ) : (
        <Empty
          icon={BookOpen}
          title={t('No entries yet')}
          description={t('Write down what you did today and how it felt. Add a photo if you like.')}
          actionLabel={t('Write the first entry')}
          onAction={() => setIsComposeOpen(true)}
        />
      )}

      {/* Photo viewer */}
      <Modal
        isOpen={Boolean(selectedPhotoModal)}
        onClose={() => setSelectedPhotoModal(null)}
        title={selectedPhotoModal?.title || t('Photo')}
        subtitle={selectedPhotoModal ? new Date(selectedPhotoModal.createdAt).toLocaleDateString() : ''}
        maxWidth="lg"
      >
        {selectedPhotoModal && selectedPhotoModal.photoDataUrl && (
          <div className="space-y-4">
            <div className="w-full max-h-[70vh] rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-muted)] flex items-center justify-center">
              <img
                src={selectedPhotoModal.photoDataUrl}
                alt={selectedPhotoModal.title}
                referrerPolicy="no-referrer"
                className="w-full max-h-[70vh] object-contain"
              />
            </div>
            <p className="text-[14px] text-[var(--fg-muted)] leading-relaxed whitespace-pre-line">
              {selectedPhotoModal.content}
            </p>
          </div>
        )}
      </Modal>

      {/* Compose */}
      <Modal
        isOpen={isComposeOpen}
        onClose={() => {
          stopCamera();
          setIsComposeOpen(false);
        }}
        title={t('New entry')}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEntry} className="space-y-6">
          <Field id="journal-title" label={t('Title')} required>
            <Input
              id="journal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('What happened?')}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="journal-mood" label={t('Mood')}>
              <Select
                id="journal-mood"
                value={mood}
                onChange={(e) => setMood(e.target.value as JournalMood)}
                options={moodOptions}
              />
            </Field>

            <Field id="journal-dream" label={t('Dream (optional)')}>
              <Select
                id="journal-dream"
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

          <Field id="journal-content" label={t('Notes')} required>
            <Textarea
              id="journal-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('What did you do today? What got in the way? What does it mean?')}
              rows={4}
            />
          </Field>

          {/* Photo */}
          <div className="space-y-2">
            <span className="block text-[13px] font-medium text-[var(--fg-muted)]">{t('Photo (optional)')}</span>

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
                  onClick={stopCamera}
                  className="absolute top-3 left-3 h-10 px-3.5 rounded-full bg-black/60 text-white text-[13px] font-medium hover:bg-black/80 transition-colors cursor-pointer"
                >
                  {t('Close')}
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
              <div className="w-full h-56 rounded-[var(--radius-md)] overflow-hidden relative bg-[var(--bg-muted)]">
                <img
                  src={photoDataUrl}
                  alt={t('Attached photo')}
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
                    onClick={() => setPhotoDataUrl('')}
                    className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                    title={t('Remove')}
                    aria-label={t('Remove')}
                  >
                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={1.8} />
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
                className={`p-4 rounded-[var(--radius-md)] border transition-colors ${
                  isDragOver
                    ? 'border-[var(--border-strong)] bg-[var(--bg-inset)]'
                    : 'border-transparent bg-[var(--bg-muted)]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2">
                  <Button type="button" variant="secondary" size="sm" icon={Camera} onClick={() => startCamera()}>
                    {t('Camera')}
                  </Button>
                  <Button type="button" variant="secondary" size="sm" icon={Upload} onClick={() => fileInputRef.current?.click()}>
                    {t('Upload')}
                  </Button>
                </div>
                {cameraError && <p className="text-[13px] text-[var(--danger)] text-center mt-3">{cameraError}</p>}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                stopCamera();
                setIsComposeOpen(false);
              }}
            >
              {t('Cancel')}
            </Button>
            <Button variant="primary" type="submit" disabled={!title.trim() || !content.trim()}>
              {t('Save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
