import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { buildNotificationsSocketUrl } from "../utils/ws";
import { notificacionesApi } from "../services/api";
import { useWebSocketBackoff } from "../hooks/useWebSocketBackoff";

export function Topbar() {
  const { user, signout } = useAuth();
  const { isAdmin } = usePermissions();
  const [conteos, setConteos] = useState({ total: 0, sinLeer: 0 });
  const wsUrl = user?.id_usuario ? buildNotificationsSocketUrl(user.id_usuario) : null;

  const refreshConteos = useCallback(async () => {
    try {
      const [totalRes, sinLeerRes] = await Promise.all([
        notificacionesApi.contar(),
        notificacionesApi.contar({ sin_leer: true }),
      ]);
      setConteos({
        total: totalRes.data?.cantidad_total || 0,
        sinLeer: sinLeerRes.data?.cantidad_sin_leer || 0,
      });
    } catch {
      // Ignore transient errors in header counters.
    }
  }, []);

  useEffect(() => {
    refreshConteos();
  }, [refreshConteos]);

  useWebSocketBackoff({
    url: wsUrl,
    enabled: Boolean(wsUrl),
    onMessage: (event) => {
      try {
        const payload = JSON.parse(event.data);
        const isUnread = payload?.leido === false || payload?.read === false || payload?.sin_leer === true;
        setConteos((prev) => ({
          total: prev.total + 1,
          sinLeer: prev.sinLeer + (isUnread ? 1 : 0),
        }));
      } catch {
        // Ignore malformed websocket payloads.
      }
    },
  });

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-4 xl:flex-row xl:items-center xl:justify-between shadow-sm z-10 relative">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="whitespace-nowrap">
          <p className="text-xs uppercase tracking-widest text-amber-600 font-bold">Producción</p>
          <h2 className="text-xl font-black text-slate-900 tracking-widest uppercase">Operación <span className="text-amber-500">Integral</span></h2>
        </div>
        
        {/* Realtime Nexus Status */}
        <div className="inline-flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-50/50 px-4 py-1.5 shadow-[0_0_10px_rgba(16,185,129,0.1)] whitespace-nowrap w-fit">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
            NEXUS STATUS <span className="mx-1.5 opacity-50">•</span> ONLINE <span className="mx-1.5 opacity-50">•</span> SECURE <span className="mx-1.5 opacity-50">•</span> REALTIME
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap xl:flex-nowrap mt-2 xl:mt-0">
        <div className="rounded-xl border border-amber-500/40 bg-slate-600 px-4 py-2 text-sm text-slate-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
          Usuario: <strong className="text-amber-500">{user?.id_usuario || "-"}</strong> | Rol: <strong className="text-amber-500">{user?.rol || "N/A"}</strong>
        </div>
        <div className="rounded-xl border border-blue-500/30 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
          Notificaciones: <span className="text-blue-500">{conteos.total}</span> | Sin leer: <span className="text-blue-500">{conteos.sinLeer}</span>
        </div>
        {isAdmin ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            ADMIN ACTIVO
          </div>
        ) : null}
        <button
          type="button"
          onClick={signout}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-500 hover:bg-rose-100 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] transition uppercase tracking-wider ml-2 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          Salir
        </button>
      </div>
    </header>
  );
}
