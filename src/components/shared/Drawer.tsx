import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import { AppIcon } from "@/components/icons";

/**
 * Overlay surfaces.
 *
 * Both were plain divs: no dialog role, no accessible name, no Escape, no
 * focus containment, and focus left wherever the trigger was — so a keyboard
 * or screen-reader user could tab straight through an open drawer into the
 * page behind it. `useDialog` fixes that once for both.
 */

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  const focusables = useCallback(
    () => Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
    [],
  );

  // Move focus in on open and hand it back to the trigger on close, so
  // dismissing a drawer returns the caret to the row that opened it.
  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    const first = focusables()[0] ?? ref.current;
    first?.focus();
    return () => restoreTo.current?.focus?.();
  }, [open, focusables]);

  // The page behind an overlay must not scroll under it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      // Wrap at both ends rather than letting focus escape to the page.
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose, focusables]);

  return ref;
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  /** Desktop width in px. Below 640px the drawer is always full-width. */
  width = 520,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  width?: number;
  footer?: ReactNode;
}) {
  const ref = useDialog(open, onClose);
  const titleId = useId();
  const subtitleId = useId();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-scrim" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-full flex-col border-l border-stroke-default bg-container sm:w-[var(--drawer-w)]"
        style={{ "--drawer-w": `${width}px` } as React.CSSProperties}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-stroke-muted px-4 py-3">
          <div className="min-w-0">
            <h2 id={titleId} className="type-heading-md truncate text-fg-primary">
              {title}
            </h2>
            {subtitle && (
              <p id={subtitleId} className="type-body-md mt-0.5 truncate text-fg-tertiary">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="grid size-7 shrink-0 place-items-center rounded-md text-icon-tertiary transition-colors duration-150 hover:bg-action-tertiary-hover hover:text-icon-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <AppIcon name="close" size="sm" />
          </button>
        </header>
        <div className="scrollbar-thin min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {children}
        </div>
        {footer && (
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-stroke-muted px-4 py-3">
            {footer}
          </footer>
        )}
      </div>
    </>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 440,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  width?: number;
  footer?: ReactNode;
}) {
  const ref = useDialog(open, onClose);
  const titleId = useId();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-scrim p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full flex-col rounded-t-xl border border-stroke-default bg-container sm:w-[var(--modal-w)] sm:max-w-full sm:rounded-xl"
        style={{ "--modal-w": `${width}px` } as React.CSSProperties}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-stroke-muted px-4 py-3">
          <h2 id={titleId} className="type-heading-md min-w-0 truncate text-fg-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid size-7 shrink-0 place-items-center rounded-md text-icon-tertiary transition-colors duration-150 hover:bg-action-tertiary-hover hover:text-icon-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <AppIcon name="close" size="sm" />
          </button>
        </header>
        <div className="scrollbar-thin min-h-0 overflow-y-auto p-4">{children}</div>
        {footer && (
          <footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-stroke-muted px-4 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
