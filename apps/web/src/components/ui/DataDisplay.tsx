import type { ReactNode } from 'react';
import { initials } from '@erui/core';
import { Icon, type IconKey } from './Icon';
import { cx } from './cx';
import type { Tone } from './Feedback';

/* ------------------------------------------------------------------ Card */
export function Card({
  title,
  subtitle,
  actions,
  children,
  footer,
  padding = 'md',
  className,
  interactive,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  interactive?: boolean;
}) {
  return (
    <section className={cx('card', interactive && 'card--interactive', className)}>
      {(title || actions) && (
        <header className="card__header">
          <div>
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card__actions">{actions}</div>}
        </header>
      )}
      <div className={cx('card__body', `pad--${padding}`)}>{children}</div>
      {footer && <footer className="card__footer">{footer}</footer>}
    </section>
  );
}

/* ---------------------------------------------------------------- Avatar */
const AVATAR_COLORS = ['#6366f1', '#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#22c55e'];
const colorFor = (name: string) => AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

export function Avatar({
  name,
  src,
  size = 36,
  status,
}: {
  name: string;
  src?: string;
  size?: number;
  status?: 'online' | 'away' | 'offline';
}) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: src ? undefined : colorFor(name) }} title={name}>
      {src ? <img src={src} alt={name} /> : initials(name)}
      {status && <span className={cx('avatar__status', `avatar__status--${status}`)} />}
    </span>
  );
}

export function AvatarGroup({ names, max = 4, size = 32 }: { names: string[]; max?: number; size?: number }) {
  const shown = names.slice(0, max);
  return (
    <span className="avatar-group">
      {shown.map((n) => (
        <Avatar key={n} name={n} size={size} />
      ))}
      {names.length > max && (
        <span className="avatar avatar--more" style={{ width: size, height: size, fontSize: size * 0.34 }}>
          +{names.length - max}
        </span>
      )}
    </span>
  );
}

/* -------------------------------------------------------------- StatCard */
export function StatCard({
  label,
  value,
  change,
  trend,
  icon,
  hint,
}: {
  label: ReactNode;
  value: ReactNode;
  change?: string;
  trend?: 'up' | 'down';
  icon?: IconKey;
  hint?: ReactNode;
}) {
  return (
    <div className="stat card">
      <div className="stat__top">
        <span className="stat__label">{label}</span>
        {icon && (
          <span className="stat__icon">
            <Icon name={icon} size={18} />
          </span>
        )}
      </div>
      <div className="stat__value">{value}</div>
      {change && (
        <div className={cx('stat__change', trend === 'down' ? 'text-danger' : 'text-success')}>
          <Icon name={trend === 'down' ? 'trendDown' : 'trendUp'} size={14} />
          {change}
          {hint && <span className="text-muted"> {hint}</span>}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- Timeline */
export function Timeline({
  items,
}: {
  items: Array<{ id: string; title: ReactNode; description?: ReactNode; at?: ReactNode; tone?: Tone }>;
}) {
  return (
    <ol className="timeline">
      {items.map((item) => (
        <li key={item.id} className="timeline__item">
          <span className={cx('timeline__dot', `tone-bg--${item.tone ?? 'neutral'}`)} />
          <div className="timeline__content">
            <div className="timeline__row">
              <span className="timeline__title">{item.title}</span>
              {item.at && <span className="text-muted text-sm">{item.at}</span>}
            </div>
            {item.description && <div className="text-muted text-sm">{item.description}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* --------------------------------------------------------------- Divider */
export function Divider({ label }: { label?: ReactNode }) {
  return label ? (
    <div className="divider divider--label">
      <span>{label}</span>
    </div>
  ) : (
    <hr className="divider" />
  );
}

/* ------------------------------------------------------- DescriptionList */
export function DescriptionList({ items, columns = 2 }: { items: Array<{ label: ReactNode; value: ReactNode }>; columns?: 1 | 2 | 3 }) {
  return (
    <dl className={cx('dl', `dl--${columns}`)}>
      {items.map((item, i) => (
        <div key={i} className="dl__item">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}

export function CodeBlock({ code, maxHeight = 320 }: { code: string; maxHeight?: number }) {
  return (
    <pre className="code" style={{ maxHeight }}>
      <code>{code}</code>
    </pre>
  );
}

/* --------------------------------------------------------------- BarList */
export function BarList({
  items,
}: {
  items: Array<{ id: string; label: ReactNode; value: ReactNode; ratio: number; tone?: Tone }>;
}) {
  return (
    <div className="barlist">
      {items.map((i) => (
        <div key={i.id} className="barlist__row">
          <div className="barlist__meta">
            <span>{i.label}</span>
            <span className="text-muted">{i.value}</span>
          </div>
          <div className="barlist__track">
            <div className={cx('barlist__bar', `tone-bg--${i.tone ?? 'primary'}`)} style={{ width: `${Math.max(2, i.ratio * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Minimal column chart (no charting dependency). */
export function ColumnChart({ points, height = 180 }: { points: Array<{ label: string; ratio: number; formatted: string }>; height?: number }) {
  return (
    <div className="colchart" style={{ height }}>
      {points.map((p) => (
        <div key={p.label} className="colchart__col" title={p.formatted}>
          <div className="colchart__bar" style={{ height: `${Math.max(4, p.ratio * 100)}%` }}>
            <span className="colchart__tip">{p.formatted}</span>
          </div>
          <span className="colchart__label">{p.label}</span>
        </div>
      ))}
    </div>
  );
}
