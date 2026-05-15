import React, { useEffect, useState } from "react";
import { usuariosApi } from "../services/api";
import { usePermissions } from "../context/PermissionsContext";
import { toast } from "react-toastify";

export function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: "", apellido: "", correo: "", password: "", id_rol: null, id_empresa: null });
  const { hasPermission } = usePermissions();

  useEffect(() => {
    async function load() {
      try {
        const r = await usuariosApi.list({ limit: 200 });
        setUsuarios(r.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (ev) => {
    ev.preventDefault();
    try {
      if (!hasPermission("crear_usuarios")) return toast.error("Sin permiso para crear usuarios");
      await usuariosApi.create(form);
      toast.success("Usuario creado");
      const r = await usuariosApi.list({ limit: 200 });
      setUsuarios(r.data || []);
      setForm({ nombre: "", apellido: "", correo: "", password: "", id_rol: null, id_empresa: null });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Error creando usuario");
    }
  };

  const handleDisable = async (id) => {
    if (!confirm("¿Deshabilitar usuario?")) return;
    try {
      if (!hasPermission("modificar_usuarios")) return toast.error("Sin permiso para deshabilitar usuarios");
      await usuariosApi.remove(id);
      toast.success("Usuario deshabilitado");
      const r = await usuariosApi.list({ limit: 200 });
      setUsuarios(r.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Error deshabilitando usuario");
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Usuarios</h2>
      <p className="mt-2 text-sm text-slate-600">Gestionar usuarios del sistema (crear, deshabilitar)</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h3 className="font-semibold">Listado</h3>
          <ul className="mt-3 space-y-2">
            {usuarios.map((u) => (
              <li key={u.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.nombre} {u.apellido} {u.rol ? `(${u.rol})` : ''}</div>
                  <div className="text-sm text-slate-500">{u.correo}</div>
                </div>
                <div className="text-sm text-slate-400 flex items-center gap-2">
                  <button className="text-red-600" onClick={() => handleDisable(u.id)}>Deshabilitar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h3 className="font-semibold">Crear usuario</h3>
          <form className="mt-3 space-y-3" onSubmit={handleCreate}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="input" />
              <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} className="input" />
            </div>
            <input name="correo" placeholder="Correo" value={form.correo} onChange={handleChange} className="input" />
            <input name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} className="input" />
            <input name="id_rol" placeholder="ID Rol (opcional)" value={form.id_rol || ''} onChange={handleChange} className="input" />
            <input name="id_empresa" placeholder="ID Empresa (opcional)" value={form.id_empresa || ''} onChange={handleChange} className="input" />
            <div>
              <button className="btn btn-primary">Crear usuario</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
