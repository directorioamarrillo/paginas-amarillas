import { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faSave, faUpload } from "@fortawesome/free-solid-svg-icons";
import { Loading } from "../components/common/Loading";
import { EmptyState } from "../components/common/EmptyState";
import { Input } from "../components/common/Input";
import { ReactSelect } from "../components/common/ReactSelect";
import { useAsyncData } from "../hooks/useAsyncData";
import { categoriasApi, empresasApi, geoApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { API_BASE_URL, SERVER_BASE_URL } from "../config/env";

export function MiEmpresaPage() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [logoArchivo, setLogoArchivo] = useState(null);

  // Load user's company
  const miEmpresa = useAsyncData(async () => {
    try {
      const { data } = await empresasApi.miEmpresa();
      return data;
    } catch (error) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  });

  const categorias = useAsyncData(async () => (await categoriasApi.list({ limit: 200 })).data);
  const [form, setForm] = useState({
    nombre: "",
    nit: "",
    correo: "",
    direccion: "",
    telefono: "",
    id_categoria: "",
    id_pais: "",
    id_departamento: "",
    id_municipio: "",
  });

  const paises = useAsyncData(async () => (await geoApi.paises({ limit: 200 })).data);
  const departamentos = useAsyncData(
    async () => (await geoApi.departamentos({ id_pais: form.id_pais || undefined, limit: 300 })).data,
    form.id_pais,
  );
  const municipios = useAsyncData(
    async () => (await geoApi.municipios({ id_departamento: form.id_departamento || undefined, limit: 400 })).data,
    form.id_departamento,
  );

  // Sync form when data loads
  useEffect(() => {
    if (miEmpresa.data) {
      setForm({
        nombre: miEmpresa.data.nombre || "",
        nit: miEmpresa.data.nit || "",
        correo: miEmpresa.data.correo || "",
        direccion: miEmpresa.data.direccion || "",
        telefono: miEmpresa.data.telefono || "",
        id_categoria: String(miEmpresa.data.id_categoria || miEmpresa.data.categoria?.id || ""),
        id_pais: String(miEmpresa.data.municipio?.departamento?.id_pais || ""),
        id_departamento: String(miEmpresa.data.municipio?.id_departamento || ""),
        id_municipio: String(miEmpresa.data.id_municipio || miEmpresa.data.municipio?.id || ""),
      });
    }
  }, [miEmpresa.data]);

  // ReactSelect options
  const categoriaOptions = useMemo(
    () => [{ value: "", label: "Selecciona categoría" }, ...(categorias.data || []).map((c) => ({ value: String(c.id), label: c.nombre }))],
    [categorias.data],
  );
  const paisOptions = useMemo(
    () => [{ value: "", label: "Selecciona país" }, ...(paises.data || []).map((p) => ({ value: String(p.id), label: p.nombre }))],
    [paises.data],
  );
  const departamentoOptions = useMemo(
    () => [{ value: "", label: "Selecciona departamento" }, ...(departamentos.data || []).map((d) => ({ value: String(d.id), label: d.nombre }))],
    [departamentos.data],
  );
  const municipioOptions = useMemo(
    () => [{ value: "", label: "Selecciona municipio" }, ...(municipios.data || []).map((m) => ({ value: String(m.id), label: m.nombre }))],
    [municipios.data],
  );

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "0.75rem",
      minHeight: "44px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#fef08a" : state.isFocused ? "#fefce8" : base.backgroundColor,
      color: "#0f172a",
    }),
  };

  const isNew = !miEmpresa.data;

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        nombre: form.nombre,
        nit: form.nit,
        correo: form.correo,
        direccion: form.direccion,
        telefono: form.telefono,
        id_categoria: Number(form.id_categoria),
        id_municipio: Number(form.id_municipio),
      };

      if (isNew) {
        payload.id_usuario_creador = user.id_usuario;
        await empresasApi.create(payload);
        pushToast({ title: "Empresa creada", message: "Tu empresa ha sido registrada con éxito", type: "success" });
      } else {
        await empresasApi.updateMiEmpresa(payload);
        pushToast({ title: "Empresa actualizada", message: "Cambios guardados", type: "success" });
      }
      
      miEmpresa.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo guardar", type: "error" });
    }
  };

  const subirLogo = async () => {
    if (!logoArchivo) {
      pushToast({ title: "Dato requerido", message: "Selecciona un archivo", type: "error" });
      return;
    }
    try {
      await empresasApi.uploadLogoMiEmpresa(logoArchivo);
      pushToast({ title: "Logo actualizado", message: "Archivo subido correctamente", type: "success" });
      setLogoArchivo(null);
      miEmpresa.reload();
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo subir logo", type: "error" });
    }
  };

  // Check if user is the creator
  const isCreator = miEmpresa.data && user?.id_usuario === miEmpresa.data.id_usuario_creador;

  if (miEmpresa.loading) {
    return <Loading />;
  }



  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Mi Empresa</h3>
        <p className="mt-1 text-sm text-slate-600">
          {isCreator ? "Edita la información de tu empresa" : "Información de tu empresa"}
        </p>
      </div>

      {/* Pending Banner */}
      {!isNew && miEmpresa.data.estado === "pendiente" && (
        <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-800 shadow-sm">
          <h4 className="font-bold">Tu empresa está en revisión</h4>
          <p className="text-sm">
            Hemos recibido los datos de tu empresa. Un administrador la revisará pronto. 
            Mientras esté en estado pendiente, tu empresa y sus productos no serán visibles públicamente.
          </p>
        </div>
      )}

      {/* Company Info */}
      {!isNew && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            {miEmpresa.data.logo_url ? (
              <img
                src={`${API_BASE_URL}/empresas/${miEmpresa.data.id}/logo`}
                alt="Logo"
                className="h-24 w-24 rounded-xl border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                <FontAwesomeIcon icon={faImage} className="h-8 w-8" />
              </div>
            )}
            <div>
              <h4 className="text-xl font-bold text-slate-900">{miEmpresa.data.nombre}</h4>
              <p className="text-sm text-slate-600">NIT: {miEmpresa.data.nit}</p>
              <p className="text-sm text-slate-500">{miEmpresa.data.correo}</p>
              {miEmpresa.data.categoria && (
                <span className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {miEmpresa.data.categoria.nombre}
                </span>
              )}
              {miEmpresa.data.estado === "pendiente" && (
                <span className="mt-1 ml-2 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
                  Pendiente de aprobación
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Logo */}
      {isCreator && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Subir logo</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className="rounded-xl border border-slate-300 px-3 py-2"
              type="file"
              accept="image/*"
              onChange={(e) => setLogoArchivo(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 font-bold text-[#1F1F1F] transition hover:bg-primary-dark shadow-sm"
              onClick={subirLogo}
            >
              <FontAwesomeIcon icon={faUpload} />
              Subir logo
            </button>
          </div>
        </div>
      )}

      {/* Edit/Create Form */}
      {isCreator || isNew ? (
        <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <h3 className="md:col-span-2 text-xl font-bold text-slate-900">{isNew ? "Registrar nueva empresa" : "Editar empresa"}</h3>
          <Input label="Nombre" value={form.nombre} onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))} required />
          <Input label="NIT" value={form.nit} onChange={(e) => setForm((prev) => ({ ...prev, nit: e.target.value }))} required />
          <Input label="Correo" type="email" value={form.correo} onChange={(e) => setForm((prev) => ({ ...prev, correo: e.target.value }))} required />
          <Input label="Dirección" value={form.direccion} onChange={(e) => setForm((prev) => ({ ...prev, direccion: e.target.value }))} required />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))} required />

          <ReactSelect
            label="Categoría"
            value={categoriaOptions.find((o) => o.value === form.id_categoria) || null}
            onChange={(selected) => setForm((prev) => ({ ...prev, id_categoria: selected?.value || "" }))}
            options={categoriaOptions.filter((o) => o.value !== "")}
            placeholder="Selecciona categoría"
            isClearable={false}
            styles={selectStyles}
            required
          />

          <ReactSelect
            label="País"
            value={paisOptions.find((o) => o.value === form.id_pais) || null}
            onChange={(selected) => setForm((prev) => ({ ...prev, id_pais: selected?.value || "", id_departamento: "", id_municipio: "" }))}
            options={paisOptions.filter((o) => o.value !== "")}
            placeholder="Selecciona país"
            isClearable={false}
            styles={selectStyles}
            required
          />

          <ReactSelect
            label="Departamento"
            value={departamentoOptions.find((o) => o.value === form.id_departamento) || null}
            onChange={(selected) => setForm((prev) => ({ ...prev, id_departamento: selected?.value || "", id_municipio: "" }))}
            options={departamentoOptions.filter((o) => o.value !== "")}
            placeholder="Selecciona departamento"
            isClearable={false}
            styles={selectStyles}
            required
            isDisabled={!form.id_pais}
          />

          <ReactSelect
            label="Municipio"
            value={municipioOptions.find((o) => o.value === form.id_municipio) || null}
            onChange={(selected) => setForm((prev) => ({ ...prev, id_municipio: selected?.value || "" }))}
            options={municipioOptions.filter((o) => o.value !== "")}
            placeholder="Selecciona municipio"
            isClearable={false}
            styles={selectStyles}
            required
            isDisabled={!form.id_departamento}
          />

          <button
            type="submit"
            className="md:col-span-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-[#1F1F1F] transition hover:bg-primary-dark shadow-md"
          >
            <FontAwesomeIcon icon={faSave} />
            Guardar cambios
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
          Solo el creador de la empresa puede editar la información.
        </div>
      )}
    </section>
  );
}
