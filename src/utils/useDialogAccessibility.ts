import { useEffect, useRef, type KeyboardEvent } from 'react';

const focusables = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>(
  'button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]'
)).filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0);
const activeDialogs: HTMLElement[] = [];
const isolated = new Map<HTMLElement, { count: number; inert: boolean; hidden: string | null }>();
let scrollLocks = 0;
let previousOverflow = '';

/** Keep custom dialog layouts usable when native dialog methods are absent. */
export function useDialogAccessibility(isOpen: boolean, onClose: () => void, native = false) {
  const ref = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const close = useRef(onClose);
  close.current = onClose;
  // Capture the trigger before a newly mounted child's autoFocus runs.
  if (isOpen && !ref.current && typeof document !== 'undefined') {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }

  useEffect(() => {
    const root = ref.current;
    if (!isOpen || !root) return;
    const trigger = returnFocus.current;
    activeDialogs.push(root);
    const isTop = () => activeDialogs.at(-1) === root;
    const focusFirst = () => (focusables(root)[0] ?? root).focus();
    const keepFocus = (event: FocusEvent) => {
      if (isTop() && event.target instanceof Node && !root.contains(event.target)) focusFirst();
    };
    const hidden: HTMLElement[] = [];
    if (native) {
      const dialog = root as HTMLDialogElement;
      if (!dialog.open) dialog.showModal();
    } else {
      focusFirst();
      for (let child: HTMLElement = root; child.parentElement; child = child.parentElement) {
        for (const sibling of Array.from(child.parentElement.children)) {
          if (sibling === child || !(sibling instanceof HTMLElement)) continue;
          const prior = isolated.get(sibling) ?? { count: 0, inert: sibling.inert, hidden: sibling.getAttribute('aria-hidden') };
          prior.count += 1;
          isolated.set(sibling, prior);
          sibling.inert = true;
          sibling.setAttribute('aria-hidden', 'true');
          hidden.push(sibling);
        }
        if (child.parentElement === document.body) break;
      }
      if (scrollLocks++ === 0) previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.addEventListener('focusin', keepFocus);
    }
    return () => {
      activeDialogs.splice(activeDialogs.lastIndexOf(root), 1);
      if (native) {
        const dialog = root as HTMLDialogElement;
        if (dialog.open) dialog.close();
      } else {
        document.removeEventListener('focusin', keepFocus);
        for (const sibling of hidden) {
          const prior = isolated.get(sibling);
          if (!prior || --prior.count > 0) continue;
          sibling.inert = prior.inert;
          if (prior.hidden === null) sibling.removeAttribute('aria-hidden');
          else sibling.setAttribute('aria-hidden', prior.hidden);
          isolated.delete(sibling);
        }
        if (--scrollLocks === 0) document.body.style.overflow = previousOverflow;
      }
      if (trigger?.isConnected) trigger.focus();
    };
  }, [isOpen, native]);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const root = ref.current;
    if (!root || activeDialogs.at(-1) !== root) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close.current();
    } else if (event.key === 'Tab') {
      const items = focusables(root);
      const first = items[0];
      const last = items.at(-1);
      if (!first) { event.preventDefault(); root.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === root)) {
        event.preventDefault(); first.focus();
      }
    }
  };
  return { ref, onKeyDown };
}
