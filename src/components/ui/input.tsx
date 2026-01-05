import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-lg border border-slate-700/60 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500/50 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-800/20',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = 'Input';
export { Input };