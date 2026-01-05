import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40',
        destructive: 'bg-danger-600 text-white hover:bg-danger-700 shadow-lg shadow-danger-600/20',
        outline: 'border-2 border-primary-500/30 bg-slate-800/30 text-primary-300 hover:bg-slate-800/50 hover:border-primary-500/50',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 shadow-lg shadow-secondary-600/20',
        ghost: 'text-slate-200 hover:bg-slate-800/50 hover:text-white',
        link: 'text-primary-400 underline-offset-4 hover:underline hover:text-primary-300',
        success: 'bg-success-600 text-white hover:bg-success-700 shadow-lg shadow-success-600/20',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends HTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export { Button };
