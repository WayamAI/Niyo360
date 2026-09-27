import type { ButtonHTMLAttributes } from "react";
import { AppIcon, type IconSize } from "./AppIcon";
import type { IconName } from "./registry";

type Variant = "ghost" | "subtle" | "inverse";
type Size = "sm" | "md" | "lg";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: IconName;
  /** Required: an icon-only control has no other accessible name. */
  "aria-label": string;
  variant?: Variant;
  size?: Size;
  /** Renders the active/selected treatment (e.g. current nav item). */
  selected?: boolean;
}

const variantClasses: Record<Variant, string> = {
  // transparent → action-tertiary on hover
  ghost:
    "bg-transparent text-icon-tertiary hover:bg-action-tertiary-hover hover:text-icon-secondary active:bg-action-tertiary-focused",
  // surface.action → surface.raised on hover
  subtle:
    "bg-action text-icon-secondary hover:bg-raised hover:text-icon-primary active:bg-raised-2",
  // action-surface.primary + icon.on-color — the light-on-dark selected state
  inverse:
    "bg-action-primary text-on-action-primary hover:bg-action-primary-hover active:bg-action-primary-focused",
};

const sizeClasses: Record<Size, string> = {
  sm: "w-8 h-8",
  md: "w-9 h-9",
  lg: "w-10 h-10",
};

const iconSize: Record<Size, IconSize> = { sm: "sm", md: "md", lg: "lg" };

export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  selected = false,
  className = "",
  ...rest
}: IconButtonProps) {
  const tone = selected ? variantClasses.inverse : variantClasses[variant];
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-md transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        disabled:opacity-50 disabled:pointer-events-none
        ${tone} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      <AppIcon name={icon} size={iconSize[size]} aria-hidden />
    </button>
  );
}
