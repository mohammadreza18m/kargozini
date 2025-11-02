import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

interface PersonaSwitcherProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}

export function PersonaSwitcher({ options, value, onChange }: PersonaSwitcherProps) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <span>{value}</span>
          <ChevronUpDownIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-20 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg focus:outline-none">
          {options.map((personaOption) => (
            <Listbox.Option
              key={personaOption}
              value={personaOption}
              className={({ active }) =>
                [
                  'flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                  active ? 'bg-primary/10 text-primary-700' : 'text-slate-700'
                ].join(' ')
              }
            >
              {({ selected }) => (
                <>
                  <span>{personaOption}</span>
                  {selected ? <CheckIcon className="h-4 w-4 text-primary-600" /> : null}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

