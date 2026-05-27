import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxArchive,
  faRotateLeft,
  faBuilding,
  faTags,
  faUser,
  faShield,
  faTriangleExclamation,
  faSpinner,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { categoriasApi, empresasApi, rolesApi, usuariosApi } from "../services/api";
import { useToast } from "../context/ToastContext";

const TABS = [
  { id: "usuarios",   label: "Usuarios",   icon: faUser,     color: "blue"   },
  { id: "empresas",   label: "Empresas",   icon: faBuilding, color: "amber"  },
  { id: "categorias", label: "Categorías", icon: faTags,     color: "violet" },
  { id: "roles",      label: "Roles",      icon: faShield,   color: "rose"   },
];

const COLOR_MAP = {
  blue:   { tab: "border-blue-500 text-blue-700 bg-blue-50",   badge: "bg-blue-100 text-blue-700",   btn: "bg-blue-600 hover:bg-blue-700"   },
  amber:  { tab: "border-amber-500 text-amber-700 bg-amber-50", badge: "bg-amber-100 text-amber-700", btn: "bg-amber-600 hover:bg-amber-700" },
  violet: { tab: "border-violet-500 text-violet-700 bg-violet-50", badge: "bg-violet-100 text-violet-700", btn: "bg-violet-600 hover:bg-violet-700" },
  rose:   { tab: "border-rose-500 text-rose-700 bg-rose-50",   badge: "bg-rose-100 text-rose-700",   btn: "bg-rose-600 hover:bg-rose-700"   },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function EmptyArchive({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-slate-300" />
      </div>
      <p className="text-sm font-semibold text-slate-500">Sin {label} eliminados</p>
      <p className="mt-1 text-xs text-slate-400">Los {label} que elimines aparecerán aquí.</p>
    </div>
  );
}

function RecordRow({ item, onRestore, restoring, type }) {
  const isRestoring = restoring === item.id;

  const getTitle = () => {
    if (type === "usuarios") return `${item.nombre || ""} ${item.apellido || ""}`.trim() || "Sin nombre";
    return item.nombre || "Sin nombre";
  };

  const getSubtitle = () => {
    if (type === "usuarios") return item.correo;
    if (type === "empresas") return item.correo || item.nit;
    if (type === "categorias") return item.descripcion || "Sin descripción";
    if (type === "roles") return item.descripcion || "Sin descripción";
    return null;
  };

  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm transition hover:border-slate-200 hover:shadow-md">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-800">{getTitle()}</p>
        {getSubtitle() && (
          <p className="mt-0.5 truncate text-xs text-slate-400">{getSubtitle()}</p>
        )}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-400" />
          <span>Eliminado el {formatDate(item.deleted_at)}</span>
        </div>
      </div>

      <button
        onClick={() => onRestore(item.id)}
        disabled={isRestoring}
        className="flex shrink-0 items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700 active:scale-95 disabled:opacity-60"
      >
        <FontAwesomeIcon
          icon={isRestoring ? faSpinner : faRotateLeft}
          className={isRestoring ? "animate-spin" : ""}
        />
        {isRestoring ? "Restaurando..." : "Restaurar"}
      </button>
    </div>
  );
}

export function ArchiveRegistrosPage() {
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState("usuarios");
  const [data, setData] = useState({ usuarios: [], empresas: [], categorias: [], roles: [] });
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, e, c, r] = await Promise.all([
        usuariosApi.list({ limit: 500 }),
        empresasApi.list({ limit: 500 }),
        categoriasApi.list({ limit: 500 }),
        rolesApi.list({ limit: 500 }),
      ]);

      setData({
        usuarios:   (u.data || []).filter((x) => x.deleted_at),
        empresas:   (e.data || []).filter((x) => x.deleted_at),
        categorias: (c.data || []).filter((x) => x.deleted_at),
        roles:      (r.data || []).filter((x) => x.deleted_at),
      });
    } catch (err) {
      pushToast({ title: "Error", message: "No se pudo cargar el archivo", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRestore = async (id) => {
    setRestoring(id);
    try {
      if (activeTab === "usuarios")   await usuariosApi.restore(id);
      if (activeTab === "empresas")   await empresasApi.restore(id);
      if (activeTab === "categorias") await categoriasApi.restore(id);
      if (activeTab === "roles")      await rolesApi.restore(id);

      pushToast({ title: "Registro restaurado", message: "El registro volvió a estar activo", type: "success" });
      await load();
    } catch (err) {
      pushToast({ title: "Error", message: err?.response?.data?.detail || "No se pudo restaurar", type: "error" });
    } finally {
      setRestoring(null);
    }
  };

  const totalEliminados = Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
  const currentItems = data[activeTab] || [];
  const currentTab = TABS.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
            <FontAwesomeIcon icon={faBoxArchive} className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Archivo de Registros Eliminados</h1>
            <p className="mt-1 text-sm text-slate-500">
              Aquí se almacenan todos los registros que han sido eliminados del sistema.
              Puedes restaurarlos en cualquier momento para devolverlos a su estado activo.
            </p>
          </div>
          {totalEliminados > 0 && (
            <div className="ml-auto shrink-0">
              <span className="inline-flex h-9 items-center gap-2 rounded-full bg-amber-100 px-4 text-sm font-bold text-amber-700">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                {totalEliminados} en total
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-0">
          {TABS.map((tab) => {
            const count = data[tab.id]?.length || 0;
            const colors = COLOR_MAP[tab.color];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-t-xl border-b-2 px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? `${colors.tab} border-current`
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="text-xs" />
                {tab.label}
                {count > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${isActive ? colors.badge : "bg-slate-200 text-slate-600"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-3xl" />
              <span className="ml-3 font-medium">Cargando archivo...</span>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <EmptyArchive label={currentTab?.label?.toLowerCase() || "registros"} />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {currentItems.length} {currentTab?.label?.toLowerCase()} eliminado{currentItems.length !== 1 ? "s" : ""}
              </p>
              {currentItems.map((item) => (
                <RecordRow
                  key={item.id}
                  item={item}
                  type={activeTab}
                  onRestore={handleRestore}
                  restoring={restoring}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
