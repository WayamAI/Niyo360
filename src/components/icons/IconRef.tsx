import type { IconSize } from "./AppIcon";
import { AppIcon } from "./AppIcon";
import { CustomIcon } from "./CustomIcon";
import type { IconName } from "./registry";
import type { CustomIconName } from "./customRegistry";

/**
 * A type-safe reference to either icon family, for call sites (like
 * Sidebar's nav data) that need to declare "which icon" without committing
 * to which rendering component handles it. The discriminant makes "which
 * registry does this name belong to" a compile-time fact: `name` for a
 * `"lucide"` ref is checked against `IconName`, `name` for a `"custom"` ref
 * against `CustomIconName` — there is no way to write a ref whose `name`
 * doesn't exist in the registry its `type` claims.
 *
 * `customIcons` is empty until a real asset passes the alpha-transparency
 * bar (see docs/design/icon-system/icon-reexport-checklist.md), which makes
 * `CustomIconName` resolve to `never` today — so `{ type: "custom", name:
 * ... }` cannot be constructed with any value right now. That's intentional:
 * it is currently impossible to declare a nav item (or anything else) that
 * references a custom icon that doesn't exist. See icons.test.tsx for a
 * `@ts-expect-error` test that pins this guarantee.
 */
export type IconRef = { type: "lucide"; name: IconName } | { type: "custom"; name: CustomIconName };

export interface ResolveIconRefProps {
  icon: IconRef;
  size?: IconSize;
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

/** Dispatches an IconRef to the component that actually knows how to render it. */
export function ResolveIconRef({ icon, ...rest }: ResolveIconRefProps) {
  if (icon.type === "custom") {
    return <CustomIcon name={icon.name} {...rest} />;
  }
  return <AppIcon name={icon.name} {...rest} />;
}
