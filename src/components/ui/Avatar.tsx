import * as React from 'react';
import { forwardRef, ImgHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, fallback, size = 'md', src, alt, ...props }, ref) => {
    const [error, setError] = React.useState(false);
    
    if (error || !src) {
      const initials = fallback
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      
      return (
        <div
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium',
            sizes[size],
            className
          )}
          {...props}
        >
          {initials || '?'}
        </div>
      );
    }
    
    return (
      <img
        ref={ref}
        src={src}
        alt={alt || fallback || 'Avatar'}
        className={cn('rounded-full object-cover', sizes[size], className)}
        onError={() => setError(true)}
        {...props}
      />
    );
  }
);

Avatar.displayName = 'Avatar';