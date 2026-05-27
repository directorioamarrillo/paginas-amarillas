import { usuariosApi, rolesApi, empresasApi } from "../services/api";
import { usePermissions } from "../context/PermissionsContext";
import { useConfirm } from "../context/ConfirmContext";
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
import { Users, UserPlus, Shield, Trash2, Mail, Lock, Building, Plus } from "lucide-react";

export function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: "", apellido: "", correo: "", password: "", id_rol: null, id_empresa: null });
  const { hasPermission } = usePermissions();
  const confirm = useConfirm();

  useEffect(() => {
    async function load() {
      try {
        const u = await usuariosApi.list({ limit: 200 });
        // Only show active users (soft-deleted ones go to Archivo de Registros Eliminados)
        setUsuarios((u.data || []).filter((x) => !x.deleted_at));
        const r = await rolesApi.list();
        setRoles(r.data || []);
        const e = await empresasApi.list({ limit: 200 });
        setEmpresas((e.data || []).filter((x) => !x.deleted_at));
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
    const isConfirmed = await confirm("¿Deshabilitar usuario? Se moverá al Archivo de Registros Eliminados.", "Deshabilitar Usuario");
    if (!isConfirmed) return;
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-yellow border-t-transparent"></div>
        <span className="ml-3 font-medium text-slate-500">Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-brand-yellow/10 rounded-2xl text-brand-yellow-hover">
          <Users size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Usuarios del Sistema</h2>
          <p className="text-sm text-slate-500 mt-0.5">Administra las cuentas de usuario, asigna roles de acceso y vincula perfiles a empresas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Side: Users list */}
        <Card className="lg:col-span-7 shadow-sm border border-neutral-100 dark:border-dark-tertiary">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-dark-tertiary">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users size={18} className="text-slate-400" />
              Listado de Cuentas
            </CardTitle>
            <CardDescription>Cuentas registradas en la plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-100 dark:divide-dark-tertiary max-h-[600px] overflow-y-auto">
              {usuarios.length === 0 ? (
                <li className="p-6 text-center text-sm text-slate-400 italic">No se encontraron usuarios.</li>
              ) : (
                usuarios.map((u) => {
                  const rolObj = roles.find(r => r.id === u.id_rol);
                  const empObj = empresas.find(e => e.id === u.id_empresa);
                  return (
                    <li key={u.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-dark-secondary/20 transition-all duration-150">
                      <div className="space-y-1 pr-4">
                        <div className="font-semibold text-slate-800 dark:text-neutral-200">
                          {u.nombre} {u.apellido}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-2">
                          <span>{u.correo}</span>
                          {empObj && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400 font-medium">{empObj.nombre}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {rolObj && (
                          <Badge variant="brand" className="capitalize">
                            {rolObj.nombre}
                          </Badge>
                        )}
                        {hasPermission("modificar_usuarios") && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDisable(u.id)}
                            className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-status-danger"
                            title="Deshabilitar"
                          >
                            <Trash2 size={15} />
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Right Side: Create user form */}
        <Card className="lg:col-span-5 shadow-sm border border-neutral-100 dark:border-dark-tertiary">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <UserPlus size={18} className="text-brand-yellow-hover" />
              Crear Nuevo Usuario
            </CardTitle>
            <CardDescription>Completa los datos de perfil y define su nivel de autorización.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
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
                  leftIcon={<Mail size={16} />}
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
                  leftIcon={<Lock size={16} />}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="id_rol">Rol de Acceso</Label>
                <select 
                  id="id_rol"
                  name="id_rol" 
                  value={form.id_rol || ""} 
                  onChange={(e) => setForm({ ...form, id_rol: e.target.value ? parseInt(e.target.value) : null })}
                  className="flex h-12 w-full rounded-xl border border-neutral-200 bg-white/70 backdrop-blur-sm px-4 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow/40 hover:border-brand-yellow/50 dark:bg-dark-secondary/50 dark:border-dark-tertiary dark:text-neutral-100 cursor-pointer"
                >
                  <option value="">Selecciona un rol (opcional)</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="id_empresa">Empresa Relacionada</Label>
                <select 
                  id="id_empresa"
                  name="id_empresa" 
                  value={form.id_empresa || ""} 
                  onChange={(e) => setForm({ ...form, id_empresa: e.target.value ? parseInt(e.target.value) : null })}
                  className="flex h-12 w-full rounded-xl border border-neutral-200 bg-white/70 backdrop-blur-sm px-4 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow/40 hover:border-brand-yellow/50 dark:bg-dark-secondary/50 dark:border-dark-tertiary dark:text-neutral-100 cursor-pointer"
                >
                  <option value="">Selecciona una empresa (opcional)</option>
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                {hasPermission("crear_usuarios") ? (
                  <Button type="submit" className="w-full rounded-xl">Crear Usuario</Button>
                ) : (
                  <Button className="w-full rounded-xl" disabled>Sin permiso para crear</Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
