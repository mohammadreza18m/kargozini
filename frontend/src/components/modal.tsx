import type { PropsWithChildren, ReactNode } from 'react';
import { Button } from '@/components/button';

interface ModalProps extends PropsWithChildren {
  open: boolean;
  title?: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthClass: Record<NonNullable<ModalProps['maxWidth']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl'
};

export function Modal({ open, title, onClose, footer, maxWidth = 'md', children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full ${maxWidthClass[maxWidth]} rounded-2xl bg-white p-6 shadow-xl`} role="dialog" aria-modal="true">
        <div className="mb-4 flex items-center justify-between">
          {title ? <h3 className="text-lg font-semibold text-slate-800">{title}</h3> : <span />}
          <Button variant="outline" size="sm" onClick={onClose}>بستن</Button>
        </div>
        <div className="space-y-3">{children}</div>
        {footer ? <div className="mt-4 flex items-center justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

