import { useEffect, type RefObject } from 'react';

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onOutsideClick: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;

    function handlePointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [ref, onOutsideClick, enabled]);
}
