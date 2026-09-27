import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/**
 * `primary` is the "inverse" treatment from the icon system: a light,
 * near-white surface on dark, using action-surface.primary + on-color text.
 */
const variantClasses: Record<Variant, string> = {
  primary:
    "bg-action-primary text-on-action-primary hover:bg-action-primary-hover active:bg-action-primary-focused disabled:bg-action-primary-disabled",
  secondary:
    "bg-transparent border border-stroke-default text-fg-secondary hover:border-stroke-active hover:text-fg-primary hover:bg-action-tertiary-hover",
  ghost:
    "bg-transparent text-fg-tertiary hover:text-fg-primary hover:bg-action-tertiary-hover active:bg-action-tertiary-focused",
  danger: "bg-transparent border border-error-stroke text-error hover:bg-error-bg",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-7 px-3 text-xs",
  md: "h-9 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      // Defaults to "button". An HTML button with no type is a submit button,
      // so every secondary action inside a <form> — "Save as draft", "Cancel"
      // — would submit it. The two submit buttons in the app set type
      // explicitly.
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-200 whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
