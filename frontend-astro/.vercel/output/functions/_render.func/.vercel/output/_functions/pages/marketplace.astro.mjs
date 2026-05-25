/* empty css                                 */
import { c as createComponent, r as renderTemplate, a as renderComponent, b as createAstro } from '../chunks/astro/server_lgVJ9B2R.mjs';
import 'kleur/colors';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect, useMemo } from 'react';
import { a as axiosInstance } from '../chunks/axiosInstance_CYLkHHxf.mjs';
export { renderers } from '../renderers.mjs';

function Marketplace({ rol = "user", productos: initialProductos = [] }) {
  const [productos, setProductos] = useState(initialProductos || []);
  const [search, setSearch] = useState("");
  const [minPrecio, setMinPrecio] = useState(0);
  const [maxPrecio, setMaxPrecio] = useState(99999);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    imagen_url: "",
    id_empresa: 1,
    id_categoria: 1,
    estado: "activo"
  });
  useEffect(() => {
    if (initialProductos && initialProductos.length > 0) return;
    setLoading(true);
    axiosInstance.get("/marketplace").then((res) => setProductos(res.data)).catch(() => setError("No se pudo cargar el marketplace.")).finally(() => setLoading(false));
  }, [initialProductos]);
  const productosFiltrados = useMemo(
    () => productos.filter(
      (p) => p.nombre.toLowerCase().includes(search.toLowerCase()) && p.precio >= minPrecio && p.precio <= maxPrecio
    ),
    [productos, search, minPrecio, maxPrecio]
  );
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post("/marketplace", form);
      setProductos([...productos, res.data]);
      setForm({ nombre: "", descripcion: "", precio: 0, imagen_url: "", id_empresa: 1, id_categoria: 1, estado: "activo" });
    } catch {
      setError("No se pudo crear el producto.");
    }
    setLoading(false);
  };
  const handleDelete = async (id) => {
    setLoading(true);
    setError("");
    try {
      await axiosInstance.delete(`/marketplace/${id}`);
      setProductos(productos.filter((p) => p.id_marketplace !== id));
    } catch {
      setError("No se pudo eliminar el producto.");
    }
    setLoading(false);
  };
  return /* @__PURE__ */ jsxs("section", { className: "marketplace-section py-8 px-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold mb-6 text-center", children: "Marketplace" }),
    rol === "admin" && /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "bg-gray-50 rounded-lg shadow p-4 mb-8 max-w-xl mx-auto flex flex-col gap-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "Agregar producto/servicio" }),
      /* @__PURE__ */ jsx("input", { name: "nombre", value: form.nombre, onChange: handleChange, placeholder: "Nombre", required: true, className: "border rounded px-3 py-2" }),
      /* @__PURE__ */ jsx("textarea", { name: "descripcion", value: form.descripcion, onChange: handleChange, placeholder: "Descripción", required: true, className: "border rounded px-3 py-2" }),
      /* @__PURE__ */ jsx("input", { name: "precio", type: "number", value: form.precio, onChange: handleChange, placeholder: "Precio", required: true, min: 0, className: "border rounded px-3 py-2" }),
      /* @__PURE__ */ jsx("input", { name: "imagen_url", value: form.imagen_url, onChange: handleChange, placeholder: "URL de imagen", className: "border rounded px-3 py-2" }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition", children: "Agregar" }),
      error && /* @__PURE__ */ jsx("div", { className: "text-red-500 text-sm", children: error })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 mb-8 justify-center", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "Buscar producto...",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          className: "border rounded px-3 py-2 w-48"
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "number",
          placeholder: "Precio mínimo",
          value: minPrecio,
          min: 0,
          onChange: (e) => setMinPrecio(Number(e.target.value)),
          className: "border rounded px-3 py-2 w-32"
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "number",
          placeholder: "Precio máximo",
          value: maxPrecio,
          min: 0,
          onChange: (e) => setMaxPrecio(Number(e.target.value)),
          className: "border rounded px-3 py-2 w-32"
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "text-center text-blue-500", children: "Cargando..." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: productosFiltrados.length === 0 ? /* @__PURE__ */ jsx("div", { className: "col-span-3 text-center text-gray-500", children: "No se encontraron productos." }) : productosFiltrados.map((p) => /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-md p-4 flex flex-col items-center", children: [
      /* @__PURE__ */ jsx("img", { src: p.imagen_url, alt: p.nombre, className: "w-32 h-32 object-cover rounded mb-4" }),
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-2", children: p.nombre }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-2", children: p.descripcion }),
      /* @__PURE__ */ jsxs("p", { className: "text-lg font-bold text-blue-600 mb-2", children: [
        "$",
        p.precio
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-500 mb-2", children: [
        "ID Empresa: ",
        p.id_empresa
      ] }),
      rol === "admin" && /* @__PURE__ */ jsx("button", { className: "bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition mb-2", onClick: () => handleDelete(p.id_marketplace), children: "Eliminar" }),
      /* @__PURE__ */ jsx("button", { className: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition", children: "Comprar" })
    ] }, p.id_marketplace)) })
  ] });
}

const $$Astro = createAstro();
const $$Marketplace = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Marketplace;
  let productos = [];
  try {
    const res = await axiosInstance("/api/marketplace", { method: "GET" });
    productos = res.data;
  } catch (error) {
    console.error("Error al cargar productos del marketplace:", error);
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const mockPath = path.join(process.cwd(), "public", "mock", "marketplace.json");
      const content = await fs.readFile(mockPath, "utf-8");
      productos = JSON.parse(content);
      console.log("Usando mock marketplace ->", mockPath);
    } catch (me) {
      console.warn("No hay mock de marketplace", me);
      productos = [];
    }
  }
  const rol = Astro2.cookies.get("rol")?.value || "user";
  return renderTemplate`${renderComponent($$result, "MarketplaceComponent", Marketplace, { "productos": productos, "rol": rol, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/components/Marketplace", "client:component-export": "Marketplace" })}`;
}, "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/marketplace.astro", void 0);

const $$file = "C:/Users/santi/Documents/DIRECTORIO2.0/Frontend/src/pages/marketplace.astro";
const $$url = "/marketplace";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Marketplace,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
