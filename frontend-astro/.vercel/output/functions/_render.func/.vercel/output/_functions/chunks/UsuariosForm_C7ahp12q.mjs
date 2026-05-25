import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as axiosInstance } from './axiosInstance_CYLkHHxf.mjs';
import { n as navigate } from './router_vN4ZPF0m.mjs';

const UsuarioForm = ({ id_usuario }) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState("user");
  const [password, setPassword] = useState("");
  useEffect(() => {
    if (id_usuario) {
      fetchUsuario();
    }
  }, [id_usuario]);
  const fetchUsuario = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/usuarios/${id_usuario}`
      );
      const data = response.data;
      console.log(response.data);
      setNombre(data.nombre);
      setApellido(data.apellido);
      setCorreo(data.correo);
      setTelefono(data.telefono);
      setRol(data.rol);
    } catch (error) {
      console.error("Error fetching usuario:", error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { nombre, apellido, correo, telefono, rol, password };
    console.log("enviada", data);
    try {
      if (id_usuario) {
        await axiosInstance.put(`/api/usuarios/${id_usuario}`, data);
      } else {
        await axiosInstance.post("/api/usuarios/", data);
      }
      navigate("/admin/usuarios");
    } catch (error) {
      console.error("Error saving usuario:", error);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto mt-6 p-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-gray-800 mb-4", children: id_usuario ? "Editar Usuario" : "Crear Usuario" }),
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
        /* @__PURE__ */ jsx("label", { htmlFor: "apellido", className: "block text-sm font-medium text-gray-700", children: "Apellido:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "apellido",
            value: apellido,
            onChange: (e) => setApellido(e.target.value),
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
        /* @__PURE__ */ jsx("label", { htmlFor: "rol", className: "block text-sm font-medium text-gray-700", children: "Rol:" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "rol",
            value: rol,
            onChange: (e) => setRol(e.target.value),
            required: true,
            className: "w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400",
            children: [
              /* @__PURE__ */ jsx("option", { value: "user", children: "Usuario" }),
              /* @__PURE__ */ jsx("option", { value: "admin", children: "Administrador" })
            ]
          }
        )
      ] }),
      !id_usuario && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Contraseña:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "password",
            id: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
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

export { UsuarioForm as U };
