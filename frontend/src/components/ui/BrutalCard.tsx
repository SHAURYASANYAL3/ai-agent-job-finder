import React from "react";
import { cn } from "./BrutalButton";

interface BrutalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  liftOnHover?: boolean;
}

export const BrutalCard = React.forwardRef<HTMLDivElement, BrutalCardProps>(
  ({ className, liftOnHover = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-none transition-all duration-200",
          liftOnHover && "hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_#000]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BrutalCard.displayName = "BrutalCard";

export const BrutalCardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 border-b-4 border-black bg-neo-muted/20", className)} {...props} />
);

export const BrutalCardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6", className)} {...props} />
);
