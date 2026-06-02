import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { EmpresaSidebar } from "./EmpresaSidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser, faArrowRightFromBracket, faCheck, faTrash, faBuilding } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { notificacionesApi } from "../services/api";
import { buildNotificationsSocketUrl } from "../utils/ws";
import { useWebSocketBackoff } from "../hooks/useWebSocketBackoff";
import clsx from "clsx";

function EmpresaTopbar() {
  const { user, signout } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const [listRes, countRes] = await Promise.all([
        notificacionesApi.listarUsuario({ limit: 5 }),
        notificacionesApi.contar({ sin_leer: true })
      ]);
      setNotifications(listRes.data || []);
      setUnreadCount(countRes.data?.cantidad_sin_leer || 0);
    } catch (e) {
      // Ignore count/list errors to avoid UI noise
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const wsUrl = user?.id_usuario ? buildNotificationsSocketUrl(user.id_usuario) : null;

  useWebSocketBackoff({
    url: wsUrl,
    enabled: Boolean(wsUrl),
    onMessage: (event) => {
      try {
        const payload = JSON.parse(event.data);
        setNotifications((prev) => [payload, ...prev].slice(0, 5));
        setUnreadCount((prev) => prev + 1);
        pushToast({
          title: "Notificación nueva",
          message: payload.contenido || "Evento recibido",
          type: "success"
        });
      } catch (e) {
        console.error(e);
      }
    }
  });

  const marcarLeida = async (id) => {
    try {
      await notificacionesApi.marcarLeida(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      pushToast({ title: "Notificaciones", message: "Marcada como leída", type: "success" });
    } catch {
      pushToast({ title: "Error", message: "No se pudo marcar como leída", type: "error" });
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await notificacionesApi.marcarTodasLeidas();
      setNotifications((prev) => prev.map((n) => ({ ...n, leido: true })));
      setUnreadCount(0);
      pushToast({ title: "Notificaciones", message: "Todas marcadas como leídas", type: "success" });
    } catch {
      pushToast({ title: "Error", message: "No se pudo marcar todas como leídas", type: "error" });
    }
  };

  const eliminarNotificacion = async (id) => {
    try {
      await notificacionesApi.eliminar(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      fetchNotifications();
      pushToast({ title: "Notificaciones", message: "Notificación eliminada", type: "success" });
    } catch {
      pushToast({ title: "Error", message: "No se pudo eliminar la notificación", type: "error" });
    }
  };

  const handleSignout = () => {
    signout();
    navigate("/");
  };

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 md:px-8 py-4 xl:flex-row xl:items-center xl:justify-between z-30 relative shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded bg-brand-dark/10 text-brand-dark">
          <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 text-brand-dark" />
        </div>
        <h2 className="text-lg font-black text-brand-dark tracking-widest uppercase">
          Gestión de <span className="text-primary">Negocios</span>
        </h2>
      </div>

      <div className="flex items-center gap-4 mt-2 xl:mt-0 ml-auto xl:ml-0">
        {/* Notification Bell Dropdown */}
        <div className="relative flex items-center" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative text-brand-gray hover:text-brand-dark transition-colors duration-200 flex items-center justify-center p-2 rounded-full hover:bg-slate-100/80"
            title="Notificaciones"
          >
            <FontAwesomeIcon 
              icon={faBell} 
              className={clsx(
                "transition-colors duration-200 w-5 h-5 text-brand-dark", 
                unreadCount > 0 ? "text-amber-500" : "text-brand-gray hover:text-brand-dark"
              )} 
            />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-white shadow-sm border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Floating Dropdown Card */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-2.5">
                <h3 className="font-black text-brand-dark text-xs uppercase tracking-wider">Avisos</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={marcarTodasLeidas}
                    className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider"
                  >
                    Marcar leídas
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin text-left">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={clsx(
                        "group/item relative flex flex-col gap-1 p-2.5 rounded-xl border transition-all text-[11px]",
                        n.leido 
                          ? "bg-slate-50/50 border-slate-100 text-brand-gray" 
                          : "bg-amber-50/20 border-amber-100/50 text-brand-dark font-medium"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 pr-8">
                        <span className="leading-normal">{n.contenido}</span>
                        {!n.leido && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1" />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-brand-gray mt-1.5 font-bold uppercase tracking-wider">
                        <span>{n.tipo || "General"}</span>
                        <span>
                          {n.fecha_creacion ? new Date(n.fecha_creacion).toLocaleDateString() : ""}
                        </span>
                      </div>

                      {/* Action overlay */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 bg-white shadow-md rounded-lg p-0.5 border border-slate-200">
                        {!n.leido && (
                          <button
                            onClick={() => marcarLeida(n.id)}
                            className="p-1 text-emerald-600 hover:text-emerald-700 rounded transition-colors"
                            title="Marcar como leída"
                          >
                            <FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5" />
                          </button>
                        )}
                        <button
                          onClick={() => eliminarNotificacion(n.id)}
                          className="p-1 text-rose-500 hover:text-rose-600 rounded transition-colors"
                          title="Eliminar"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-brand-gray text-[11px]">
                    No tienes notificaciones pendientes
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Block */}
        <div className="flex items-center gap-3 h-[42px] rounded-lg border border-slate-200 bg-white px-4 text-[11px] whitespace-nowrap select-none">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-brand-dark/10 text-brand-dark">
            <FontAwesomeIcon icon={faUser} className="w-3 h-3 text-brand-dark" />
          </div>
          <div className="flex flex-col justify-center leading-tight">
            <span className="text-[9px] text-brand-gray font-bold uppercase tracking-wider mb-[2px]">Usuario</span>
            <span className="text-brand-dark font-black">{user?.nombre || user?.id_usuario || "-"}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleSignout}
          className="group inline-flex items-center justify-center gap-2 h-[42px] rounded-xl bg-slate-800 px-4 text-[11px] font-black text-amber-400 border border-slate-700 hover:bg-slate-900 hover:text-amber-300 transition-all uppercase tracking-wider whitespace-nowrap"
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} className="transition-transform group-hover:-translate-x-1" />
          Salir
        </button>
      </div>
    </header>
  );
}

export function EmpresaShell() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 lg:flex-row">
      <div className="w-full lg:w-auto lg:min-w-[280px]">
        <SidebarWrapper />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <EmpresaTopbar />
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Simple wrapper in case EmpresaSidebar needs structural layout
function SidebarWrapper() {
  return <EmpresaSidebar />;
}

