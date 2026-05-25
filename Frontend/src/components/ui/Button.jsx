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
        "bg-primary text-[#1F1F1F] font-semibold hover:bg-primary-hover hover:shadow-md focus-visible:ring-primary",
      secondary:
        "bg-[#212121] text-white hover:bg-[#1F1F1F] hover:shadow-md focus-visible:ring-[#212121] dark:bg-neutral-100 dark:text-[#1F1F1F] dark:hover:bg-neutral-200",
      outline:
        "border-2 border-neutral-200 bg-transparent hover:bg-neutral-100 text-[#1F1F1F] focus-visible:ring-neutral-200 dark:border-dark-tertiary dark:text-neutral-100 dark:hover:bg-dark-secondary",
      ghost:
        "bg-transparent hover:bg-slate-100 text-[#1F1F1F] dark:text-neutral-100 dark:hover:bg-dark-secondary shadow-none hover:translate-y-0",
      danger:
        "bg-danger text-white hover:bg-red-600 hover:shadow-md focus-visible:ring-danger",
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
