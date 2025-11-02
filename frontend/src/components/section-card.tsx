import type { PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';

interface SectionCardProps extends PropsWithChildren {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  action,
  className,
  children
}: SectionCardProps) {
  return (
    <section className={clsx('rounded-2xl bg-white p-6 shadow-sm', className)}>
      <header className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          {description ? (
            <p className="text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {action}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
