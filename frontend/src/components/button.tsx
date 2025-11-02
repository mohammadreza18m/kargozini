import clsx from 'clsx';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'warning';
type Size = 'sm' | 'md';

interface ButtonProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm'
  } as const;
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    outline: 'border border-slate-300 text-slate-700 hover:border-primary hover:text-primary bg-white',
    ghost: 'text-slate-600 hover:text-primary',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    warning: 'bg-amber-500 text-white hover:bg-amber-600'
  } as const;

  return (
    <button className={clsx(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

