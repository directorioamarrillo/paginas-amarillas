import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { ticketsApi } from "../services/api";
import { Loading } from "../components/common/Loading";
import { EmptyState } from "../components/common/EmptyState";
import { DataTable } from "../components/common/DataTable";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent } from "../components/ui/Card";
import { LifeBuoy, Plus, FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Modal } from "../components/common/Modal";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { useToast } from "../context/ToastContext";

export function MisTicketsPage() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ titulo: "", descripcion: "", categoria: "SOPORTE_TECNICO", prioridad: "MEDIA" });

  const tickets = useAsyncData(async () => {
    return (await ticketsApi.misTickets()).data || [];
  });

  const stats = useAsyncData(async () => {
    return (await ticketsApi.stats()).data;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "ABIERTO": return <Badge variant="warning">Abierto</Badge>;
      case "EN_PROCESO": return <Badge variant="primary">En Proceso</Badge>;
      case "PENDIENTE_USUARIO": return <Badge variant="danger">Pendiente</Badge>;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo || !form.descripcion) return pushToast({ title: "Error", message: "Llena todos los campos", type: "error" });
    setIsSubmitting(true);
    try {
      await ticketsApi.create(form);
      pushToast({ title: "Ticket creado", message: "Tu solicitud ha sido enviada", type: "success" });
      setModalOpen(false);
      setForm({ titulo: "", descripcion: "", categoria: "SOPORTE_TECNICO", prioridad: "MEDIA" });
      tickets.reload();
      stats.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo crear", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tickets.loading) return <Loading />;

  return (
    <section className="space-y-6 animate-fade-in max-w-7xl mx-auto px-4 md:px-8">
      {/* Title Card */}
      <Card className="border-brand-yellow shadow-sm">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <LifeBuoy className="text-brand-yellow" size={28} />
              Soporte Técnico
            </h2>
            <p className="text-neutral-500 mt-1">Gestiona tus solicitudes de soporte y asistencia técnica.</p>
          </div>
          <Button onClick={() => setModalOpen(true)} leftIcon={<Plus size={18} />} className="rounded-xl shadow">
            Nuevo Ticket
          </Button>
        </CardContent>
      </Card>

      {/* Dashboard Stats Row */}
      {stats.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <Card className="hover:shadow-md transition-shadow duration-300 shadow-sm border border-neutral-100 dark:border-dark-tertiary">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Total Tickets</span>
                <span className="text-2xl font-bold text-neutral-800 dark:text-white">{stats.data.total}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-dark-secondary flex items-center justify-center text-neutral-500 shrink-0">
                <FileText size={20} />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-300 shadow-sm border border-neutral-100 dark:border-dark-tertiary border-l-4 border-l-amber-400">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Abiertos / Proceso</span>
                <span className="text-2xl font-bold text-neutral-800 dark:text-white">
                  {stats.data.abiertos + stats.data.en_proceso}
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500 shrink-0">
                <Clock size={20} />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-300 shadow-sm border border-neutral-100 dark:border-dark-tertiary border-l-4 border-l-red-500">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Pendiente Respuesta</span>
                <span className="text-2xl font-bold text-neutral-800 dark:text-white">{stats.data.pendiente_usuario}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle size={20} />
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

      {/* Ticket List Table */}
      {tickets.data?.length === 0 ? (
        <EmptyState title="No tienes tickets" description="Si necesitas ayuda o reportar un problema, crea un nuevo ticket de soporte." />
      ) : (
        <Card className="shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <DataTable
            columns={[
              { key: "codigo_ticket", label: "Código", render: (row) => <span className="font-mono text-sm font-semibold text-neutral-600 dark:text-neutral-300">{row.codigo_ticket}</span> },
              { key: "titulo", label: "Asunto", render: (row) => <span className="font-medium text-neutral-900 dark:text-white">{row.titulo}</span> },
              { key: "categoria", label: "Categoría", render: (row) => <span className="text-xs text-neutral-500 capitalize">{(row.categoria || "").replace("_", " ").toLowerCase()}</span> },
              { key: "prioridad", label: "Prioridad", render: (row) => getPriorityBadge(row.prioridad) },
              { key: "estado", label: "Estado", render: (row) => getStatusBadge(row.estado) },
              { key: "fecha_creacion", label: "Creado", render: (row) => <span className="text-sm text-neutral-500">{new Date(row.fecha_creacion).toLocaleDateString("es-CO")}</span> },
              {
                key: "acciones", label: "Acciones", render: (row) => (
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/tickets/${row.id_ticket}`)} className="rounded-lg">
                      Ver Detalle
                    </Button>
                  </div>
                )
              }
            ]}
            rows={tickets.data || []}
          />
        </Card>
      )}

      {/* Modal Crear Ticket */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Crear Ticket de Soporte">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Asunto</Label>
            <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: Problemas con mi cuenta" required className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <select 
                value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} 
                className="w-full rounded-xl border border-neutral-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary px-3 py-2 outline-none focus:border-brand-yellow text-sm"
              >
                <option value="SOPORTE_TECNICO">Soporte Técnico</option>
                <option value="CUENTA">Cuenta y Accesos</option>
                <option value="COMERCIOS">Empresas y Comercios</option>
                <option value="MARKETPLACE">Marketplace / Productos</option>
                <option value="PAGOS">Pagos y Facturación</option>
                <option value="OTROS">Otros</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <select 
                value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value })} 
                className="w-full rounded-xl border border-neutral-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary px-3 py-2 outline-none focus:border-brand-yellow text-sm"
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descripción detallada</Label>
            <textarea
              value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Describe detalladamente tu problema o solicitud..." rows="4" required
              className="w-full rounded-xl border border-neutral-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary px-3 py-2 outline-none focus:border-brand-yellow resize-none text-sm"
            ></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting} className="rounded-xl">Enviar Solicitud</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
