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
    if (!accion) return 'bg-gray-200';
    if (accion.includes('POST')) return 'bg-green-100 text-green-800';
    if (accion.includes('PUT') || accion.includes('PATCH')) return 'bg-yellow-100 text-yellow-800';
    if (accion.includes('DELETE')) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
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
          <h2 className="text-2xl font-extrabold text-[#1F1F1F] tracking-tight">Registro de Actividad</h2>
          <p className="text-sm text-slate-500 mt-1">Historial de auditoría y eventos de seguridad en el sistema (solo lectura)</p>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 flex-1">
            {/* Role Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Rol de Usuario</label>
              <select 
                value={rol} 
                onChange={(e) => setRol(e.target.value)} 
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition cursor-pointer"
              >
                <option value="">Todos los roles</option>
                {rolesList.map(r => (<option key={r.id} value={r.nombre}>{r.nombre}</option>))}
              </select>
            </div>

            {/* Date From */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Fecha Desde</label>
              <input 
                type="date" 
                value={fechaDesde} 
                onChange={(e) => setFechaDesde(e.target.value)} 
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition" 
              />
            </div>

            {/* Date To */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Fecha Hasta</label>
              <input 
                type="date" 
                value={fechaHasta} 
                onChange={(e) => setFechaHasta(e.target.value)} 
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition" 
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button 
                type="submit" 
                className="w-full rounded-xl bg-primary hover:bg-primary-hover px-5 py-2.5 font-bold text-[#1F1F1F] transition shadow-sm flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faSearch} />
                Buscar
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2 lg:pt-0 shrink-0">
            <button 
              type="button" 
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
              onClick={handleExport}
            >
              <FontAwesomeIcon icon={faFileCsv} className="text-emerald-500" />
              Exportar CSV
            </button>
            
            <button 
              type="button" 
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
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
              <FontAwesomeIcon icon={faFilePdf} className="text-red-500" />
              Exportar PDF
            </button>

            <button 
              type="button" 
              className="rounded-xl bg-[#212121] px-4 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 transition shadow-sm flex items-center gap-2"
              onClick={handleReport} 
              disabled={loadingReport}
            >
              <FontAwesomeIcon icon={faChartPie} className="text-primary" />
              {loadingReport ? 'Generando...' : 'Reporte Resumen'}
            </button>
          </div>
        </form>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm font-medium text-slate-500">Cargando registros de auditoría...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Acción</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Módulo</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Entidad</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">IP</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50/50 cursor-pointer transition duration-150" onClick={() => setSelected(it)}>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-600 whitespace-nowrap">{new Date(it.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-900">{it.nombre_usuario}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 capitalize">{it.rol_usuario}</td>
                    <td className="px-4 py-3.5 text-xs font-mono text-slate-500">{it.accion}</td>
                    <td className="px-4 py-3.5 text-xs">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg font-semibold ${badgeFor(it.accion)}`}>
                        {it.accion}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-600">{it.entidad_afectada} {it.entidad_id ? `#${it.entidad_id}` : ''}</td>
                    <td className="px-4 py-3.5 text-xs font-mono text-slate-500">{it.ip}</td>
                    <td className="px-4 py-3.5 text-xs font-bold text-slate-800">{it.estado_evento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-xs font-semibold text-slate-500">Mostrando {items.length} de {total} registros</div>
        <div className="flex gap-2">
          <button 
            disabled={skip === 0} 
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition disabled:opacity-50 disabled:pointer-events-none" 
            onClick={() => setSkip(Math.max(0, skip - limit))}
          >
            Anterior
          </button>
          <button 
            disabled={skip + limit >= total} 
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#212121] hover:bg-neutral-800 text-white transition disabled:opacity-50 disabled:pointer-events-none" 
            onClick={() => setSkip(skip + limit)}
          >
            Siguiente
          </button>
        </div>
      </div>
      {/* Modal detalle simple */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-4 rounded w-11/12 max-w-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Detalle evento #{selected.id}</h3>
              <button className="btn" onClick={() => setSelected(null)}>Cerrar</button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <div><strong>Usuario:</strong> {selected.nombre_usuario} ({selected.rol_usuario})</div>
              <div><strong>Acción:</strong> {selected.accion}</div>
              <div><strong>Módulo:</strong> {selected.modulo}</div>
              <div><strong>Entidad:</strong> {selected.entidad_afectada} {selected.entidad_id}</div>
              <div><strong>Endpoint:</strong> {selected.endpoint}</div>
              <div><strong>IP:</strong> {selected.ip}</div>
              <div><strong>User Agent:</strong> {selected.user_agent}</div>
              <div><strong>Descripción:</strong> <pre className="whitespace-pre-wrap">{selected.descripcion}</pre></div>
              <div><strong>Datos anteriores:</strong> <pre className="whitespace-pre-wrap">{selected.datos_anteriores}</pre></div>
              <div><strong>Datos nuevos:</strong> <pre className="whitespace-pre-wrap">{selected.datos_nuevos}</pre></div>
            </div>
          </div>
        </div>
      )}

      {/* Report modal */}
      {report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-4 rounded w-11/12 max-w-3xl">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Reporte - Resumen</h3>
              <button className="btn" onClick={() => setReport(null)}>Cerrar</button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4">
              <div>
                <h4 className="font-medium">Por módulo</h4>
                <table className="table-auto w-full mt-2">
                  <thead><tr><th>Módulo</th><th>Conteo</th></tr></thead>
                  <tbody>
                    {(report['módulos'] || []).map(r => (
                      <tr key={r.modulo}><td>{r.modulo}</td><td>{r.count}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h4 className="font-medium">Por acción</h4>
                <table className="table-auto w-full mt-2">
                  <thead><tr><th>Acción</th><th>Conteo</th></tr></thead>
                  <tbody>
                    {(report['acciones'] || []).map(r => (
                      <tr key={r.accion}><td>{r.accion}</td><td>{r.count}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h4 className="font-medium">Tendencia (diaria)</h4>
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
                            borderColor: '#2563eb',
                            backgroundColor: 'rgba(37,99,235,0.1)',
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
                <div className="mt-2">
                  <button className="btn" onClick={() => {
                    // Export report summary CSV
                    const rows = [];
                    rows.push(['Tipo','Clave','Conteo']);
                    (report['módulos'] || []).forEach(r => rows.push(['Módulo', r.modulo, r.count]));
                    (report['acciones'] || []).forEach(r => rows.push(['Acción', r.accion, r.count]));
                    const csv = rows.map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = 'reporte_resumen.csv'; document.body.appendChild(a); a.click(); a.remove();
                  }}>Exportar resumen CSV</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
