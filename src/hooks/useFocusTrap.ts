import { useEffect, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Keeps Tab focus inside `containerRef` while mounted, moves initial focus to the
 * first `[data-autofocus]` element (or the container), and restores focus on unmount.
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, returnFocusTo: HTMLElement | null): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!container.contains(document.activeElement)) {
      (container.querySelector<HTMLElement>('[data-autofocus]') ?? container).focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !container) return;

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => element.offsetParent !== null,
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      returnFocusTo?.focus();
    };
  }, [containerRef, returnFocusTo]);
}
