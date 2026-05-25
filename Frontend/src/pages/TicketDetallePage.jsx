import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ticketsApi, usuariosApi } from "../services/api";
import { useAsyncData } from "../hooks/useAsyncData";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Loading } from "../components/common/Loading";
import { EmptyState } from "../components/common/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { 
  ArrowLeft, Clock, Send, User, Paperclip, FileText, X, Download, 
  HelpCircle, UserCheck, Shield, AlertTriangle, AlertCircle, FileCheck, CheckCircle2, History, Activity
} from "lucide-react";
import { cn } from "../utils/utils";
import { API_BASE_URL } from "../config/env";

export function TicketDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [mensaje, setMensaje] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [archivos, setArchivos] = useState([]);
  const [esNotaInterna, setEsNotaInterna] = useState(false);
  const [isUploadingGlobal, setIsUploadingGlobal] = useState(false);
  const [admins, setAdmins] = useState([]);
  
  const fileInputRef = useRef(null);
  const globalFileInputRef = useRef(null);

  const isAdmin = user?.rol === "admin" || user?.rol === "superadmin";

  const ticket = useAsyncData(async () => {
    return (await ticketsApi.get(id)).data;
  }, id);

  // Cargar administradores para la asignación en la barra lateral
  useEffect(() => {
    if (isAdmin) {
      usuariosApi.list({ limit: 100 })
        .then((res) => {
          const list = res.data?.items || res.data || [];
          setAdmins(list.filter(u => u.rol === "admin" || u.rol === "superadmin"));
        })
        .catch((err) => console.error("Error al cargar admins:", err));
    }
  }, [isAdmin]);

  const getFileUrl = (path) => {
    if (!path) return "#";
    const host = API_BASE_URL.replace("/api", "");
    return `${host}${path}`;
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setArchivos((prev) => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mensaje.trim() && archivos.length === 0) return;
    setIsSubmitting(true);
    try {
      const resMsg = await ticketsApi.responder(id, { 
        mensaje: mensaje || "Archivo adjunto enviado.", 
        es_nota_interna: esNotaInterna 
      });
      
      if (archivos.length > 0) {
        const idMensaje = resMsg.data.id_mensaje;
        await ticketsApi.uploadMensajeAdjuntos(id, idMensaje, archivos);
      }
      
      setMensaje("");
      setArchivos([]);
      setEsNotaInterna(false);
      ticket.reload();
      pushToast({ title: "Respuesta enviada", type: "success" });
    } catch (error) {
      pushToast({ title: "Error", message: "No se pudo enviar la respuesta", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGlobalUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setIsUploadingGlobal(true);
    try {
      await ticketsApi.uploadAdjuntos(id, files);
      ticket.reload();
      pushToast({ title: "Archivos adjuntos subidos", type: "success" });
    } catch (err) {
      pushToast({ title: "Error", message: "No se pudieron subir los archivos", type: "error" });
    } finally {
      setIsUploadingGlobal(false);
    }
  };

  const handleEstadoChange = async (nuevoEstado) => {
    try {
      await ticketsApi.cambiarEstado(id, nuevoEstado);
      ticket.reload();
      pushToast({ title: "Estado del ticket actualizado", type: "success" });
    } catch (err) {
      pushToast({ title: "Error", message: "No se pudo cambiar el estado", type: "error" });
    }
  };

  const handlePrioridadChange = async (nuevaPrioridad) => {
    try {
      await ticketsApi.cambiarPrioridad(id, nuevaPrioridad);
      ticket.reload();
      pushToast({ title: "Prioridad del ticket actualizada", type: "success" });
    } catch (err) {
      pushToast({ title: "Error", message: "No se pudo cambiar la prioridad", type: "error" });
    }
  };

  const handleAsignarChange = async (nuevoAsignadoId) => {
    try {
      await ticketsApi.asignar(id, nuevoAsignadoId ? parseInt(nuevoAsignadoId) : null);
      ticket.reload();
      pushToast({ title: "Responsable asignado correctamente", type: "success" });
    } catch (err) {
      pushToast({ title: "Error", message: "No se pudo cambiar la asignación", type: "error" });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ABIERTO": return <Badge variant="warning" className="px-3 py-1 text-xs">Abierto</Badge>;
      case "EN_PROCESO": return <Badge variant="primary" className="px-3 py-1 text-xs">En Proceso</Badge>;
      case "PENDIENTE_USUARIO": return <Badge variant="danger" className="px-3 py-1 text-xs">Pendiente de tu respuesta</Badge>;
      case "RESUELTO": return <Badge variant="success" className="px-3 py-1 text-xs">Resuelto</Badge>;
      case "CERRADO": return <Badge variant="secondary" className="px-3 py-1 text-xs">Cerrado</Badge>;
      default: return <Badge variant="outline" className="px-3 py-1 text-xs">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "CRITICA": return <Badge className="bg-red-500 text-white border-none hover:bg-red-600">Crítica</Badge>;
      case "ALTA": return <Badge className="bg-orange-500 text-white border-none hover:bg-orange-600">Alta</Badge>;
      case "MEDIA": return <Badge className="bg-amber-400 text-neutral-900 border-none hover:bg-amber-500">Media</Badge>;
      case "BAJA": return <Badge className="bg-emerald-500 text-white border-none hover:bg-emerald-600">Baja</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTimelineIcon = (action) => {
    switch (action) {
      case "CREACION": return <HelpCircle size={14} className="text-blue-500" />;
      case "CAMBIO_ESTADO": return <Activity size={14} className="text-amber-500" />;
      case "CAMBIO_PRIORIDAD": return <AlertTriangle size={14} className="text-orange-500" />;
      case "ASIGNACION": return <UserCheck size={14} className="text-purple-500" />;
      case "RESPONDER_TICKET": return <Send size={14} className="text-emerald-500" />;
      default: return <Clock size={14} className="text-neutral-500" />;
    }
  };

  if (ticket.loading) return <Loading />;
  if (!ticket.data) return <EmptyState title="Ticket no encontrado" />;

  const t = ticket.data;
  const isClosed = t.estado === "CERRADO" || t.estado === "RESUELTO";

  // Agrupar todos los adjuntos (del ticket base y de los mensajes)
  const todosLosAdjuntos = t.adjuntos || [];

  return (
    <section className="max-w-7xl mx-auto animate-fade-in pb-12 px-4 md:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(isAdmin ? "/admin/tickets" : "/mis-tickets")} className="px-2 shrink-0">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex flex-wrap items-center gap-3">
              {t.titulo}
              <span className="text-sm font-mono text-neutral-500 bg-neutral-100 dark:bg-dark-secondary px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
                {t.codigo_ticket}
              </span>
            </h2>
            <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500">
              {getStatusBadge(t.estado)}
              <span className="flex items-center gap-1"><Clock size={14} /> {new Date(t.fecha_creacion).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Chat thread */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="flex flex-col h-[650px] shadow-md border border-neutral-200 dark:border-neutral-800">
            {/* Thread list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50 dark:bg-dark-primary rounded-t-2xl">
              {/* Initial description as first message */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-yellow/20 flex items-center justify-center text-brand-yellow-hover font-bold shrink-0 shadow-sm">
                  {t.usuario?.nombre?.[0] || "U"}
                </div>
                <div className="bg-white dark:bg-dark-secondary border border-neutral-200 dark:border-dark-tertiary rounded-2xl rounded-tl-none p-5 w-full md:w-5/6 shadow-sm">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100 dark:border-dark-tertiary">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        {t.usuario?.nombre} {t.usuario?.apellido}
                      </span>
                      <span className="text-[11px] text-neutral-400">Creador del Ticket</span>
                    </div>
                    <span className="text-xs text-neutral-400">{new Date(t.fecha_creacion).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {t.descripcion}
                  </p>

                  {/* Attachments for the original ticket */}
                  {todosLosAdjuntos.filter(a => !a.id_mensaje).length > 0 && (
                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-dark-tertiary space-y-2">
                      <span className="text-xs font-semibold text-neutral-500 block">Archivos adjuntos:</span>
                      <div className="flex flex-wrap gap-2">
                        {todosLosAdjuntos.filter(a => !a.id_mensaje).map((adj) => (
                          <a 
                            key={adj.id_adjunto} 
                            href={getFileUrl(adj.ruta_archivo)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-dark-tertiary bg-neutral-50 dark:bg-dark-primary text-xs hover:bg-neutral-100 dark:hover:bg-dark-tertiary text-neutral-700 dark:text-neutral-300 transition-colors"
                          >
                            <FileText size={14} className="text-brand-yellow" />
                            <span className="truncate max-w-[150px]">{adj.nombre_archivo}</span>
                            <Download size={12} className="text-neutral-400 ml-1 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies */}
              {(t.mensajes || []).map((msg) => {
                const isSystemMessage = false; // Add system msg flag if necessary
                const isMine = msg.id_usuario === user?.id_usuario;
                const isNota = msg.es_nota_interna === 1;

                return (
                  <div key={msg.id_mensaje} className={cn("flex items-start gap-4", isMine ? "flex-row-reverse" : "")}>
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-sm", 
                      isMine 
                        ? "bg-brand-yellow/20 text-brand-yellow-hover" 
                        : isNota 
                          ? "bg-amber-800 text-white"
                          : "bg-neutral-800 text-white"
                    )}>
                      {isMine ? (user?.nombre?.[0] || "M") : (msg.usuario?.nombre?.[0] || <User size={18} />)}
                    </div>
                    <div className={cn("border rounded-2xl p-5 w-full md:w-5/6 shadow-sm", 
                      isMine 
                        ? "bg-white dark:bg-dark-secondary border-neutral-200 dark:border-dark-tertiary rounded-tr-none" 
                        : isNota
                          ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 rounded-tl-none text-neutral-900 dark:text-neutral-100"
                          : "bg-neutral-900 dark:bg-neutral-800 border-neutral-800 dark:border-neutral-700 text-white rounded-tl-none"
                    )}>
                      <div className="flex items-center justify-between mb-3 pb-1 border-b border-neutral-100/10 dark:border-neutral-700/20">
                        <div className="flex flex-col">
                          <span className={cn("font-bold text-sm", isMine ? "text-neutral-900 dark:text-white" : "")}>
                            {isMine ? "Tú" : `${msg.usuario?.nombre || 'Soporte'} ${msg.usuario?.apellido || ''}`}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {isNota ? "Nota Interna (Solo Soporte)" : msg.rol_usuario?.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-400">{new Date(msg.fecha_creacion).toLocaleString()}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.mensaje}</p>

                      {/* Attachments for this message */}
                      {todosLosAdjuntos.filter(a => a.id_mensaje === msg.id_mensaje).length > 0 && (
                        <div className="mt-4 pt-3 border-t border-neutral-100/10 dark:border-neutral-700/20 space-y-2">
                          <span className="text-xs font-semibold text-neutral-400 block">Archivos adjuntos:</span>
                          <div className="flex flex-wrap gap-2">
                            {todosLosAdjuntos.filter(a => a.id_mensaje === msg.id_mensaje).map((adj) => (
                              <a 
                                key={adj.id_adjunto} 
                                href={getFileUrl(adj.ruta_archivo)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50 bg-neutral-50/50 dark:bg-neutral-900/50 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-colors"
                              >
                                <FileText size={14} className="text-brand-yellow" />
                                <span className="truncate max-w-[150px]">{adj.nombre_archivo}</span>
                                <Download size={12} className="text-neutral-400 ml-1 shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected files preview */}
            {archivos.length > 0 && (
              <div className="px-6 py-2 border-t border-neutral-200 dark:border-dark-tertiary bg-neutral-100 dark:bg-dark-secondary flex flex-wrap gap-2">
                {archivos.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white dark:bg-dark-primary border border-neutral-300 dark:border-neutral-700 px-3 py-1 rounded-full text-xs text-neutral-700 dark:text-neutral-300">
                    <FileText size={12} className="text-brand-yellow" />
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button type="button" onClick={() => removeFile(index)} className="hover:text-red-500 ml-1">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input area */}
            <div className="p-4 bg-white dark:bg-dark-secondary border-t border-neutral-200 dark:border-dark-tertiary rounded-b-2xl">
              {isClosed ? (
                <div className="text-center text-sm text-neutral-500 py-4 bg-neutral-50 dark:bg-dark-tertiary rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600">
                  Este ticket está cerrado o resuelto. No es posible enviar más respuestas.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={mensaje} 
                      onChange={(e) => setMensaje(e.target.value)}
                      placeholder="Escribe tu respuesta..." 
                      rows="2"
                      className="w-full rounded-xl border border-neutral-200 dark:border-dark-tertiary bg-neutral-50 dark:bg-dark-primary px-4 py-3 text-sm focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow dark:text-white outline-none resize-none"
                    />
                    
                    <input 
                      type="file" 
                      multiple 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />

                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-11 w-11 p-0 rounded-xl shrink-0 text-neutral-500 hover:text-brand-yellow hover:bg-neutral-100 dark:hover:bg-dark-tertiary border border-neutral-200 dark:border-neutral-700"
                    >
                      <Paperclip size={18} />
                    </Button>

                    <Button 
                      type="submit" 
                      isLoading={isSubmitting} 
                      disabled={!mensaje.trim() && archivos.length === 0} 
                      className="h-11 px-5 rounded-xl shrink-0" 
                      leftIcon={<Send size={16} />}
                    >
                      Enviar
                    </Button>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center justify-between border-t border-neutral-100 dark:border-dark-tertiary pt-2 px-1">
                      <label className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={esNotaInterna}
                          onChange={(e) => setEsNotaInterna(e.target.checked)}
                          className="rounded border-neutral-300 text-brand-yellow focus:ring-brand-yellow h-3.5 w-3.5"
                        />
                        <span>Enviar como <strong>Nota Interna</strong> (privada para soporte)</span>
                      </label>
                    </div>
                  )}
                </form>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Ticket settings & timeline */}
        <div className="space-y-6">
          {/* Settings/Information Card */}
          <Card className="shadow-md border border-neutral-200 dark:border-neutral-800">
            <CardHeader className="border-b border-neutral-100 dark:border-dark-tertiary pb-3">
              <CardTitle className="text-md font-bold text-neutral-900 dark:text-white">
                Información del Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-sm">
              {/* Category */}
              <div>
                <span className="text-xs text-neutral-400 block mb-1">Categoría</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{t.categoria}</span>
              </div>

              {/* Status */}
              <div>
                <span className="text-xs text-neutral-400 block mb-1">Estado</span>
                {isAdmin ? (
                  <select 
                    value={t.estado} 
                    onChange={(e) => handleEstadoChange(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-dark-tertiary bg-white dark:bg-dark-primary px-3 py-2 text-xs focus:border-brand-yellow outline-none text-neutral-800 dark:text-white font-semibold"
                  >
                    <option value="ABIERTO">Abierto</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="PENDIENTE_USUARIO">Pendiente Usuario</option>
                    <option value="RESUELTO">Resuelto</option>
                    <option value="CERRADO">Cerrado</option>
                  </select>
                ) : (
                  <div className="mt-1">{getStatusBadge(t.estado)}</div>
                )}
              </div>

              {/* Priority */}
              <div>
                <span className="text-xs text-neutral-400 block mb-1">Prioridad</span>
                {isAdmin ? (
                  <select 
                    value={t.prioridad} 
                    onChange={(e) => handlePrioridadChange(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-dark-tertiary bg-white dark:bg-dark-primary px-3 py-2 text-xs focus:border-brand-yellow outline-none text-neutral-800 dark:text-white font-semibold"
                  >
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="CRITICA">Crítica</option>
                  </select>
                ) : (
                  <div className="mt-1">{getPriorityBadge(t.prioridad)}</div>
                )}
              </div>

              {/* Assignee */}
              <div>
                <span className="text-xs text-neutral-400 block mb-1">Asignado a</span>
                {isAdmin ? (
                  <select 
                    value={t.asignado_a_id || ""} 
                    onChange={(e) => handleAsignarChange(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-dark-tertiary bg-white dark:bg-dark-primary px-3 py-2 text-xs focus:border-brand-yellow outline-none text-neutral-800 dark:text-white font-semibold"
                  >
                    <option value="">Sin Asignar</option>
                    {admins.map(adm => (
                      <option key={adm.id} value={adm.id}>
                        {adm.nombre} {adm.apellido}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {t.asignado_a ? `${t.asignado_a.nombre} ${t.asignado_a.apellido}` : "Sin asignar"}
                  </span>
                )}
              </div>

              {/* Customer Company if any */}
              {t.empresa && (
                <div>
                  <span className="text-xs text-neutral-400 block mb-1">Empresa Cliente</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{t.empresa.nombre}</span>
                </div>
              )}

              {/* General Attachments Uploader for Sidebar */}
              {!isClosed && (
                <div className="pt-3 border-t border-neutral-100 dark:border-dark-tertiary">
                  <input 
                    type="file" 
                    multiple 
                    ref={globalFileInputRef} 
                    onChange={handleGlobalUpload} 
                    className="hidden" 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    isLoading={isUploadingGlobal}
                    onClick={() => globalFileInputRef.current?.click()}
                    className="w-full text-xs py-2 rounded-lg border-dashed border-2 hover:border-brand-yellow hover:text-brand-yellow"
                    leftIcon={<Paperclip size={12} />}
                  >
                    Adjuntar Archivo al Ticket
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline / History Card */}
          <Card className="shadow-md border border-neutral-200 dark:border-neutral-800 max-h-[300px] flex flex-col">
            <CardHeader className="border-b border-neutral-100 dark:border-dark-tertiary pb-3 flex flex-row items-center gap-2 shrink-0">
              <History size={16} className="text-neutral-500" />
              <CardTitle className="text-md font-bold text-neutral-900 dark:text-white">
                Historial de Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 overflow-y-auto flex-1">
              {(!t.historial || t.historial.length === 0) ? (
                <p className="text-xs text-neutral-400 italic text-center py-4">No hay historial registrado.</p>
              ) : (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {t.historial.map((event, idx) => (
                      <li key={event.id_historial}>
                        <div className="relative pb-6">
                          {idx !== t.historial.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-neutral-200 dark:bg-dark-tertiary" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-dark-secondary flex items-center justify-center ring-4 ring-white dark:ring-dark-primary shadow-sm">
                                {getTimelineIcon(event.accion)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-xs text-neutral-800 dark:text-neutral-200 font-medium">
                                  {event.descripcion || `${event.accion}`}
                                </p>
                                {event.usuario && (
                                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                                    Por {event.usuario.nombre} ({event.usuario.rol})
                                  </span>
                                )}
                              </div>
                              <div className="text-right text-[10px] whitespace-nowrap text-neutral-400 self-start">
                                <time>{new Date(event.fecha_creacion).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
