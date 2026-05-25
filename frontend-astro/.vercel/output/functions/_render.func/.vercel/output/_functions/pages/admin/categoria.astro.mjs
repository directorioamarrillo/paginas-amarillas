/* empty css                                    */
import { c as createComponent, r as renderTemplate, a as renderComponent } from '../../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as axiosInstance } from '../../chunks/axiosInstance_CYLkHHxf.mjs';
import { n as navigate } from '../../chunks/router_vN4ZPF0m.mjs';
import { Plus, Edit, Trash, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { $ as $$GlobalLayout } from '../../chunks/GlobalLayout_OchguJay.mjs';
export { renderers } from '../../renderers.mjs';

const CategoriaAdmin = () => {
  const [categorias, setCategorias] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
  useEffect(() => {
    fetchCategorias();
  }, [currentPage, searchTerm]);
  const fetchCategorias = async () => {
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const response = await axiosInstance.get(
        `/api/categorias/?skip=${skip}&limit=${itemsPerPage}`
      );
      setCategorias(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const deleteCategoria = async (id_categoria) => {
    try {
      await axiosInstance.delete(`/api/categorias/${id_categoria}`);
      fetchCategorias();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const filteredCategorias = categorias.filter(
    (cat) => cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return /* @__PURE__ */ jsxs("div", { className: "p-8 min-h-screen", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-6 text-gray-700", children: "Administrar Categorías" }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          title: "Crear nueva categoría",
          onClick: () => navigate(),
          className: "flex items-center justify-center w-8 h-8 rounded-full border border-gray-400 text-gray-700 hover:bg-yellow-200 transition",
          children: /* @__PURE__ */ jsx(Plus, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "Buscar categoría...",
          value: searchTerm,
          onChange: handleSearch,
          className: "px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-yellow-400"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full border-collapse border border-yellow-400 bg-yellow-50 rounded-lg shadow", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-yellow-200", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2 border border-yellow-400 text-left", children: "ID" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2 border border-yellow-400 text-left", children: "Nombre" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2 border border-yellow-400 text-left", children: "Descripción" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2 border border-yellow-400 text-left", children: "Acciones" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: filteredCategorias.map((categoria) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-yellow-100", children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2 border border-yellow-400", children: categoria.id_categoria }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2 border border-yellow-400", children: categoria.nombre }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-2 border border-yellow-400", children: categoria.descripcion }),
        /* @__PURE__ */ jsxs("td", { className: "px-4 py-2 border border-yellow-400 space-x-2 flex", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              title: "Editar categoría",
              onClick: () => navigate(`/admin/categoria/editar/${categoria.id_categoria}`),
              className: "flex items-center justify-center w-8 h-8 rounded-full border border-gray-400 text-gray-700 hover:bg-yellow-200 transition",
              children: /* @__PURE__ */ jsx(Edit, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              title: "Eliminar categoría",
              onClick: () => deleteCategoria(categoria.id_categoria),
              className: "flex items-center justify-center w-8 h-8 rounded-full border border-gray-400 text-gray-700 hover:bg-red-200 transition",
              children: /* @__PURE__ */ jsx(Trash, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }, categoria.id_categoria)) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-center items-center space-x-2 mt-6", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          title: "Primera página",
          onClick: () => setCurrentPage(1),
          disabled: currentPage === 1,
          className: `flex items-center justify-center w-8 h-8 rounded-full border ${currentPage === 1 ? "border-gray-300 text-gray-400 cursor-not-allowed" : "border-gray-400 text-gray-700 hover:bg-yellow-200"}`,
          children: /* @__PURE__ */ jsx(ChevronsLeft, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          title: "Página anterior",
          onClick: () => setCurrentPage((prev) => Math.max(prev - 1, 1)),
          disabled: currentPage === 1,
          className: `flex items-center justify-center w-8 h-8 rounded-full border ${currentPage === 1 ? "border-gray-300 text-gray-400 cursor-not-allowed" : "border-gray-400 text-gray-700 hover:bg-yellow-200"}`,
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          title: "Página siguiente",
          onClick: () => setCurrentPage((prev) => prev + 1),
          disabled: categorias.length < itemsPerPage,
          className: `flex items-center justify-center w-8 h-8 rounded-full border ${categorias.length < itemsPerPage ? "border-gray-300 text-gray-400 cursor-not-allowed" : "border-gray-400 text-gray-700 hover:bg-yellow-200"}`,
          children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          title: "Última página",
          onClick: () => setCurrentPage(Math.ceil(100 / itemsPerPage)),
          disabled: categorias.length < itemsPerPage,
          className: `flex items-center justify-center w-8 h-8 rounded-full border ${categorias.length < itemsPerPage ? "border-gray-300 text-gray-400 cursor-not-allowed" : "border-gray-400 text-gray-700 hover:bg-yellow-200"}`,
          children: /* @__PURE__ */ jsx(ChevronsRight, { className: "w-4 h-4" })
        }
      )
    ] })
  ] });
};

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "GlobalLayout", $$GlobalLayout, { "title": "Categor\xEDas" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "CategoriaAdmin", CategoriaAdmin, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/admin/categoria/CategoriaAdmin", "client:component-export": "CategoriaAdmin" })} ` })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/categoria/index.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/admin/categoria/index.astro";
const $$url = "/admin/categoria";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
