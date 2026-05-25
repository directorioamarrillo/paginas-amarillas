import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/utils";

const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] hover:-translate-y-[1px]";

    const variants = {
      primary:
        "bg-brand-yellow text-dark-primary hover:bg-brand-yellow-hover hover:shadow-elevation-sm focus-visible:ring-brand-yellow",
      secondary:
        "bg-dark-primary text-neutral-50 hover:bg-dark-tertiary hover:shadow-elevation-sm focus-visible:ring-dark-primary dark:bg-neutral-100 dark:text-dark-primary dark:hover:bg-neutral-200",
      outline:
        "border-2 border-neutral-200 bg-transparent hover:bg-neutral-100 text-neutral-900 focus-visible:ring-neutral-200 dark:border-dark-tertiary dark:text-neutral-100 dark:hover:bg-dark-secondary",
      ghost:
        "bg-transparent hover:bg-neutral-100 text-neutral-900 dark:text-neutral-100 dark:hover:bg-dark-secondary shadow-none hover:translate-y-0",
      danger:
        "bg-status-danger text-white hover:bg-red-600 hover:shadow-elevation-sm focus-visible:ring-status-danger",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-5 text-base",
      lg: "h-14 px-8 text-lg rounded-lg",
      icon: "h-11 w-11",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
