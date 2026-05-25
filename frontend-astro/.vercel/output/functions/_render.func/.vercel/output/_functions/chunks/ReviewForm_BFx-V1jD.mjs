import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as axiosInstance } from './axiosInstance_CYLkHHxf.mjs';
import { n as navigate } from './router_vN4ZPF0m.mjs';
import { F as ForeignKeySelect } from './ForeignKeySelect_BMvZlW6V.mjs';

const ReviewForm = ({ id_review }) => {
  const [id_empresa, setIdEmpresa] = useState(null);
  const [id_usuario, setIdUsuario] = useState(null);
  const [comentario, setComentario] = useState("");
  const [calificacion, setCalificacion] = useState(0);
  useEffect(() => {
    if (id_review) {
      fetchReview();
    }
  }, [id_review]);
  const fetchReview = async () => {
    try {
      const response = await axiosInstance.get(`/api/reviews/${id_review}`);
      const data = response.data;
      if (data && !Array.isArray(data) && data.id_review) {
        setIdEmpresa(data.id_empresa);
        setIdUsuario(data.id_usuario);
        setComentario(data.comentario);
        setCalificacion(data.calificacion);
        return;
      }
      const listResp = await axiosInstance.get(`/api/reviews/?skip=0&limit=1000`);
      const found = listResp.data.find((r) => r.id_review === Number(id_review));
      if (found) {
        setIdEmpresa(found.id_empresa);
        setIdUsuario(found.id_usuario);
        setComentario(found.comentario);
        setCalificacion(found.calificacion);
      } else {
        console.error("Review not found by id_review", id_review);
      }
    } catch (error) {
      console.error("Error fetching review:", error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { id_empresa, id_usuario, comentario, calificacion };
    try {
      if (id_review) {
        await axiosInstance.put(`/api/reviews/${id_review}`, data);
      } else {
        await axiosInstance.post("/api/reviews/", data);
      }
      navigate("/admin/reviews");
    } catch (error) {
      console.error("Error saving review:", error);
    }
  };
  const handleCalificacionChange = (value) => {
    if (value < 0 || value > 5) {
      alert("La calificación debe estar entre 0 y 5.");
      return;
    }
    setCalificacion(value);
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto mt-6 p-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-gray-800 mb-4", children: id_review ? "Editar Review" : "Crear Review" }),
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
        /* @__PURE__ */ jsx("label", { htmlFor: "comentario", className: "block text-sm font-medium text-gray-700", children: "Comentario:" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "comentario",
            value: comentario,
            onChange: (e) => setComentario(e.target.value),
            required: true,
            className: "w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "calificacion", className: "block text-sm font-medium text-gray-700", children: "Calificación (0-5):" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            id: "calificacion",
            value: calificacion,
            onChange: (e) => handleCalificacionChange(Number(e.target.value)),
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

export { ReviewForm as R };
