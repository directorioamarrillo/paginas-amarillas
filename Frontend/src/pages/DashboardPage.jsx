import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faChartLine,
  faEye,
  faMessage,
  faMousePointer,
  faReceipt,
  faSearch,
  faStore,
  faUser,
  faArrowUp,
  faArrowDown,
  faClock,
  faGlobe,
  faShield,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useAsyncData } from "../hooks/useAsyncData";
import { authApi, notificacionesApi, reportesApi } from "../services/api";
import { StatCard } from "../components/common/StatCard";
import { Loading } from "../components/common/Loading";
import { useAuth } from "../context/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();
  const permisos = useAsyncData(async () => (await authApi.mePermisos()).data);
  const funnel = useAsyncData(async () => (await reportesApi.funnel()).data);
  const sinLeer = useAsyncData(async () => (await notificacionesApi.contarSinLeer()).data);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const horaActual = currentTime.getHours();
  const saludo = horaActual < 12 ? "Buenos días" : horaActual < 18 ? "Buenas tardes" : "Buenas noches";
  
  const fechaFormateada = currentTime.toLocaleDateString("es-CO", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const horas = currentTime.getHours();
  const minutos = currentTime.getMinutes().toString().padStart(2, '0');
  const segundos = currentTime.getSeconds().toString().padStart(2, '0');
  const ampm = horas >= 12 ? 'PM' : 'AM';
  const horas12 = (horas % 12) || 12;
  const horaFormateada = `${horas12.toString().padStart(2, '0')}:${minutos}:${segundos} ${ampm}`;

  if (permisos.loading || funnel.loading || sinLeer.loading) {
    return <Loading text="Cargando tablero ejecutivo" />;
  }

  const metricas = funnel.data?.metricas || {};
  const conversiones = funnel.data?.conversiones || {};

  return (
    <section className="space-y-6">
      {/* Welcome Header: NEXUS CONTROL */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#2a2000] p-8 md:p-10 text-white shadow-[0_0_40px_rgba(255,193,7,0.15)] border border-amber-500/20">
        {/* Glowing effects */}
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-amber-500/10 blur-[80px]"></div>
        <div className="absolute top-1/2 -right-32 h-80 w-80 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[100px]"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
          
          {/* Left Icon: Shield/Globe */}
          <div className="relative flex h-40 w-40 shrink-0 items-center justify-center">
            
            {/* Intense Radar Ping Effect */}
            <div className="absolute inset-0 rounded-full border-[3px] border-amber-500/80 drop-shadow-[0_0_8px_#f59e0b] animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute inset-2 rounded-full border-2 border-amber-500/60 drop-shadow-[0_0_5px_#f59e0b] animate-[ping_3.5s_cubic-bezier(0,0,0.2,1)_infinite_1s]"></div>
            
            {/* Outer rings */}
            <div className="absolute inset-0 rounded-full border border-amber-500/20"></div>
            <div className="absolute inset-2 rounded-full border border-amber-500/30 border-dashed animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute inset-6 rounded-full border border-amber-500/20 animate-[spin_15s_linear_infinite_reverse]"></div>
            {/* Center Shield */}
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-b from-slate-900 to-black border-[3px] border-amber-500 shadow-[0_0_20px_#f59e0b,inset_0_0_15px_rgba(245,158,11,0.2)]">
              {/* Glow/Border behind the shield */}
              <FontAwesomeIcon icon={faShield} className="absolute text-7xl text-slate-900 drop-shadow-[0_0_8px_#f59e0b]" style={{ stroke: '#f59e0b', strokeWidth: '20px' }} />
              <FontAwesomeIcon icon={faGlobe} className="absolute text-[3.25rem] text-amber-500 drop-shadow-[0_0_10px_#f59e0b]" />
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold tracking-[0.2em] text-amber-500 uppercase">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
              Bienvenido a
            </div>
            
            <div className="mt-1 flex flex-wrap items-baseline gap-2 md:gap-4">
              <h1 className="text-5xl md:text-6xl font-black tracking-widest text-white drop-shadow-md leading-none">
                NEXUS
              </h1>
              <div className="flex items-center flex-1 min-w-[200px]">
                <div className="text-xl md:text-3xl font-bold tracking-[0.4em] text-amber-500 pt-2 whitespace-nowrap">
                  DE CONTROL
                </div>
                <div className="ml-4 h-[2px] flex-1 bg-gradient-to-r from-amber-500/50 to-transparent hidden md:block"></div>
              </div>
            </div>

            <div className="mt-6 border-t border-amber-500/20 pt-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                {saludo}, <span className="text-amber-400">{user?.nombre || "Usuario"}</span>
              </h2>
              
              <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-black/40 px-4 py-2 text-sm font-medium text-slate-300">
                  <FontAwesomeIcon icon={faClock} className="text-amber-500" />
                  <span className="capitalize">{fechaFormateada}</span> • <span className="inline-block min-w-[120px] text-center font-bold text-amber-400 tabular-nums whitespace-nowrap">{horaFormateada}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-black/40 px-4 py-2 text-sm font-medium text-slate-300">
                  <FontAwesomeIcon icon={faUser} className="text-amber-500" />
                  Rol: <span className="capitalize text-amber-400">{user?.rol || "usuario"}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-black/40 px-4 py-2 text-sm font-medium text-slate-300">
                  <FontAwesomeIcon icon={faUsers} className="text-amber-500" />
                  {user?.permisos?.length || 0} permisos activos
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Quick Links (Moved up for better order) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Accesos Rápidos</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/admin/empresas"
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:brightness-105"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 border-2 border-blue-500 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.6)] transition-all group-hover:shadow-[0_0_20px_rgba(59,130,246,0.8)]">
              <FontAwesomeIcon icon={faStore} size="lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Empresas</p>
              <p className="text-xs text-slate-600">Gestionar directorio</p>
            </div>
          </Link>

          <Link
            to="/admin/marketplace"
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-r from-green-50 to-green-100 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:brightness-105"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 border-2 border-green-500 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.6)] transition-all group-hover:shadow-[0_0_20px_rgba(34,197,94,0.8)]">
              <FontAwesomeIcon icon={faChartLine} size="lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Marketplace</p>
              <p className="text-xs text-slate-600">Productos</p>
            </div>
          </Link>

          <Link
            to="/admin/mensajes"
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-r from-purple-50 to-purple-100 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:brightness-105"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 border-2 border-purple-500 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.6)] transition-all group-hover:shadow-[0_0_20px_rgba(168,85,247,0.8)]">
              <FontAwesomeIcon icon={faMessage} size="lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Mensajes</p>
              <p className="text-xs text-slate-600">Chats activos</p>
            </div>
          </Link>

          <Link
            to="/admin/notificaciones"
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:brightness-105"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 border-2 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)] transition-all group-hover:shadow-[0_0_20px_rgba(245,158,11,0.8)]">
              <FontAwesomeIcon icon={faBell} size="lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Notificaciones</p>
              <p className="text-xs text-slate-600">
                {sinLeer.data?.sin_leer > 0 ? `${sinLeer.data.sin_leer} nuevas` : "Al día"}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Stats */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Métricas Clave</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Notificaciones sin leer"
            value={sinLeer.data?.sin_leer || 0}
            icon={faBell}
            color="warning"
            trend={sinLeer.data?.sin_leer > 0 ? "down" : "up"}
            hint={sinLeer.data?.sin_leer > 0 ? "Tienes mensajes pendientes" : "Todo al día"}
          />
          <StatCard
            title="Búsquedas realizadas"
            value={metricas.busquedas || 0}
            icon={faSearch}
            color="info"
            hint="Total de búsquedas"
          />
          <StatCard
            title="Chats iniciados"
            value={metricas.chats_iniciados || 0}
            icon={faMessage}
            color="purple"
            hint="Conversaciones activas"
          />
          <StatCard
            title="Tasa de conversión"
            value={`${conversiones.busqueda_a_valido_porcentaje || 0}%`}
            icon={faChartLine}
            color={Number(conversiones.busqueda_a_valido_porcentaje) > 50 ? "success" : "danger"}
            trend={Number(conversiones.busqueda_a_valido_porcentaje) > 50 ? "up" : "down"}
            hint="De búsqueda a venta válida"
          />
        </div>
      </div>

      {/* Funnel Metrics */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Funnel de Conversión</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Productos vistos"
            value={metricas.productos_vistos || 0}
            icon={faEye}
            color="primary"
            hint="Vistas de producto"
          />
          <StatCard
            title="Clics en productos"
            value={metricas.clics_producto || 0}
            icon={faMousePointer}
            color="info"
            hint="Interacción con productos"
          />
          <StatCard
            title="Comprobantes"
            value={metricas.comprobantes_registrados || 0}
            icon={faReceipt}
            color="warning"
            hint="Pagos registrados"
          />
          <StatCard
            title="Empresas activas"
            value="-"
            icon={faStore}
            color="success"
            hint="Próximamente"
          />
        </div>
      </div>


      {/* User Permissions */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FontAwesomeIcon icon={faUser} className="text-primary-500" />
          Tus Permisos
        </h3>
        <div className="flex flex-wrap gap-2">
          {(permisos.data?.permisos || []).map((permiso) => (
            <span
              key={permiso}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-100 to-primary-50 px-4 py-2 text-xs font-semibold text-primary-700 shadow-sm transition hover:shadow-md"
            >
              <div className="h-2 w-2 rounded-full bg-primary-500"></div>
              {permiso.replace(/_/g, " ")}
            </span>
          ))}
          {(permisos.data?.permisos || []).length === 0 && (
            <p className="text-sm text-slate-500">No tienes permisos especiales asignados</p>
          )}
        </div>
      </article>
    </section>
  );
}
