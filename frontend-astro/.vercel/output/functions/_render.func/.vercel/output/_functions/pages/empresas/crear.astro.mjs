/* empty css                                    */
import { c as createComponent, r as renderTemplate, a as renderComponent, b as createAstro, m as maybeRenderHead } from '../../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as axiosInstance } from '../../chunks/axiosInstance_CYLkHHxf.mjs';
import { AxiosError } from 'axios';
import { n as navigate } from '../../chunks/router_vN4ZPF0m.mjs';
import { $ as $$GlobalLayout } from '../../chunks/GlobalLayout_OchguJay.mjs';
import fs from 'fs/promises';
import path from 'path';
export { renderers } from '../../renderers.mjs';

function CrearEmpresa({
  listaCategoria,
  listaMunicipios,
  initialValue,
  id
}) {
  const [statusForm, setStatusForm] = useState({
    isLoading: false,
    error: null,
    success: false
  });
  const [formState, setFormState] = useState({
    nombre: initialValue?.nombre || "",
    nit: initialValue?.nit || "",
    correo: initialValue?.correo || "",
    direccion: initialValue?.direccion || "",
    logo: initialValue?.logo || "",
    telefono: initialValue?.telefono || "",
    id_categoria: initialValue?.id_categoria || "",
    id_municipio: initialValue?.id_municipio || ""
  });
  const [logoPreview, setLogoPreview] = useState(
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
      id_municipio: initialValue?.id_municipio || ""
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
  const onSubmit = async (e) => {
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
        id_municipio: Number(formState.id_municipio)
      };
      if (id) {
        await axiosInstance(`/api/empresas/${id}`, {
          method: "PUT",
          data: payload
        });
      } else {
        await axiosInstance("/api/empresas", {
          method: "POST",
          data: payload
        });
      }
      setStatusForm({ isLoading: false, error: null, success: true });
      setTimeout(() => navigate("/"), 900);
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.detail || "Ocurrió un error inesperado.";
        setStatusForm({ isLoading: false, error: message, success: false });
      } else {
        setStatusForm({ isLoading: false, error: "Error desconocido.", success: false });
      }
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((s) => ({ ...s, [name]: value }));
    if (name === "logo") {
      try {
        const url = value.trim();
        if (url.startsWith("http")) setLogoPreview(url);
        else setLogoPreview(null);
      } catch {
        setLogoPreview(null);
      }
    }
  };
  return /* @__PURE__ */ jsxs("form", { className: "max-w-3xl mx-auto bg-white/90 p-6 rounded-xl shadow-md", onSubmit, children: [
    /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold mb-4", children: id ? "Editar empresa" : "Registrar empresa" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Nombre" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            name: "nombre",
            value: formState.nombre,
            onChange: handleChange,
            className: "mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 focus:ring-amarillo focus:border-amarillo",
            placeholder: "Nombre de la empresa"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "NIT" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            name: "nit",
            value: formState.nit,
            onChange: handleChange,
            className: "mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2",
            placeholder: "900123456-1"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Correo electrónico" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            name: "correo",
            type: "email",
            value: formState.correo,
            onChange: handleChange,
            className: "mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2",
            placeholder: "contacto@empresa.com"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Dirección" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            name: "direccion",
            value: formState.direccion,
            onChange: handleChange,
            className: "mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2",
            placeholder: "Calle 123 # 45-67"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Logo (URL)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            name: "logo",
            value: formState.logo,
            onChange: handleChange,
            className: "mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2",
            placeholder: "https://.../logo.png"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Teléfono" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            name: "telefono",
            value: formState.telefono,
            onChange: handleChange,
            className: "mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2",
            placeholder: "3001234567"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Categoría" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            name: "id_categoria",
            value: formState.id_categoria,
            onChange: handleChange,
            className: "mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Seleccione" }),
              listaCategoria.map((item) => /* @__PURE__ */ jsx("option", { value: item.id_categoria, children: item.nombre }, `${item.nombre}-${item.id_categoria}`))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Municipio" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            name: "id_municipio",
            value: formState.id_municipio,
            onChange: handleChange,
            className: "mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Seleccione" }),
              listaMunicipios.map((item) => /* @__PURE__ */ jsx("option", { value: item.id_municipio, children: item.nombre }, `${item.nombre}-${item.id_municipio}`))
            ]
          }
        )
      ] })
    ] }),
    logoPreview && /* @__PURE__ */ jsxs("div", { className: "mt-4 mb-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Vista previa del logo:" }),
      /* @__PURE__ */ jsx("img", { src: logoPreview, alt: "Logo preview", className: "w-40 h-40 object-contain rounded-md border" })
    ] }),
    statusForm.error && /* @__PURE__ */ jsx("div", { className: "mt-4 text-sm text-red-600", children: statusForm.error }),
    statusForm.success && /* @__PURE__ */ jsx("div", { className: "mt-4 text-sm text-green-600", children: "Operación realizada correctamente." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: statusForm.isLoading,
          className: "inline-flex items-center px-5 py-2 bg-amarillo text-white rounded-md hover:bg-amarillo-oscuro transition disabled:opacity-60",
          children: statusForm.isLoading ? "Procesando..." : id ? "Guardar" : "Registrar"
        }
      ),
      /* @__PURE__ */ jsx("a", { href: "/", className: "text-sm text-gray-600 hover:underline", children: "Cancelar" })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const rol = (Astro2.cookies.get("rol") || {})?.value;
  const id = Astro2.url.searchParams.get("id") || "";
  if (!rol || rol !== "admin") {
    return Astro2.redirect("/");
  }
  let dataMunicipio = [];
  let dataCategoria = [];
  let initialValue = void 0;
  try {
    const resp = await axiosInstance("/api/municipios", { method: "GET", params: { skip: 0, limit: 100 } });
    dataMunicipio = resp.data;
  } catch (e) {
    try {
      const mockPath = path.join(process.cwd(), "public", "mock", "municipios.json");
      const content = await fs.readFile(mockPath, "utf-8");
      dataMunicipio = JSON.parse(content);
      console.log("Fallback municipios ->", mockPath);
    } catch (me) {
      console.warn("No hay mock de municipios", me);
      dataMunicipio = [];
    }
  }
  try {
    const resp = await axiosInstance("/api/categorias", { method: "GET", params: { skip: 0, limit: 100 } });
    dataCategoria = resp.data;
  } catch (e) {
    try {
      const mockPath = path.join(process.cwd(), "public", "mock", "categorias.json");
      const content = await fs.readFile(mockPath, "utf-8");
      dataCategoria = JSON.parse(content);
      console.log("Fallback categorias ->", mockPath);
    } catch (me) {
      console.warn("No hay mock de categorias", me);
      dataCategoria = [];
    }
  }
  if (id) {
    try {
      const { data } = await axiosInstance(`/api/empresas/${id}`, { method: "GET" });
      initialValue = data;
    } catch (e) {
      try {
        const mockPath = path.join(process.cwd(), "public", "mock", "empresas.json");
        const content = await fs.readFile(mockPath, "utf-8");
        const all = JSON.parse(content);
        initialValue = all.find((it) => String(it.id_empresa) === String(id)) || void 0;
        console.log("Fallback empresa detail ->", mockPath);
      } catch (me) {
        console.warn("No hay mock para empresa detail", me);
        initialValue = void 0;
      }
    }
  }
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Registrar empresa" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-[calc(100vh-110px)] flex items-start justify-center py-12"> <section class="w-full max-w-5xl"> <div class="flex items-center justify-between mb-6"> <div> <h2 class="text-3xl font-bold text-gray-900">${id ? "Editar empresa" : "Registrar empresa"}</h2> <p class="text-sm text-gray-500 mt-1">Completa la información para publicar la empresa en el directorio.</p> </div> <nav class="flex gap-3"> <a href="/empresas/categorias" class="inline-flex items-center gap-2 px-4 py-2 bg-amarillo text-white rounded-md hover:bg-amarillo-oscuro transition">Categorías</a> <a href="/empresas/municipios" class="inline-flex items-center gap-2 px-4 py-2 bg-fondo-crema border rounded-md hover:shadow">Municipios</a> </nav> </div> <div class="bg-white/80 rounded-2xl shadow-lg p-6"> ${renderComponent($$result2, "CrearEmpresa", CrearEmpresa, { "listaMunicipios": dataMunicipio, "listaCategoria": dataCategoria, "initialValue": initialValue, "id": id, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/Formularios/CrearEmpresa", "client:component-export": "CrearEmpresa" })} </div> </section> </div> ` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/empresas/crear/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/empresas/crear/index.astro";
const $$url = "/empresas/crear";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
