import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { AxiosError } from "axios";
import { navigate } from "astro:transitions/client";

type Props = {
  listaMunicipios: any[];
  listaCategoria: any[];
  initialValue: any;
  id: string | undefined;
};

export function CrearEmpresa({
  listaCategoria,
  listaMunicipios,
  initialValue,
  id,
}: Props) {
  const [statusForm, setStatusForm] = useState<{
    isLoading: boolean;
    error: string | null;
    success: boolean;
  }>({
    isLoading: false,
    error: null,
    success: false,
  });
  const [formState, setFormState] = useState({
    nombre: initialValue?.nombre || "",
    nit: initialValue?.nit || "",
    correo: initialValue?.correo || "",
    direccion: initialValue?.direccion || "",
    logo: initialValue?.logo || "",
    telefono: initialValue?.telefono || "",
    id_categoria: initialValue?.id_categoria || "",
    id_municipio: initialValue?.id_municipio || "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialValue?.logo || null
  );

  useEffect(() => {
    setFormState({
      nombre: initialValue?.nombre || "",
      nit: initialValue?.nit || "",
      correo: initialValue?.correo || "",
      direccion: initialValue?.direccion || "",
      logo: initialValue?.logo || "",
      telefono: initialValue?.telefono || "",
      id_categoria: initialValue?.id_categoria || "",
      id_municipio: initialValue?.id_municipio || "",
    });
    setLogoPreview(initialValue?.logo || null);
  }, [initialValue]);
  const validate = () => {
    if (!formState.nombre.trim()) return "El nombre es obligatorio.";
    if (!formState.nit.toString().trim()) return "El NIT es obligatorio.";
    if (!/^[0-9\-]+$/.test(formState.nit.toString()))
      return "El NIT solo puede contener números y guiones.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formState.correo))
      return "Correo electrónico inválido.";
    if (!formState.direccion.trim()) return "La dirección es obligatoria.";
    if (!formState.telefono.toString().trim()) return "El teléfono es obligatorio.";
    if (!/^[0-9]{7,15}$/.test(formState.telefono.toString()))
      return "Teléfono inválido (7-15 dígitos).";
    if (!formState.id_categoria) return "Selecciona una categoría.";
    if (!formState.id_municipio) return "Selecciona un municipio.";
    return null;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const clientError = validate();
    if (clientError) {
      setStatusForm({ isLoading: false, error: clientError, success: false });
      return;
    }

    setStatusForm((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const payload = {
        nombre: formState.nombre,
        nit: formState.nit,
        correo: formState.correo,
        direccion: formState.direccion,
        logo: formState.logo,
        telefono: formState.telefono,
        id_categoria: Number(formState.id_categoria),
        id_municipio: Number(formState.id_municipio),
      };

      if (id) {
        await axiosInstance(`/api/empresas/${id}`, {
          method: "PUT",
          data: payload,
        });
      } else {
        await axiosInstance("/api/empresas", {
          method: "POST",
          data: payload,
        });
      }

      setStatusForm({ isLoading: false, error: null, success: true });
      // Redirigir luego de un breve delay para que el usuario vea el mensaje
      setTimeout(() => navigate("/"), 900);
    } catch (error) {
      if (error instanceof AxiosError) {
        const message =
          (error.response as any)?.data?.detail || "Ocurrió un error inesperado.";
        setStatusForm({ isLoading: false, error: message, success: false });
      } else {
        setStatusForm({ isLoading: false, error: "Error desconocido.", success: false });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as any;
    setFormState((s) => ({ ...s, [name]: value }));
    if (name === "logo") {
      // Intentar setear vista previa si URL parece válida
      try {
        const url = value.trim();
        if (url.startsWith("http")) setLogoPreview(url);
        else setLogoPreview(null);
      } catch {
        setLogoPreview(null);
      }
    }
  };

  return (
    <form className="max-w-3xl mx-auto bg-white/90 p-6 rounded-xl shadow-md" onSubmit={onSubmit}>
      <h3 className="text-2xl font-bold mb-4">{id ? "Editar empresa" : "Registrar empresa"}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            name="nombre"
            value={formState.nombre}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:ring-amarillo focus:border-amarillo"
            placeholder="Nombre de la empresa"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">NIT</label>
          <input
            name="nit"
            value={formState.nit}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2"
            placeholder="900123456-1"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
          <input
            name="correo"
            type="email"
            value={formState.correo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2"
            placeholder="contacto@empresa.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Dirección</label>
          <input
            name="direccion"
            value={formState.direccion}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2"
            placeholder="Calle 123 # 45-67"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Logo (URL)</label>
          <input
            name="logo"
            value={formState.logo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2"
            placeholder="https://.../logo.png"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            name="telefono"
            value={formState.telefono}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2"
            placeholder="3001234567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Categoría</label>
          <select
            name="id_categoria"
            value={formState.id_categoria}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2"
          >
            <option value="">Seleccione</option>
            {listaCategoria.map((item) => (
              <option value={item.id_categoria} key={`${item.nombre}-${item.id_categoria}`}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Municipio</label>
          <select
            name="id_municipio"
            value={formState.id_municipio}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2"
          >
            <option value="">Seleccione</option>
            {listaMunicipios.map((item) => (
              <option value={item.id_municipio} key={`${item.nombre}-${item.id_municipio}`}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>

      </div>

      {logoPreview && (
        <div className="mt-4 mb-4">
          <p className="text-sm text-gray-600 mb-2">Vista previa del logo:</p>
          <img src={logoPreview} alt="Logo preview" className="w-40 h-40 object-contain rounded-md border" />
        </div>
      )}

      {statusForm.error && (
        <div className="mt-4 text-sm text-red-600">{statusForm.error}</div>
      )}
      {statusForm.success && (
        <div className="mt-4 text-sm text-green-600">Operación realizada correctamente.</div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={statusForm.isLoading}
          className="inline-flex items-center px-5 py-2 bg-amarillo text-white rounded-md hover:bg-amarillo-oscuro transition disabled:opacity-60"
        >
          {statusForm.isLoading ? "Procesando..." : id ? "Guardar" : "Registrar"}
        </button>
        <a href="/" className="text-sm text-gray-600 hover:underline">Cancelar</a>
      </div>
    </form>
  );
}
