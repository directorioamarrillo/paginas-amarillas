/* empty css                                 */
import { c as createComponent, r as renderTemplate, a as renderComponent } from '../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState } from 'react';
import { Search, SortDesc, SortAsc } from 'lucide-react';
import { $ as $$GlobalLayout } from '../chunks/GlobalLayout_OchguJay.mjs';
export { renderers } from '../renderers.mjs';

const adminSections = [
  { name: "Resultados", path: "/admin/resultados" },
  { name: "Categorías", path: "/admin/categoria" },
  { name: "Publicidad", path: "/admin/publicidad" },
  { name: "Departamentos", path: "/admin/departamentos" },
  { name: "Empresas", path: "/admin/empresas" },
  { name: "Reviews", path: "/admin/reviews" },
  { name: "Municipios", path: "/admin/municipios" },
  { name: "Usuarios", path: "/admin/usuarios" }
];
const AdminGrid = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sorted, setSorted] = useState(false);
  const filteredSections = adminSections.filter(
    (section) => section.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (!sorted) return 0;
    return a.name.localeCompare(b.name);
  });
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen p-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-6 text-gray-800 text-center", children: "Panel Administrativo" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6 space-x-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Buscar sección...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-yellow-400 pl-10"
          }
        ),
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-2.5 text-gray-400 w-5 h-5" })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setSorted(!sorted),
          title: sorted ? "Desordenar" : "Ordenar Alfabéticamente",
          className: "w-10 h-10 flex items-center justify-center bg-yellow-500 text-white rounded-full shadow hover:bg-yellow-600 transition relative group",
          children: [
            sorted ? /* @__PURE__ */ jsx(SortDesc, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(SortAsc, { className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition", children: sorted ? "Desordenar" : "Ordenar" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: filteredSections.map((section) => /* @__PURE__ */ jsxs(
      "a",
      {
        href: section.path,
        className: "block p-6 bg-white rounded-lg shadow hover:shadow-lg border border-gray-200 hover:bg-yellow-50 transition group",
        children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-gray-700", children: section.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 group-hover:text-yellow-600", children: [
            "Administrar la sección de ",
            section.name.toLowerCase(),
            "."
          ] })
        ]
      },
      section.name
    )) })
  ] }) });
};

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Admin" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminGrid", AdminGrid, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/admin/AdminGrid", "client:component-export": "AdminGrid" })} ` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
