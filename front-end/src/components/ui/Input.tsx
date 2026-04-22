import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium text-foreground ml-1">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-foreground/40 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full h-12 px-4 rounded-xl transition-premium
              bg-surface/50 border border-surface-border
              text-foreground placeholder:text-foreground/30
              focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-red-500 ml-1 font-medium">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
