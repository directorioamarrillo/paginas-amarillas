import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as axiosInstance } from './axiosInstance_CYLkHHxf.mjs';
import { n as navigate } from './router_vN4ZPF0m.mjs';
import { F as ForeignKeySelect } from './ForeignKeySelect_BMvZlW6V.mjs';

const EmpresaForm = ({ id_empresa }) => {
  const [nombre, setNombre] = useState("");
  const [nit, setNit] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [id_categoria, setIdCategoria] = useState(0);
  const [id_municipio, setIdMunicipio] = useState(0);
  const [logo, setLogo] = useState("");
  useEffect(() => {
    if (id_empresa) {
      fetchEmpresa();
    }
  }, [id_empresa]);
  const fetchEmpresa = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/empresas/${id_empresa}`
      );
      const data = response.data;
      setNombre(data.nombre || "");
      setNit(data.nit || "");
      setCorreo(data.correo || "");
      setDireccion(data.direccion || "");
      setTelefono(data.telefono || "");
      setIdCategoria(data.id_categoria || 0);
      setIdMunicipio(data.id_municipio || 0);
      setLogo(data.logo || "");
    } catch (error) {
      console.error("Error fetching empresa:", error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      nombre,
      nit,
      correo,
      direccion,
      telefono,
      id_categoria,
      id_municipio,
      logo
    };
    try {
      if (id_empresa) {
        await axiosInstance.put(`/api/empresas/${id_empresa}`, data);
      } else {
        await axiosInstance.post("/api/empresas/", data);
      }
      navigate("/admin/empresas");
    } catch (error) {
      console.error("Error saving empresa:", error);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto mt-6 p-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-gray-800 mb-4", children: id_empresa ? "Editar Empresa" : "Crear Empresa" }),
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
        /* @__PURE__ */ jsx("label", { htmlFor: "nit", className: "block text-sm font-medium text-gray-700", children: "NIT:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "nit",
            value: nit,
            onChange: (e) => setNit(e.target.value),
            required: true,
            className: "w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "correo", className: "block text-sm font-medium text-gray-700", children: "Correo:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            id: "correo",
            value: correo,
            onChange: (e) => setCorreo(e.target.value),
            required: true,
            className: "w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "direccion", className: "block text-sm font-medium text-gray-700", children: "Dirección:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "direccion",
            value: direccion,
            onChange: (e) => setDireccion(e.target.value),
            required: true,
            className: "w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "telefono", className: "block text-sm font-medium text-gray-700", children: "Teléfono:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "telefono",
            value: telefono,
            onChange: (e) => setTelefono(e.target.value),
            required: true,
            className: "w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "id_categoria", className: "block text-sm font-medium text-gray-700", children: "Categoría:" }),
        /* @__PURE__ */ jsx(
          ForeignKeySelect,
          {
            endpoint: "/api/categorias",
            value: id_categoria,
            onChange: (value) => setIdCategoria(Number(value)),
            labelKey: "nombre",
            valueKey: "id_categoria",
            placeholder: "Seleccione una categoría"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "id_municipio", className: "block text-sm font-medium text-gray-700", children: "Municipio:" }),
        /* @__PURE__ */ jsx(
          ForeignKeySelect,
          {
            endpoint: "/api/municipios",
            value: id_municipio,
            onChange: (value) => setIdMunicipio(Number(value)),
            labelKey: "nombre",
            valueKey: "id_municipio",
            placeholder: "Seleccione un municipio"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "logo", className: "block text-sm font-medium text-gray-700", children: "Logo (URL):" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "logo",
            value: logo,
            onChange: (e) => setLogo(e.target.value),
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

export { EmpresaForm as E };
