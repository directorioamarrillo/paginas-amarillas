import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Database,
  RefreshCw,
  Download,
  Trash2,
  Play,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Cloud,
  HardDrive,
  Info,
  Clock
} from "lucide-react";
import { backupApi } from "../../services/backupApi";
import "../../styles/backups.css";

export function Backups() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  
  // Modal de confirmación de restauración
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  const fetchSummary = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await backupApi.getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error("Error al cargar resumen de backups", error);
      
      // Control de sesión expirada
      if (error.response && (error.response.status === 401 || error.response.status === 419)) {
        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        navigate("/login");
      } else {
        toast.error("No se pudo cargar el listado de backups.");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    
    // Intervalo para verificar estado si hay proceso en ejecución
    const interval = setInterval(async () => {
      try {
        const response = await backupApi.getStatus();
        if (response.data.is_running) {
          setProcessing(true);
          setStatusMessage(response.data.last_message || "Procesando backup...");
        } else {
          if (processing) {
            setProcessing(false);
            fetchSummary(false);
          }
        }
      } catch (e) {
        console.error("Error al consultar estado de backup", e);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [processing]);

  const handleFrequencyChange = async (e) => {
    const freq = e.target.value;
    try {
      setLoading(true);
      await backupApi.updateSchedule(freq);
      toast.success(`Frecuencia de backups actualizada a: ${freq}`);
      fetchSummary(false);
    } catch (error) {
      console.error("Error al actualizar frecuencia", error);
      toast.error("Fallo al actualizar la frecuencia de backups.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setProcessing(true);
    setStatusMessage("Generando archivo de respaldo de la base de datos...");
    try {
      await backupApi.generate();
      toast.success("Copia de seguridad manual creada exitosamente.");
      await fetchSummary(false);
    } catch (error) {
      console.error("Error al generar backup", error);
      const detail = error.response?.data?.detail || "Fallo en la generación del backup.";
      toast.error(detail);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async (backup) => {
    try {
      toast.info(`Iniciando descarga de ${backup.name}...`);
      const response = await backupApi.download(backup.id);
      
      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", backup.name);
      document.body.appendChild(link);
      link.click();
      
      // Limpieza
      window.URL.revokeObjectURL(url);
      link.remove();
      toast.success("Descarga completada.");
    } catch (error) {
      console.error("Error al descargar backup", error);
      toast.error("No se pudo descargar el archivo de respaldo.");
    }
  };

  const handleDelete = async (backup) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el backup: ${backup.name}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      await backupApi.remove(backup.id);
      toast.success("Backup eliminado correctamente.");
      fetchSummary(false);
    } catch (error) {
      console.error("Error al eliminar backup", error);
      toast.error("No se pudo eliminar el backup seleccionado.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = (backup) => {
    setSelectedBackup(backup);
    setConfirmText("");
  };

  const handleRestoreConfirm = async () => {
    if (confirmText !== "CONFIRMAR") {
      toast.warn("Debes escribir exactamente la palabra CONFIRMAR.");
      return;
    }

    const backupId = selectedBackup.id;
    setSelectedBackup(null);
    setProcessing(true);
    setStatusMessage("Restaurando base de datos. Creando copia de seguridad previa...");

    try {
      await backupApi.restore(backupId);
      toast.success("Base de datos restaurada correctamente.");
      
      // Cerrar sesión después de restaurar para asegurar consistencia
      toast.info("Redirigiendo a Login para refrescar sesión...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error) {
      console.error("Error al restaurar", error);
      const detail = error.response?.data?.detail || "Fallo en el proceso de restauración.";
      toast.error(detail);
      fetchSummary(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleResetStatus = async () => {
    try {
      setLoading(true);
      await backupApi.resetStatus();
      toast.success("Estado de backup desbloqueado.");
      setProcessing(false);
      fetchSummary(false);
    } catch (error) {
      console.error("Error al resetear estado", error);
      toast.error("Fallo al desbloquear el estado.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="backups-container">
        <div className="flex items-center justify-center p-12">
          <div className="spinner"></div>
          <span className="ml-4 font-semibold text-neutral-400">Cargando módulo de backups...</span>
        </div>
      </div>
    );
  }

  const {
    total_backups = 0,
    last_backup_date = null,
    last_backup_status = null,
    storage_type = "Local",
    google_drive_configured = false,
    backups = [],
    config = {}
  } = summary || {};

  return (
    <div className="backups-container">
      {/* Loading Overlay */}
      {processing && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p className="text-lg font-bold">{statusMessage}</p>
          <p className="text-sm text-neutral-400 mt-2">Por favor, no cierres esta pestaña ni refresques la página.</p>
        </div>
      )}

      {/* Hero Section */}
      <div className="backups-hero">
        <div className="backups-hero-content">
          <h1>Gestión de Backups</h1>
          <p>Crea copias de seguridad de la base de datos, administra programaciones y restaura estados del sistema de manera segura.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="backups-stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon-wrapper">
            <Database size={24} />
          </div>
          <div className="stat-info">
            <h3>Total de Backups</h3>
            <div className="stat-value">{total_backups}</div>
          </div>
        </div>

        <div className="stat-card stat-storage">
          <div className="stat-icon-wrapper">
            {google_drive_configured ? <Cloud size={24} /> : <HardDrive size={24} />}
          </div>
          <div className="stat-info">
            <h3>Almacenamiento</h3>
            <div className="stat-value">{storage_type}</div>
          </div>
        </div>

        <div className="stat-card stat-status">
          <div className="stat-icon-wrapper">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>Último Estado</h3>
            <div className="stat-value">
              {last_backup_status === "success" && (
                <span className="badge badge-success">Correcto</span>
              )}
              {last_backup_status === "running" && (
                <span className="badge badge-warning">En proceso</span>
              )}
              {last_backup_status === "error" && (
                <span className="badge badge-danger">Error</span>
              )}
              {!last_backup_status && (
                <span className="text-neutral-400 font-normal text-sm">Sin ejecutar</span>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card stat-date">
          <div className="stat-icon-wrapper">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>Última Ejecución</h3>
            <div className="stat-value" style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>
              {last_backup_date ? new Date(last_backup_date).toLocaleString() : "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de Google Drive no configurado */}
      {!google_drive_configured && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm">Google Drive no está configurado</h4>
            <p className="text-xs text-amber-700 mt-1">
              Los archivos ZIP se guardarán localmente en la carpeta del servidor (<code className="bg-amber-100 px-1 rounded">backups_local</code>) temporalmente. 
              Para la integración remota de Google Drive, configura las variables del archivo <code className="bg-amber-100 px-1 rounded">.env</code>.
            </p>
          </div>
        </div>
      )}

      {/* Configuración de Automatización */}
      <div className="backups-config-section">
        <div className="config-flex">
          <div className="config-title">
            <h2>Respaldos Automáticos</h2>
            <p>Define la frecuencia en la que el programador de tareas del sistema operativo respaldará la base de datos.</p>
          </div>
          <div className="config-actions">
            <select
              value={config.frequency || "daily"}
              onChange={handleFrequencyChange}
              className="frequency-select"
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>

            <button
              onClick={handleGenerate}
              disabled={processing || last_backup_status === "running"}
              className="btn-primary"
            >
              <Play size={16} />
              Respaldar Base de Datos
            </button>

            {last_backup_status === "running" && (
              <button
                onClick={handleResetStatus}
                className="btn-secondary"
                title="Destraba el estado si quedó congelado en ejecución"
              >
                <RefreshCw size={16} />
                Reiniciar Estado
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Backups */}
      <div className="backups-table-card">
        <div className="table-header-flex">
          <h2>Respaldos Disponibles</h2>
          <button
            onClick={() => fetchSummary(true)}
            className="btn-secondary"
            title="Refrescar lista"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="table-responsive">
          {backups.length === 0 ? (
            <div className="text-center p-12 text-neutral-400">
              <Info size={32} className="mx-auto mb-2 opacity-50" />
              <p>No se encontraron archivos de copia de seguridad generados.</p>
            </div>
          ) : (
            <table className="backups-table">
              <thead>
                <tr>
                  <th>Nombre del Archivo</th>
                  <th>Fecha de Creación</th>
                  <th>Tamaño</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr key={backup.id}>
                    <td className="font-semibold text-neutral-700" style={{ wordBreak: 'break-all' }}>{backup.name}</td>
                    <td>{new Date(backup.created_time).toLocaleString()}</td>
                    <td>{backup.size}</td>
                    <td>
                      <span className="inline-flex items-center gap-1">
                        {backup.location === "Google Drive" ? (
                          <>
                            <Cloud size={14} className="text-blue-500" />
                            Google Drive
                          </>
                        ) : (
                          <>
                            <HardDrive size={14} className="text-gray-500" />
                            Local Fallback
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">Correcto</span>
                    </td>
                    <td align="right">
                      <div className="action-btn-group justify-end">
                        <button
                          onClick={() => handleDownload(backup)}
                          className="btn-action btn-action-download"
                          title="Descargar ZIP"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleRestoreClick(backup)}
                          className="btn-action btn-action-restore"
                          title="Restaurar Base de Datos"
                        >
                          <RefreshCw size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(backup)}
                          className="btn-action btn-action-delete"
                          title="Eliminar permanentemente"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Dialog modal para confirmación de restauración */}
      {selectedBackup && (
        <div className="restore-dialog-overlay">
          <div className="restore-dialog">
            <h3>¿Confirmar restauración?</h3>
            <p>
              Estás a punto de restaurar la base de datos al estado del backup seleccionado. 
              <strong> Esto reemplazará todos los datos actuales del sistema.</strong>
            </p>
            <div className="restore-dialog-details">
              <div><strong>Archivo:</strong> {selectedBackup.name}</div>
              <div><strong>Fecha:</strong> {new Date(selectedBackup.created_time).toLocaleString()}</div>
              <div><strong>Tamaño:</strong> {selectedBackup.size}</div>
            </div>
            
            <p className="text-xs text-red-600 font-bold mb-2">
              Para continuar, escribe exactamente la palabra "CONFIRMAR":
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="CONFIRMAR"
              className="confirm-input"
            />
            
            <div className="dialog-buttons">
              <button
                onClick={() => setSelectedBackup(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleRestoreConfirm}
                disabled={confirmText !== "CONFIRMAR"}
                className="btn-primary"
                style={{ backgroundColor: confirmText === "CONFIRMAR" ? "#ef4444" : "#cbd5e1" }}
              >
                Restaurar Base de Datos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Backups;
