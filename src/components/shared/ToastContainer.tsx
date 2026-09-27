import { AppIcon } from "@/components/icons";
import { useApp } from "@/context/AppContext";

const variantBorder = {
  default: "var(--brand)",
  success: "var(--feedback-success-icon)",
  warning: "var(--feedback-warning-icon)",
  error: "var(--feedback-error-icon)",
};

const Icon = ({ v }: { v: keyof typeof variantBorder }) => {
  const props = { className: "w-4 h-4 shrink-0" };
  if (v === "success")
    return <AppIcon name="success" {...props} style={{ color: variantBorder.success }} />;
  if (v === "warning")
    return <AppIcon name="warning" {...props} style={{ color: variantBorder.warning }} />;
  if (v === "error")
    return <AppIcon name="error" {...props} style={{ color: variantBorder.error }} />;
  return <AppIcon name="info" {...props} style={{ color: variantBorder.default }} />;
};

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();
  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[9999] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4"
    >
      {toasts.slice(-3).map((t) => (
        <div
          key={t.id}
          className="event-enter pointer-events-auto flex w-full max-w-[340px] items-start gap-3 rounded-lg border border-stroke-default bg-raised py-2.5 pr-2 pl-3"
          style={{ borderLeft: `3px solid ${variantBorder[t.variant]}` }}
        >
          <Icon v={t.variant} />
          <p className="text-xs text-fg-primary flex-1 leading-snug">{t.message}</p>
          <button
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
            className="p-0.5 rounded hover:bg-action-tertiary-hover text-icon-tertiary hover:text-icon-primary transition-colors duration-200"
          >
            <AppIcon name="close" size="sm" />
          </button>
        </div>
      ))}
    </div>
  );
}
