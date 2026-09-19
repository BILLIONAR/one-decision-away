import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Field } from './ui';
import { Trash2, Volume2, Folder } from 'lucide-react';
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
      title={categoryToEdit ? t('Edit category') : t('New category')}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3.5 text-[13px] rounded-[var(--radius-sm)] bg-[var(--danger-soft)] text-[var(--danger)]">
            {error}
          </div>
        )}

        {/* Name & description */}
        <div className="space-y-4">
          <Field id="cat-name" label={t('Name')} helper={t('{n}/28', { n: name.length })}>
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
          </Field>

          <Field id="cat-desc" label={t('Description (optional)')}>
            <Input
              id="cat-desc"
              placeholder={t('What belongs here?')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={90}
            />
          </Field>
        </div>

        {/* Icon */}
        <div className="space-y-2">
          <span className="block text-[13px] font-medium text-[var(--fg-muted)]">{t('Icon')}</span>
          <div
            className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-44 overflow-y-auto p-2 bg-[var(--bg-muted)] rounded-[var(--radius-sm)]"
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
                  className={`aspect-square min-h-[44px] rounded-[var(--radius-xs)] flex items-center justify-center transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--fg)] text-[var(--bg)]'
                      : 'text-[var(--fg-muted)] hover:bg-[var(--bg-inset)] hover:text-[var(--fg)]'
                  }`}
                >
                  <IconComp className="w-5 h-5" strokeWidth={1.8} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Color */}
        <div className="space-y-2">
          <span className="block text-[13px] font-medium text-[var(--fg-muted)]">{t('Color')}</span>
          <div className="flex flex-wrap gap-2 p-2 bg-[var(--bg-muted)] rounded-[var(--radius-sm)]">
            {CURATED_CATEGORY_COLORS.map((palette) => {
              const isSelected = activeColorHex.toLowerCase() === palette.hex.toLowerCase();
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => handleColorSelect(palette.hex)}
                  title={t(palette.label)}
                  aria-label={t(palette.label)}
                  className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-inset)]"
                >
                  <span
                    className={`w-6 h-6 rounded-full ${isSelected ? 'ring-2 ring-offset-2 ring-[var(--fg)] ring-offset-[var(--bg-muted)]' : ''}`}
                    style={{ backgroundColor: palette.hex }}
                  />
                </button>
              );
            })}
          </div>
          <div className="relative">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
              style={{ backgroundColor: activeColorHex }}
            />
            <Input
              id="cat-hex"
              placeholder={t('Custom hex, e.g. #1F5F3F')}
              value={customHex}
              onChange={(e) => handleCustomHexChange(e.target.value)}
              className="pl-10 font-mono"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="block text-[13px] font-medium text-[var(--fg-muted)]">{t('Preview')}</span>
            <button
              type="button"
              onClick={testAudioChime}
              className="h-9 px-3 -mr-3 rounded-full flex items-center gap-1.5 text-[13px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
            >
              <Volume2 className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {t('Play sound')}
            </button>
          </div>
          <div className="min-h-[56px] px-4 py-3 rounded-[var(--radius-md)] bg-[var(--bg-muted)] flex items-center gap-3">
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
              <div className="text-[15px] font-medium text-[var(--fg)] truncate">
                {t('Sample habit')}
              </div>
              <div className="text-[13px] text-[var(--fg-muted)] truncate flex items-center gap-1.5">
                <ActiveIconComponent className="w-3.5 h-3.5 shrink-0" style={{ color: activeColorHex }} strokeWidth={1.8} />
                <span className="truncate">{name || t('Category')} · {t('5 min')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div>
            {categoryToEdit && onDelete && (
              <>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={handleDelete}
                      isLoading={isSubmitting}
                    >
                      {t('Delete')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      {t('Keep')}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-[var(--danger)] hover:text-[var(--danger)]"
                  >
                    {t('Delete')}
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              {t('Cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {categoryToEdit ? t('Save') : t('Create')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
