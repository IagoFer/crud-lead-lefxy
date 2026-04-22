import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, fullWidth = false, children, disabled, ...props }, ref) => {

    const baseStyles = 'inline-flex items-center justify-center font-medium transition-premium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background active:scale-[0.98]';

    const variants = {
      primary: 'bg-primary hover:bg-primary-light text-white',
      secondary: 'bg-surface-light border border-surface-border hover:bg-surface-border text-foreground',
      outline: 'bg-transparent border border-surface-border text-foreground hover:bg-surface-light focus:ring-surface-border',
      ghost: 'bg-transparent hover:bg-surface-light text-foreground focus:ring-surface',
      danger: 'bg-red-600 hover:bg-red-500 text-white',
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-5 text-sm md:text-base',
      lg: 'h-14 px-8 text-base md:text-lg',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
