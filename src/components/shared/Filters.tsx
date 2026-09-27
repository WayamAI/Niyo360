import type { ReactNode } from "react";
import { AppIcon } from "@/components/icons";

/**
 * Scope controls.
 *
 * Screens were using bare `<select>` elements whose options carried the field
 * name — `<option>Authority: All</option>` — so the control had no accessible
 * label, no idea whether it was filtering anything, and repeated the field
 * name on every line of the dropdown. These wrap the native control (kept for
 * its free mobile picker and keyboard behaviour) in a labelled shell that
 * shows when a filter is active.
 */

export function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  /** The value that means "not filtering". Anything else styles as active. */
  neutralValue = "All" as T,
  optionLabel,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
  neutralValue?: T;
  /** Render a friendlier label than the raw option value. */
  optionLabel?: (option: T) => string;
}) {
  const active = value !== neutralValue;
  return (
    <label
      className={`inline-flex h-8 min-w-0 shrink-0 items-center gap-1.5 rounded-md border pr-1.5 pl-2.5 transition-colors duration-150 focus-within:ring-2 focus-within:ring-ring ${
        active
          ? "border-stroke-active bg-raised-2"
          : "border-stroke-default bg-action hover:border-stroke-active"
      }`}
    >
      <span className="type-label-sm shrink-0 text-fg-quaternary">{label}</span>
      <span className="relative inline-flex min-w-0 items-center">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className={`type-body-md min-w-0 appearance-none truncate bg-transparent pr-5 focus:outline-none ${
            active ? "text-fg-primary" : "text-fg-tertiary"
          }`}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {optionLabel ? optionLabel(option) : option}
            </option>
          ))}
        </select>
        <AppIcon
          name="chevronDown"
          size="xs"
          className="pointer-events-none absolute right-0.5 text-icon-quaternary"
        />
      </span>
    </label>
  );
}

/**
 * Segmented pills. Better than a select when there are few options and their
 * counts are part of the decision — "which of these queues has work in it".
 */
export function FilterChips<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly { id: T; label: string; count?: number }[];
  /** Names the group for screen readers, e.g. "Filter by severity". */
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="scrollbar-thin -mx-1 flex min-w-0 gap-1.5 overflow-x-auto px-1 pb-0.5 sm:flex-wrap sm:overflow-visible"
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            className={`type-body-md inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
              active
                ? "border-transparent bg-action-primary text-on-action-primary"
                : "border-stroke-default bg-action text-fg-tertiary hover:border-stroke-active hover:text-fg-secondary"
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`tabular ${active ? "opacity-70" : "text-fg-quaternary"}`}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Row of scope controls with a single clear action. `activeCount` is shown so
 * a filtered view never looks like an empty one.
 */
export function FilterBar({
  children,
  activeCount = 0,
  onClear,
}: {
  children: ReactNode;
  activeCount?: number;
  onClear?: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {children}
      {activeCount > 0 && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="type-body-md inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2 text-fg-tertiary transition-colors duration-150 hover:bg-action-tertiary-hover hover:text-fg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <AppIcon name="close" size="xs" />
          Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
        </button>
      )}
    </div>
  );
}

/** Standalone search box for pages whose search is not inside a DataTable. */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative min-w-[160px] ${className}`}>
      <AppIcon
        name="search"
        size="sm"
        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-icon-quaternary"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="type-body-md h-8 w-full rounded-md border border-stroke-default bg-action pr-3 pl-8 text-fg-primary transition-colors duration-150 placeholder:text-fg-quaternary hover:border-stroke-active focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      />
    </div>
  );
}
