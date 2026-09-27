import { AppIcon } from "@/components/icons";
import type { ReactNode } from "react";

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 560,
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
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-[80] bg-scrim backdrop-blur-sm" onClick={onClose} />
      <aside
        className="fixed right-0 top-0 z-[90] h-full bg-raised border-l border-stroke-default shadow-2xl flex flex-col"
        style={{ width }}
      >
        <header className="flex items-start justify-between gap-3 p-5 border-b border-stroke-default">
          <div className="min-w-0">
            <div className="text-md font-medium text-fg-primary truncate">{title}</div>
            {subtitle && <div className="text-xs text-fg-tertiary mt-1">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="p-1.5 rounded hover:bg-action-tertiary-hover text-icon-tertiary hover:text-icon-primary transition-colors duration-200"
          >
            <AppIcon name="close" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin space-y-4">{children}</div>
        {footer && (
          <footer className="p-4 border-t border-stroke-default flex flex-wrap items-center gap-2 justify-end bg-raised">
            {footer}
          </footer>
        )}
      </aside>
    </>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 480,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  width?: number;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-scrim"
      onClick={onClose}
    >
      <div
        className="rounded-xl bg-raised border border-stroke-default shadow-2xl flex flex-col max-h-[90vh]"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-stroke-default">
          <h3 className="text-md font-medium text-fg-primary">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded hover:bg-action-tertiary-hover text-icon-tertiary hover:text-icon-primary transition-colors duration-200"
          >
            <AppIcon name="close" />
          </button>
        </header>
        <div className="p-5 overflow-y-auto scrollbar-thin">{children}</div>
        {footer && (
          <footer className="p-4 border-t border-stroke-default flex justify-end gap-2">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
