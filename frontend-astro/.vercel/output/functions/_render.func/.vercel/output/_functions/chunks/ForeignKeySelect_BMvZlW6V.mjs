import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as axiosInstance } from './axiosInstance_CYLkHHxf.mjs';

const ForeignKeySelect = ({
  endpoint,
  value,
  onChange,
  labelKey,
  valueKey,
  placeholder = "Seleccione una opción"
}) => {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axiosInstance.get(endpoint);
        setOptions(response.data);
      } catch (error) {
        console.error("Error fetching foreign key options:", error);
      }
    };
    fetchOptions();
  }, [endpoint]);
  return /* @__PURE__ */ jsxs(
    "select",
    {
      value: value || "",
      onChange: (e) => onChange(e.target.value),
      className: "w-full mt-1 px-3 py-1.5 rounded-md border focus:ring-yellow-400 focus:border-yellow-400",
      children: [
        /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: placeholder }),
        options.map((option) => /* @__PURE__ */ jsx("option", { value: option[valueKey], children: option[labelKey] }, option[valueKey]))
      ]
    }
  );
};

export { ForeignKeySelect as F };
