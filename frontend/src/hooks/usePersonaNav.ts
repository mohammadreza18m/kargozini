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
    { to: '/', label: 'Dashboard', icon: ChartBarIcon },
    { to: '/rules', label: 'Rule Management', icon: CogIcon },
    { to: '/attributes', label: 'Dynamic Attributes', icon: ClipboardDocumentListIcon },
    { to: '/personnel', label: 'Personnel Profiles', icon: UserGroupIcon },
    { to: '/reports', label: 'Reports', icon: ChartBarIcon },
    { to: '/archive', label: 'Decree Archive', icon: ArchiveBoxIcon }
  ],
  'Regional Operator': [
    { to: '/', label: 'Home', icon: ChartBarIcon },
    { to: '/personnel', label: 'Regional Personnel', icon: UserGroupIcon },
    { to: '/decrees', label: 'Issue Decree', icon: ClipboardDocumentListIcon },
    { to: '/archive', label: 'Regional Archive', icon: ArchiveBoxIcon }
  ],
  Auditor: [
    { to: '/', label: 'Overview', icon: ChartBarIcon },
    { to: '/archive', label: 'Archive & Comparison', icon: ArchiveBoxIcon },
    { to: '/reports', label: 'Analytics', icon: ChartBarIcon }
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
    switchPersona
  };
}
