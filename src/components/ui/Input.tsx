import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-white/90">
            {label}
          </label>
        )}
        <input
          className={`
            flex h-12 w-full rounded-xl border bg-black/20 px-4 py-2 text-sm text-white 
            transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium 
            placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-500 focus-visible:ring-red-500' : 'border-white/10 focus-visible:ring-love-400'}
            ${className}
          `}
          ref={ref}
          {...props}
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
