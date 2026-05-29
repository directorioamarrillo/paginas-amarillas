import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faRightFromBracket, faStore, faUser, faBuilding, faLifeRing, faShoppingBag, faShieldHalved, faTicket } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { useAsyncData } from "../hooks/useAsyncData";
import { favoritosApi, empresasApi } from "../services/api";



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
        className="relative rounded-xl bg-gray-400/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-400/20"
      >
        <FontAwesomeIcon icon={faHeart} color="red" size="xl" className="animate-pulse" />
        {favoritosCount.data > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {favoritosCount.data}
          </span>
        )}
      </Link>

      {/* User Menu */}
      <div className="relative group">
        <button className="flex items-center gap-2 rounded-xl bg-gray-400/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-400/20">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[#1F1F1F] font-bold text-sm">
            {user?.nombre?.[0] || "U"}
          </div>
          <span className="hidden md:inline text-sm text-neutral-200 group-hover:text-white">{user?.nombre || "Usuario"}</span>
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          {/* User Info */}
          <div className="px-4 py-2 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-900">{user?.nombre} {user?.apellido}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.rol}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/mi-perfil"
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
            >
              <FontAwesomeIcon icon={faUser} className="w-4" />
              Mi Perfil
            </Link>
            <Link
              to="/favoritos"
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
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
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
            >
              <FontAwesomeIcon icon={faTicket} className="w-4" />
              Mis Tickets
            </Link>
          </div>
          
          {/* Admin / Empresa / Nexus Control */}
          <div className="py-2 border-t border-slate-200">
            {isAdmin ? (
              <Link
                to="/admin"
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
              >
                <FontAwesomeIcon icon={faShieldHalved} className="w-4" />
                Nexus Control
              </Link>
            ) : null}
            {!isAdmin && hasEmpresa ? (
              <Link
                to="/empresas-panel"
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
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
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
              >
                <FontAwesomeIcon icon={faBuilding} className="w-4" />
                Registrar mi negocio
              </Link>
            ) : null}
          </div>

          {/* Logout */}
          <div className="border-t border-slate-200 pt-2">
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
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="border-b border-neutral-800 bg-[#212121] shadow-md">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
          <div>
            <Link to="/" className="group block">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary group-hover:text-primary-hover transition">Páginas Amarillas</p>
              <h1 className="text-lg font-bold text-white tracking-tight group-hover:text-neutral-200 transition">Catálogo Público</h1>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl bg-primary text-[#1F1F1F] hover:bg-primary-hover px-4 py-2 text-sm font-semibold transition shadow-sm"
                >
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}
