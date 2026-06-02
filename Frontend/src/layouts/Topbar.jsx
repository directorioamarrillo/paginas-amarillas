import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import { buildNotificationsSocketUrl } from "../utils/ws";
import { notificacionesApi } from "../services/api";
import { useWebSocketBackoff } from "../hooks/useWebSocketBackoff";
import { Link } from "react-router-dom";

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
    <header className="flex flex-col gap-4 border-b border-brand-gray-light bg-white px-4 md:px-8 py-5 xl:flex-row xl:items-center xl:justify-between z-10 relative">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary-dark font-bold mb-1">Producción</p>
          <h2 className="text-xl font-black text-brand-dark tracking-widest uppercase flex flex-wrap items-center gap-2">
            Operación <span className="text-primary">Integral</span>
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap xl:flex-nowrap mt-2 xl:mt-0">
        
        {/* User Block */}
        <Link 
          to="/admin/perfil" 
          className="flex items-center gap-3 h-[46px] rounded-lg border border-brand-gray-light bg-white px-4 text-[11px] whitespace-nowrap hover:bg-brand-gray-light/30 hover:border-brand-gray transition-all cursor-pointer select-none"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded bg-brand-dark/10 text-brand-dark">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex flex-col justify-center leading-tight">
            <span className="text-[9px] text-brand-gray font-bold uppercase tracking-wider mb-[2px]">Usuario</span>
            <span className="text-brand-dark font-black">{user?.id_usuario || "-"}</span>
          </div>
          <div className="w-px h-6 bg-brand-gray-light"></div>
          <div className="flex flex-col justify-center leading-tight">
            <span className="text-[9px] text-brand-gray font-bold uppercase tracking-wider mb-[2px]">Rol</span>
            <span className="text-brand-dark font-black uppercase">{user?.rol || "N/A"}</span>
          </div>
        </Link>

        {/* Notifications Block */}
        <Link 
          to="/admin/notificaciones" 
          className="flex items-center gap-3 h-[46px] rounded-lg border border-brand-gray-light bg-white px-4 text-[11px] whitespace-nowrap hover:bg-brand-gray-light/30 hover:border-brand-gray transition-all cursor-pointer select-none"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded bg-brand-gray-light/30 text-brand-gray">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="flex flex-col justify-center leading-tight">
            <span className="text-[9px] text-brand-gray font-bold uppercase tracking-wider mb-[2px]">Avisos</span>
            <span className="text-brand-dark font-black">{conteos.total}</span>
          </div>
          <div className="w-px h-6 bg-brand-gray-light"></div>
          <div className="flex flex-col justify-center leading-tight">
            <span className="text-[9px] text-brand-gray font-bold uppercase tracking-wider mb-[2px]">Nuevos</span>
            <span className="text-primary-dark font-black">{conteos.sinLeer}</span>
          </div>
        </Link>

        {/* Admin Badge */}
        {isAdmin ? (
          <div className="flex items-center gap-3 h-[46px] rounded-lg border border-brand-gray-light bg-white px-4 text-[11px] whitespace-nowrap">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-brand-dark/10 text-brand-dark">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex flex-col justify-center leading-tight">
              <span className="text-[9px] text-brand-gray font-bold uppercase tracking-wider mb-[2px]">Permisos</span>
              <span className="text-brand-dark font-black tracking-widest text-[11px] uppercase">Administrador</span>
            </div>
          </div>
        ) : null}

        {/* Logout Button */}
        <button
          type="button"
          onClick={signout}
          className="group inline-flex items-center justify-center gap-2 h-[46px] rounded-xl bg-slate-800 px-5 text-[11px] font-black text-amber-400 border border-slate-700 hover:bg-slate-900 hover:text-amber-300 transition-all uppercase tracking-wider whitespace-nowrap"
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} className="transition-transform group-hover:-translate-x-1" />
          Salir
        </button>
      </div>
    </header>
  );
}
