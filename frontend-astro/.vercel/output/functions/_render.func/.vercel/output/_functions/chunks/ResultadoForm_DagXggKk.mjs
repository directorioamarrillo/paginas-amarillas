import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as axiosInstance } from './axiosInstance_CYLkHHxf.mjs';
import { n as navigate } from './router_vN4ZPF0m.mjs';
import { F as ForeignKeySelect } from './ForeignKeySelect_BMvZlW6V.mjs';

const ResultadoForm = ({ id_resultado }) => {
  const [id_usuario, setIdUsuario] = useState(null);
  const [criterio, setCriterio] = useState("");
  const [fecha_hora, setFechaHora] = useState("");
  useEffect(() => {
    if (id_resultado) {
      fetchResultado();
    }
  }, [id_resultado]);
  const fetchResultado = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/resultados/${id_resultado}`
      );
      const data = response.data;
      setIdUsuario(data.id_usuario);
      setCriterio(data.criterio);
      setFechaHora(data.fecha_hora);
    } catch (error) {
      console.error("Error fetching resultado:", error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { id_usuario, criterio, fecha_hora };
    try {
      if (id_resultado) {
        await axiosInstance.put(`/api/resultados/${id_resultado}`, data);
      } else {
        await axiosInstance.post("/api/resultados/", data);
      }
      navigate("/admin/resultados");
    } catch (error) {
      console.error("Error saving resultado:", error);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto mt-6 p-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-gray-800 mb-4", children: id_resultado ? "Editar Resultado" : "Crear Resultado" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "id_usuario", className: "block text-sm font-medium text-gray-700", children: "Usuario:" }),
        /* @__PURE__ */ jsx(
          ForeignKeySelect,
          {
            endpoint: "/api/usuarios",
            value: id_usuario,
            onChange: (value) => setIdUsuario(Number(value)),
            labelKey: "nombre",
            valueKey: "id_usuario",
            placeholder: "Seleccione un usuario"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "criterio", className: "block text-sm font-medium text-gray-700", children: "Criterio:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "criterio",
            value: criterio,
            onChange: (e) => setCriterio(e.target.value),
            required: true,
            className: "w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "fecha_hora", className: "block text-sm font-medium text-gray-700", children: "Fecha y Hora:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "datetime-local",
            id: "fecha_hora",
            value: fecha_hora,
            onChange: (e) => setFechaHora(e.target.value),
            required: true,
            className: "w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
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

export { ResultadoForm as R };
