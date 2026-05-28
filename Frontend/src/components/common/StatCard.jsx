import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp, faMinus } from "@fortawesome/free-solid-svg-icons";

export function StatCard({ title, value, hint, icon, color = "primary", trend }) {
  const colorClasses = {
    primary: "from-primary-400 to-primary-500",
    success: "from-emerald-400 to-emerald-500",
    danger: "from-rose-400 to-rose-500",
    warning: "from-amber-400 to-amber-500",
    info: "from-sky-400 to-sky-500",
    purple: "from-violet-400 to-violet-500",
  };

  const iconGlows = {
    primary: "border-primary-500 text-primary-400 shadow-[0_0_12px_rgba(59,130,246,0.6)]",
    success: "border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]",
    danger: "border-rose-500 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]",
    warning: "border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]",
    info: "border-sky-500 text-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.6)]",
    purple: "border-violet-500 text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.6)]",
  };

  const bgGradient = colorClasses[color] || colorClasses.primary;
  const glowClass = iconGlows[color] || iconGlows.primary;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg md:p-6">
      {/* Animated background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          {icon && (
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border-2 ${glowClass} transition-all duration-300 group-hover:scale-110 group-hover:brightness-125`}
            >
              <FontAwesomeIcon icon={icon} size="sm" />
            </div>
          )}
        </div>

        <p className="mt-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
          {value}
        </p>

        {hint && (
          <div className="mt-2 flex items-center gap-1.5">
            {trend && (
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  trend === "up"
                    ? "bg-emerald-100 text-emerald-600"
                    : trend === "down"
                      ? "bg-rose-100 text-rose-600"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                <FontAwesomeIcon
                  icon={trend === "up" ? faArrowUp : trend === "down" ? faArrowDown : faMinus}
                  size="xs"
                />
              </div>
            )}
            <p className="text-xs font-medium text-slate-600">{hint}</p>
          </div>
        )}
      </div>
    </article>
  );
}
