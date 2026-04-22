import React, { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', glass = false, children, ...props }, ref) => {
    const defaultStyle = 'bg-surface border border-surface-border rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]';
    const glassStyle = 'glass-card rounded-3xl';

    return (
      <div
        ref={ref}
        className={`${glass ? glassStyle : defaultStyle} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
