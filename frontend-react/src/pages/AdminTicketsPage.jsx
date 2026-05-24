import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { ticketsApi } from "../services/api";
import { DataTable } from "../components/common/DataTable";
import { Loading } from "../components/common/Loading";
import { Badge } from "../components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useToast } from "../context/ToastContext";
import { 
  LifeBuoy, FileText, AlertCircle, CheckCircle2, Clock, UserCheck, 
  BarChart3, PieChart 
} from "lucide-react";

// Import Chart.js and React-Chartjs-2 components
import { Doughnut, Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title 
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title
);

export function AdminTicketsPage() {
  const { pushToast } = useToast();
  const [filtros, setFiltros] = useState({ estado: "", prioridad: "" });

  const tickets = useAsyncData(async () => {
    const params = {};
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.prioridad) params.prioridad = filtros.prioridad;
    return (await ticketsApi.list(params)).data || [];
  }, JSON.stringify(filtros));

  const stats = useAsyncData(async () => {
    return (await ticketsApi.stats()).data;
  });

  const handleEstadoChange = async (id_ticket, nuevoEstado) => {
    try {
      await ticketsApi.cambiarEstado(id_ticket, nuevoEstado);
      pushToast({ title: "Estado actualizado", type: "success" });
      tickets.reload();
      stats.reload();
    } catch (e) {
      pushToast({ title: "Error al actualizar", type: "error" });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ABIERTO": return <Badge variant="warning">Abierto</Badge>;
      case "EN_PROCESO": return <Badge variant="primary">En Proceso</Badge>;
      case "PENDIENTE_USUARIO": return <Badge variant="danger">Pend. Usuario</Badge>;
      case "RESUELTO": return <Badge variant="success">Resuelto</Badge>;
      case "CERRADO": return <Badge variant="secondary">Cerrado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "BAJA": return <Badge variant="secondary">Baja</Badge>;
      case "MEDIA": return <Badge variant="outline">Media</Badge>;
      case "ALTA": return <Badge variant="warning">Alta</Badge>;
      case "CRITICA": return <Badge variant="danger">Crítica</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Chart Data preparation
  const priorityChartData = useMemo(() => {
    if (!stats.data?.por_prioridad) return null;
    const p = stats.data.por_prioridad;
    return {
      labels: ["Crítica", "Alta", "Media", "Baja"],
      datasets: [
        {
          label: "Tickets",
          data: [p.CRITICA || 0, p.ALTA || 0, p.MEDIA || 0, p.BAJA || 0],
          backgroundColor: [
            "#EF4444", // Red-500
            "#F97316", // Orange-500
            "#FBBF24", // Yellow-400
            "#10B981"  // Emerald-500
          ],
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    };
  }, [stats.data]);

  const categoryChartData = useMemo(() => {
    if (!stats.data?.por_categoria) return null;
    const cat = stats.data.por_categoria;
    const labels = Object.keys(cat).map(c => c.replace("_", " "));
    const data = Object.values(cat);
    return {
      labels,
      datasets: [
        {
          label: "Cantidad de Tickets",
          data,
          backgroundColor: "rgba(251, 191, 36, 0.8)", // Brand Yellow with alpha
          borderColor: "#FBBF24",
          borderWidth: 1,
          borderRadius: 8
        }
      ]
    };
  }, [stats.data]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          font: { size: 11 }
        }
      }
    }
  };

  if (tickets.loading && !tickets.data) return <Loading />;

  return (
    <section className="space-y-6 animate-fade-in max-w-7xl mx-auto px-4 md:px-8">
      {/* Title Card */}
      <Card className="border-brand-yellow shadow-sm">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <LifeBuoy className="text-brand-yellow" size={28} />
              Centro de Mesa de Ayuda
            </h2>
            <p className="text-neutral-500 mt-1">Gestiona todos los tickets de soporte de los usuarios y comerciantes.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="rounded-xl border border-neutral-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary px-4 py-2.5 text-xs font-semibold outline-none focus:border-brand-yellow cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="ABIERTO">Abierto</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="PENDIENTE_USUARIO">Pendiente Usuario</option>
              <option value="RESUELTO">Resuelto</option>
              <option value="CERRADO">Cerrado</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Global Dashboard Metrics */}
      {stats.data && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in">
          <Card className="hover:shadow-md transition-shadow duration-300 shadow-sm border border-neutral-100 dark:border-dark-tertiary">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Total Recibidos</span>
                <span className="text-2xl font-bold text-neutral-800 dark:text-white">{stats.data.total}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-dark-secondary flex items-center justify-center text-neutral-500 shrink-0">
                <FileText size={20} />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-300 shadow-sm border border-neutral-100 dark:border-dark-tertiary border-l-4 border-l-red-500">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Abiertos</span>
                <span className="text-2xl font-bold text-neutral-800 dark:text-white">{stats.data.abiertos}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle size={20} />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-300 shadow-sm border border-neutral-100 dark:border-dark-tertiary border-l-4 border-l-blue-500">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">En Proceso</span>
                <span className="text-2xl font-bold text-neutral-800 dark:text-white">{stats.data.en_proceso}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-500 shrink-0">
                <Clock size={20} />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-300 shadow-sm border border-neutral-100 dark:border-dark-tertiary border-l-4 border-l-amber-500">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Pend. Usuario</span>
                <span className="text-2xl font-bold text-neutral-800 dark:text-white">{stats.data.pendiente_usuario}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500 shrink-0">
                <UserCheck size={20} />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-300 shadow-sm border border-neutral-100 dark:border-dark-tertiary border-l-4 border-l-emerald-500">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Resueltos / Cerrados</span>
                <span className="text-2xl font-bold text-neutral-800 dark:text-white">
                  {stats.data.resueltos + stats.data.cerrados}
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle2 size={20} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Charts Grid */}
      {stats.data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm border border-neutral-200 dark:border-neutral-800">
            <CardHeader className="border-b border-neutral-100 dark:border-dark-tertiary pb-3 flex flex-row items-center gap-2">
              <PieChart size={16} className="text-neutral-400" />
              <CardTitle className="text-sm font-bold text-neutral-800 dark:text-white">Distribución por Prioridad</CardTitle>
            </CardHeader>
            <CardContent className="p-5 h-[230px] flex items-center justify-center">
              {priorityChartData ? (
                <Doughnut data={priorityChartData} options={chartOptions} />
              ) : (
                <span className="text-xs text-neutral-400">Sin datos de prioridades</span>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-sm border border-neutral-200 dark:border-neutral-800">
            <CardHeader className="border-b border-neutral-100 dark:border-dark-tertiary pb-3 flex flex-row items-center gap-2">
              <BarChart3 size={16} className="text-neutral-400" />
              <CardTitle className="text-sm font-bold text-neutral-800 dark:text-white">Tickets por Categoría</CardTitle>
            </CardHeader>
            <CardContent className="p-5 h-[230px]">
              {categoryChartData ? (
                <Bar data={categoryChartData} options={{
                  ...chartOptions,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1, color: "#888" },
                      grid: { color: "rgba(100, 100, 100, 0.1)" }
                    },
                    x: {
                      ticks: { color: "#888", font: { size: 10 } },
                      grid: { display: false }
                    }
                  }
                }} />
              ) : (
                <span className="text-xs text-neutral-400 flex items-center justify-center h-full">Sin datos de categorías</span>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tickets List Table */}
      <Card className="shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <DataTable
          columns={[
            { key: "codigo_ticket", label: "Código", render: (row) => <span className="font-mono text-sm font-semibold text-neutral-600 dark:text-neutral-300">{row.codigo_ticket}</span> },
            { key: "titulo", label: "Asunto", render: (row) => <span className="font-medium truncate max-w-[200px] block" title={row.titulo}>{row.titulo}</span> },
            { key: "usuario", label: "Usuario", render: (row) => <span className="text-xs text-neutral-500">{row.usuario?.correo}</span> },
            { key: "prioridad", label: "Prioridad", render: (row) => getPriorityBadge(row.prioridad) },
            { 
              key: "estado", label: "Estado", render: (row) => (
                <select
                  value={row.estado}
                  onChange={(e) => handleEstadoChange(row.id_ticket, e.target.value)}
                  className="rounded-lg border border-neutral-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer hover:border-brand-yellow"
                >
                  <option value="ABIERTO">Abierto</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="PENDIENTE_USUARIO">Pendiente Usuario</option>
                  <option value="RESUELTO">Resuelto</option>
                  <option value="CERRADO">Cerrado</option>
                </select>
              )
            },
            { key: "fecha_creacion", label: "Creado", render: (row) => <span className="text-sm text-neutral-500">{new Date(row.fecha_creacion).toLocaleDateString("es-CO")}</span> },
            {
              key: "acciones", label: "Acciones", render: (row) => (
                <div className="flex justify-end gap-2">
                  <Link to={`/tickets/${row.id_ticket}`}>
                    <Button size="sm" variant="primary" className="rounded-lg">Atender</Button>
                  </Link>
                </div>
              )
            }
          ]}
          rows={tickets.data || []}
        />
      </Card>
    </section>
  );
}
