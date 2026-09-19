import React, { useState, useEffect } from 'react';
import { Modal, Button } from './ui';
import { Download, Copy, Check, RefreshCw } from 'lucide-react';
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
    alabaster: '#F3F3F1',
    white: '#FFFFFF',
    dark: '#111111',
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
    showToast(t('Image downloaded.'), 'success');
  };

  const handleCopy = async () => {
    if (!dataUrl) return;
    const success = await copyPngToClipboard(dataUrl);
    if (success) {
      setCopied(true);
      showToast(t('Image copied.'), 'success');
      setTimeout(() => setCopied(false), 2500);
    } else {
      showToast(t('Copying images is not supported here. Use Download instead.'), 'info');
    }
  };

  const bgOptions: { id: 'alabaster' | 'white' | 'dark'; label: string }[] = [
    { id: 'alabaster', label: t('Paper') },
    { id: 'white', label: t('White') },
    { id: 'dark', label: t('Dark') },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('Export image')}
      subtitle={t('Save or copy your progress as a PNG.')}
      maxWidth="lg"
    >
      <div id="export-progress-modal-container" className="space-y-6">
        {/* Options */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="block text-[13px] font-medium text-[var(--fg-muted)]">{t('Background')}</span>
            <div className="flex gap-1 p-1 bg-[var(--bg-muted)] rounded-[var(--radius-sm)]">
              {bgOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBgStyle(opt.id)}
                  className={`h-9 px-3.5 rounded-[var(--radius-xs)] text-[13px] font-medium transition-colors cursor-pointer ${
                    bgStyle === opt.id
                      ? 'bg-[var(--bg)] text-[var(--fg)] shadow-[var(--shadow-md)]'
                      : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-[13px] font-medium text-[var(--fg-muted)]">{t('Scale')}</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 p-1 bg-[var(--bg-muted)] rounded-[var(--radius-sm)]">
                {([2, 1] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setResolution(r)}
                    className={`h-9 px-3.5 rounded-[var(--radius-xs)] text-[13px] font-medium transition-colors cursor-pointer ${
                      resolution === r
                        ? 'bg-[var(--bg)] text-[var(--fg)] shadow-[var(--shadow-md)]'
                        : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                    }`}
                  >
                    {r}x
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={generateImage}
                disabled={isGenerating}
                className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer disabled:opacity-40"
                title={t('Regenerate preview')}
                aria-label={t('Regenerate preview')}
              >
                <RefreshCw className={`w-[18px] h-[18px] ${isGenerating ? 'animate-spin' : ''}`} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] min-h-[220px] max-h-[50vh] flex items-center justify-center p-3 overflow-hidden">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3 text-center p-6">
              <div className="w-6 h-6 border-2 border-[var(--fg)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[13px] text-[var(--fg-muted)]">{t('Rendering…')}</p>
            </div>
          ) : dataUrl ? (
            <div className="w-full h-full overflow-auto flex justify-center">
              <img
                src={dataUrl}
                alt={t('Progress image')}
                className="max-h-[46vh] w-auto object-contain rounded-[var(--radius-sm)]"
              />
            </div>
          ) : (
            <p className="text-[13px] text-[var(--fg-muted)] p-6">{t('No preview yet.')}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button
            id="copy-visualization-png-btn"
            variant="secondary"
            icon={copied ? Check : Copy}
            onClick={handleCopy}
            disabled={isGenerating || !dataUrl}
          >
            {copied ? t('Copied') : t('Copy')}
          </Button>
          <Button
            id="download-visualization-png-btn"
            variant="primary"
            icon={Download}
            onClick={handleDownload}
            disabled={isGenerating || !dataUrl}
          >
            {t('Download PNG')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
