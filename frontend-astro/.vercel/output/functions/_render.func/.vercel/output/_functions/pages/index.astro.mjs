/* empty css                                 */
import { c as createComponent, r as renderTemplate, a as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { $ as $$GlobalLayout } from '../chunks/GlobalLayout_OchguJay.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash } from 'lucide-react';
import { a as axiosInstance } from '../chunks/axiosInstance_CYLkHHxf.mjs';
import fs from 'fs/promises';
import path from 'path';
export { renderers } from '../renderers.mjs';

const CardEmpresa = ({ empresas: initialEmpresas }) => {
  const [empresas, setEmpresas] = useState(initialEmpresas);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const rol = document.cookie.split("; ").find((row) => row.startsWith("rol="))?.split("=")[1];
    setIsAdmin(rol === "admin");
  }, []);
  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Estás seguro de eliminar la empresa "${nombre}"?`)) {
      return;
    }
    try {
      await axiosInstance.delete(`/api/empresas/${id}`);
      setEmpresas(empresas.filter((e) => e.id_empresa !== id));
      alert("Empresa eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar empresa:", error);
      alert("Error al eliminar la empresa");
    }
  };
  const handleEdit = (id) => {
    window.location.href = `/admin/empresas/editar/${id}`;
  };
  const handleCreate = () => {
    window.location.href = "/admin/empresas/agregar";
  };
  if (!empresas || empresas.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-lg mb-4", children: "No hay empresas registradas aún" }),
      isAdmin && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleCreate,
          className: "inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-5 h-5" }),
            "Crear Primera Empresa"
          ]
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    isAdmin && /* @__PURE__ */ jsx("div", { className: "mb-6 flex justify-end", children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleCreate,
        className: "inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-md",
        children: [
          /* @__PURE__ */ jsx(Plus, { className: "w-5 h-5" }),
          "Crear Nueva Empresa"
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: empresas.map((empresa) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "border rounded-xl shadow-md bg-white hover:shadow-xl transition-shadow duration-300 overflow-hidden relative",
        children: [
          isAdmin && /* @__PURE__ */ jsxs("div", { className: "absolute top-2 right-2 z-10 flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleEdit(empresa.id_empresa),
                className: "p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg",
                title: "Editar empresa",
                children: /* @__PURE__ */ jsx(Edit, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleDelete(empresa.id_empresa, empresa.nombre),
                className: "p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg",
                title: "Eliminar empresa",
                children: /* @__PURE__ */ jsx(Trash, { className: "w-4 h-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("a", { href: `/empresas/${empresa.id_empresa}`, className: "block", children: [
            /* @__PURE__ */ jsx("div", { className: "aspect-video w-full bg-gray-100 flex items-center justify-center overflow-hidden", children: empresa.logo ? /* @__PURE__ */ jsx(
              "img",
              {
                src: empresa.logo,
                alt: empresa.nombre,
                className: "w-full h-full object-cover"
              }
            ) : /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-4xl", children: "🏢" }) }),
            /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-2 text-gray-900", children: empresa.nombre }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-sm text-gray-600 mb-4", children: [
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("strong", { children: "NIT:" }),
                  " ",
                  empresa.nit
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("strong", { children: "Correo:" }),
                  " ",
                  empresa.correo
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("strong", { children: "Teléfono:" }),
                  " ",
                  empresa.telefono
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  /* @__PURE__ */ jsx("strong", { children: "Dirección:" }),
                  " ",
                  empresa.direccion
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
                empresa.categoria && /* @__PURE__ */ jsx("span", { className: "inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full", children: empresa.categoria.nombre }),
                empresa.municipio && /* @__PURE__ */ jsx("span", { className: "inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full", children: empresa.municipio.nombre })
              ] })
            ] })
          ] })
        ]
      },
      empresa.id_empresa
    )) })
  ] });
};

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  let empresas = [];
  let error = null;
  try {
    const res = await axiosInstance.get("/api/empresas");
    empresas = res.data;
    console.log("Empresas cargadas:", empresas.length);
  } catch (err) {
    error = err && err.message ? err.message : "Error al conectar con el backend.";
    console.warn("Error al cargar empresas:", error);
    try {
      const mockPath = path.join(process.cwd(), "public", "mock", "empresas.json");
      const data = await fs.readFile(mockPath, "utf-8");
      empresas = JSON.parse(data);
      console.log("Usando mock local:", mockPath, empresas.length);
      error = null;
    } catch (mockErr) {
      console.error("No se encontr\xF3 mock o fall\xF3 la lectura:", mockErr);
    }
  }
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Directorio de Empresas" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="py-12 px-6 bg-gray-50 rounded-xl"> <h1 class="text-3xl font-extrabold mb-8 text-center text-gray-900">
Directorio de Empresas
</h1> ${error ? renderTemplate`<div class="text-center py-12"> <p class="text-red-500">Error: ${error}</p> <p class="text-gray-500 mt-2">Verifica que el backend esté corriendo en http://localhost:8000</p> </div>` : renderTemplate`${renderComponent($$result2, "CardEmpresa", CardEmpresa, { "empresas": empresas, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/commons/CardEmpresa", "client:component-export": "default" })}`} </section> ` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
