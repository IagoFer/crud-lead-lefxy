import React, { forwardRef } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  iconSize?: number;
  isLoading?: boolean;
  iconClassName?: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon: Icon,
      size = 'md',
      iconSize,
      className = '',
      iconClassName = '',
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const containerSizes = {
      sm: 'w-9 h-9',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    };

    const defaultIconSizes = {
      sm: 16,
      md: 20,
      lg: 24,
    };

    const finalIconSize = iconSize || defaultIconSizes[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${containerSizes[size]}
          flex items-center justify-center
          rounded-xl
          border border-surface-border
          bg-surface
          hover:bg-surface-light
          transition
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Icon
            size={finalIconSize}
            strokeWidth={2.5}
            className={`pointer-events-none ${iconClassName}`}
          />
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton };