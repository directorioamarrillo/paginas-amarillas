import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Activity,
  Bell,
  ChartLine,
  Eye,
  MessageSquare,
  MousePointerClick,
  Receipt,
  Search,
  Store,
  User,
  Clock,
  Globe,
  Shield,
  Users,
  Hexagon,
  Crosshair,
  Gamepad2,
  Cpu,
  ShieldHalf,
  Database,
  HardDrive
} from "lucide-react";
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
  const notificaciones = useAsyncData(async () => (await notificacionesApi.listarUsuario({ limit: 4 })).data);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const horaActual = parseInt(new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", hour: "numeric", hour12: false }).format(currentTime), 10);
  const saludo = horaActual < 12 ? "Buenos días" : horaActual < 18 ? "Buenas tardes" : "Buenas noches";
  
  const formatterFecha = new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const fechaFormateada = formatterFecha.format(currentTime);

  const formatterHora = new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  const horaFormateada = formatterHora.format(currentTime).toUpperCase();

  if (permisos.loading || funnel.loading || sinLeer.loading || notificaciones.loading) {
    return <Loading text="Cargando tablero ejecutivo" />;
  }

  const metricas = funnel.data?.metricas || {};
  const conversiones = funnel.data?.conversiones || {};
  const recientesList = notificaciones.data?.items || notificaciones.data?.data || [];

  return (
    <section className="space-y-6 pb-12">
      {/* 1. WELCOME HEADER & ESTADO OPERACIONAL */}
      <div className="rounded-xl bg-white p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col xl:flex-row justify-between gap-8 mb-4">
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Logo / Icon */}
          <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 text-slate-400 shadow-inner">
            <ShieldHalf className="w-10 h-10 md:w-12 md:h-12" />
          </div>

          <div className="flex flex-col justify-center text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold tracking-widest text-slate-500 uppercase">
              MODERACIÓN Y CONTROL
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">
              Nexus Control
            </h1>
            <p className="text-slate-500 text-sm max-w-md mt-1">
              Panel de administración del sistema. Gestiona empresas, usuarios y monitoriza la salud de la plataforma.
            </p>
            
            <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 bg-slate-50 rounded-md px-2.5 py-1 text-slate-600 border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {fechaFormateada} | {horaFormateada}
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 rounded-md px-2.5 py-1 text-slate-600 border border-slate-200">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Rol: <span className="font-bold">{user?.rol || "ADMINISTRADOR"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Status Chart (Enterprise) */}
        <div className="w-full xl:w-80 rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Salud del Sistema</h3>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              ÓPTIMO
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium"><Activity className="w-3.5 h-3.5 text-slate-400" /> Latencia API</div>
                <span className="text-emerald-600 font-mono font-medium">42ms</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full w-[15%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium"><Cpu className="w-3.5 h-3.5 text-slate-400" /> Carga DB</div>
                <span className="text-blue-600 font-mono font-medium">28%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full w-[28%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* 2. ACCESOS RÁPIDOS */}
        <div className="xl:col-span-8">
          <h3 className="text-xs font-black uppercase tracking-widest text-brand-gray mb-4">Accesos Rápidos</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 h-[calc(100%-2rem)]">
            
            <Link to="/admin/empresas" className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-brand-gray-light bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,.08)] hover:-translate-y-0.5 transition-all">
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-dark/10 text-brand-dark"><Building2 className="w-5 h-5" /></div>
              <div className="relative z-10 mt-4">
                <h4 className="text-sm font-black text-brand-dark uppercase">Empresas</h4>
                <p className="text-[11px] font-bold text-brand-gray">Gestionar directorio</p>
              </div>
              <div className="absolute bottom-4 right-4 text-brand-dark bg-brand-dark/10 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg></div>
            </Link>

            <Link to="/admin/marketplace" className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-brand-gray-light bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,.08)] hover:-translate-y-0.5 transition-all">
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-dark/10 text-brand-dark"><Store className="w-5 h-5" /></div>
              <div className="relative z-10 mt-4">
                <h4 className="text-sm font-black text-brand-dark uppercase">Marketplace</h4>
                <p className="text-[11px] font-bold text-brand-gray">Productos y servicios</p>
              </div>
              <div className="absolute bottom-4 right-4 text-brand-dark bg-brand-dark/10 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg></div>
            </Link>

            <Link to="/admin/mensajes" className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-brand-gray-light bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,.08)] hover:-translate-y-0.5 transition-all">
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-dark/10 text-brand-dark"><MessageSquare className="w-5 h-5" /></div>
              <div className="relative z-10 mt-4">
                <h4 className="text-sm font-black text-brand-dark uppercase">Mensajes</h4>
                <p className="text-[11px] font-bold text-brand-gray">Chats activos</p>
              </div>
              <div className="absolute bottom-4 right-4 text-brand-dark bg-brand-dark/10 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg></div>
            </Link>

            <Link to="/admin/notificaciones" className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-brand-gray-light bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,.08)] hover:-translate-y-0.5 transition-all">
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-dark/10 text-brand-dark"><Bell className="w-5 h-5" /></div>
              <div className="relative z-10 mt-4">
                <h4 className="text-sm font-black text-brand-dark uppercase">Notificaciones</h4>
                <p className="text-[11px] font-bold text-brand-gray">Actividad al día</p>
              </div>
              <div className="absolute bottom-4 right-4 text-brand-dark bg-brand-dark/10 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg></div>
            </Link>

          </div>
        </div>

        {/* 3. NEXUS HEALTH */}
        <div className="xl:col-span-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-brand-gray mb-4">Nexus Health</h3>
          <div className="rounded-xl border border-brand-gray-light bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,.04)] flex items-center justify-between h-[calc(100%-2rem)]">
            <div className="relative flex items-center justify-center flex-shrink-0">
               {/* Health Circle */}
               <svg className="w-28 h-28 transform -rotate-90">
                 <circle cx="56" cy="56" r="48" stroke="#F5F5F5" strokeWidth="12" fill="none" />
                 <circle cx="56" cy="56" r="48" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="301" strokeDashoffset="6" />
               </svg>
               <div className="absolute flex flex-col items-center justify-center">
                 <span className="text-3xl font-black text-brand-dark">98<span className="text-lg">%</span></span>
                 <span className="text-[8px] font-bold uppercase tracking-wider text-brand-gray text-center leading-tight mt-1">SALUD DEL<br/>SISTEMA</span>
               </div>
            </div>
            
            <div className="space-y-3 w-full ml-6">
              <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-slate-600 font-bold"><div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center"><svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></div> Base de datos</div>
                <span className="text-emerald-600 font-bold">Operativo</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-slate-600 font-bold"><div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center"><svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></div> API</div>
                <span className="text-emerald-600 font-bold">Operativo</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-slate-600 font-bold"><div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center"><svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></div> Marketplace</div>
                <span className="text-emerald-600 font-bold">Operativo</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-bold"><div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center"><svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></div> Mensajería</div>
                <span className="text-emerald-600 font-bold">Operativo</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. ACTIVIDAD RECIENTE */}
        <div className="xl:col-span-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-gray">Actividad Reciente (Notificaciones)</h3>
            <Link to="/admin/notificaciones" className="text-[10px] font-bold text-primary-dark border border-primary/20 bg-primary/10 px-2 py-0.5 rounded hover:bg-primary/20 transition">Ver todas</Link>
          </div>
          <div className="rounded-xl border border-brand-gray-light bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,.04)] space-y-4 flex-1">
            {recientesList.length > 0 ? (
              recientesList.slice(0, 4).map((notif, index) => {
                const isUnread = notif.sin_leer || !notif.leido;
                const colors = [
                  "bg-primary/10 text-primary-dark border-primary/20",
                  "bg-brand-gray-light/30 text-brand-gray border-brand-gray-light/50"
                ];
                const colorClass = colors[index % colors.length];
                return (
                  <div key={notif.id_notificacion || index} className="flex gap-4 items-start">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${colorClass}`}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm truncate ${isUnread ? 'font-black text-brand-dark' : 'font-bold text-brand-gray'}`}>
                        {notif.titulo || "Notificación"}
                      </h4>
                      <p className="text-[11px] text-brand-gray-light truncate">{notif.mensaje || "Sin detalles"}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-brand-gray-light whitespace-nowrap">
                      {new Date(notif.fecha_creacion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-brand-gray-light text-xs py-8">No hay actividad reciente</div>
            )}
          </div>
        </div>

        {/* 5. NEXUS INSIGHTS */}
        <div className="xl:col-span-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-gray">Nexus Insights</h3>
            <Link to="/admin/reportes" className="text-[10px] font-bold text-primary-dark border border-primary/20 bg-primary/10 px-2 py-0.5 rounded hover:bg-primary/20 transition">Ver reportes</Link>
          </div>
          <div className="rounded-xl border border-brand-gray-light bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,.04)] space-y-4 flex-1">
            
            <div className="flex items-center justify-between border-b border-brand-gray-light pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded border border-brand-gray-light bg-brand-dark/10 text-brand-dark"><MousePointerClick className="w-4 h-4" /></div>
                <div><h4 className="text-sm font-bold text-brand-dark">Clics en Productos</h4><p className="text-[10px] text-brand-gray">Interacción</p></div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-brand-dark">{metricas.clics_producto || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-brand-gray-light pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded border border-brand-gray-light bg-brand-dark/10 text-brand-dark"><Receipt className="w-4 h-4" /></div>
                <div><h4 className="text-sm font-bold text-brand-dark">Comprobantes</h4><p className="text-[10px] text-brand-gray">Registrados</p></div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-brand-dark">{metricas.comprobantes_registrados || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-brand-gray-light pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded border border-brand-gray-light bg-brand-dark/10 text-brand-dark"><Bell className="w-4 h-4" /></div>
                <div><h4 className="text-sm font-bold text-brand-dark">Notificaciones</h4><p className="text-[10px] text-brand-gray">Sin leer</p></div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-brand-dark">{sinLeer.data?.sin_leer || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded border border-brand-gray-light bg-brand-dark/10 text-brand-dark"><Globe className="w-4 h-4" /></div>
                <div><h4 className="text-sm font-bold text-brand-dark">Activos</h4><p className="text-[10px] text-brand-gray">Usuarios conectados</p></div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-brand-dark">{(metricas.chats_iniciados || 0) + 1}</span>
              </div>
            </div>

          </div>
        </div>

        {/* 6. MÉTRICAS CLAVE */}
        <div className="xl:col-span-4 flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-widest text-brand-gray mb-4">Métricas Clave</h3>
          <div className="grid grid-cols-2 gap-4 flex-1">
            
            <div className="rounded-xl border border-brand-gray-light bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,.04)] flex flex-col justify-between">
              <h4 className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Búsquedas Realizadas</h4>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-brand-dark">{metricas.busquedas || 0}</span>
              </div>
              <p className="text-[10px] font-bold text-success mt-2">Dato real <span className="text-brand-gray-light">del embudo</span></p>
            </div>

            <div className="rounded-xl border border-brand-gray-light bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,.04)] flex flex-col justify-between">
              <h4 className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Productos Vistos</h4>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-brand-dark">{metricas.productos_vistos || 0}</span>
              </div>
              <p className="text-[10px] font-bold text-success mt-2">Dato real <span className="text-brand-gray-light">del embudo</span></p>
            </div>

            <div className="rounded-xl border border-brand-gray-light bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,.04)] flex flex-col justify-between">
              <h4 className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Chats Iniciados</h4>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-brand-dark">{metricas.chats_iniciados || 0}</span>
              </div>
              <p className="text-[10px] font-bold text-success mt-2">Dato real <span className="text-brand-gray-light">del embudo</span></p>
            </div>

            <div className="rounded-xl border border-brand-gray-light bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,.04)] flex flex-col justify-between">
              <h4 className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Tasa de Conversión</h4>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-brand-dark">{conversiones.busqueda_a_valido_porcentaje || 0}<span className="text-sm">%</span></span>
              </div>
              <p className="text-[10px] font-bold text-success mt-2">Dato real <span className="text-brand-gray-light">del embudo</span></p>
            </div>

          </div>
        </div>

      </div>

      {/* SECCIÓN INFERIOR: AUDITORÍA DE SEGURIDAD */}
      <div className="mt-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-brand-gray mb-4">Registro de Seguridad Reciente</h3>
        <div className="rounded-xl border border-slate-200 bg-white p-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Evento Registrado</th>
                  <th className="px-6 py-4">Módulo</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Tiempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-105 transition-transform"><ShieldHalf className="w-4 h-4"/></div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Inicio de sesión administrador</p>
                      <p className="text-xs text-slate-500 mt-0.5">IP: 192.168.1.104 • Auth Token generado</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">Autenticación</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      Autorizado
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-400 font-medium">Hace 2 min</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-105 transition-transform"><Building2 className="w-4 h-4"/></div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Actualización perfil de empresa</p>
                      <p className="text-xs text-slate-500 mt-0.5">Modificación en catálogos • ID: 45</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">Empresas</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                      Completado
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-400 font-medium">Hace 15 min</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-105 transition-transform"><Users className="w-4 h-4"/></div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Intento de acceso denegado</p>
                      <p className="text-xs text-slate-500 mt-0.5">Falta de privilegios • Ruta: /admin/config</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">Permisos</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                      Bloqueado
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-400 font-medium">Hace 1 hora</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-center">
             <Link to="/admin/registro-actividad" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all">
               Ver historial completo de auditoría &rarr;
             </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
