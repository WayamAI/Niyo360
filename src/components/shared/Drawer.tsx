import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export function Drawer({ open, onClose, title, subtitle, children, width = 560, footer }: {
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
      <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        className="fixed right-0 top-0 z-[90] h-full bg-card border-l border-border shadow-2xl flex flex-col"
        style={{ width }}
      >
        <header className="flex items-start justify-between gap-3 p-5 border-b border-border">
          <div className="min-w-0">
            <div className="text-[15px] font-medium text-foreground truncate">{title}</div>
            {subtitle && <div className="text-[12px] text-muted-foreground mt-1">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin space-y-4">
          {children}
        </div>
        {footer && (
          <footer className="p-4 border-t border-border flex flex-wrap items-center gap-2 justify-end bg-card">
            {footer}
          </footer>
        )}
      </aside>
    </>
  );
}

export function Modal({ open, onClose, title, children, width = 480, footer }: {
  open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; width?: number; footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="rounded-xl bg-card border border-border shadow-2xl flex flex-col max-h-[90vh]"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-[15px] font-medium text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent text-muted-foreground"><X className="w-4 h-4" /></button>
        </header>
        <div className="p-5 overflow-y-auto scrollbar-thin">{children}</div>
        {footer && <footer className="p-4 border-t border-border flex justify-end gap-2">{footer}</footer>}
      </div>
    </div>
  );
}
