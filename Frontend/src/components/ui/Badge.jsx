import React from "react";
import { cn } from "../../utils/utils";

const Badge = React.forwardRef(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-neutral-100 text-neutral-800 dark:bg-dark-tertiary dark:text-neutral-200",
      success: "bg-status-success-light text-status-success dark:bg-status-success/20 dark:text-status-success",
      warning: "bg-status-warning-light text-status-warning dark:bg-status-warning/20 dark:text-status-warning",
      danger: "bg-status-danger-light text-status-danger dark:bg-status-danger/20 dark:text-status-danger",
      info: "bg-status-info-light text-status-info dark:bg-status-info/20 dark:text-status-info",
      brand: "bg-brand-yellow-light text-yellow-800 dark:bg-brand-yellow/20 dark:text-brand-yellow",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
