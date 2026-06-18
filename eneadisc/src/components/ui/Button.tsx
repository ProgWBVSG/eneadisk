
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F]/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants = {
      primary: "bg-[#E07A5F] text-white hover:bg-[#C9624A] shadow-sm",
      secondary: "bg-[#7C9885] text-white hover:bg-[#5F7A68] shadow-sm",
      outline: "border border-[#ECE3D8] bg-white hover:bg-[#FAF6F1] text-[#3A332E]",
      ghost: "hover:bg-[#F2EAE0] text-[#3A332E]",
    };

    const sizes = {
      sm: "h-10 px-3 text-sm min-h-[40px]",
      md: "h-11 px-4 py-2 text-base min-h-[44px]",
      lg: "h-12 px-8 text-base min-h-[48px]",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
