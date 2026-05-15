import React, { useEffect, useState } from "react";
import { permisosApi } from "../services/api";
import { usePermissions } from "../context/PermissionsContext";
import { toast } from "react-toastify";

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

  if (loading) return <div>Cargando permisos...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Permisos</h2>
      <p className="mt-2 text-sm text-slate-600">Administrar permisos del sistema</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h3 className="font-semibold">Listado</h3>
          <ul className="mt-3 space-y-2">
            {permisos.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.key}</div>
                  <div className="text-sm text-slate-500">{p.descripcion}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-400">ID {p.id}</div>
                  {hasPermission("modificar_permisos") && (
                    <button className="text-sm text-blue-600" onClick={() => handleEdit(p)}>Editar</button>
                  )}
                  {hasPermission("modificar_permisos") && (
                    <button className="text-sm text-red-600" onClick={() => handleDelete(p.id)}>Desactivar</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h3 className="font-semibold">Crear permiso</h3>
          <form className="mt-3 space-y-3" onSubmit={handleCreate}>
            <input name="key" placeholder="Key (ej: crear_marketplace)" value={form.key} onChange={handleChange} className="input" />
            <input name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} className="input" />
            <div>
              {hasPermission("crear_permisos") ? (
                <button className="btn btn-primary">Crear</button>
              ) : (
                <button className="btn" disabled>Sin permiso</button>
              )}
            </div>
          </form>
          {editing && (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium">Editar permiso: {editing.key}</h4>
              <PermEditor permiso={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
            </div>
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
    <form onSubmit={(e) => { e.preventDefault(); onSave(permiso.id, form); }} className="space-y-2">
      <input name="key" value={form.key} onChange={handleChange} className="input" />
      <input name="descripcion" value={form.descripcion} onChange={handleChange} className="input" />
      <div className="flex gap-2">
        <button className="btn btn-primary" type="submit">Guardar</button>
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
