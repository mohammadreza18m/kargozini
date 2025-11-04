import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export function TopBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          className="rounded-lg border border-slate-200 p-2 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="باز کردن منو"
          aria-expanded={open}
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-slate-800 lg:text-lg">سامانه احکام و مقررات منابع انسانی</h1>
          <p className="text-xs text-slate-500 lg:text-sm">مرکز یکپارچه مدیریت مقررات و صدور احکام</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-200 p-2 text-slate-600 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="اعلان‌ها"
          >
            <BellIcon className="h-5 w-5" />
          </button>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 sm:flex">
            <span>ورود به‌عنوان</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-primary-500" aria-hidden="true" />
            <span>مدیریت منابع انسانی</span>
          </div>
        </div>
      </div>
      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 lg:hidden">
          منوی موبایل به‌زودی در دسترس خواهد بود.
        </div>
      ) : null}
    </header>
  );
}

