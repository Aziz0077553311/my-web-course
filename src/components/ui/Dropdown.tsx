import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface DropdownProps {
  trigger: ReactNode;
  content: ReactNode;
  align?: 'start' | 'end';
}

export const Dropdown = ({ trigger, content, align = 'start' }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div ref={dropdownRef} className="relative inline-block" tabIndex={0}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'fixed z-50 mt-1.5 min-w-[180px] rounded-small bg-surface border border-border shadow-lg animate-slide-down',
            align === 'end' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          <div className="py-1">{content}</div>
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  destructive?: boolean;
}

export const DropdownItem = ({ children, onClick, disabled, className, destructive }: DropdownItemProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    role="menuitem"
    className={cn(
      'flex w-full items-center px-3 py-2 text-sm transition-colors',
      'hover:bg-border focus:bg-border focus:outline-none',
      disabled && 'opacity-50 pointer-events-none',
      destructive && 'text-error',
      className
    )}
  >
    {children}
  </button>
);

interface DropdownSeparatorProps {
  className?: string;
}

export const DropdownSeparator = ({ className }: DropdownSeparatorProps) => (
  <hr className={cn('h-px bg-border my-1', className)} role="separator" />
);