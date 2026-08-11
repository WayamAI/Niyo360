import { useApp } from '@/context/AppContext';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const variantBorder = {
  default: 'var(--primary)',
  success: 'var(--status-green)',
  warning: 'var(--status-amber)',
  error:   'var(--status-red)',
};

const Icon = ({ v }: { v: keyof typeof variantBorder }) => {
  const props = { className: 'w-4 h-4 shrink-0' };
  if (v === 'success') return <CheckCircle2 {...props} style={{ color: variantBorder.success }} />;
  if (v === 'warning') return <AlertTriangle {...props} style={{ color: variantBorder.warning }} />;
  if (v === 'error') return <AlertCircle {...props} style={{ color: variantBorder.error }} />;
  return <Info {...props} style={{ color: variantBorder.default }} />;
};

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.slice(-3).map(t => (
        <div
          key={t.id}
          className="event-enter pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-card shadow-lg pl-3 pr-2 py-3 max-w-[340px]"
          style={{ borderLeft: `3px solid ${variantBorder[t.variant]}` }}
        >
          <Icon v={t.variant} />
          <p className="text-[12px] text-foreground flex-1 leading-snug">{t.message}</p>
          <button onClick={() => dismissToast(t.id)} className="p-0.5 rounded hover:bg-accent text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
