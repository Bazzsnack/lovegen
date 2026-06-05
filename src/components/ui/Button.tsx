import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-love-400 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:bg-white/20 hover:scale-[1.02]',
        secondary: 'bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10',
        outline: 'border border-white/20 bg-transparent text-white hover:bg-white/10',
        ghost: 'hover:bg-white/10 hover:text-white text-white/70',
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
