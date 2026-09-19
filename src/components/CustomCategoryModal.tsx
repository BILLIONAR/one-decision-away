import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Field } from './ui';
import {
  Sparkles,
  Check,
  Trash2,
  Volume2,
  HelpCircle,
  Folder,
  Tag,
} from 'lucide-react';
import { CustomHabitCategory } from '../types/models';
import {
  CURATED_CATEGORY_COLORS,
  CURATED_CATEGORY_ICONS,
  ICON_MAP,
} from '../utils/categoryHelpers';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { MicroHabitCheckbox } from './MicroHabitCheckbox';
import { useT } from '../i18n';

export interface CustomCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: CustomHabitCategory | null;
  onSave: (params: {
    id?: string;
    name: string;
    icon: string;
    color: string;
    description?: string;
  }) => Promise<void>;
  onDelete?: (categoryId: string) => Promise<void>;
}

export const CustomCategoryModal: React.FC<CustomCategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  onSave,
  onDelete,
}) => {
  const t = useT();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Zap');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [customHex, setCustomHex] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewChecked, setPreviewChecked] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSelectedIcon(categoryToEdit.icon || 'Zap');
      setSelectedColor(categoryToEdit.color || '#6366f1');
      setCustomHex(categoryToEdit.color || '');
      setDescription(categoryToEdit.description || '');
    } else {
      setName('');
      setSelectedIcon('Zap');
      setSelectedColor('#6366f1');
      setCustomHex('');
      setDescription('');
    }
    setError(null);
    setShowDeleteConfirm(false);
    setPreviewChecked(false);
  }, [categoryToEdit, isOpen]);

  const activeColorHex = customHex.startsWith('#') && customHex.length >= 4 ? customHex : selectedColor;
  const ActiveIconComponent = ICON_MAP[selectedIcon] || Folder;

  const handleColorSelect = (hex: string) => {
    setSelectedColor(hex);
    setCustomHex(hex);
    setError(null);
  };

  const handleCustomHexChange = (val: string) => {
    let formatted = val.trim();
    if (formatted && !formatted.startsWith('#')) {
      formatted = `#${formatted}`;
    }
    setCustomHex(formatted);
    if (/^#[0-9A-Fa-f]{6}$/.test(formatted) || /^#[0-9A-Fa-f]{3}$/.test(formatted)) {
      setSelectedColor(formatted);
      setError(null);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError(t('Please enter a category name.'));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        id: categoryToEdit?.id,
        name: cleanName,
        icon: selectedIcon,
        color: activeColorHex,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || t('Failed to save custom category.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToEdit || !onDelete) return;
    setIsSubmitting(true);
    try {
      await onDelete(categoryToEdit.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || t('Failed to delete category.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const testAudioChime = () => {
    soundSynthesizer.playCustomCategoryCue(name || 'Custom', activeColorHex);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? t('Edit Custom Category') : t('Create Custom Habit Category')}
      subtitle={t('Define a personalized identity domain with custom icons, color accents, and sound cues.')}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 text-xs rounded bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)]">
            {error}
          </div>
        )}

        {/* Category Name & Description */}
        <div className="space-y-3">
          <Field
            id="cat-name"
            label={t('Category Name')}
            helper={t('Short and evocative (e.g. Deep Focus, Morning Power, Writing, Vitality).')}
          >
            <div className="relative">
              <Input
                id="cat-name"
                placeholder={t('e.g. Deep Focus')}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                maxLength={28}
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-[var(--fg-muted)]">
                <Tag className="w-3.5 h-3.5" />
                <span>{name.length}/28</span>
              </div>
            </div>
          </Field>

          <Field
            id="cat-desc"
            label={t('Optional Focus Intent / Trigger Description')}
            helper={t('Brief context on what belongs here.')}
          >
            <Input
              id="cat-desc"
              placeholder={t('e.g. 5-minute deep focus sprints, cognitive rituals & zero distraction')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={90}
            />
          </Field>
        </div>

        {/* Icon Selection Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
              {t('Choose Unique Icon Identifier')}
            </label>
            <span className="text-[11px] text-[var(--fg-muted)]">
              {t('Selected:')} <strong className="text-[var(--fg)]">{selectedIcon}</strong>
            </span>
          </div>

          <div
            className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-[var(--bg-muted)]/40 rounded-[var(--radius-sm)] border border-[var(--border)]"
            role="radiogroup"
            aria-label={t('Select category icon')}
          >
            {CURATED_CATEGORY_ICONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = selectedIcon === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  title={t(item.label)}
                  onClick={() => setSelectedIcon(item.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-[var(--radius-xs)] border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--bg-elevated)] border-[var(--fg)] text-[var(--fg)] shadow-xs ring-1 ring-[var(--fg)]'
                      : 'bg-[var(--bg)] border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--border-strong)] hover:text-[var(--fg)]'
                  }`}
                >
                  <IconComp className="w-4 h-4 mb-1" />
                  <span className="text-[9px] font-medium truncate max-w-full text-center">
                    {item.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Swatch & Custom Hex Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
              {t('Choose Unique Color Palette')}
            </label>
            <div className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/20"
                style={{ backgroundColor: activeColorHex }}
              />
              <span className="text-xs font-mono font-medium text-[var(--fg)]">
                {activeColorHex}
              </span>
            </div>
          </div>

          {/* Palette Swatches */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {CURATED_CATEGORY_COLORS.map((palette) => {
              const isSelected = activeColorHex.toLowerCase() === palette.hex.toLowerCase();

              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => handleColorSelect(palette.hex)}
                  title={t(palette.label)}
                  className={`flex items-center gap-2 p-1.5 rounded-[var(--radius-xs)] border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--bg-elevated)] border-[var(--fg)] ring-1 ring-[var(--fg)] font-semibold shadow-xs'
                      : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-xs border border-black/15"
                    style={{ backgroundColor: palette.hex }}
                  />
                  <span className="text-[10px] font-medium text-[var(--fg)] truncate">
                    {t(palette.label)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Hex Code Field */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1">
              <Input
                id="cat-hex"
                placeholder={t('#6366f1 or custom hex')}
                value={customHex}
                onChange={(e) => handleCustomHexChange(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <span className="text-[11px] text-[var(--fg-muted)]">
              {t('Paste any valid brand or custom hex code')}
            </span>
          </div>
        </div>

        {/* Live Interactive Preview */}
        <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg-muted)]/50 border border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-coral)]" />
              <span>{t('Live Interactive Preview')}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={Volume2}
              onClick={testAudioChime}
              className="text-xs h-7 px-2.5"
            >
              {t('Test Sound & Haptics')}
            </Button>
          </div>

          {/* Habit Item Mockup with Particle Checkbox */}
          <div
            className="p-3 rounded-[var(--radius-xs)] bg-[var(--bg-elevated)] border transition-all flex items-center justify-between gap-3 shadow-xs"
            style={{
              borderLeftWidth: '4px',
              borderLeftColor: activeColorHex,
            }}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Checkbox with custom particle burst and halo */}
              <MicroHabitCheckbox
                checked={previewChecked}
                onToggle={() => {
                  const next = !previewChecked;
                  setPreviewChecked(next);
                  soundSynthesizer.playMicroHabitCue(
                    name || 'Custom',
                    next ? 'complete' : 'undo',
                    activeColorHex
                  );
                }}
                color={activeColorHex}
                ariaLabel={t('Toggle preview habit')}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide border shadow-xs"
                    style={{
                      backgroundColor: `${activeColorHex}15`,
                      borderColor: `${activeColorHex}40`,
                      color: activeColorHex,
                    }}
                  >
                    <ActiveIconComponent className="w-3 h-3" />
                    <span>{name || t('Category Name')}</span>
                  </span>
                  <span className="text-[11px] text-[var(--fg-muted)]">{t('5 mins')}</span>
                </div>
                <div className="text-xs font-medium text-[var(--fg)] truncate">
                  {t('Sample habit in this custom category')}
                </div>
                <div className="text-[11px] text-[var(--fg-muted)] truncate">
                  {description || t('Interactive particle burst & acoustic chime in your custom color.')}
                </div>
              </div>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)] px-2 py-0.5 bg-[var(--bg-muted)] rounded border border-[var(--border)] shrink-0">
              {previewChecked ? t('Completed') : t('Click to Test')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <div>
            {categoryToEdit && onDelete && (
              <>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--danger)] font-medium">{t('Confirm delete?')}</span>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={handleDelete}
                      isLoading={isSubmitting}
                    >
                      {t('Yes, Delete')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      {t('Cancel')}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-[var(--danger)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
                  >
                    {t('Delete Category')}
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('Cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Check}
              isLoading={isSubmitting}
            >
              {categoryToEdit ? t('Save Changes') : t('Create Category')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
