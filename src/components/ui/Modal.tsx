import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDialogBehaviour } from '../../hooks/useDialogBehaviour';

interface ModalProps {
  title: string;
  description?: ReactNode;
  onClose: () => void;
  /** Pinned under the header (e.g. search and filters) while the body scrolls. */
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/** Centred dialog for larger tasks such as browsing. Mount it to open, unmount it to close. */
export function Modal({ title, description, onClose, toolbar, footer, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useDialogBehaviour(panelRef, onClose);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-slate-900/20 motion-safe:animate-fade-in" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-lg border border-slate-200 bg-white shadow-sm focus:outline-none motion-safe:animate-modal-in"
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
            aria-label="Close dialog"
            className="-mr-2 flex size-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        {toolbar && <div className="border-b border-slate-200 px-6 py-3">{toolbar}</div>}

        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {footer && <div className="rounded-b-lg border-t border-slate-200 bg-slate-50 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
