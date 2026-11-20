import { useState, type ReactNode } from 'react';
import { Icon, type IconKey } from './Icon';
import { cx } from './cx';

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

/* ------------------------------------------------------------------ Alert */
const alertIcon: Record<Exclude<Tone, 'neutral' | 'primary'>, IconKey> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'error',
};

export function Alert({
  tone = 'info',
  title,
  children,
  onClose,
  action,
  variant = 'soft',
}: {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  action?: ReactNode;
  variant?: 'soft' | 'outline' | 'solid';
}) {
  return (
    <div className={cx('alert', `alert--${tone}`, `alert--${variant}`)} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon name={alertIcon[tone]} size={18} className="alert__icon" />
      <div className="alert__body">
        {title && <div className="alert__title">{title}</div>}
        {children && <div className="alert__text">{children}</div>}
      </div>
      {action && <div className="alert__action">{action}</div>}
      {onClose && (
        <button className="alert__close" onClick={onClose} aria-label="Dismiss">
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Badge */
export function Badge({
  tone = 'neutral',
  variant = 'soft',
  dot,
  children,
  icon,
}: {
  tone?: Tone;
  variant?: 'soft' | 'solid' | 'outline';
  dot?: boolean;
  icon?: IconKey;
  children: ReactNode;
}) {
  return (
    <span className={cx('badge', `badge--${tone}`, `badge--${variant}`)}>
      {dot && <span className="badge__dot" />}
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------- Chip */
export function Chip({
  label,
  selected,
  onClick,
  onRemove,
  icon,
  disabled,
}: {
  label: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  icon?: IconKey;
  disabled?: boolean;
}) {
  const content = (
    <>
      {selected && onClick ? <Icon name="check" size={14} /> : icon && <Icon name={icon} size={14} />}
      <span>{label}</span>
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          className="chip__remove"
          aria-label="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === 'Backspace') && onRemove()}
        >
          <Icon name="x" size={12} />
        </span>
      )}
    </>
  );
  const className = cx('chip', selected && 'chip--selected', onClick && 'chip--clickable', disabled && 'is-disabled');
  return onClick ? (
    <button type="button" className={className} onClick={onClick} aria-pressed={!!selected} disabled={disabled}>
      {content}
    </button>
  ) : (
    <span className={className}>{content}</span>
  );
}

/* ---------------------------------------------------------------- Spinner */
export function Spinner({ size = 18, label }: { size?: number; label?: string }) {
  return (
    <span className="spinner" style={{ width: size, height: size }} role="status" aria-label={label ?? 'Loading'} />
  );
}

/* -------------------------------------------------------------- Progress */
export function ProgressBar({
  value = 0,
  max = 100,
  tone = 'primary',
  label,
  showValue,
  indeterminate,
  size = 'md',
}: {
  value?: number;
  max?: number;
  tone?: Tone;
  label?: ReactNode;
  showValue?: boolean;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="progress">
      {(label || showValue) && (
        <div className="progress__meta">
          <span>{label}</span>
          {showValue && !indeterminate && <span className="text-muted">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className={cx('progress__track', `progress__track--${size}`)}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cx('progress__bar', `tone-bg--${tone}`, indeterminate && 'progress__bar--indeterminate')}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ProgressRing({
  value,
  size = 56,
  stroke = 6,
  tone = 'primary',
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: Tone;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle className="ring__track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" />
        <circle
          className={cx('ring__value', `tone-stroke--${tone}`)}
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          strokeLinecap="round"
        />
      </svg>
      <span className="ring__label">{children ?? `${Math.round(pct)}%`}</span>
    </div>
  );
}

/* --------------------------------------------------------------- Skeleton */
export function Skeleton({
  width = '100%',
  height = 14,
  radius = 6,
  lines = 1,
  circle,
}: {
  width?: number | string;
  height?: number;
  radius?: number;
  lines?: number;
  circle?: boolean;
}) {
  return (
    <div className="skeleton-group" aria-hidden>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            width: circle ? height : i === lines - 1 && lines > 1 ? '60%' : width,
            height,
            borderRadius: circle ? '50%' : radius,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Tooltip */
export function Tooltip({
  content,
  children,
  placement = 'top',
}: {
  content: ReactNode;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="tooltip-anchor"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span role="tooltip" className={cx('tooltip', `tooltip--${placement}`)}>
          {content}
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------- EmptyState */
export function EmptyState({
  icon = 'folder',
  title,
  description,
  action,
}: {
  icon?: IconKey;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty__icon">
        <Icon name={icon} size={24} />
      </div>
      <div className="empty__title">{title}</div>
      {description && <div className="empty__text">{description}</div>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}
