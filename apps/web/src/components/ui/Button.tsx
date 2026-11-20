import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { Icon, type IconKey } from './Icon';
import { Spinner } from './Feedback';
import { cx } from './cx';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: IconKey;
  rightIcon?: IconKey;
  fullWidth?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  leftIcon,
  rightIcon,
  fullWidth,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const iconSize = size === 'lg' ? 18 : size === 'xs' ? 13 : 16;
  return (
    <button
      type={type}
      className={cx('btn', `btn--${variant}`, `btn--${size}`, fullWidth && 'btn--block', loading && 'is-loading', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={iconSize} /> : leftIcon && <Icon name={leftIcon} size={iconSize} />}
      {children && <span>{children}</span>}
      {rightIcon && !loading && <Icon name={rightIcon} size={iconSize} />}
    </button>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: IconKey;
  label: string;
  badge?: number;
}

export function IconButton({ icon, label, badge, variant = 'ghost', size = 'md', className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx('btn', 'btn--icon', `btn--${variant}`, `btn--${size}`, className)}
      {...rest}
    >
      <Icon name={icon} size={size === 'sm' || size === 'xs' ? 16 : 18} />
      {!!badge && <span className="btn__badge">{badge > 99 ? '99+' : badge}</span>}
    </button>
  );
}

export function ButtonGroup({ children, attached }: { children: ReactNode; attached?: boolean }) {
  return <div className={cx('btn-group', attached && 'btn-group--attached')}>{children}</div>;
}
