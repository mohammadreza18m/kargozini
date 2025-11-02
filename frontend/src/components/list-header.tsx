import type { ChangeEvent, ReactNode } from 'react';
import clsx from 'clsx';

interface ListHeaderProps {
  left?: ReactNode;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  className?: string;
}

export function ListHeader({ left, searchPlaceholder, searchValue, onSearchChange, className }: ListHeaderProps) {
  return (
    <div className={clsx('mb-3 flex items-center gap-3', className)}>
      {left}
      <input
        className="ml-auto w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none sm:w-72"
        placeholder={searchPlaceholder ?? 'جستجو...'}
        value={searchValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
      />
    </div>
  );
}

