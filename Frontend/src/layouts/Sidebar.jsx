import { NavLink, Link } from "react-router-dom";
import clsx from "clsx";
import {
  Activity,
  Building2,
  Tags,
  Store,
  Heart,
  Search,
  MessageSquare,
  Star,
  Receipt,
  PieChart,
  Megaphone,
  Bell,
  User,
  Radio,
  ClipboardList,
  Home,
  MessageCircle,
  LifeBuoy,
  BookOpen,
  Database,
  Archive,
  Hexagon,
  Globe,
} from "lucide-react";
import { usePermissions } from "../context/PermissionsContext";

const navItems = [
  // NAVEGACIÓN
  { to: "/", label: "Volver a la Web", icon: Globe, group: "Navegación" },

  // OPERACIÓN
  { to: "/admin", label: "Resumen", icon: Activity, group: "Operación" },
  { to: "/admin/empresas", label: "Empresas", icon: Building2, group: "Operación" },
  { to: "/admin/categorias", label: "Categorías", icon: Tags, anyPerms: ["crear_categorias", "modificar_categorias"], group: "Operación" },
  { to: "/admin/marketplace", label: "Marketplace", icon: Store, group: "Operación" },
  
  // COMUNICACIÓN
  { to: "/admin/mensajes", label: "Mensajes", icon: MessageSquare, group: "Comunicación" },
  { to: "/admin/chat", label: "Chat Marketplace", icon: MessageCircle, group: "Comunicación" },
  { to: "/admin/favoritos", label: "Favoritos", icon: Heart, group: "Comunicación" },
  { to: "/admin/reviews", label: "Reviews", icon: Star, group: "Comunicación" },
  
  // ANALÍTICAS
  { to: "/admin/reportes", label: "Reportes", icon: PieChart, anyPerms: ["ver_reportes"], group: "Analíticas" },
  { to: "/admin/comprobantes", label: "Comprobantes", icon: Receipt, group: "Analíticas" },
  { to: "/admin/busqueda", label: "Búsqueda", icon: Search, group: "Analíticas" },

  // SISTEMA
  { to: "/admin/publicidades", label: "Publicidades", icon: Megaphone, group: "Sistema" },
  { to: "/admin/admin-live", label: "Admin Live", icon: Radio, adminOnly: true, group: "Sistema" },
  { to: "/admin/notificaciones", label: "Notificaciones", icon: Bell, group: "Sistema" },
  { to: "/admin/tickets", label: "Soporte Técnico", icon: LifeBuoy, group: "Sistema" },
  { to: "/admin/recursos", label: "Recursos", icon: BookOpen, group: "Sistema" },
  { to: "/admin/perfil", label: "Mi perfil", icon: User, group: "Sistema" },
  
  // ADMIN ONLY
  { to: "/admin/roles", label: "Roles", icon: User, adminOnly: true, group: "Administración" },
  { to: "/admin/permisos", label: "Permisos", icon: Radio, adminOnly: true, group: "Administración" },
  { to: "/admin/usuarios", label: "Usuarios", icon: User, adminOnly: true, group: "Administración" },
  { to: "/admin/registro-actividad", label: "Registro de Actividad", icon: ClipboardList, adminOnly: true, group: "Administración" },
  { to: "/admin/backups", label: "Backups", icon: Database, adminOnly: true, group: "Administración" },
  { to: "/admin/papelera", label: "Archivo de Registros", icon: Archive, adminOnly: true, group: "Administración" },
];

export function Sidebar() {
  const { isAdmin, hasAnyPermissions, user } = usePermissions();

  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    if (item.anyPerms && !hasAnyPermissions(item.anyPerms)) {
      return false;
    }
    return true;
  });

  const groupedItems = visibleItems.reduce((acc, item) => {
    const group = item.group || "Otros";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <aside className="relative flex h-full w-[300px] flex-col bg-white border-r border-slate-200 p-6 lg:h-auto z-20 overflow-y-auto">
      
      {/* Header Logo */}
      <div className="relative z-10 flex flex-col items-center justify-center mb-8">
        <div className="w-16 h-16 mb-4 rounded-2xl bg-primary flex items-center justify-center relative group shadow-[0_4px_20px_rgba(244,181,30,0.3)]">
           <Hexagon className="w-10 h-10 text-[#1E1E1E] absolute opacity-20" />
           <span className="text-3xl font-black text-[#1E1E1E] relative z-10">N</span>
        </div>
        <h1 className="text-xl font-black text-slate-800 tracking-widest uppercase">
          NEXUS <span className="text-primary">CONTROL</span>
        </h1>
        <div className="mt-1 flex items-center justify-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">DIRECTORIO 2.0</p>
        </div>
        <div className="mt-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
          • v2.0.1 Enterprise
        </div>
      </div>

      <nav className="relative z-10 flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <div key={groupName} className="mb-6 last:mb-0 relative z-10">
            <h3 className="mb-2 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {groupName}
            </h3>
            <ul className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                            isActive
                              ? "bg-slate-100 text-slate-900 border-l-4 border-slate-800 font-bold"
                              : "text-slate-600 border-l-4 border-transparent hover:bg-slate-50 hover:text-slate-900",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon 
                            className={clsx(
                              "w-5 h-5 transition-transform duration-200",
                                isActive ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600"
                            )}
                          />
                          <span>{item.label}</span>
                          
                          {/* Simulated badge for some items */}
                          {item.label === "Mensajes" && (
                            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-brand-dark">
                              3
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Footer block */}
      <div className="relative z-10 mt-6 border-t border-slate-200 pt-6">
        <Link to="/admin/perfil" className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3 hover:bg-slate-100 transition cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-black text-slate-900 uppercase">
            {user?.nombre ? user.nombre.charAt(0) : "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">
              {user?.nombre || "Administrador"}
            </p>
            <p className="truncate text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
              {user?.rol || "SISTEMA"}
            </p>
          </div>
          <div className="flex h-2 w-2 rounded-full bg-success"></div>
        </Link>
      </div>
    </aside>
  );
}
