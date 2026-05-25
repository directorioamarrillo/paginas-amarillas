import React from "react";
import { cn } from "../../utils/utils";

const Input = React.forwardRef(
  ({ className, type = "text", error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    if (leftIcon && typeof leftIcon === 'object' && !leftIcon.typeof) console.error('ui/Input leftIcon is an object without typeof!', leftIcon);
    return (
      <div className="w-full relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-xl border bg-white/70 backdrop-blur-sm px-4 py-2 text-sm placeholder:text-neutral-400 transition-all duration-300 shadow-sm hover:shadow-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-dark-secondary/50 dark:border-dark-tertiary dark:text-neutral-100 dark:placeholder:text-neutral-500",
            error
              ? "border-status-danger focus-visible:ring-status-danger focus-visible:border-status-danger"
              : "border-neutral-200 focus-visible:border-brand-yellow focus-visible:ring-brand-yellow/40 hover:border-brand-yellow/50 dark:focus-visible:border-brand-yellow",
            leftIcon && "pl-11",
            rightIcon && "pr-11",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">
            {rightIcon}
          </div>
        )}
        {(error || helperText) && (
          <p
            className={cn(
              "mt-1.5 text-xs font-medium",
              error ? "text-status-danger" : "text-neutral-500 dark:text-neutral-400"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
