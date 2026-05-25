import React from "react";
import { cn } from "../../utils/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-shimmer bg-neutral-200 dark:bg-dark-tertiary rounded-md bg-gradient-to-r from-transparent via-white/20 to-transparent background-size-[200%_100%]", className)}
      {...props}
    />
  );
}

export { Skeleton };
