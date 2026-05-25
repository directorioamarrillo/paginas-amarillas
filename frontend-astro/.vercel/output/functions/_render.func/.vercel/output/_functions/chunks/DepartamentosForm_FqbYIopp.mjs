import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as axiosInstance } from './axiosInstance_CYLkHHxf.mjs';
import { n as navigate } from './router_vN4ZPF0m.mjs';

const DepartamentoForm = ({ id_departamento }) => {
  const [nombre, setNombre] = useState("");
  useEffect(() => {
    if (id_departamento) {
      fetchDepartamento();
    }
  }, [id_departamento]);
  const fetchDepartamento = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/departamentos/${id_departamento}`
      );
      setNombre(response.data.nombre);
    } catch (error) {
      console.error("Error fetching department:", error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { nombre };
    try {
      if (id_departamento) {
        await axiosInstance.put(`/api/departamentos/${id_departamento}`, data);
      } else {
        await axiosInstance.post("/api/departamentos/", data);
      }
      navigate("/admin/departamentos");
    } catch (error) {
      console.error("Error saving department:", error);
    }
  };
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "nombre") setNombre(value);
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto mt-6 p-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-gray-800 mb-4", children: id_departamento ? "Editar Departamento" : "Crear Departamento" }),
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

export { DepartamentoForm as D };
