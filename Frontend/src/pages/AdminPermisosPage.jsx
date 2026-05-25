import React, { useEffect, useState } from "react";
import { permisosApi } from "../services/api";
import { usePermissions } from "../context/PermissionsContext";
import { toast } from "react-toastify";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Badge } from "../components/ui/Badge";
import { Shield, Key, Edit3, Trash2, Plus, Save, X, Settings } from "lucide-react";

export function AdminPermisosPage() {
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ key: "", descripcion: "" });
  const { hasPermission } = usePermissions();
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await permisosApi.list({ limit: 200 });
        setPermisos(r.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar permisos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (ev) => {
    ev.preventDefault();
    if (!form.key) return toast.warn("La key es requerida");
    try {
      await permisosApi.create(form);
      toast.success("Permiso creado");
      const r = await permisosApi.list({ limit: 200 });
      setPermisos(r.data || []);
      setForm({ key: "", descripcion: "" });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Error creando permiso");
    }
  };

  const handleEdit = (perm) => setEditing(perm);

  const handleSave = async (id, payload) => {
    try {
      await permisosApi.update(id, payload);
      toast.success("Permiso actualizado");
      const r = await permisosApi.list({ limit: 200 });
      setPermisos(r.data || []);
      setEditing(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Error actualizando permiso");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Desactivar permiso?")) return;
    try {
      await permisosApi.remove(id);
      toast.success("Permiso desactivado");
      const r = await permisosApi.list({ limit: 200 });
      setPermisos(r.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Error desactivando permiso");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-yellow border-t-transparent"></div>
        <span className="ml-3 font-medium text-slate-500">Cargando permisos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-brand-yellow/10 rounded-2xl text-brand-yellow-hover">
          <Shield size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Permisos del Sistema</h2>
          <p className="text-sm text-slate-500 mt-0.5">Define y administra los permisos que regulan las operaciones en la plataforma.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Side: List */}
        <Card className="lg:col-span-7 shadow-sm border border-neutral-100 dark:border-dark-tertiary">
          <CardHeader className="border-b border-slate-100 dark:border-dark-tertiary pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Settings size={18} className="text-slate-400" />
              Listado de Permisos
            </CardTitle>
            <CardDescription>Todos los permisos de seguridad registrados.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-100 dark:divide-dark-tertiary max-h-[600px] overflow-y-auto">
              {permisos.length === 0 ? (
                <li className="p-6 text-center text-sm text-slate-400 italic">No se encontraron permisos.</li>
              ) : (
                permisos.map((p) => (
                  <li key={p.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-dark-secondary/20 transition-all duration-150">
                    <div className="space-y-1 pr-4">
                      <div className="font-mono text-sm font-semibold text-slate-800 dark:text-neutral-200">{p.key}</div>
                      <div className="text-xs text-slate-500 dark:text-neutral-400">{p.descripcion}</div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <Badge variant="default" className="font-mono">ID {p.id}</Badge>
                      <div className="flex items-center gap-1.5">
                        {hasPermission("modificar_permisos") && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEdit(p)}
                            className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-brand-yellow-hover"
                            title="Editar"
                          >
                            <Edit3 size={15} />
                          </Button>
                        )}
                        {hasPermission("modificar_permisos") && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDelete(p.id)}
                            className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-status-danger"
                            title="Desactivar"
                          >
                            <Trash2 size={15} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Right Side: Create/Edit Forms */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-sm border border-neutral-100 dark:border-dark-tertiary">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Plus size={18} className="text-brand-yellow-hover" />
                Crear Nuevo Permiso
              </CardTitle>
              <CardDescription>Agrega una nueva llave de permiso para usar en el control de acceso del código.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="key">Key del Permiso</Label>
                  <Input 
                    id="key"
                    name="key" 
                    placeholder="Ej: crear_marketplace" 
                    value={form.key} 
                    onChange={handleChange} 
                    leftIcon={<Key size={16} />}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input 
                    id="descripcion"
                    name="descripcion" 
                    placeholder="Descripción legible de lo que permite hacer" 
                    value={form.descripcion} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="pt-2">
                  {hasPermission("crear_permisos") ? (
                    <Button type="submit" className="w-full rounded-xl">Crear Permiso</Button>
                  ) : (
                    <Button className="w-full rounded-xl" disabled>Sin permiso para crear</Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {editing && (
            <Card className="shadow-md border border-brand-yellow/30 bg-brand-yellow/5 dark:bg-dark-secondary/50">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Edit3 size={18} className="text-brand-yellow-hover" />
                    Editar Permiso
                  </CardTitle>
                  <CardDescription>Modifica la configuración de {editing.key}.</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEditing(null)}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <X size={16} />
                </Button>
              </CardHeader>
              <CardContent>
                <PermEditor 
                  permiso={editing} 
                  onSave={handleSave} 
                  onCancel={() => setEditing(null)} 
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function PermEditor({ permiso, onSave, onCancel }) {
  const [form, setForm] = useState({ key: permiso.key, descripcion: permiso.descripcion });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(permiso.id, form); }} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="edit-key">Key del Permiso</Label>
        <Input 
          id="edit-key"
          name="key" 
          value={form.key} 
          onChange={handleChange} 
          leftIcon={<Key size={16} />}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-desc">Descripción</Label>
        <Input 
          id="edit-desc"
          name="descripcion" 
          value={form.descripcion} 
          onChange={handleChange} 
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="primary" type="submit" className="flex-1 rounded-xl" leftIcon={<Save size={16} />}>
          Guardar
        </Button>
        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onCancel} leftIcon={<X size={16} />}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
