import { cn } from '../../../lib/cn';
import type { KitIconKey } from '../../../types/kit';
import { KIT_ICON_ORDER, KIT_ICONS } from '../constants/kitIconMeta';

interface KitIconPickerProps {
  value: KitIconKey;
  onChange: (icon: KitIconKey) => void;
}

export function KitIconPicker({ value, onChange }: KitIconPickerProps) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-900">Icon</legend>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {KIT_ICON_ORDER.map((key) => {
          const { icon: Icon, label } = KIT_ICONS[key];
          const selected = key === value;
          return (
            <label
              key={key}
              title={label}
              className={cn(
                'flex size-9 cursor-pointer items-center justify-center rounded-md border transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo-600',
                selected
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600 ring-1 ring-indigo-600'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50',
              )}
            >
              <input
                type="radio"
                name="kit-icon"
                value={key}
                checked={selected}
                onChange={() => onChange(key)}
                className="sr-only"
                aria-label={label}
              />
              <Icon aria-hidden="true" className="size-4" />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
