"use client";

import { useEffect, useRef } from "react";

// keeps a focused user trapped inside an open modal, restores focus to the
// element that opened it on close, and wires up Escape to close. one hook
// instead of repeating this in every dialog.
//
// usage: const ref = useModalA11y(open, onClose);
// then spread to the modal's container: <div ref={ref} role="dialog" aria-modal="true" ...>
//
// callers are responsible for the visual presentation (overlay, click-outside,
// styling). this hook only handles keyboard + focus.

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function useModalA11y(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // focus the first focusable inside the modal so keyboard users land
    // somewhere sensible. fall back to the modal container itself if there
    // are no focusable children (rare — pure-content dialogs).
    const node = ref.current;
    if (node) {
      const first = node.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (first) first.focus();
      else node.focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      const focusables = Array.from(
        ref.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // restore focus only if the element still exists in the DOM
      const prev = previouslyFocused.current;
      if (prev && document.contains(prev)) prev.focus();
    };
  }, [open, onClose]);

  return ref;
}
