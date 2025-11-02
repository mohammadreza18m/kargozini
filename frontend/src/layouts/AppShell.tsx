import { Outlet } from 'react-router-dom';
import { PersonaSwitcher } from '@/components/persona-switcher';
import { SidebarNav } from '@/components/sidebar-nav';
import { TopBar } from '@/components/top-bar';
import { usePersonaNav } from '@/hooks/usePersonaNav';

export function AppShell() {
  const { persona, personaOptions, navItems, switchPersona } = usePersonaNav();

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside aria-label="Primary navigation" className="hidden w-72 flex-col border-l border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-200 p-4">
          <PersonaSwitcher options={personaOptions as any} value={persona as any} onChange={(v) => switchPersona(v as any)} />
        </div>
        <SidebarNav persona={persona} items={navItems} />
      </aside>
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
