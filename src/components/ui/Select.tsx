import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, children, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-white/90">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={`
              flex h-12 w-full appearance-none rounded-xl border bg-black/20 px-4 py-2 text-sm text-white 
              transition-colors focus-visible:outline-none focus-visible:ring-2 
              disabled:cursor-not-allowed disabled:opacity-50
              ${error ? 'border-red-500 focus-visible:ring-red-500' : 'border-white/10 focus-visible:ring-love-400'}
              ${className}
            `}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
            <ChevronDown size={18} />
          </div>
        </div>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
