import { NavLink, Link } from "react-router-dom";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faBuilding,
  faTags,
  faStore,
  faHeart,
  faMagnifyingGlass,
  faComments,
  faStar,
  faReceipt,
  faChartPie,
  faBullhorn,
  faBell,
  faUser,
  faTowerBroadcast,
  faClipboardList,
  faHouse,
  faMessage,
  faLifeRing,
  faDatabase,
  faBoxArchive,
} from "@fortawesome/free-solid-svg-icons";
import { usePermissions } from "../context/PermissionsContext";

const navItems = [
  { to: "/admin", label: "Resumen", icon: faChartLine },
  { to: "/admin/empresas", label: "Empresas", icon: faBuilding },
  { to: "/admin/categorias", label: "Categorías", icon: faTags, anyPerms: ["crear_categorias", "modificar_categorias"] },
  { to: "/admin/marketplace", label: "Marketplace", icon: faStore },
  { to: "/admin/favoritos", label: "Favoritos", icon: faHeart },
  { to: "/admin/busqueda", label: "Búsqueda", icon: faMagnifyingGlass },
  { to: "/admin/mensajes", label: "Mensajes", icon: faComments },
  { to: "/admin/reviews", label: "Reviews", icon: faStar },
  { to: "/admin/comprobantes", label: "Comprobantes", icon: faReceipt },
  { to: "/admin/reportes", label: "Reportes", icon: faChartPie, anyPerms: ["ver_reportes"] },
  { to: "/admin/publicidades", label: "Publicidades", icon: faBullhorn },
  { to: "/admin/admin-live", label: "Admin Live", icon: faTowerBroadcast, adminOnly: true },
  { to: "/admin/notificaciones", label: "Notificaciones", icon: faBell },
  { to: "/admin/roles", label: "Roles", icon: faUser, adminOnly: true },
  { to: "/admin/permisos", label: "Permisos", icon: faTowerBroadcast, adminOnly: true },
  { to: "/admin/usuarios", label: "Usuarios", icon: faUser, adminOnly: true },
  { to: "/admin/registro-actividad", label: "Registro de Actividad", icon: faClipboardList, adminOnly: true },
  { to: "/admin/chat", label: "Chat Marketplace", icon: faMessage },
  { to: "/admin/tickets", label: "Mesa de Ayuda", icon: faLifeRing },
  { to: "/admin/backups", label: "Backups", icon: faDatabase, adminOnly: true },
  { to: "/admin/papelera", label: "Archivo de Registros Eliminados", icon: faBoxArchive, adminOnly: true },
  { to: "/admin/perfil", label: "Mi perfil", icon: faUser },
];

export function Sidebar() {
  const { isAdmin, hasAnyPermissions } = usePermissions();

  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    if (item.anyPerms && !hasAnyPermissions(item.anyPerms)) {
      return false;
    }
    return true;
  });

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white/80 p-6 backdrop-blur-md lg:h-auto shadow-sm z-20">
      <h1 className="text-xl font-black text-slate-900 tracking-widest uppercase">
        Nexus <span className="text-amber-500">Control</span>
      </h1>
      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">Directorio 2.0</p>
      <nav className="mt-8 flex-1 space-y-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-widest transition-all duration-300 group",
                isActive
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-[inset_0_0_15px_rgba(245,158,11,0.15)] is-active"
                  : "text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-900",
              )
            }
          >
            {({ isActive }) => (
              <>
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className={isActive ? "text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" : ""} 
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Volver al Inicio */}
      <div className="mt-6 border-t border-amber-500/20 pt-6">
        <Link
          to="/"
          className="flex items-center justify-center gap-3 rounded-xl px-4 py-3.5 text-xs font-black uppercase tracking-widest text-black bg-amber-500 transition-all hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_20px_rgba(245,158,11,0.8)]"
        >
          <FontAwesomeIcon icon={faHouse} />
          <span>Volver al Inicio</span>
        </Link>
      </div>
    </aside>
  );
}
