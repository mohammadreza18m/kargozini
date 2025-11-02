import { NavLink } from 'react-router-dom';
import type { PersonaNavItem } from '@/hooks/usePersonaNav';
import { classNames } from '@/utils/class-names';

interface SidebarNavProps {
  persona: string;
  items: PersonaNavItem[];
}

export function SidebarNav({ persona, items }: SidebarNavProps) {
  return (
    <nav aria-label={`Navigation for persona ${persona}`} className="flex-1 overflow-y-auto px-2 py-4">
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  classNames(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="ms-auto inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary-700">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

