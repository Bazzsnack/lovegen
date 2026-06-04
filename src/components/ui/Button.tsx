import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-love-400 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-love-500 to-love-600 text-white shadow-lg shadow-love-500/25 hover:shadow-love-500/40 hover:scale-[1.02]',
        secondary: 'bg-love-100 text-love-900 hover:bg-love-200',
        outline: 'border border-love-200 bg-transparent text-love-600 hover:bg-love-50',
        ghost: 'hover:bg-white/10 hover:text-love-100 text-white/70',
        glass: 'bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-14 px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
