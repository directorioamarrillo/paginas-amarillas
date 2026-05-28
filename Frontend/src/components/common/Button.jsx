import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { playHover } from "../../utils/audio";

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  onMouseEnter,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-slate-900 text-amber-500 shadow-md hover:bg-slate-800 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] focus:ring-amber-500 border border-slate-900",
    secondary:
      "border border-blue-500/30 bg-blue-500/10 text-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:bg-blue-500/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] focus:ring-blue-500",
    success:
      "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] focus:ring-emerald-500",
    danger:
      "border border-rose-500/30 bg-rose-500/10 text-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.2)] hover:bg-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] focus:ring-rose-500",
    warning:
      "border border-yellow-500/30 bg-yellow-500/10 text-yellow-600 shadow-[0_0_10px_rgba(234,179,8,0.2)] hover:bg-yellow-500/20 hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] focus:ring-yellow-500",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100/50 focus:ring-slate-500",
    link: "bg-transparent text-amber-600 underline-offset-4 hover:underline focus:ring-amber-500 shadow-none",
  };

  const sizes = {
    xs: "px-3 py-1.5 text-xs",
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;
  const widthStyles = fullWidth ? "w-full" : "";

  const handleMouseEnter = (e) => {
    if (!disabled && !loading) playHover();
    if (onMouseEnter) onMouseEnter(e);
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${className}`}
      disabled={disabled || loading}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {loading && <FontAwesomeIcon icon={faSpinner} spin />}
      {!loading && icon && <FontAwesomeIcon icon={icon} />}
      {children}
    </button>
  );
}
