import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as axiosInstance } from './axiosInstance_CYLkHHxf.mjs';
import { n as navigate } from './router_vN4ZPF0m.mjs';
import { F as ForeignKeySelect } from './ForeignKeySelect_BMvZlW6V.mjs';

const MunicipioForm = ({ id_municipio }) => {
  const [nombre, setNombre] = useState("");
  const [id_departamento, setIdDepartamento] = useState(null);
  useEffect(() => {
    if (id_municipio) {
      fetchMunicipio();
    }
  }, [id_municipio]);
  const fetchMunicipio = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/municipios/${id_municipio}`
      );
      setNombre(response.data.nombre);
      setIdDepartamento(response.data.id_departamento);
    } catch (error) {
      console.error("Error fetching municipality:", error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { nombre, id_departamento };
    try {
      if (id_municipio) {
        await axiosInstance.put(`/api/municipios/${id_municipio}`, data);
      } else {
        await axiosInstance.post("/api/municipios/", data);
      }
      navigate("/admin/municipios");
    } catch (error) {
      console.error("Error saving municipality:", error);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto mt-6 p-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-gray-800 mb-4", children: id_municipio ? "Editar Municipio" : "Crear Municipio" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "nombre", className: "block text-sm font-medium text-gray-700", children: "Nombre:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "nombre",
            value: nombre,
            onChange: (e) => setNombre(e.target.value),
            required: true,
            className: "w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: "id_departamento",
            className: "block text-sm font-medium text-gray-700",
            children: "Departamento:"
          }
        ),
        /* @__PURE__ */ jsx(
          ForeignKeySelect,
          {
            endpoint: "/api/departamentos",
            value: id_departamento,
            onChange: (value) => setIdDepartamento(Number(value)),
            labelKey: "nombre",
            valueKey: "id_departamento",
            placeholder: "Seleccione un departamento"
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

export { MunicipioForm as M };
