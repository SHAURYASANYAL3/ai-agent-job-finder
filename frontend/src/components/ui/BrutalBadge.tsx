import React from "react";
import { cn } from "./BrutalButton";

interface BrutalBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "muted" | "white";
  rotate?: "none" | "left" | "right";
}

export const BrutalBadge = React.forwardRef<HTMLDivElement, BrutalBadgeProps>(
  ({ className, variant = "secondary", rotate = "none", children, ...props }, ref) => {
    const variants = {
      primary: "bg-neo-accent text-white",
      secondary: "bg-neo-secondary text-black",
      muted: "bg-neo-muted text-black",
      white: "bg-white text-black",
    };

    const rotations = {
      none: "",
      left: "-rotate-2",
      right: "rotate-3",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center px-3 py-1 font-black text-xs uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_#000]",
          variants[variant],
          rotations[rotate],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BrutalBadge.displayName = "BrutalBadge";
