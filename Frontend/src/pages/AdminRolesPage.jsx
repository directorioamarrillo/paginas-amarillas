import React, { useEffect, useState } from "react";
import { rolesApi, usuariosApi, empresasApi } from "../services/api";
import { usePermissions } from "../context/PermissionsContext";
import { toast } from "react-toastify";

export function AdminRolesPage() {
  const [roles, setRoles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ nombre: "", apellido: "", correo: "", password: "", id_empresa: null });
  const { hasPermission } = usePermissions();
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await rolesApi.list();
        setRoles(r.data || []);
        const u = await usuariosApi.list({ limit: 200 });
        setUsuarios(u.data || []);
        const e = await empresasApi.list({ limit: 200 });
        setEmpresas(e.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar datos de roles/usuarios/empresas");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const empresaRole = roles.find((r) => String(r.nombre).toLowerCase() === "empresa");
  const empresaRoleId = empresaRole ? empresaRole.id : null;

  const comerciantes = usuarios.filter((u) => u.id_rol === empresaRoleId);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreateComerciante = async (ev) => {
    ev.preventDefault();
    if (!form.id_empresa) return toast.warn("Selecciona la empresa");
    if (!empresaRoleId) return toast.error("No existe el rol 'empresa' en el sistema");

    try {
      await empresasApi.addUsuario(form.id_empresa, {
        correo: form.correo,
        nombre: form.nombre,
        apellido: form.apellido,
        password: form.password,
        id_rol: empresaRoleId,
      });
      toast.success("Comerciante creado exitosamente");
      const u = await usuariosApi.list({ limit: 200 });
      setUsuarios(u.data || []);
      setForm({ nombre: "", apellido: "", correo: "", password: "", id_empresa: null });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Error creando comerciante");
    }
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
  };

  const handleSaveRole = async (roleId, payload) => {
    try {
      await rolesApi.update(roleId, payload);
      toast.success("Rol actualizado");
      const r = await rolesApi.list();
      setRoles(r.data || []);
      setEditingRole(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Error actualizando rol");
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm("¿Desactivar rol?")) return;
    try {
      await rolesApi.remove(roleId);
      toast.success("Rol desactivado");
      const r = await rolesApi.list();
      setRoles(r.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Error desactivando rol");
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Roles</h2>
      <p className="mt-2 text-sm text-slate-600">Roles registrados en el sistema</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h3 className="font-semibold">Listado de roles</h3>
          <ul className="mt-3 space-y-2">
            {roles.map((r) => (
              <li key={r.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.nombre}</div>
                  <div className="text-sm text-slate-500">{r.descripcion}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-400">ID {r.id}</div>
                  {hasPermission("modificar_roles") && (
                    <button className="text-sm text-blue-600" onClick={() => handleEditRole(r)}>Editar</button>
                  )}
                  {hasPermission("modificar_roles") && (
                    <button className="text-sm text-red-600" onClick={() => handleDeleteRole(r.id)}>Desactivar</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h3 className="font-semibold">Comerciantes</h3>
          <p className="text-sm text-slate-500">Usuarios con rol 'empresa'</p>

          <ul className="mt-3 space-y-2">
            {comerciantes.map((u) => (
              <li key={u.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.nombre} {u.apellido}</div>
                  <div className="text-sm text-slate-500">{u.correo}</div>
                </div>
                <div className="text-sm text-slate-400">Empresa: {u.id_empresa || '—'}</div>
              </li>
            ))}
          </ul>

          <form className="mt-4 space-y-3" onSubmit={handleCreateComerciante}>
            <h4 className="font-medium">Crear comerciante</h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="input" />
              <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} className="input" />
            </div>
            <input name="correo" placeholder="Correo" value={form.correo} onChange={handleChange} className="input" />
            <input name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} className="input" />
            <select name="id_empresa" value={form.id_empresa || ""} onChange={handleChange} className="input">
              <option value="">Selecciona empresa</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
            <div>
              <button type="submit" className="btn btn-primary">Crear comerciante</button>
            </div>
          </form>
          {editingRole && (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium">Editar rol: {editingRole.nombre}</h4>
              <RoleEditor role={editingRole} onSave={handleSaveRole} onCancel={() => setEditingRole(null)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleEditor({ role, onSave, onCancel }) {
  const [form, setForm] = useState({ nombre: role.nombre, descripcion: role.descripcion });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(role.id, form); }} className="space-y-2">
      <input name="nombre" value={form.nombre} onChange={handleChange} className="input" />
      <input name="descripcion" value={form.descripcion} onChange={handleChange} className="input" />
      <div className="flex gap-2">
        <button className="btn btn-primary" type="submit">Guardar</button>
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
