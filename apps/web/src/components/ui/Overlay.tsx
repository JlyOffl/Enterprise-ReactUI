import { useEffect, useRef, type ComponentType, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  ComponentRegistry,
  CORE_MODALS,
  useModal,
  useModalEntries,
  useToastQueue,
  type ConfirmOptions,
  type ModalContentProps,
  type ModalEntry,
} from '@erui/core';
import { Button, IconButton } from './Button';
import { Icon, type IconKey } from './Icon';
import { cx } from './cx';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModalContentComponent = ComponentType<ModalContentProps<any, any>>;

/* ------------------------------------------------------ built-in contents */
function ConfirmContent({ entry, close }: ModalContentProps<ConfirmOptions, boolean>) {
  const { t } = useTranslation();
  const p = entry.props;
  return (
    <>
      <div className="modal__body">
        <div className="confirm">
          <span className={cx('confirm__icon', p.tone === 'danger' && 'is-danger')}>
            <Icon name={p.tone === 'danger' ? 'warning' : 'info'} size={22} />
          </span>
          <p className="text-muted">{p.message ? t(p.message) : null}</p>
        </div>
      </div>
      <div className="modal__footer">
        <Button variant="secondary" onClick={() => close(false)}>
          {p.cancelLabel ?? t('common.cancel')}
        </Button>
        <Button variant={p.tone === 'danger' ? 'danger' : 'primary'} onClick={() => close(true)} autoFocus>
          {p.confirmLabel ?? t('common.confirm')}
        </Button>
      </div>
    </>
  );
}

function AlertContent({ entry, close }: ModalContentProps<{ message?: string }>) {
  const { t } = useTranslation();
  return (
    <>
      <div className="modal__body">
        <p className="text-muted">{entry.props.message ? t(entry.props.message) : null}</p>
      </div>
      <div className="modal__footer">
        <Button onClick={() => close()} autoFocus>
          OK
        </Button>
      </div>
    </>
  );
}

/** Creates the web modal content registry pre-populated with built-in dialogs. */
export function createModalRegistry() {
  return new ComponentRegistry<ModalContentComponent>('web-modals').registerMany({
    [CORE_MODALS.confirm]: ConfirmContent as ModalContentComponent,
    [CORE_MODALS.alert]: AlertContent as ModalContentComponent,
  });
}

/* ------------------------------------------------------------ focus trap */
function trapFocus(e: ReactKeyboardEvent<HTMLElement>) {
  if (e.key !== 'Tab') return;
  const focusables = e.currentTarget.querySelectorAll<HTMLElement>(
    'button:not([disabled]),[href],input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])',
  );
  if (!focusables.length) return;
  const first = focusables[0]!;
  const last = focusables[focusables.length - 1]!;
  if (e.shiftKey && document.activeElement === first) {
    last.focus();
    e.preventDefault();
  } else if (!e.shiftKey && document.activeElement === last) {
    first.focus();
    e.preventDefault();
  }
}

/* -------------------------------------------------------- blocking layer */
function BlockingLayer({ entry, registry, isTop }: { entry: ModalEntry; registry: ComponentRegistry<ModalContentComponent>; isTop: boolean }) {
  const modal = useModal();
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const Content = registry.resolve(entry.contentKey);
  const close = (result?: unknown) => modal.close(entry.id, result);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const firstInput = panelRef.current?.querySelector<HTMLElement>('input,textarea,select,[autofocus]');
    (firstInput ?? panelRef.current)?.focus();
    return () => previous?.focus?.();
  }, []);

  const isDrawer = entry.kind === 'drawer';
  return (
    <div className={cx('overlay', isDrawer && `overlay--drawer-${entry.placement ?? 'right'}`)} style={{ zIndex: 1000 + entry.zIndex }}>
      <div className="overlay__backdrop" onClick={() => entry.dismissible && isTop && close()} />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={entry.title ? t(entry.title) : undefined}
        className={cx(isDrawer ? 'drawer' : 'modal', `modal--${entry.size}`, isDrawer && `drawer--${entry.placement ?? 'right'}`)}
        onKeyDown={trapFocus}
      >
        {entry.title && entry.contentKey !== CORE_MODALS.confirm && entry.contentKey !== CORE_MODALS.alert ? (
          <div className="modal__header">
            <h2 className="modal__title">{t(entry.title)}</h2>
            {entry.dismissible && <IconButton icon="x" label={t('common.close')} size="sm" onClick={() => close()} />}
          </div>
        ) : (
          entry.title && (
            <div className="modal__header">
              <h2 className="modal__title">{t(entry.title)}</h2>
            </div>
          )
        )}
        <Content entry={entry} close={close} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------- modeless window */
function ModelessWindow({ entry, registry, index }: { entry: ModalEntry; registry: ComponentRegistry<ModalContentComponent>; index: number }) {
  const modal = useModal();
  const { t } = useTranslation();
  const Content = registry.resolve(entry.contentKey);
  const pos = entry.position ?? { x: window.innerWidth - 400 - index * 28, y: 96 + index * 28 };
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    modal.focus(entry.id);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const x = Math.min(window.innerWidth - 120, Math.max(0, e.clientX - drag.current.dx));
    const y = Math.min(window.innerHeight - 48, Math.max(0, e.clientY - drag.current.dy));
    modal.move(entry.id, x, y);
  };

  return (
    <div
      className={cx('modeless', `modal--${entry.size}`, entry.minimized && 'is-minimized')}
      style={{ left: pos.x, top: pos.y, zIndex: 900 + entry.zIndex }}
      role="dialog"
      aria-modal="false"
      aria-label={entry.title ? t(entry.title) : undefined}
      onPointerDown={() => modal.focus(entry.id)}
    >
      <div
        className="modeless__header"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
      >
        <Icon name="grip" size={14} className="text-muted" />
        <span className="modeless__title">{entry.title ? t(entry.title) : ''}</span>
        <IconButton icon={entry.minimized ? 'maximize' : 'minimize'} label="Minimize" size="xs" onClick={() => modal.toggleMinimize(entry.id)} />
        <IconButton icon="x" label={t('common.close')} size="xs" onClick={() => modal.close(entry.id)} />
      </div>
      {!entry.minimized && <Content entry={entry} close={(r) => modal.close(entry.id, r)} />}
    </div>
  );
}

/* ---------------------------------------------------------------- host */
export function ModalHost({ registry }: { registry: ComponentRegistry<ModalContentComponent> }) {
  const { blocking, modeless } = useModalEntries();
  const modal = useModal();

  useEffect(() => {
    if (!blocking.length) return;
    const top = blocking[blocking.length - 1]!;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && top.dismissible && modal.close(top.id);
    document.addEventListener('keydown', onKey);
    document.body.classList.add('scroll-lock');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('scroll-lock');
    };
  }, [blocking, modal]);

  return createPortal(
    <>
      {modeless.map((e, i) => (
        <ModelessWindow key={e.id} entry={e} registry={registry} index={i} />
      ))}
      {blocking.map((e, i) => (
        <BlockingLayer key={e.id} entry={e} registry={registry} isTop={i === blocking.length - 1} />
      ))}
    </>,
    document.body,
  );
}

/* --------------------------------------------------------------- toasts */
const toastIcons: Record<string, IconKey> = { success: 'success', error: 'error', warning: 'warning', info: 'info' };

export function ToastHost() {
  const { items, dismiss } = useToastQueue();
  const { t } = useTranslation();
  return createPortal(
    <div className="toasts" aria-live="polite">
      {items.map((toast) => (
        <div key={toast.id} className={cx('toast', `toast--${toast.variant}`)} role={toast.variant === 'error' ? 'alert' : 'status'}>
          <Icon name={toastIcons[toast.variant] ?? 'info'} size={18} className="toast__icon" />
          <div className="toast__body">
            <div className="toast__title">{t(toast.title)}</div>
            {toast.message && <div className="toast__message">{t(toast.message)}</div>}
          </div>
          <button className="toast__close" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
            <Icon name="x" size={14} />
          </button>
          <span className="toast__timer" style={{ animationDuration: `${toast.durationMs}ms` }} />
        </div>
      ))}
    </div>,
    document.body,
  );
}
