import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faHeart, faRightFromBracket, faStore, faUser, faBuilding, faLifeRing, faShoppingBag, faShieldHalved, faTicket, faBell, faMapMarkerAlt, faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faInstagram, faWhatsapp, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useAsyncData } from "../hooks/useAsyncData";
import { favoritosApi, empresasApi, notificacionesApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { buildNotificationsSocketUrl } from "../utils/ws";
import { useWebSocketBackoff } from "../hooks/useWebSocketBackoff";
import { faCheck, faTrash } from "@fortawesome/free-solid-svg-icons";

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/empresas", label: "Directorio" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/categorias", label: "Categorías" },
  { to: "/blog", label: "Blog" },
];

function UserMenu() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const favoritosCount = useAsyncData(async () => {
    try {
      const { data } = await favoritosApi.contar();
      return data.cantidad || 0;
    } catch {
      return 0;
    }
  });

  const misEmpresas = useAsyncData(async () => {
    try {
      const { data } = await empresasApi.misEmpresas({ limit: 1 });
      return data || [];
    } catch {
      return [];
    }
  });

  const handleSignout = () => {
    signout();
    navigate("/");
  };

  const isAdmin = user?.rol === "admin" && user?.permisos?.includes("modificar_roles");
  const isCreator = misEmpresas.data && misEmpresas.data.length > 0;
  const hasEmpresa = Boolean(user?.id_empresa) || isCreator;

  return (
    <div className="flex items-center gap-2">
      {/* Favoritos */}
      <Link
        to="/favoritos"
        className="relative rounded-xl bg-brand-gray-light/10 px-3 py-2 text-sm font-semibold transition hover:bg-brand-gray-light/20 flex items-center justify-center border border-transparent hover:border-brand-gray-light"
      >
        <FontAwesomeIcon icon={faHeart} className="text-danger animate-pulse" size="lg" />
        {favoritosCount.data > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white shadow-sm">
            {favoritosCount.data}
          </span>
        )}
      </Link>

      {/* User Menu */}
      <div className="relative group">
        <button className="flex items-center gap-3 rounded-full bg-white border border-brand-gray-light p-1.5 pl-4 transition hover:border-primary hover:shadow-md">
          <FontAwesomeIcon icon={faBars} className="text-brand-gray text-sm" />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-brand-dark font-black text-sm">
            <FontAwesomeIcon icon={faUser} />
          </div>
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-brand-gray-light bg-white py-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          {/* User Info */}
          <div className="px-4 py-2 border-b border-brand-gray-light">
            <p className="text-sm font-semibold text-brand-dark">{user?.nombre} {user?.apellido}</p>
            <p className="text-xs text-brand-gray capitalize">{user?.rol}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/mi-perfil"
              className="flex items-center gap-3 px-4 py-2 text-sm text-brand-gray hover:bg-brand-gray-light/20 transition"
            >
              <FontAwesomeIcon icon={faUser} className="w-4" />
              Mi Perfil
            </Link>
            <Link
              to="/favoritos"
              className="flex items-center gap-3 px-4 py-2 text-sm text-brand-gray hover:bg-brand-gray-light/20 transition"
            >
              <FontAwesomeIcon icon={faHeart} className="w-4" />
              Mis Favoritos
              {favoritosCount.data > 0 && (
                <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                  {favoritosCount.data}
                </span>
              )}
            </Link>
            <Link
              to="/mis-tickets"
              className="flex items-center gap-3 px-4 py-2 text-sm text-brand-gray hover:bg-brand-gray-light/20 transition"
            >
              <FontAwesomeIcon icon={faTicket} className="w-4" />
              Mis Tickets
            </Link>
          </div>
          
          {/* Admin / Empresa / Nexus Control */}
          <div className="py-2 border-t border-brand-gray-light">
            {isAdmin ? (
              <Link
                to="/admin"
                className="flex items-center gap-3 px-4 py-2 text-sm text-brand-gray hover:bg-brand-gray-light/20 transition"
              >
                <FontAwesomeIcon icon={faShieldHalved} className="w-4" />
                Nexus Control
              </Link>
            ) : null}
            {!isAdmin && hasEmpresa ? (
              <Link
                to="/empresas-panel"
                className="flex items-center gap-3 px-4 py-2 text-sm text-brand-gray hover:bg-brand-gray-light/20 transition"
              >
                <FontAwesomeIcon icon={faBuilding} className="w-4" />
                Panel Empresa
                {isCreator && (
                  <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">
                    {misEmpresas.data?.length || 0}
                  </span>
                )}
              </Link>
            ) : !isAdmin && !hasEmpresa ? (
              <Link
                to="/empresas-panel"
                className="flex items-center gap-3 px-4 py-2 text-sm text-brand-gray hover:bg-brand-gray-light/20 transition"
              >
                <FontAwesomeIcon icon={faBuilding} className="w-4" />
                Registrar mi negocio
              </Link>
            ) : null}
          </div>

          {/* Logout */}
          <div className="border-t border-brand-gray-light pt-2">
            <button
              onClick={handleSignout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicShell() {
  const { isAuthenticated, user } = useAuth();
  const { pushToast } = useToast();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isAdmin = user?.rol === "admin" && user?.permisos?.includes("modificar_roles");
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
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
  }, [isAuthenticated]);

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

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-brand-gray-light bg-white/90 sticky top-0 z-[100] backdrop-blur-md shadow-sm">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="group flex items-center gap-3">
              <img 
                src="/logo.svg" 
                alt="Directorio 2.0" 
                className="h-[52px] w-auto shrink-0 transition-transform duration-300 group-hover:scale-105" 
              />
              
              {/* Text Content */}
              <div className="flex flex-col justify-center">
                <div className="flex items-baseline gap-1.5">
                  <h1 className="text-[22px] font-black text-brand-dark tracking-tight leading-none uppercase">
                    Directorio
                  </h1>
                  <span className="rounded-md bg-brand-dark px-1.5 py-0.5 text-[10px] font-black text-primary leading-none uppercase tracking-wider">
                    2.0
                  </span>
                </div>
                <p className="mt-1.5 text-[8px] font-bold tracking-[0.2em] text-brand-gray uppercase leading-none">
                  Comercial & Marketplace
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    "rounded-full px-4 py-2 text-[13px] font-bold transition-colors duration-200",
                    isActive && item.to === "/"
                      ? "text-primary-dark bg-primary/10"
                      : isActive
                      ? "text-brand-dark bg-brand-gray-light/20"
                      : "text-brand-gray hover:text-brand-dark hover:bg-brand-gray-light/10"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            
            {/* Notification Bell Dropdown */}
            <div className="relative flex items-center" ref={dropdownRef}>
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setShowNotifications((prev) => !prev);
                  } else {
                    navigate("/login");
                  }
                }}
                className="relative text-brand-gray hover:text-primary transition-colors duration-200 flex items-center justify-center p-2 rounded-full hover:bg-slate-100/80"
                title="Notificaciones"
              >
                <FontAwesomeIcon 
                  icon={faBell} 
                  size="lg" 
                  className={clsx(
                    "transition-colors duration-200", 
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
                <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-brand-gray-light bg-white p-4 shadow-xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-brand-gray-light pb-2.5 mb-2.5">
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

                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
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
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 bg-white shadow-md rounded-lg p-0.5 border border-brand-gray-light">
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

                  {isAdmin && (
                    <div className="border-t border-brand-gray-light pt-2.5 mt-2.5 text-center">
                      <Link
                        to="/admin/notificaciones"
                        onClick={() => setShowNotifications(false)}
                        className="inline-block text-[10px] font-black text-brand-dark hover:text-primary transition-colors uppercase tracking-widest"
                      >
                        Ver panel general →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="pl-1">
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 rounded-xl bg-white border border-brand-gray-light px-4 py-2 text-sm font-bold text-[#1E1E1E] hover:text-primary-dark uppercase tracking-wide transition-colors hover:border-primary"
                >
                  <FontAwesomeIcon icon={faUser} />
                  <span className="hidden sm:inline">Iniciar</span>
                </Link>
              )}
            </div>

            <Link
              to="/empresas-panel"
              className="hidden md:flex items-center gap-2 rounded-xl bg-primary border border-primary px-5 py-2.5 text-[13px] font-black text-[#1E1E1E] hover:text-[#1E1E1E] uppercase tracking-wide transition-all hover:bg-primary-dark shadow-sm"
            >
              + Registrar Negocio
            </Link>
          </div>
        </div>
      </header>

      <main className={isHomePage ? "w-full" : "mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6"}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white text-brand-gray py-12 border-t border-brand-gray-light/50">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link to="/" className="group flex items-center gap-3 mb-6">
                <img 
                  src="/logo.svg" 
                  alt="Directorio 2.0" 
                  className="h-[56px] w-auto shrink-0 transition-transform duration-300 group-hover:scale-105" 
                />
                <div className="flex flex-col justify-center">
                  <div className="flex items-baseline gap-1.5">
                    <h1 className="text-[20px] font-black text-brand-dark tracking-tight leading-none uppercase">
                      Directorio
                    </h1>
                    <span className="rounded-md bg-brand-dark px-1.5 py-0.5 text-[9px] font-black text-primary leading-none uppercase tracking-wider">
                      2.0
                    </span>
                  </div>
                  <p className="mt-1.5 text-[8px] font-bold tracking-[0.2em] text-brand-gray uppercase leading-none">
                    Comercial & Marketplace
                  </p>
                </div>
              </Link>
              <p className="text-[11px] text-brand-gray mb-6 pr-4">
                Conectamos negocios con clientes. Encuentra, compara y alquila mejor, para ti.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-brand-gray hover:text-primary transition-colors">
                  <FontAwesomeIcon icon={faFacebook} size="lg" />
                </a>
                <a href="#" className="text-brand-gray hover:text-primary transition-colors">
                  <FontAwesomeIcon icon={faInstagram} size="lg" />
                </a>
                <a href="#" className="text-brand-gray hover:text-primary transition-colors">
                  <FontAwesomeIcon icon={faWhatsapp} size="lg" />
                </a>
                <a href="#" className="text-brand-gray hover:text-primary transition-colors">
                  <FontAwesomeIcon icon={faYoutube} size="lg" />
                </a>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h3 className="text-brand-dark font-bold text-sm mb-4">Navegación</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-primary transition-colors">Inicio</Link></li>
                <li><Link to="/empresas" className="hover:text-primary transition-colors">Directorio</Link></li>
                <li><Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link></li>
                <li><Link to="/categorias" className="hover:text-primary transition-colors">Categorías</Link></li>
                <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-brand-dark font-bold text-sm mb-4">Recursos</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="/planes" className="hover:text-primary transition-colors">Plantillas</Link></li>
                <li><Link to="/publicidad" className="hover:text-primary transition-colors">Checklists</Link></li>
                <li><Link to="/ayuda" className="hover:text-primary transition-colors">Webinars</Link></li>
                <li><Link to="/ayuda" className="hover:text-primary transition-colors">Centro de ayuda</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-brand-dark font-bold text-sm mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/quienes-somos" className="hover:text-primary transition-colors">Quiénes somos</Link></li>
                <li><Link to="/terminos" className="hover:text-primary transition-colors">Términos y condiciones</Link></li>
                <li><Link to="/privacidad" className="hover:text-primary transition-colors">Política de privacidad</Link></li>
                <li><Link to="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
              </ul>
            </div>

            {/* Right Column */}
            <div>
              <h3 className="text-brand-dark font-bold text-sm mb-4">¿Tienes un negocio?</h3>
              <p className="text-[13px] text-brand-gray mb-6">
                Regístrate, publica y llega a más clientes hoy mismo.
              </p>
              <Link to="/empresas-panel" className="inline-block w-full text-center rounded-xl bg-primary border border-primary px-5 py-2.5 text-sm font-black text-[#1E1E1E] hover:bg-primary-dark transition-colors shadow-sm">
                + Registrar negocio
              </Link>
            </div>

          </div>
          
          <div className="border-t border-brand-gray-light/50 pt-8 flex items-center justify-center text-xs text-brand-gray-light">
            <p>© 2026 Directorio 2.0. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
