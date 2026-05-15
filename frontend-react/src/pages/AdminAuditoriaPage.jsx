import React, { useEffect, useState } from "react";
import { auditApi, rolesApi } from "../services/api";
import { toast } from "react-toastify";
import { Line } from 'react-chartjs-2';
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
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Registro de Actividad / Historial del sistema</h2>
      <p className="mt-2 text-sm text-slate-600">Registros de actividad y eventos del sistema (solo lectura)</p>

      <div className="mt-4 flex gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 items-center">
          <button className="btn btn-primary">Buscar</button>
          <select value={rol} onChange={(e) => setRol(e.target.value)} className="input">
            <option value="">Todos roles</option>
            {rolesList.map(r => (<option key={r.id} value={r.nombre}>{r.nombre}</option>))}
          </select>
          <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="input" />
          <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="input" />
        </form>
        <button className="btn" onClick={handleExport}>Exportar CSV</button>
        <button className="btn" onClick={handleReport} disabled={loadingReport}>{loadingReport ? 'Generando...' : 'Generar reporte resumen'}</button>
      </div>
        <button className="btn" onClick={async () => {
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
        }}>Exportar PDF</button>

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <table className="table-auto w-full bg-white">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Acción</th>
                <th>Módulo</th>
                <th>Entidad</th>
                <th>IP</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t hover:bg-slate-50 cursor-pointer" onClick={() => setSelected(it)}>
                  <td>{new Date(it.timestamp).toLocaleString()}</td>
                  <td>{it.nombre_usuario}</td>
                  <td>{it.rol_usuario}</td>
                  <td>{it.accion}</td>
                  <td><span className={`px-2 py-1 rounded ${badgeFor(it.accion)}`}>{it.accion}</span></td>
                  <td>{it.entidad_afectada} {it.entidad_id ? `#${it.entidad_id}` : ''}</td>
                  <td>{it.ip}</td>
                  <td>{it.estado_evento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>Mostrando {items.length} de {total}</div>
        <div className="flex gap-2">
          <button disabled={skip === 0} className="btn" onClick={() => setSkip(Math.max(0, skip - limit))}>Anterior</button>
          <button disabled={skip + limit >= total} className="btn btn-primary" onClick={() => setSkip(skip + limit)}>Siguiente</button>
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
