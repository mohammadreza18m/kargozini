import { useMemo } from 'react';
import type { SVGProps } from 'react';
import { create } from 'zustand';
import {
  ArchiveBoxIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export type Persona = 'Administrator' | 'Regional Operator' | 'Auditor';

const personaFa: Record<Persona, string> = {
  Administrator: 'مدیر سامانه',
  'Regional Operator': 'اپراتور منطقه',
  Auditor: 'ناظر'
};

export interface PersonaNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<SVGProps<SVGSVGElement>>;
  badge?: string;
}

interface PersonaStoreState {
  persona: Persona;
  switchPersona: (persona: Persona) => void;
}

const personaOptions: readonly Persona[] = ['Administrator', 'Regional Operator', 'Auditor'] as const;

const usePersonaStore = create<PersonaStoreState>((set) => ({
  persona: 'Administrator',
  switchPersona: (persona) => set({ persona })
}));

const baseNav: Record<Persona, PersonaNavItem[]> = {
  Administrator: [
    { to: '/', label: 'داشبورد', icon: ChartBarIcon },
    { to: '/rules', label: 'مدیریت مقررات', icon: CogIcon },
    { to: '/attributes', label: 'ویژگی‌های پویا', icon: ClipboardDocumentListIcon },
    { to: '/members', label: 'اعضای موجودیت', icon: UserGroupIcon },
    { to: '/reports', label: 'گزارش‌ها', icon: ChartBarIcon },
    { to: '/archive', label: 'آرشیو احکام', icon: ArchiveBoxIcon }
  ],
  'Regional Operator': [
    { to: '/', label: 'خانه', icon: ChartBarIcon },
    { to: '/decrees', label: 'صدور حکم', icon: ClipboardDocumentListIcon },
    { to: '/archive', label: 'آرشیو منطقه‌ای', icon: ArchiveBoxIcon }
  ],
  Auditor: [
    { to: '/', label: 'نمای کلی', icon: ChartBarIcon },
    { to: '/archive', label: 'آرشیو و مقایسه', icon: ArchiveBoxIcon },
    { to: '/reports', label: 'تحلیل‌ها', icon: ChartBarIcon }
  ]
};

export function usePersonaNav() {
  const persona = usePersonaStore((state) => state.persona);
  const switchPersona = usePersonaStore((state) => state.switchPersona);

  const navItems = useMemo(() => baseNav[persona], [persona]);

  return {
    persona,
    personaOptions,
    navItems,
    switchPersona,
    personaLabel: personaFa[persona]
  };
}
