import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as axiosInstance } from './axiosInstance_CYLkHHxf.mjs';
import { n as navigate } from './router_vN4ZPF0m.mjs';
import { F as ForeignKeySelect } from './ForeignKeySelect_BMvZlW6V.mjs';

const PublicidadForm = ({ id_publicidad }) => {
  const [id_empresa, setIdEmpresa] = useState(0);
  const [tipo_anuncio, setTipoAnuncio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracion, setDuracion] = useState(0);
  const [fecha_inicio, setFechaInicio] = useState("");
  const [fecha_fin, setFechaFin] = useState("");
  useEffect(() => {
    if (id_publicidad) {
      fetchPublicidad();
    }
  }, [id_publicidad]);
  const fetchPublicidad = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/publicidades/${id_publicidad}`
      );
      const data = response.data;
      setIdEmpresa(data.id_empresa);
      setTipoAnuncio(data.tipo_anuncio);
      setDescripcion(data.descripcion);
      setDuracion(data.duracion);
      setFechaInicio(data.fecha_inicio);
      setFechaFin(data.fecha_fin);
    } catch (error) {
      console.error("Error fetching publicidad:", error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      id_empresa,
      tipo_anuncio,
      descripcion,
      duracion,
      fecha_inicio,
      fecha_fin
    };
    try {
      if (id_publicidad) {
        await axiosInstance.put(`/api/publicidades/${id_publicidad}`, data);
      } else {
        await axiosInstance.post("/api/publicidades/", data);
      }
      navigate("/admin/publicidad");
    } catch (error) {
      console.error("Error saving publicidad:", error);
    }
  };
  const handleDuracionChange = (value) => {
    if (value < 0) {
      alert("La duración no puede ser negativa.");
      return;
    }
    setDuracion(value);
  };
  const handleFechaFinChange = (value) => {
    if (new Date(value) < new Date(fecha_inicio)) {
      alert("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }
    setFechaFin(value);
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto mt-6 p-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-gray-800 mb-4", children: id_publicidad ? "Editar Publicidad" : "Crear Publicidad" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "id_empresa", className: "block text-sm font-medium text-gray-700", children: "Empresa:" }),
        /* @__PURE__ */ jsx(
          ForeignKeySelect,
          {
            endpoint: "/api/empresas",
            value: id_empresa,
            onChange: (value) => setIdEmpresa(Number(value)),
            labelKey: "nombre",
            valueKey: "id_empresa",
            placeholder: "Seleccione una empresa"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "tipo_anuncio", className: "block text-sm font-medium text-gray-700", children: "Tipo de Anuncio:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "tipo_anuncio",
            value: tipo_anuncio,
            onChange: (e) => setTipoAnuncio(e.target.value),
            required: true,
            className: "w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "descripcion", className: "block text-sm font-medium text-gray-700", children: "Descripción:" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "descripcion",
            value: descripcion,
            onChange: (e) => setDescripcion(e.target.value),
            required: true,
            className: "w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "duracion", className: "block text-sm font-medium text-gray-700", children: "Duración (en días):" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            id: "duracion",
            value: duracion,
            onChange: (e) => handleDuracionChange(Number(e.target.value)),
            required: true,
            className: "w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "fecha_inicio", className: "block text-sm font-medium text-gray-700", children: "Fecha de Inicio:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "datetime-local",
            id: "fecha_inicio",
            value: fecha_inicio,
            onChange: (e) => setFechaInicio(e.target.value),
            required: true,
            className: "w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "fecha_fin", className: "block text-sm font-medium text-gray-700", children: "Fecha de Fin:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "datetime-local",
            id: "fecha_fin",
            value: fecha_fin,
            onChange: (e) => handleFechaFinChange(e.target.value),
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

export { PublicidadForm as P };
