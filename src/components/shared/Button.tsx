import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:brightness-110',
  secondary: 'bg-transparent border border-border text-foreground hover:border-primary hover:text-primary',
  ghost: 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent',
  danger: 'bg-transparent border border-[color:var(--status-red)] text-[color:var(--status-red)] hover:bg-[color:var(--status-red)]/10',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-3 text-[12px]',
  md: 'h-9 px-4 text-[13px]',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
