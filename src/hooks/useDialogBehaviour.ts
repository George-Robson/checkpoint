import { useEffect, useState, type RefObject } from 'react';
import { useFocusTrap } from './useFocusTrap';

/**
 * Shared modal behaviour for drawers and dialogs: traps Tab focus inside the panel, closes on
 * Escape, and returns focus to whatever was focused when the dialog opened.
 */
export function useDialogBehaviour(panelRef: RefObject<HTMLElement | null>, onClose: () => void): void {
  // Captured during the first render, before anything inside the dialog takes focus.
  const [returnFocusTo] = useState(() => document.activeElement as HTMLElement | null);

  useFocusTrap(panelRef, returnFocusTo);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
}
