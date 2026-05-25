import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as axiosInstance } from './axiosInstance_CYLkHHxf.mjs';
import { ChevronLeft, Plus, Edit, Trash, ChevronsLeft, ChevronRight, ChevronsRight } from 'lucide-react';

const TableAdmin = ({
  tableName,
  columns,
  endpoint,
  primaryKey,
  onEdit,
  onDelete,
  onCreate
}) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm]);
  const fetchData = async () => {
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const response = await axiosInstance.get(
        `${endpoint}?skip=${skip}&limit=${itemsPerPage}`
      );
      setData(response.data);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
    }
  };
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`${endpoint}/${id}`);
      fetchData();
      if (onDelete) onDelete(id);
    } catch (error) {
      console.error(`Error deleting ${tableName} entry:`, error);
    }
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const filteredData = data.filter(
    (item) => columns.some(
      (col) => item[col.key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  return /* @__PURE__ */ jsxs("div", { className: "p-8 min-h-screen", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "relative top-8 left-4",
        title: "Volver a Admin",
        children: /* @__PURE__ */ jsx("a", { href: "/admin", className: "flex gap-4 items-center justify-center w-10 h-10 rounded-full border border-gray-400 text-gray-700 hover:bg-yellow-200 transition", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-6 h-6" }) })
      }
    ),
    /* @__PURE__ */ jsxs("h1", { className: "text-center text-3xl font-bold mb-6 text-gray-700", children: [
      "Administrar ",
      tableName
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
      onCreate && /* @__PURE__ */ jsx(
        "button",
        {
          title: `Crear nuevo ${tableName}`,
          onClick: onCreate,
          className: "flex items-center justify-center w-8 h-8 rounded-full border border-gray-400 text-gray-700 hover:bg-yellow-200 transition",
          children: /* @__PURE__ */ jsx(Plus, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: `Buscar ${tableName}...`,
          value: searchTerm,
          onChange: handleSearch,
          className: "px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-yellow-400"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full border-collapse border border-yellow-400 bg-yellow-50 rounded-lg shadow", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-yellow-200", children: /* @__PURE__ */ jsxs("tr", { children: [
        columns.map((col) => /* @__PURE__ */ jsx(
          "th",
          {
            className: "px-4 py-2 border border-yellow-400 text-left",
            children: col.label
          },
          col.key
        )),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2 border border-yellow-400 text-left", children: "Acciones" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: filteredData.map((item) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-yellow-100", children: [
        columns.map((col) => /* @__PURE__ */ jsx(
          "td",
          {
            className: "px-4 py-2 border border-yellow-400",
            children: item[col.key]
          },
          col.key
        )),
        /* @__PURE__ */ jsxs("td", { className: "px-4 py-2 border border-yellow-400 space-x-2 flex", children: [
          onEdit && /* @__PURE__ */ jsx(
            "button",
            {
              title: `Editar ${tableName}`,
              onClick: () => onEdit(item[primaryKey]),
              className: "flex items-center justify-center w-8 h-8 rounded-full border border-gray-400 text-gray-700 hover:bg-yellow-200 transition",
              children: /* @__PURE__ */ jsx(Edit, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              title: `Eliminar ${tableName}`,
              onClick: () => handleDelete(item[primaryKey]),
              className: "flex items-center justify-center w-8 h-8 rounded-full border border-gray-400 text-gray-700 hover:bg-red-200 transition",
              children: /* @__PURE__ */ jsx(Trash, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }, item[primaryKey])) })
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
          disabled: data.length < itemsPerPage,
          className: `flex items-center justify-center w-8 h-8 rounded-full border ${data.length < itemsPerPage ? "border-gray-300 text-gray-400 cursor-not-allowed" : "border-gray-400 text-gray-700 hover:bg-yellow-200"}`,
          children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          title: "Última página",
          onClick: () => setCurrentPage(Math.ceil(100 / itemsPerPage)),
          disabled: data.length < itemsPerPage,
          className: `flex items-center justify-center w-8 h-8 rounded-full border ${data.length < itemsPerPage ? "border-gray-300 text-gray-400 cursor-not-allowed" : "border-gray-400 text-gray-700 hover:bg-yellow-200"}`,
          children: /* @__PURE__ */ jsx(ChevronsRight, { className: "w-4 h-4" })
        }
      )
    ] })
  ] });
};

export { TableAdmin as T };
