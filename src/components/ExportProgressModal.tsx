import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from './ui';
import {
  Download,
  Copy,
  Check,
  Image as ImageIcon,
  X,
  Sparkles,
  Share2,
  RefreshCw,
  Award,
  Layers,
} from 'lucide-react';
import {
  captureElementToPng,
  downloadPngDataUrl,
  copyPngToClipboard,
} from '../utils/exportVisualizationImage';
import { useApp } from '../store/useApp';
import { useT } from '../i18n';

interface ExportProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetElementId?: string;
}

export const ExportProgressModal: React.FC<ExportProgressModalProps> = ({
  isOpen,
  onClose,
  targetElementId = 'daily-primary-goals-visualization-card',
}) => {
  const t = useT();
  const { showToast } = useApp();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resolution, setResolution] = useState<2 | 1>(2);
  const [bgStyle, setBgStyle] = useState<'alabaster' | 'white' | 'dark'>('alabaster');

  const bgColors = {
    alabaster: '#F5F2ED',
    white: '#FFFFFF',
    dark: '#1A1816',
  };

  const generateImage = async () => {
    const el = document.getElementById(targetElementId);
    if (!el) {
      showToast(t('Could not find visualization to export'), 'error');
      return;
    }

    setIsGenerating(true);
    try {
      // Add slight delay to ensure rendering completes
      await new Promise((r) => setTimeout(r, 100));
      const url = await captureElementToPng(el, {
        pixelRatio: resolution,
        backgroundColor: bgColors[bgStyle],
      });
      setDataUrl(url);
    } catch (err) {
      console.error('Failed to generate PNG image:', err);
      showToast(t('Failed to generate PNG image. Please try again.'), 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateImage();
    } else {
      setDataUrl(null);
      setCopied(false);
    }
  }, [isOpen, resolution, bgStyle]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!dataUrl) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `one-decision-away-progress-milestones-${dateStr}.png`;
    downloadPngDataUrl(dataUrl, filename);
    showToast(t('✓ Progress visualization downloaded as PNG!'), 'success');
  };

  const handleCopy = async () => {
    if (!dataUrl) return;
    const success = await copyPngToClipboard(dataUrl);
    if (success) {
      setCopied(true);
      showToast(t('✓ Image copied to clipboard! Ready to paste into Slack, Twitter, or Discord.'), 'success');
      setTimeout(() => setCopied(false), 2500);
    } else {
      showToast(t('Clipboard image copying is not supported in this browser. Please use Download.'), 'warning');
    }
  };

  return (
    <div
      id="export-progress-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <Card
        id="export-progress-modal-container"
        padding="none"
        className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-[var(--bg-elevated)] border border-[var(--border)] shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-muted)]/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[var(--primary)]/15 text-[var(--primary)]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-display text-[var(--fg)]">
                  {t('Export Progress Visualization (PNG)')}
                </h3>
                <Badge variant="sage" className="text-[10px] uppercase">
                  {t('PNG • High Resolution')}
                </Badge>
              </div>
              <p className="text-xs text-[var(--fg-muted)]">
                {t('Share your 30-day consistency trajectory, accomplishment trend, and goal streaks')}
              </p>
            </div>
          </div>
          <button
            id="close-export-progress-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] rounded-md transition-colors cursor-pointer"
            aria-label={t('Close dialog')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Export Customization Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[var(--bg-muted)] rounded-[var(--radius-sm)] border border-[var(--border)] text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--fg-muted)]">{t('Image Background:')}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setBgStyle('alabaster')}
                  className={`px-2.5 py-1 rounded-[var(--radius-xs)] border transition-all cursor-pointer ${
                    bgStyle === 'alabaster'
                      ? 'bg-[#F5F2ED] text-[#2A2421] font-bold border-[var(--primary)] shadow-xs'
                      : 'bg-[var(--bg-elevated)] text-[var(--fg-muted)] border-[var(--border)]'
                  }`}
                >
                  {t('Warm Alabaster')}
                </button>
                <button
                  type="button"
                  onClick={() => setBgStyle('white')}
                  className={`px-2.5 py-1 rounded-[var(--radius-xs)] border transition-all cursor-pointer ${
                    bgStyle === 'white'
                      ? 'bg-white text-neutral-900 font-bold border-[var(--primary)] shadow-xs'
                      : 'bg-[var(--bg-elevated)] text-[var(--fg-muted)] border-[var(--border)]'
                  }`}
                >
                  {t('Clean White')}
                </button>
                <button
                  type="button"
                  onClick={() => setBgStyle('dark')}
                  className={`px-2.5 py-1 rounded-[var(--radius-xs)] border transition-all cursor-pointer ${
                    bgStyle === 'dark'
                      ? 'bg-neutral-900 text-neutral-100 font-bold border-neutral-600 shadow-xs'
                      : 'bg-[var(--bg-elevated)] text-[var(--fg-muted)] border-[var(--border)]'
                  }`}
                >
                  {t('Dark Obsidian')}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--fg-muted)]">{t('Sharpness:')}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setResolution(2)}
                  className={`px-2.5 py-1 rounded-[var(--radius-xs)] border transition-all cursor-pointer ${
                    resolution === 2
                      ? 'bg-[var(--bg-elevated)] text-[var(--fg)] font-bold border-[var(--border-strong)] shadow-xs'
                      : 'text-[var(--fg-muted)] border-transparent'
                  }`}
                >
                  {t('2x Retina (Sharper)')}
                </button>
                <button
                  type="button"
                  onClick={() => setResolution(1)}
                  className={`px-2.5 py-1 rounded-[var(--radius-xs)] border transition-all cursor-pointer ${
                    resolution === 1
                      ? 'bg-[var(--bg-elevated)] text-[var(--fg)] font-bold border-[var(--border-strong)] shadow-xs'
                      : 'text-[var(--fg-muted)] border-transparent'
                  }`}
                >
                  {t('1x Standard')}
                </button>
              </div>
              <button
                type="button"
                onClick={generateImage}
                disabled={isGenerating}
                className="p-1.5 text-[var(--fg-muted)] hover:text-[var(--fg)] rounded transition-colors ml-1 cursor-pointer disabled:opacity-40"
                title={t('Regenerate preview')}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Live Preview Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] px-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                {t('Image Preview (Ready for export)')}
              </span>
              <span>{resolution === 2 ? t('High-DPI 2x scale') : t('1x scale')}</span>
            </div>

            <div className="relative rounded-[var(--radius-md)] border border-[var(--border)] overflow-hidden bg-neutral-900/10 min-h-[220px] max-h-[50vh] flex items-center justify-center p-2">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-2 text-center p-6">
                  <div className="w-7 h-7 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-medium text-[var(--fg)]">
                    {t('Capturing chart layers and milestone icons...')}
                  </p>
                  <p className="text-[10px] text-[var(--fg-muted)]">
                    {t('Embedding SVG paths, 15-day comparison, and typography')}
                  </p>
                </div>
              ) : dataUrl ? (
                <div className="w-full h-full overflow-auto flex justify-center">
                  <img
                    src={dataUrl}
                    alt={t('One Decision Away Progress Visualization')}
                    className="max-h-[46vh] w-auto object-contain rounded border border-black/10 shadow-md"
                  />
                </div>
              ) : (
                <div className="text-center p-6 text-xs text-[var(--fg-muted)]">
                  {t('No preview generated yet.')}
                </div>
              )}
            </div>
          </div>

          {/* Social / Sharing Tips */}
          <div className="p-3 bg-[var(--bg-muted)]/50 rounded-[var(--radius-sm)] border border-[var(--border)] flex items-start gap-2.5 text-xs text-[var(--fg-muted)]">
            <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-[var(--fg)]">
                {t('Perfect for celebrating your milestones & streaks')}
              </span>
              <p className="text-[11px] text-[var(--fg-subtle)] leading-relaxed">
                {t('Click')} <strong>{t('Download PNG')}</strong> {t('to save the image to your device, or use')} <strong>{t('Copy Image')}</strong> {t('to paste directly into your favorite messaging apps, Twitter/X, or journaling tools.')}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--border)] bg-[var(--bg-muted)]/30 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            {t('Cancel')}
          </Button>

          <div className="flex items-center gap-2.5">
            <Button
              id="copy-visualization-png-btn"
              variant="secondary"
              size="sm"
              icon={copied ? Check : Copy}
              onClick={handleCopy}
              disabled={isGenerating || !dataUrl}
              className="text-xs"
            >
              {copied ? t('Copied to Clipboard!') : t('Copy Image')}
            </Button>

            <Button
              id="download-visualization-png-btn"
              variant="primary"
              size="sm"
              icon={Download}
              onClick={handleDownload}
              disabled={isGenerating || !dataUrl}
              className="text-xs"
            >
              {t('Download PNG Image')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
