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
    'inline-flex items-center justify-center font-semibold font-sans rounded-[var(--radius-sm)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-strong)] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer select-none';

  const sizeClasses = {
    sm: 'h-11 px-4 text-[14px] gap-2',
    md: 'h-11 px-5 text-[15px] gap-2',
    lg: 'h-12 px-6 text-[15px] gap-2',
  };

  const variantClasses = {
    primary: 'bg-[var(--fg)] text-[var(--bg)] hover:opacity-90 active:opacity-80',
    secondary:
      'border border-[var(--border-strong)] bg-transparent text-[var(--fg)] hover:bg-[var(--bg-muted)]',
    accent: 'bg-[var(--accent)] text-white hover:opacity-90 active:opacity-80',
    outline:
      'border border-[var(--border-strong)] bg-transparent text-[var(--fg)] hover:bg-[var(--bg-muted)]',
    ghost: 'bg-transparent text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)]',
    danger: 'bg-[var(--danger)] text-white hover:opacity-90 active:opacity-80',
  };

  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {!isLoading && Icon && iconPosition === 'left' && <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />}
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
    elevated: 'bg-[var(--bg-muted)]',
    flat: 'bg-[var(--bg-muted)]',
    subtle: 'bg-[var(--bg-muted)]',
    bordered: 'bg-[var(--bg)] border border-[var(--border)]',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={`rounded-[var(--radius-md)] ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
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
      <label htmlFor={id} className="block text-[13px] font-medium text-[var(--fg-muted)]">
        {label} {required && <span className="text-[var(--danger)]">*</span>}
      </label>
      {children}
      {helper && !error && <p className="text-[12px] text-[var(--fg-subtle)] leading-relaxed">{helper}</p>}
      {error && <p className="text-[12px] text-[var(--danger)]">{error}</p>}
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
      className={`w-full h-11 px-3.5 bg-[var(--bg-muted)] text-[var(--fg)] border ${
        hasError ? 'border-[var(--danger)]' : 'border-transparent'
      } rounded-[var(--radius-sm)] text-[15px] transition-colors focus:outline-none focus:border-[var(--border-strong)] placeholder:text-[var(--fg-subtle)] ${className}`}
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
      className={`w-full p-3.5 bg-[var(--bg-muted)] text-[var(--fg)] border ${
        hasError ? 'border-[var(--danger)]' : 'border-transparent'
      } rounded-[var(--radius-sm)] text-[15px] transition-colors focus:outline-none focus:border-[var(--border-strong)] placeholder:text-[var(--fg-subtle)] resize-y min-h-[100px] leading-relaxed ${className}`}
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
      className={`w-full h-11 px-3.5 bg-[var(--bg-muted)] text-[var(--fg)] border border-transparent rounded-[var(--radius-sm)] text-[15px] transition-colors focus:outline-none focus:border-[var(--border-strong)] ${className}`}
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
    sage: 'bg-[var(--accent-soft)] text-[var(--accent)]',
    coral: 'bg-[var(--accent-soft)] text-[var(--accent)]',
    slate: 'bg-[var(--fg)] text-[var(--bg)]',
    subtle: 'bg-[var(--bg-inset)] text-[var(--fg-muted)]',
    outline: 'bg-[var(--bg-inset)] text-[var(--fg)]',
    danger: 'bg-[var(--danger-soft)] text-[var(--danger)]',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium whitespace-nowrap ${variantStyles[variant]} ${className}`}
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
    sage: 'bg-[var(--accent)]',
    coral: 'bg-[var(--accent)]',
    slate: 'bg-[var(--fg)]',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-[12px] text-[var(--fg-muted)] mb-1.5">
          <span>{t('Progress')}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="h-1.5 w-full bg-[var(--bg-inset)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${colors[variant]}`}
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
    <div className={`p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)] ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[13px] text-[var(--fg-muted)] truncate">{label}</span>
        {Icon && <Icon className="w-[18px] h-[18px] text-[var(--fg-subtle)] shrink-0" strokeWidth={1.8} />}
        {badge && <Badge variant="sage">{badge}</Badge>}
      </div>
      <div className="text-[22px] font-semibold text-[var(--fg)] tracking-tight">{value}</div>
      {subtext && <p className="text-[12px] text-[var(--fg-subtle)] mt-1">{subtext}</p>}
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
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-black/40 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-[var(--bg-elevated)] rounded-t-2xl sm:rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <h3 className="text-[20px] font-semibold tracking-tight text-[var(--fg)] leading-tight">{title}</h3>
            {subtitle && <p className="text-[14px] text-[var(--fg-muted)] mt-1 leading-relaxed">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 -mr-2 -mt-1 rounded-full flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer shrink-0"
            aria-label={t('Close')}
          >
            <X className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>
        <div className="px-5 pb-6 sm:px-6 overflow-y-auto">{children}</div>
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
            className={`h-9 px-3.5 text-[13px] font-medium rounded-full transition-colors cursor-pointer ${
              isSelected
                ? 'bg-[var(--fg)] text-[var(--bg)]'
                : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:bg-[var(--bg-inset)]'
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
  return (
    <div className={`flex flex-col items-center justify-center py-10 px-4 text-center ${className}`}>
      {Icon && <Icon className="w-6 h-6 text-[var(--fg-subtle)] mb-3" strokeWidth={1.8} />}
      <h4 className="text-[15px] font-semibold text-[var(--fg)] mb-1">{title}</h4>
      <p className="text-[14px] text-[var(--fg-muted)] max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-5">
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
  return <p className={`text-[12px] text-[var(--fg-muted)] leading-relaxed ${className}`}>{body}</p>;
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
  className = '',
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-semibold tracking-tight text-[var(--fg)]">{title}</h1>
          {subtitle && <p className="text-[15px] text-[var(--fg-muted)] mt-1 leading-relaxed">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
      </div>
    </div>
  );
};
