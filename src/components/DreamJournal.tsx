import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../store/useApp';
import {
  Card,
  Badge,
  Button,
  Modal,
  Field,
  Input,
  Textarea,
  Select,
} from './ui';
import {
  Camera,
  FlipHorizontal,
  Upload,
  Plus,
  Trash2,
  Calendar,
  Search,
  Maximize2,
  X,
  BookOpen,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { DreamJournalEntry, MarketItem } from '../types/models';
import { SEED_MARKET_ITEMS } from '../data/seed';

type JournalMood = 'triumphant' | 'focused' | 'grateful' | 'visionary' | 'breakthrough';
type DateRangePreset = 'all' | 'today' | '7days' | '30days' | 'thisMonth' | 'custom';

const MOOD_CONFIG: Record<JournalMood, { label: string; color: string; badgeVariant: 'sage' | 'slate' | 'coral' | 'outline' }> = {
  focused: { label: 'Deep Focus', color: 'text-[var(--color-sage)]', badgeVariant: 'sage' },
  triumphant: { label: 'Triumphant', color: 'text-amber-500', badgeVariant: 'slate' },
  grateful: { label: 'Grateful & Grounded', color: 'text-emerald-500', badgeVariant: 'sage' },
  visionary: { label: 'Visionary', color: 'text-[var(--color-coral)]', badgeVariant: 'coral' },
  breakthrough: { label: 'Breakthrough', color: 'text-sky-500', badgeVariant: 'outline' },
};

const DATE_PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: 'all', label: 'All Dates' },
  { id: 'today', label: 'Today' },
  { id: '7days', label: 'Past 7 Days' },
  { id: '30days', label: 'Past 30 Days' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'custom', label: 'Custom Range' },
];

export const DreamJournal: React.FC<{ limit?: number; showHeaderAction?: boolean }> = ({
  limit,
  showHeaderAction = true,
}) => {
  const { data, addDreamJournalEntry, deleteDreamJournalEntry, showToast } = useApp();

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
      console.warn('Camera stream failed:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access was denied. Please allow camera permissions in your browser or upload an image file.'
          : 'Could not access camera device. You can upload an image from your device.'
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
      showToast('Photo captured from camera!', 'success');
    }
  };

  // File Upload Handlers (Drag & Drop + Click)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
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
      showToast('Please provide both a title and reflection notes.', 'error');
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
        <mark key={i} className="bg-[var(--color-sage)]/25 text-[var(--fg)] font-semibold rounded-xs px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--color-sage)]/15 border border-[var(--color-sage)]/30 flex items-center justify-center text-[var(--color-sage)] shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-[var(--fg)]">
              Dream Journal & Visual Log
            </h3>
            <p className="text-xs text-[var(--fg-muted)]">
              Document your daily physical progress, mental breakthroughs, and snapshot photo memories.
            </p>
          </div>
        </div>

        {showHeaderAction && (
          <div className="flex items-center gap-2">
            <Button
              variant="accent"
              size="sm"
              icon={Plus}
              onClick={() => {
                setIsComposeOpen(true);
              }}
            >
              <span>New Entry</span>
              <kbd className="hidden sm:inline-block ml-1.5 px-1.5 py-0.2 rounded bg-black/20 text-white font-mono text-[9px] font-bold">
                {typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || '') ? '⌘K' : 'Ctrl+K'}
              </kbd>
            </Button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2.5 p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border)]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
            <input
              type="text"
              placeholder="Search by keywords, reflections, dreams, or insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--fg)] placeholder-[var(--fg-muted)] focus:outline-none focus:border-[var(--color-sage)] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] hover:text-[var(--fg)] p-0.5 rounded-full"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Date Range Selector & Toggle */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1 bg-[var(--bg)] p-0.5 rounded-[var(--radius-sm)] border border-[var(--border)]">
              <Calendar className="w-3.5 h-3.5 ml-2 text-[var(--fg-muted)] shrink-0" />
              <select
                value={datePreset}
                onChange={(e) => {
                  const val = e.target.value as DateRangePreset;
                  setDatePreset(val);
                  if (val === 'custom') setShowAdvancedFilters(true);
                }}
                className="px-2 py-1 text-xs bg-transparent border-0 text-[var(--fg)] focus:outline-none cursor-pointer font-medium"
              >
                {DATE_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant={showAdvancedFilters || datePreset === 'custom' ? 'secondary' : 'ghost'}
              size="sm"
              icon={Filter}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-xs shrink-0"
            >
              Filters
            </Button>
          </div>
        </div>

        {/* Expandable Advanced Filters (Custom Date Pickers & Mood) */}
        {(showAdvancedFilters || datePreset === 'custom') && (
          <div className="pt-2.5 mt-2 border-t border-[var(--border)] space-y-2.5 text-xs">
            {/* Custom Date Range Pickers if active */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-[var(--bg-muted)] p-2.5 rounded-[var(--radius-sm)] border border-[var(--border)]">
              <span className="text-[11px] font-semibold text-[var(--fg)] flex items-center gap-1 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-[var(--color-sage)]" /> Date Range:
              </span>

              <div className="flex items-center gap-2 flex-1 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1 flex-1 min-w-[120px]">
                  <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)]">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setDatePreset('custom');
                    }}
                    className="w-full px-2 py-1 text-xs bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-xs)] text-[var(--fg)] focus:outline-none focus:border-[var(--color-sage)]"
                  />
                </div>

                <div className="flex items-center gap-1 flex-1 min-w-[120px]">
                  <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)]">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setDatePreset('custom');
                    }}
                    className="w-full px-2 py-1 text-xs bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-xs)] text-[var(--fg)] focus:outline-none focus:border-[var(--color-sage)]"
                  />
                </div>

                {(startDate || endDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setDatePreset('all');
                    }}
                    className="text-[11px] text-[var(--color-coral)] hover:underline shrink-0 px-1"
                  >
                    Clear Dates
                  </button>
                )}
              </div>
            </div>

            {/* Mood Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[11px] text-[var(--fg-muted)] font-medium mr-1 shrink-0">
                Mood:
              </span>
              <button
                onClick={() => setSelectedMoodFilter('all')}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-[var(--radius-xs)] border transition-all cursor-pointer ${
                  selectedMoodFilter === 'all'
                    ? 'bg-[var(--fg)] text-[var(--bg)] border-transparent'
                    : 'bg-[var(--bg)] text-[var(--fg-muted)] border-[var(--border)] hover:text-[var(--fg)]'
                }`}
              >
                All ({entries.length})
              </button>
              {(Object.keys(MOOD_CONFIG) as JournalMood[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMoodFilter(m)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-[var(--radius-xs)] border transition-all cursor-pointer whitespace-nowrap ${
                    selectedMoodFilter === m
                      ? 'bg-[var(--fg)] text-[var(--bg)] border-transparent'
                      : 'bg-[var(--bg)] text-[var(--fg-muted)] border-[var(--border)] hover:text-[var(--fg)]'
                  }`}
                >
                  {MOOD_CONFIG[m].label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Summary & Active Indicator */}
        <div className="flex items-center justify-between text-[11px] text-[var(--fg-muted)] pt-1 border-t border-[var(--border)]/60">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>
              Showing <strong className="text-[var(--fg)]">{filteredEntries.length}</strong> of {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
            {searchQuery && (
              <span className="bg-[var(--color-sage)]/10 text-[var(--color-sage)] px-1.5 py-0.2 rounded border border-[var(--color-sage)]/20">
                keyword: "{searchQuery}"
              </span>
            )}
            {datePreset !== 'all' && (
              <span className="bg-[var(--bg-muted)] text-[var(--fg)] px-1.5 py-0.2 rounded border border-[var(--border)]">
                date: {datePreset === 'custom' ? `${startDate || 'Start'} to ${endDate || 'Now'}` : DATE_PRESETS.find(p => p.id === datePreset)?.label}
              </span>
            )}
            {selectedMoodFilter !== 'all' && (
              <span className="bg-[var(--bg-muted)] text-[var(--fg)] px-1.5 py-0.2 rounded border border-[var(--border)]">
                mood: {MOOD_CONFIG[selectedMoodFilter as JournalMood]?.label || selectedMoodFilter}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="flex items-center gap-1 text-[var(--color-coral)] hover:underline font-semibold shrink-0"
            >
              <RotateCcw className="w-3 h-3" /> Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Entries List */}
      {displayedEntries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedEntries.map((entry) => {
            const moodInfo = entry.mood ? MOOD_CONFIG[entry.mood] : MOOD_CONFIG.focused;
            const formattedDate = new Date(entry.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <Card
                key={entry.id}
                padding="md"
                className="flex flex-col justify-between overflow-hidden border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-strong)] transition-all group relative"
              >
                <div className="space-y-3">
                  {/* Photo Banner if attached */}
                  {entry.photoDataUrl && (
                    <div className="w-full h-44 rounded-[var(--radius-md)] overflow-hidden border border-[var(--border)] relative bg-black">
                      <img
                        src={entry.photoDataUrl}
                        alt={entry.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={() => setSelectedPhotoModal(entry)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/70 backdrop-blur-xs text-white/90 hover:text-white hover:bg-black transition-colors"
                        title="View Full Photo"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Header Badges */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant={moodInfo.badgeVariant}>
                        {moodInfo.label}
                      </Badge>
                      {entry.dreamName && (
                        <span className="text-[10px] font-semibold text-[var(--color-sage)] bg-[var(--color-sage)]/10 px-2 py-0.5 rounded-[var(--radius-xs)] border border-[var(--color-sage)]/20 truncate max-w-[180px]">
                          ⚓ {renderHighlightedText(entry.dreamName, searchQuery)}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-[var(--fg-subtle)] flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3" />
                      {formattedDate}
                    </span>
                  </div>

                  {/* Title & Notes with query highlighting */}
                  <div>
                    <h4 className="font-display font-bold text-sm text-[var(--fg)] leading-snug">
                      {renderHighlightedText(entry.title, searchQuery)}
                    </h4>
                    <p className="text-xs text-[var(--fg-muted)] leading-relaxed mt-1.5 whitespace-pre-line">
                      {renderHighlightedText(entry.content, searchQuery)}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-[10px] text-[var(--fg-subtle)] uppercase tracking-wider font-mono">
                    Entry #{entry.id.slice(-4)}
                  </span>
                  <button
                    onClick={() => deleteDreamJournalEntry(entry.id)}
                    className="text-[var(--fg-subtle)] hover:text-red-500 transition-colors p-1"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : entries.length > 0 ? (
        /* No entries matching search query or date range */
        <div className="p-8 text-center bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)] space-y-3">
          <Search className="w-8 h-8 text-[var(--fg-subtle)] mx-auto" />
          <h4 className="font-display font-bold text-sm text-[var(--fg)]">
            No journal entries match your search filters
          </h4>
          <p className="text-xs text-[var(--fg-muted)] max-w-sm mx-auto">
            {searchQuery ? `No results found for "${searchQuery}". ` : ''}
            Try adjusting your keyword query, mood filter, or date range settings.
          </p>
          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={resetAllFilters}
            >
              Reset Search & Filters
            </Button>
          </div>
        </div>
      ) : (
        /* Zero entries in system */
        <div className="p-8 text-center bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)] space-y-3">
          <BookOpen className="w-8 h-8 text-[var(--fg-subtle)] mx-auto" />
          <h4 className="font-display font-bold text-sm text-[var(--fg)]">
            No Dream Journal entries yet
          </h4>
          <p className="text-xs text-[var(--fg-muted)] max-w-sm mx-auto">
            Take a photo from your camera and jot down your mental state, execution win, or vision reflection.
          </p>
          <Button
            variant="outline"
            size="sm"
            icon={Camera}
            onClick={() => setIsComposeOpen(true)}
          >
            Create First Journal Entry
          </Button>
        </div>
      )}

      {/* Full Photo Modal */}
      <Modal
        isOpen={Boolean(selectedPhotoModal)}
        onClose={() => setSelectedPhotoModal(null)}
        title={selectedPhotoModal?.title || 'Journal Photo'}
        subtitle={selectedPhotoModal ? `Logged on ${new Date(selectedPhotoModal.createdAt).toLocaleDateString()}` : ''}
        maxWidth="lg"
      >
        {selectedPhotoModal && selectedPhotoModal.photoDataUrl && (
          <div className="space-y-3">
            <div className="w-full max-h-[70vh] rounded-[var(--radius-md)] overflow-hidden bg-black flex items-center justify-center border border-[var(--border)]">
              <img
                src={selectedPhotoModal.photoDataUrl}
                alt={selectedPhotoModal.title}
                referrerPolicy="no-referrer"
                className="w-full max-h-[70vh] object-contain"
              />
            </div>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
              {selectedPhotoModal.content}
            </p>
          </div>
        )}
      </Modal>

      {/* Compose Journal Entry Modal */}
      <Modal
        isOpen={isComposeOpen}
        onClose={() => {
          stopCamera();
          setIsComposeOpen(false);
        }}
        title="New Dream Journal Entry"
        subtitle="Capture a live camera snapshot and write a short reflection on your future life progress."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEntry} className="space-y-4">
          <Field id="journal-title" label="Entry Title" required helper="e.g. 6 AM Sanctuary Routine, Breakthrough Architecture Milestone">
            <Input
              id="journal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Breakthrough execution on high-leverage decision"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="journal-mood" label="State of Mind">
              <Select
                id="journal-mood"
                value={mood}
                onChange={(e) => setMood(e.target.value as JournalMood)}
                options={[
                  { value: 'focused', label: '🎯 Deep Focus' },
                  { value: 'triumphant', label: '🏆 Triumphant Win' },
                  { value: 'grateful', label: '🌿 Grateful & Grounded' },
                  { value: 'visionary', label: '✨ Visionary Expansion' },
                  { value: 'breakthrough', label: '⚡ Breakthrough Realization' },
                ]}
              />
            </Field>

            <Field id="journal-dream" label="Linked Vision Target (Optional)" helper="Anchor this reflection to a specific luxury milestone.">
              <Select
                id="journal-dream"
                value={linkedDreamId}
                onChange={(e) => setLinkedDreamId(e.target.value)}
                options={[
                  { value: '', label: '— General Future Life Progress —' },
                  ...allAvailableDreams.map((d) => ({
                    value: d.id,
                    label: `${d.name} (${d.category})`,
                  })),
                ]}
              />
            </Field>
          </div>

          {/* Photo & Camera Section */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[var(--fg)] block">
              Attach Live Camera Photo or Image
            </span>

            {/* Live Camera Viewfinder if Active */}
            {isCameraActive ? (
              <div className="w-full h-64 rounded-[var(--radius-md)] overflow-hidden relative bg-black border-2 border-[var(--color-sage)] shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                />
                
                {/* Camera Overlay Controls */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Live Camera Active ({cameraFacing === 'user' ? 'Front' : 'Back'})
                </div>

                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-xs text-white hover:bg-black/90 transition-colors"
                  title="Switch Camera Facing"
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
                    Cancel Camera
                  </Button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-12 h-12 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 active:scale-95 transition-all shadow-lg flex items-center justify-center cursor-pointer"
                    title="Capture Photo"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            ) : photoDataUrl ? (
              /* Photo Preview with Retake / Remove */
              <div className="w-full h-56 rounded-[var(--radius-md)] overflow-hidden relative bg-black border border-[var(--border)] group">
                <img
                  src={photoDataUrl}
                  alt="Captured Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white">
                  Photo Attached
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
                    Retake with Camera
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setPhotoDataUrl('')}
                    className="bg-black/75 text-red-400 border-0 hover:bg-black"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              /* No Photo Attached: Choose Camera or Drag & Drop Upload */
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
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    icon={Camera}
                    onClick={() => startCamera()}
                  >
                    Take Photo with Camera
                  </Button>

                  <span className="text-xs text-[var(--fg-muted)]">or</span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Upload}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload / Drop Image
                  </Button>
                </div>

                <p className="text-[11px] text-[var(--fg-subtle)] mt-2">
                  Use your device camera to capture your workspace, physical notes, or milestone moment.
                </p>

                {cameraError && (
                  <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-700 dark:text-amber-300">
                    {cameraError}
                  </div>
                )}
              </div>
            )}
          </div>

          <Field
            id="journal-content"
            label="Progress Notes & Reflections"
            required
            helper="What action did you take today? How did you overcome friction? What does this mean for your future life?"
          >
            <Textarea
              id="journal-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Reflect on the standard of work executed today, resistance conquered, or physical milestone unlocked..."
              rows={4}
            />
          </Field>

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                stopCamera();
                setIsComposeOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!title.trim() || !content.trim()}
            >
              Save Journal Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
