import { useRef, useState, type ReactNode } from 'react';
import { useAccordion, useTabs, type PageItem } from '@erui/core';
import { Icon, type IconKey } from './Icon';
import { cx, useDismiss } from './cx';

/* -------------------------------------------------------------------- Tabs */
export interface TabDef {
  id: string;
  label: ReactNode;
  icon?: IconKey;
  badge?: ReactNode;
  disabled?: boolean;
}

export function Tabs({
  items,
  value,
  onChange,
  variant = 'line',
  fullWidth,
}: {
  items: TabDef[];
  value: string;
  onChange: (id: string) => void;
  variant?: 'line' | 'pill' | 'enclosed';
  fullWidth?: boolean;
}) {
  const tabs = useTabs({ items, value, onChange });
  return (
    <div
      role="tablist"
      className={cx('tabs', `tabs--${variant}`, fullWidth && 'tabs--block')}
      onKeyDown={(e) => tabs.handleKey(e.key) && e.preventDefault()}
    >
      {items.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={tabs.isSelected(t.id)}
          tabIndex={tabs.isSelected(t.id) ? 0 : -1}
          disabled={t.disabled}
          className={cx('tabs__tab', tabs.isSelected(t.id) && 'is-active')}
          onClick={() => tabs.select(t.id)}
        >
          {t.icon && <Icon name={t.icon} size={16} />}
          <span>{t.label}</span>
          {t.badge !== undefined && <span className="tabs__badge">{t.badge}</span>}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- Breadcrumbs */
export function Breadcrumbs({ items }: { items: Array<{ label: ReactNode; onClick?: () => void }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumbs">
        {items.map((item, i) => (
          <li key={i}>
            {i < items.length - 1 ? (
              <>
                <button type="button" className="breadcrumbs__link" onClick={item.onClick}>
                  {item.label}
                </button>
                <Icon name="chevronRight" size={14} className="breadcrumbs__sep" />
              </>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* -------------------------------------------------------------- Pagination */
export interface PaginationModel {
  page: number;
  pageCount: number;
  items: PageItem[];
  setPage(p: number): void;
  next(): void;
  prev(): void;
  canNext: boolean;
  canPrev: boolean;
}

export function Pagination({ model, compact }: { model: PaginationModel; compact?: boolean }) {
  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="pagination__btn" onClick={model.prev} disabled={!model.canPrev} aria-label="Previous page">
        <Icon name="chevronLeft" size={16} />
      </button>
      {compact ? (
        <span className="pagination__compact">
          {model.page} / {model.pageCount}
        </span>
      ) : (
        model.items.map((item, i) =>
          typeof item === 'number' ? (
            <button
              key={i}
              type="button"
              className={cx('pagination__btn', item === model.page && 'is-active')}
              aria-current={item === model.page ? 'page' : undefined}
              onClick={() => model.setPage(item)}
            >
              {item}
            </button>
          ) : (
            <span key={i} className="pagination__ellipsis">
              …
            </span>
          ),
        )
      )}
      <button type="button" className="pagination__btn" onClick={model.next} disabled={!model.canNext} aria-label="Next page">
        <Icon name="chevronRight" size={16} />
      </button>
    </nav>
  );
}

/* ----------------------------------------------------------------- Stepper */
export function Stepper({
  steps,
  statusOf,
  onStepClick,
  orientation = 'horizontal',
}: {
  steps: Array<{ id: string; label: ReactNode; description?: ReactNode }>;
  statusOf: (index: number) => 'complete' | 'current' | 'upcoming';
  onStepClick?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <ol className={cx('steps', `steps--${orientation}`)}>
      {steps.map((s, i) => {
        const status = statusOf(i);
        return (
          <li key={s.id} className={cx('steps__item', `is-${status}`)}>
            <button type="button" className="steps__marker" onClick={() => onStepClick?.(i)} disabled={!onStepClick}>
              {status === 'complete' ? <Icon name="check" size={14} strokeWidth={3} /> : i + 1}
            </button>
            <div className="steps__text">
              <span className="steps__label">{s.label}</span>
              {s.description && <span className="steps__desc">{s.description}</span>}
            </div>
            {i < steps.length - 1 && <span className="steps__connector" />}
          </li>
        );
      })}
    </ol>
  );
}

/* --------------------------------------------------------------- Accordion */
export function Accordion({
  items,
  multiple,
  defaultExpanded,
}: {
  items: Array<{ id: string; title: ReactNode; subtitle?: ReactNode; content: ReactNode; icon?: IconKey }>;
  multiple?: boolean;
  defaultExpanded?: string[];
}) {
  const acc = useAccordion({ multiple, defaultExpanded });
  return (
    <div className="accordion">
      {items.map((item) => {
        const open = acc.isExpanded(item.id);
        return (
          <div key={item.id} className={cx('accordion__item', open && 'is-open')}>
            <button type="button" className="accordion__trigger" aria-expanded={open} onClick={() => acc.toggle(item.id)}>
              {item.icon && <Icon name={item.icon} size={18} />}
              <span className="accordion__titles">
                <span className="accordion__title">{item.title}</span>
                {item.subtitle && <span className="accordion__subtitle">{item.subtitle}</span>}
              </span>
              <Icon name="chevronDown" size={16} className="accordion__chevron" />
            </button>
            {open && <div className="accordion__panel">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------ DropdownMenu */
export interface MenuItemDef {
  id: string;
  label: ReactNode;
  icon?: IconKey;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  divider?: boolean;
  description?: ReactNode;
}

export function DropdownMenu({
  trigger,
  items,
  align = 'end',
  header,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  items: MenuItemDef[];
  align?: 'start' | 'end';
  header?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  return (
    <div className="popover-anchor" ref={ref}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div className={cx('menu', `menu--${align}`)} role="menu">
          {header && <div className="menu__header">{header}</div>}
          {items.map((item) =>
            item.divider ? (
              <div key={item.id} className="menu__divider" role="separator" />
            ) : (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={cx('menu__item', item.danger && 'is-danger')}
                onClick={() => {
                  item.onSelect?.();
                  setOpen(false);
                }}
              >
                {item.icon && <Icon name={item.icon} size={16} />}
                <span className="menu__text">
                  <span>{item.label}</span>
                  {item.description && <span className="menu__desc">{item.description}</span>}
                </span>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
