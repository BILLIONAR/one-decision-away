import React from 'react';
import { LucideIcon, X } from 'lucide-react';
import { useT } from '../i18n';

/* -------------------------------- Button -------------------------------- */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-[var(--fg)] focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer select-none';

  const sizeClasses = {
    sm: 'h-8 px-3 text-[11px] uppercase tracking-wider font-semibold rounded-[var(--radius-xs)] gap-1.5',
    md: 'h-10 px-4 text-xs uppercase tracking-wider font-semibold rounded-[var(--radius-sm)] gap-2',
    lg: 'h-12 px-6 text-xs uppercase tracking-widest font-bold rounded-[var(--radius-sm)] gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[var(--fg)] text-[var(--bg)] border border-[var(--fg)] hover:bg-transparent hover:text-[var(--fg)] active:opacity-80',
    secondary:
      'bg-[var(--bg-muted)] text-[var(--fg)] hover:bg-[var(--bg-inset)] border border-[var(--border-strong)]',
    accent:
      'bg-[var(--color-coral)] text-white border border-[var(--color-coral)] hover:bg-transparent hover:text-[var(--color-coral)] active:opacity-80',
    outline:
      'border border-[var(--fg)] bg-transparent text-[var(--fg)] hover:bg-[var(--fg)] hover:text-[var(--bg)]',
    ghost:
      'bg-transparent text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)]',
    danger:
      'bg-[var(--danger)] text-white border border-[var(--danger)] hover:bg-transparent hover:text-[var(--danger)]',
  };

  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="inline-block w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin mr-1.5" />
      )}
      {!isLoading && Icon && iconPosition === 'left' && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
};

/* -------------------------------- Card -------------------------------- */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'flat' | 'subtle' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  className = '',
  ...props
}) => {
  const variantStyles = {
    elevated: 'bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-sm)]',
    flat: 'bg-[var(--bg-muted)] border border-[var(--border)]',
    subtle: 'bg-[var(--bg)] border border-[var(--border)]',
    bordered: 'bg-transparent border border-[var(--border-strong)]',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`rounded-[var(--radius-md)] transition-all ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/* -------------------------------- Field & Inputs -------------------------------- */
export interface FieldProps {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({
  id,
  label,
  helper,
  error,
  required,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--fg-muted)]">
        {label} {required && <span className="text-[var(--danger)]">*</span>}
      </label>
      {children}
      {helper && !error && <p className="text-xs text-[var(--fg-subtle)] leading-relaxed">{helper}</p>}
      {error && <p className="text-xs text-[var(--danger)] font-medium">{error}</p>}
    </div>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input: React.FC<InputProps> = ({ className = '', hasError, id, ...props }) => {
  return (
    <input
      id={id}
      className={`w-full h-10 px-3 bg-[var(--bg-elevated)] text-[var(--fg)] border ${
        hasError ? 'border-[var(--danger)]' : 'border-[var(--border)]'
      } rounded-[var(--radius-sm)] text-sm transition-colors focus:outline-none focus:border-[var(--fg)] placeholder:text-[var(--fg-subtle)] ${className}`}
      {...props}
    />
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ className = '', hasError, id, ...props }) => {
  return (
    <textarea
      id={id}
      className={`w-full p-3 bg-[var(--bg-elevated)] text-[var(--fg)] border ${
        hasError ? 'border-[var(--danger)]' : 'border-[var(--border)]'
      } rounded-[var(--radius-sm)] text-sm transition-colors focus:outline-none focus:border-[var(--fg)] placeholder:text-[var(--fg-subtle)] resize-y min-h-[100px] leading-relaxed ${className}`}
      {...props}
    />
  );
};

export const TextArea = Textarea;
export type TextAreaProps = TextareaProps;

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ options, className = '', id, ...props }) => {
  return (
    <select
      id={id}
      className={`w-full h-10 px-3 bg-[var(--bg-elevated)] text-[var(--fg)] border border-[var(--border)] rounded-[var(--radius-sm)] text-sm transition-colors focus:outline-none focus:border-[var(--fg)] ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

/* -------------------------------- Badge -------------------------------- */
export interface BadgeProps {
  variant?: 'sage' | 'coral' | 'slate' | 'subtle' | 'outline' | 'danger';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'subtle',
  children,
  className = '',
}) => {
  const variantStyles = {
    sage: 'bg-[var(--success-soft)] text-[var(--color-sage)] border border-[var(--color-sage)]/30',
    coral: 'bg-[var(--accent-soft)] text-[var(--color-coral)] border border-[var(--color-coral)]/30',
    slate: 'bg-[var(--fg)] text-[var(--bg)] border border-[var(--fg)]',
    subtle: 'bg-[var(--bg-muted)] text-[var(--fg-muted)] border border-[var(--border)]',
    outline: 'border border-[var(--border-strong)] text-[var(--fg)] bg-transparent',
    danger: 'bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-xs)] text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

/* -------------------------------- Progress -------------------------------- */
export interface ProgressProps {
  value: number; // 0 to 100
  variant?: 'sage' | 'coral' | 'slate';
  className?: string;
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  variant = 'sage',
  className = '',
  showLabel = false,
}) => {
  const t = useT();
  const clamped = Math.min(100, Math.max(0, value));

  const colors = {
    sage: 'bg-[var(--color-sage)]',
    coral: 'bg-[var(--color-coral)]',
    slate: 'bg-[var(--fg)]',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-[var(--fg-muted)] font-semibold mb-1.5">
          <span>{t('Progress')}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="h-1.5 w-full bg-[var(--bg-muted)] rounded-none overflow-hidden border border-[var(--border)]">
        <div
          className={`h-full transition-all duration-300 ease-out ${colors[variant]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

/* -------------------------------- Stat Block -------------------------------- */
export interface StatProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  badge?: string;
  className?: string;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  badge,
  className = '',
}) => {
  return (
    <div className={`p-4 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border)] relative ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--fg-muted)] truncate">
          {label}
        </span>
        {Icon && <Icon className="w-3.5 h-3.5 text-[var(--fg-subtle)] shrink-0" />}
        {badge && <Badge variant="sage">{badge}</Badge>}
      </div>
      <div className="text-2xl font-bold font-display text-[var(--fg)] tracking-tight">
        {value}
      </div>
      {subtext && <p className="text-xs text-[var(--fg-subtle)] mt-1 font-sans">{subtext}</p>}
    </div>
  );
};

/* -------------------------------- Modal -------------------------------- */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  const t = useT();
  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] overflow-hidden my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-[var(--border)]">
          <div>
            <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-[var(--fg-subtle)] block mb-1">
              {t('Dialogue Window')}
            </span>
            <h3 className="text-xl font-bold font-display text-[var(--fg)] leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[var(--fg-muted)] mt-1 leading-relaxed">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-[var(--border-strong)] flex items-center justify-center text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:border-[var(--fg)] transition-colors cursor-pointer"
            aria-label={t('Close dialog')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

/* -------------------------------- Chip Group -------------------------------- */
export interface ChipGroupProps {
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
  className?: string;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
  items,
  selected,
  onSelect,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => {
        const isSelected = selected === item;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-[var(--radius-xs)] transition-all cursor-pointer ${
              isSelected
                ? 'bg-[var(--fg)] text-[var(--bg)] border border-[var(--fg)]'
                : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:bg-[var(--bg-inset)] border border-[var(--border)]'
            }`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
};

/* -------------------------------- Empty State -------------------------------- */
export interface EmptyProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const Empty: React.FC<EmptyProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  const t = useT();
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-muted)] border border-[var(--border)] rounded-[var(--radius-sm)] relative ${className}`}
    >
      <div className="text-[9px] font-sans uppercase tracking-[0.3em] opacity-50 mb-3">
        {t('Fig. 00 — State')}
      </div>
      {Icon && (
        <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--fg-muted)] mb-3">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h4 className="text-base font-bold font-display text-[var(--fg)] mb-1.5">{title}</h4>
      <p className="text-xs text-[var(--fg-muted)] max-w-sm mb-5 leading-relaxed font-sans">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

/* -------------------------------- Skeleton -------------------------------- */
export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`bg-[var(--bg-muted)] animate-pulse rounded-[var(--radius-xs)] ${className}`}
    />
  );
};

/* -------------------------------- Disclaimer -------------------------------- */
export const Disclaimer: React.FC<{ text?: string; className?: string }> = ({
  text,
  className = '',
}) => {
  const t = useT();
  const body = text ?? t('Dream Dollars is a virtual simulation economy with no cash value. Purchases and allocations are symbolic.');
  return (
    <div
      className={`p-3.5 bg-[var(--bg-muted)] border border-[var(--border)] rounded-[var(--radius-xs)] text-xs text-[var(--fg-muted)] leading-relaxed flex items-start gap-2.5 ${className}`}
    >
      <span className="font-bold text-[10px] uppercase tracking-wider text-[var(--fg)] shrink-0 mt-0.5">{t('Note:')}</span>
      <span>{body}</span>
    </div>
  );
};

/* -------------------------------- Page Header -------------------------------- */
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: string;
  issueNumber?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  badge,
  issueNumber,
  className = '',
}) => {
  const t = useT();
  return (
    <div className={`mb-8 pb-4 border-b border-[var(--border)] ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.3em] text-[var(--fg-subtle)]">
              {issueNumber || t('One Decision Away — OS')}
            </span>
            {badge && <Badge variant="sage">{badge}</Badge>}
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold font-display text-[var(--fg)] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[var(--fg-muted)] mt-2 max-w-2xl font-sans leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
      </div>
      <div className="w-12 h-[1px] bg-[var(--fg)] mt-4 opacity-70" />
    </div>
  );
};
