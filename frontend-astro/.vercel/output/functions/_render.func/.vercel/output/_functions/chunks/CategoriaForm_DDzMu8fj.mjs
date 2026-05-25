import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as axiosInstance } from './axiosInstance_CYLkHHxf.mjs';
import { n as navigate } from './router_vN4ZPF0m.mjs';

const CategoriaForm = ({ id_categoria }) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  useEffect(() => {
    if (id_categoria) {
      fetchCategoria();
    }
  }, [id_categoria]);
  const fetchCategoria = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/categorias/${id_categoria}`
      );
      setNombre(response.data.nombre);
      setDescripcion(response.data.descripcion);
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { nombre, descripcion };
    try {
      if (id_categoria) {
        await axiosInstance.put(`/api/categorias/${id_categoria}`, data);
      } else {
        await axiosInstance.post("/api/categorias/", data);
      }
      window.location.href = "/";
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "nombre") setNombre(value);
    if (id === "descripcion") setDescripcion(value);
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto mt-6 p-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-gray-800 mb-4", children: id_categoria ? "Editar Categoría" : "Crear Categoría" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "nombre",
            className: "block text-sm font-medium text-gray-700",
            children: "Nombre:"
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "nombre",
            value: nombre,
            onChange: handleInputChange,
            required: true,
            className: "w-full mt-1 px-3 py-1.5 rounded-md focus:ring-yellow-400 focus:border-yellow-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "descripcion",
            className: "block text-sm font-medium text-gray-700",
            children: "Descripción:"
          }
        ),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "descripcion",
            value: descripcion,
            onChange: handleInputChange,
            required: true,
            rows: 3,
            className: "w-full mt-1 px-3 py-1.5 rounded-md focus:ring-yellow-400 focus:border-yellow-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => navigate(),
            className: "px-3 py-1 text-sm font-medium bg-red-500 text-white border rounded-md hover:bg-red-600",
            children: "Cancelar"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "px-3 py-1 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600",
            children: "Guardar"
          }
        )
      ] })
    ] })
  ] });
};

export { CategoriaForm as C };
