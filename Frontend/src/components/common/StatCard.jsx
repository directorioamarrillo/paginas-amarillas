import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function StatCard({ title, value, hint, icon: Icon, color = "primary", trend }) {
  const colorClasses = {
    primary: "from-primary-50 to-white",
    success: "from-emerald-50 to-white",
    danger: "from-rose-50 to-white",
    warning: "from-amber-50 to-white",
    info: "from-sky-50 to-white",
    purple: "from-violet-50 to-white",
  };

  const iconStyles = {
    primary: "bg-primary-50 text-primary-600 border border-primary-200",
    success: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    danger: "bg-rose-50 text-rose-600 border border-rose-200",
    warning: "bg-amber-50 text-amber-600 border border-amber-200",
    info: "bg-sky-50 text-sky-600 border border-sky-200",
    purple: "bg-violet-50 text-violet-600 border border-violet-200",
  };

  const bgGradient = colorClasses[color] || colorClasses.primary;
  const iconStyle = iconStyles[color] || iconStyles.primary;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg md:p-6">
      {/* Animated background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          {Icon && (
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle} transition-all duration-300 group-hover:scale-110 shadow-sm`}
            >
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        <p className="mt-3 text-3xl font-bold text-slate-800 md:text-4xl">
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
                {trend === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : trend === "down" ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
              </div>
            )}
            <p className="text-xs font-medium text-slate-600">{hint}</p>
          </div>
        )}
      </div>
    </article>
  );
}
