import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "white" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const BrutalButton = React.forwardRef<HTMLButtonElement, BrutalButtonProps>(
  ({ className, variant = "primary", size = "default", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold uppercase tracking-wide border-4 border-black transition-all duration-100 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-neo-bg disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary: "bg-neo-accent text-white shadow-[6px_6px_0px_0px_#000] hover:bg-[#ff5252]",
      secondary: "bg-neo-secondary text-black shadow-[6px_6px_0px_0px_#000] hover:bg-[#ffc107]",
      white: "bg-white text-black shadow-[6px_6px_0px_0px_#000] hover:bg-gray-100",
      ghost: "border-2 border-transparent hover:border-black hover:bg-neo-muted/20 active:shadow-none",
    };

    const sizes = {
      default: "h-14 px-8 text-base",
      sm: "h-10 px-4 text-sm border-2 shadow-[4px_4px_0px_0px_#000]",
      lg: "h-16 px-10 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
BrutalButton.displayName = "BrutalButton";
