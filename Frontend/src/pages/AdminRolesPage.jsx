import React, { useEffect, useState } from "react";
import { rolesApi, usuariosApi, empresasApi } from "../services/api";
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
import { UserCheck, Users, Briefcase, Edit3, Trash2, Plus, Save, X, Key, Shield } from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-yellow border-t-transparent"></div>
        <span className="ml-3 font-medium text-slate-500">Cargando roles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-brand-yellow/10 rounded-2xl text-brand-yellow-hover">
          <UserCheck size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Roles y Comerciantes</h2>
          <p className="text-sm text-slate-500 mt-0.5">Administra los roles del sistema y asocia comerciantes a sus respectivas empresas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Side: Roles list & edit */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="shadow-sm border border-neutral-100 dark:border-dark-tertiary">
            <CardHeader className="border-b border-slate-100 dark:border-dark-tertiary pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Shield size={18} className="text-slate-400" />
                Listado de Roles
              </CardTitle>
              <CardDescription>Roles definidos para el control de acceso.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100 dark:divide-dark-tertiary">
                {roles.map((r) => (
                  <li key={r.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-dark-secondary/20 transition-all duration-150">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-800 dark:text-neutral-200 capitalize">{r.nombre}</div>
                      <div className="text-xs text-slate-500 dark:text-neutral-400">{r.descripcion}</div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <Badge variant="default" className="font-mono">ID {r.id}</Badge>
                      <div className="flex items-center gap-1.5">
                        {hasPermission("modificar_roles") && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEditRole(r)}
                            className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-brand-yellow-hover"
                            title="Editar"
                          >
                            <Edit3 size={15} />
                          </Button>
                        )}
                        {hasPermission("modificar_roles") && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteRole(r.id)}
                            className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-status-danger"
                            title="Desactivar"
                          >
                            <Trash2 size={15} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {editingRole && (
            <Card className="shadow-md border border-brand-yellow/30 bg-brand-yellow/5 dark:bg-dark-secondary/50">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Edit3 size={18} className="text-brand-yellow-hover" />
                    Editar Rol: {editingRole.nombre}
                  </CardTitle>
                  <CardDescription>Modifica los detalles generales del rol.</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEditingRole(null)}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <X size={16} />
                </Button>
              </CardHeader>
              <CardContent>
                <RoleEditor 
                  role={editingRole} 
                  onSave={handleSaveRole} 
                  onCancel={() => setEditingRole(null)} 
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Merchants list & create */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="shadow-sm border border-neutral-100 dark:border-dark-tertiary">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-dark-tertiary">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users size={18} className="text-slate-400" />
                Comerciantes Asociados
              </CardTitle>
              <CardDescription>Usuarios con privilegios de gestión comercial (Rol: Empresa).</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100 dark:divide-dark-tertiary max-h-[300px] overflow-y-auto">
                {comerciantes.length === 0 ? (
                  <li className="p-6 text-center text-sm text-slate-400 italic">No hay comerciantes registrados.</li>
                ) : (
                  comerciantes.map((u) => {
                    const emp = empresas.find(e => e.id === u.id_empresa);
                    return (
                      <li key={u.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-dark-secondary/20 transition-all duration-150">
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-neutral-200">{u.nombre} {u.apellido}</div>
                          <div className="text-xs text-slate-500 dark:text-neutral-400">{u.correo}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="brand" className="gap-1 font-medium">
                            <Briefcase size={12} />
                            {emp ? emp.nombre : 'Sin Empresa'}
                          </Badge>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-neutral-100 dark:border-dark-tertiary">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Plus size={18} className="text-brand-yellow-hover" />
                Crear Nuevo Comerciante
              </CardTitle>
              <CardDescription>Crea una cuenta de usuario con rol 'empresa' y conéctala a un comercio.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateComerciante} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input 
                      id="nombre"
                      name="nombre" 
                      placeholder="Nombre" 
                      value={form.nombre} 
                      onChange={handleChange} 
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input 
                      id="apellido"
                      name="apellido" 
                      placeholder="Apellido" 
                      value={form.apellido} 
                      onChange={handleChange} 
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="correo">Correo Electrónico</Label>
                  <Input 
                    id="correo"
                    type="email"
                    name="correo" 
                    placeholder="correo@ejemplo.com" 
                    value={form.correo} 
                    onChange={handleChange} 
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input 
                    id="password"
                    type="password"
                    name="password" 
                    placeholder="••••••••" 
                    value={form.password} 
                    onChange={handleChange} 
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="id_empresa">Empresa Asociada</Label>
                  <select 
                    id="id_empresa"
                    name="id_empresa" 
                    value={form.id_empresa || ""} 
                    onChange={handleChange} 
                    className="flex h-12 w-full rounded-xl border border-neutral-200 bg-white/70 backdrop-blur-sm px-4 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow/40 hover:border-brand-yellow/50 dark:bg-dark-secondary/50 dark:border-dark-tertiary dark:text-neutral-100 cursor-pointer"
                    required
                  >
                    <option value="">Selecciona una empresa</option>
                    {empresas.map((e) => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full rounded-xl">Crear Comerciante</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RoleEditor({ role, onSave, onCancel }) {
  const [form, setForm] = useState({ nombre: role.nombre, descripcion: role.descripcion });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(role.id, form); }} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="edit-nombre">Nombre del Rol</Label>
        <Input 
          id="edit-nombre"
          name="nombre" 
          value={form.nombre} 
          onChange={handleChange} 
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
