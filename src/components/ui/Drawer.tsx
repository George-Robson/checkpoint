import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDialogBehaviour } from '../../hooks/useDialogBehaviour';

interface DrawerProps {
  title: string;
  description?: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

/** Right-hand slide-over panel. Mount it to open, unmount it to close. */
export function Drawer({ title, description, onClose, footer, children }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useDialogBehaviour(panelRef, onClose);

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-slate-900/20 motion-safe:animate-fade-in" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-sm focus:outline-none motion-safe:animate-drawer-in"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-slate-900">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="-mr-2 flex size-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

        {footer && <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
