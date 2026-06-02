import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faBuilding,
  faShieldHalved,
  faSave,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import {
  User,
  Mail,
  Shield,
  Building2,
  BadgeCheck,
  Settings,
  Save,
  Info,
  Fingerprint,
  UserCog,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usuariosApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { Loading } from "../components/common/Loading";

export function PerfilPage() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    rol: "",
    id_rol: "",
    id_empresa: "",
  });

  useEffect(() => {
    const cargarPerfil = async () => {
      if (!user?.id_usuario) {
        return;
      }
      setLoading(true);
      try {
        const { data } = await usuariosApi.get(user.id_usuario);
        setPerfil(data);
        setForm({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          correo: data.correo || "",
          rol: data.rol || "",
          id_rol: data.id_rol || "",
          id_empresa: data.id_empresa || "",
        });
      } catch (error) {
        pushToast({
          title: "Error",
          message: "No se pudo cargar el perfil",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    cargarPerfil();
  }, [user]);

  const guardar = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        rol: form.rol || null,
        id_rol: form.id_rol ? Number(form.id_rol) : null,
        id_empresa: form.id_empresa ? Number(form.id_empresa) : null,
      };
      await usuariosApi.update(user.id_usuario, payload);
      pushToast({
        title: "Perfil actualizado",
        message: "Tus datos han sido guardados exitosamente",
        type: "success",
      });
    } catch (error) {
      pushToast({
        title: "Error",
        message: error?.response?.data?.detail || "No se pudo actualizar",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Cargando perfil..." />;
  }

  const iniciales = `${form.nombre?.[0] || ""}${form.apellido?.[0] || ""}`.toUpperCase() || "U";

  return (
    <section className="space-y-6">
      {/* Header con Avatar */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-dark border border-primary/20 p-8 text-white shadow-lg">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary blur-3xl"></div>
        </div>

        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary text-brand-dark text-4xl font-black shadow-[0_0_15px_rgba(244,181,30,0.4)]">
            {iniciales}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-white drop-shadow-md break-words">
              {form.nombre || "-"} <span className="text-primary">{form.apellido || "-"}</span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-bold text-primary/80 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="break-all">{form.correo || "-"}</span>
              </div>
              {form.rol && (
                <>
                  <span className="text-primary/30">•</span>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Shield className="w-4 h-4" />
                    <span>{form.rol}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* ID Usuario */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">ID Usuario</p>
              <p className="text-lg font-black text-slate-900">
                {perfil?.id || user?.id_usuario || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Rol ID */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-50 text-secondary-500">
              <UserCog className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">ID Rol</p>
              <p className="text-lg font-black text-slate-900">
                {form.id_rol || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Empresa ID */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-success">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">ID Empresa</p>
              <p className="text-lg font-black text-slate-900">
                {form.id_empresa || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de Edición */}
      <form onSubmit={guardar} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 flex items-center gap-3 text-xl font-black text-slate-900 uppercase tracking-widest">
          <Settings className="w-5 h-5 text-primary" />
          Editar Información
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label={<span className="text-slate-700 uppercase tracking-widest text-xs font-bold">Nombre</span>}
            icon={faUser}
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
            required
            className="bg-slate-50 border-slate-300 text-slate-900 focus:border-primary focus:ring-primary/20"
          />

          <Input
            label={<span className="text-slate-700 uppercase tracking-widest text-xs font-bold">Apellido</span>}
            icon={faUser}
            placeholder="Tu apellido"
            value={form.apellido}
            onChange={(e) => setForm((prev) => ({ ...prev, apellido: e.target.value }))}
            required
            className="bg-slate-50 border-slate-300 text-slate-900 focus:border-primary focus:ring-primary/20"
          />

          <Input
            label={<span className="text-slate-700 uppercase tracking-widest text-xs font-bold">Correo</span>}
            icon={faEnvelope}
            type="email"
            placeholder="tu@correo.com"
            value={form.correo}
            onChange={(e) => setForm((prev) => ({ ...prev, correo: e.target.value }))}
            required
            className="bg-slate-50 border-slate-300 text-slate-900 focus:border-primary focus:ring-primary/20"
          />

          <Input
            label={<span className="text-slate-700 uppercase tracking-widest text-xs font-bold">Rol</span>}
            icon={faShieldHalved}
            placeholder="Ej: admin, usuario"
            value={form.rol}
            onChange={(e) => setForm((prev) => ({ ...prev, rol: e.target.value }))}
            helperText={<span className="text-slate-500 uppercase tracking-wider text-[10px]">Rol del usuario en el sistema</span>}
            className="bg-slate-50 border-slate-300 text-slate-900 focus:border-primary focus:ring-primary/20"
          />

          <Input
            label={<span className="text-slate-700 uppercase tracking-widest text-xs font-bold">ID Rol</span>}
            icon={faUserGear}
            type="number"
            placeholder="Ej: 1"
            value={form.id_rol}
            onChange={(e) => setForm((prev) => ({ ...prev, id_rol: e.target.value }))}
            helperText={<span className="text-slate-500 uppercase tracking-wider text-[10px]">Identificador numérico del rol</span>}
            className="bg-slate-50 border-slate-300 text-slate-900 focus:border-primary focus:ring-primary/20"
          />

          <Input
            label={<span className="text-slate-700 uppercase tracking-widest text-xs font-bold">ID Empresa</span>}
            icon={faBuilding}
            type="number"
            placeholder="Ej: 1"
            value={form.id_empresa}
            onChange={(e) => setForm((prev) => ({ ...prev, id_empresa: e.target.value }))}
            helperText={<span className="text-slate-500 uppercase tracking-wider text-[10px]">Empresa asociada (opcional)</span>}
            className="bg-slate-50 border-slate-300 text-slate-900 focus:border-primary focus:ring-primary/20"
          />
        </div>

        {/* Info Box */}
        <div className="mt-8 flex items-start gap-4 rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm font-bold text-slate-700">
          <Info className="mt-0.5 w-5 h-5 text-primary flex-shrink-0" />
          <p className="uppercase tracking-widest text-[11px] leading-relaxed">
            Los cambios se aplicarán inmediatamente después de guardar.<br/> El campo de rol e IDs son configurables solo por administradores.
          </p>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-black text-brand-dark bg-primary border border-primary-dark uppercase tracking-widest transition-all hover:bg-primary-dark hover:shadow-[0_4px_15px_rgba(244,181,30,0.3)] disabled:opacity-50 flex justify-center items-center gap-3"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}
