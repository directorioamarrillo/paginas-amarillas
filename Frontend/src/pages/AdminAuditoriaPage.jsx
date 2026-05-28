import React, { useEffect, useState } from "react";
import { auditApi, rolesApi } from "../services/api";
import { toast } from "react-toastify";
import { Line } from 'react-chartjs-2';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFileCsv,
  faFilePdf,
  faChartPie,
  faCalendarAlt,
  faFilter,
  faChevronLeft,
  faChevronRight,
  faXmark,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function AdminAuditoriaPage() {
  const badgeFor = (accion) => {
    if (!accion) return 'bg-slate-50 text-slate-500 border-slate-200';
    if (accion.includes('POST') || accion.includes('CREAR')) return 'bg-emerald-50 text-emerald-600 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
    if (accion.includes('PUT') || accion.includes('PATCH') || accion.includes('CAMBIO')) return 'bg-amber-50 text-amber-600 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
    if (accion.includes('DELETE') || accion.includes('DESACTIVAR')) return 'bg-rose-50 text-rose-600 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]';
    return 'bg-blue-50 text-blue-600 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
  }
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [rol, setRol] = useState("");
  const [accionFilter, setAccionFilter] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [rolesList, setRolesList] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    load();
    loadRoles();
  }, [skip, limit]);

  async function loadRoles(){
    try{
      const r = await rolesApi.list({});
      setRolesList(r.data || []);
    }catch(e){
      console.error(e);
    }
  }

  async function load() {
    setLoading(true);
    try {
      const params = { skip, limit, q };
      if (rol) params.rol = rol;
      if (accionFilter) params.accion = accionFilter;
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;
      const res = await auditApi.list(params);
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando auditoría");
    } finally {
      setLoading(false);
    }
  }

  const handleExport = async () => {
    try {
      const res = await auditApi.exportCsv({ q });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'auditoria.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      toast.error('Error exportando CSV');
    }
  };

  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [timeseries, setTimeseries] = useState([]);

  const handleReport = async () => {
    setLoadingReport(true);
    try {
      const params = {};
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;
      const res = await auditApi.reportSummary(params);
      setReport(res.data);
      // load timeseries
      const ts = await auditApi.reportTimeseries(params);
      setTimeseries(ts.data.timeseries || []);
    } catch (err) {
      console.error(err);
      toast.error('Error generando reporte');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSkip(0);
    load();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-widest drop-shadow-sm">
            REGISTRO <span className="text-amber-500">DE ACTIVIDAD</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold">Historial de auditoría y eventos de seguridad</p>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm backdrop-blur-md">
        <form onSubmit={handleSearch} className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 flex-1">
            {/* Role Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rol de Usuario</label>
              <select 
                value={rol} 
                onChange={(e) => setRol(e.target.value)} 
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition cursor-pointer"
              >
                <option value="" className="bg-white">Todos los roles</option>
                {rolesList.map(r => (<option key={r.id} value={r.nombre} className="bg-white">{r.nombre}</option>))}
              </select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Desde</label>
              <input 
                type="date" 
                value={fechaDesde} 
                onChange={(e) => setFechaDesde(e.target.value)} 
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition" 
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hasta</label>
              <input 
                type="date" 
                value={fechaHasta} 
                onChange={(e) => setFechaHasta(e.target.value)} 
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition" 
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end h-full">
              <button 
                type="submit" 
                className="w-full h-[46px] rounded-xl border border-slate-900 bg-slate-900 px-5 font-black text-amber-500 uppercase tracking-widest transition shadow-md hover:bg-slate-800 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 focus:ring-amber-500"
              >
                <FontAwesomeIcon icon={faSearch} />
                Buscar
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 shrink-0">
            <button 
              type="button" 
              className="rounded-xl border border-emerald-500/30 bg-emerald-50 px-5 h-[46px] text-sm font-bold text-emerald-500 hover:bg-emerald-100 transition shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2 uppercase tracking-wider"
              onClick={handleExport}
            >
              <FontAwesomeIcon icon={faFileCsv} />
              CSV
            </button>
            
            <button 
              type="button" 
              className="rounded-xl border border-rose-500/30 bg-rose-50 px-5 h-[46px] text-sm font-bold text-rose-500 hover:bg-rose-100 transition shadow-[0_0_10px_rgba(244,63,94,0.2)] hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center gap-2 uppercase tracking-wider"
              onClick={async () => {
                try {
                  const res = await auditApi.exportPdf({ q, rol, accion: accionFilter, fecha_desde: fechaDesde, fecha_hasta: fechaHasta });
                  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'auditoria.pdf';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                } catch (err) {
                  console.error(err);
                  toast.error('Error exportando PDF');
                }
              }}
            >
              <FontAwesomeIcon icon={faFilePdf} />
              PDF
            </button>

            <button 
              type="button" 
              className="rounded-xl border border-blue-500/30 bg-blue-50 px-5 h-[46px] text-sm font-bold text-blue-500 hover:bg-blue-100 transition shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center gap-2 uppercase tracking-wider"
              onClick={handleReport} 
              disabled={loadingReport}
            >
              <FontAwesomeIcon icon={faChartPie} />
              {loadingReport ? '...' : 'Reporte'}
            </button>
          </div>
        </form>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Cargando registros de sistema...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-1/4">Usuario</th>
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-1/4">Actividad</th>
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest w-1/4">Detalles</th>
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50 cursor-pointer transition duration-200" onClick={() => setSelected(it)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                          {it.nombre_usuario ? it.nombre_usuario.charAt(0) : '?'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{it.nombre_usuario}</span>
                          <span className="text-xs font-bold text-amber-600 capitalize">{it.rol_usuario}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex px-2 py-0.5 rounded-md font-bold border ${badgeFor(it.accion?.toUpperCase())} uppercase tracking-wider text-[10px]`}>
                          {it.accion}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col text-xs text-slate-500 gap-0.5">
                        {it.entidad_afectada ? <span className="font-medium text-slate-700">Entidad: {it.entidad_afectada} {it.entidad_id ? `#${it.entidad_id}` : ''}</span> : <span className="italic opacity-50">Sin entidad</span>}
                        {it.ip && <span className="font-mono text-[10px] text-slate-400">IP: {it.ip}</span>}
                        {it.estado_evento && <span className="font-bold text-slate-900">{it.estado_evento}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex flex-col text-xs text-slate-500 whitespace-nowrap items-end">
                        <span className="font-medium text-slate-900">{new Date(it.timestamp).toLocaleDateString()}</span>
                        <span>{new Date(it.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mostrando {items.length} de {total} registros</div>
        <div className="flex gap-3">
          <button 
            disabled={skip === 0} 
            className="px-5 py-2.5 text-xs font-black rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 uppercase tracking-widest transition disabled:opacity-30 disabled:pointer-events-none" 
            onClick={() => setSkip(Math.max(0, skip - limit))}
          >
            Anterior
          </button>
          <button 
            disabled={skip + limit >= total} 
            className="px-5 py-2.5 text-xs font-black rounded-xl border border-slate-900 bg-slate-900 hover:bg-slate-800 text-amber-500 uppercase tracking-widest shadow-md transition disabled:opacity-30 disabled:pointer-events-none" 
            onClick={() => setSkip(skip + limit)}
          >
            Siguiente
          </button>
        </div>
      </div>
      {/* Modal detalle simple */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 p-6 rounded-2xl w-11/12 max-w-2xl shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-white uppercase tracking-widest">Detalle Evento <span className="text-amber-500">#{selected.id}</span></h3>
              <button className="text-slate-400 hover:text-white transition" onClick={() => setSelected(null)}>
                <FontAwesomeIcon icon={faXmark} size="xl" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4 text-sm text-slate-300">
              <div className="bg-black/50 p-3 rounded-lg border border-slate-800"><strong className="text-amber-500 uppercase tracking-wider block mb-1">Usuario</strong> {selected.nombre_usuario} ({selected.rol_usuario})</div>
              <div className="bg-black/50 p-3 rounded-lg border border-slate-800"><strong className="text-amber-500 uppercase tracking-wider block mb-1">Acción</strong> {selected.accion}</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/50 p-3 rounded-lg border border-slate-800"><strong className="text-amber-500 uppercase tracking-wider block mb-1">Módulo</strong> {selected.modulo}</div>
                <div className="bg-black/50 p-3 rounded-lg border border-slate-800"><strong className="text-amber-500 uppercase tracking-wider block mb-1">IP</strong> {selected.ip}</div>
              </div>
              <div className="bg-black/50 p-3 rounded-lg border border-slate-800"><strong className="text-amber-500 uppercase tracking-wider block mb-1">Descripción</strong> <pre className="whitespace-pre-wrap font-mono text-xs">{selected.descripcion}</pre></div>
            </div>
          </div>
        </div>
      )}

      {/* Report modal */}
      {report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 p-6 rounded-2xl w-11/12 max-w-3xl shadow-[0_0_30px_rgba(245,158,11,0.2)] overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-white uppercase tracking-widest">Reporte <span className="text-amber-500">Resumen</span></h3>
              <button className="text-slate-400 hover:text-white transition" onClick={() => setReport(null)}>
                <FontAwesomeIcon icon={faXmark} size="xl" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-6 text-sm text-slate-300">
              <div className="bg-black/50 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-500 uppercase tracking-wider mb-3">Por módulo</h4>
                <table className="w-full text-left">
                  <thead><tr className="border-b border-slate-700"><th className="pb-2">Módulo</th><th className="pb-2">Conteo</th></tr></thead>
                  <tbody className="divide-y divide-slate-800">
                    {(report['módulos'] || []).map(r => (
                      <tr key={r.modulo}><td className="py-2">{r.modulo}</td><td className="py-2">{r.count}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-black/50 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-500 uppercase tracking-wider mb-3">Tendencia (diaria)</h4>
                {timeseries.length === 0 ? (
                  <div className="text-sm text-slate-500">No hay datos para el rango seleccionado.</div>
                ) : (
                  <div className="mt-2">
                    <Line
                      data={{
                        labels: timeseries.map(t => t.day),
                        datasets: [
                          {
                            label: 'Eventos',
                            data: timeseries.map(t => t.count),
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245,158,11,0.1)',
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                      }}
                      style={{ height: 200 }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
