import React, { useRef, useState } from "react";
import { Edit2, Trash, Loader2, MapPin } from 'lucide-react';
import "../styles/form.css";
import { axiosInstance } from "../utils/axiosInstance";
import { AxiosError } from "axios";

type Municipio = {
  nombre: string;
  id_municipio: number;
};

type FormMunicipio = {
  id_municipio?: number;
} & Omit<Municipio, "id_municipio">;

type Props = {
  municipios: Municipio[];
};

const initialValue: FormMunicipio = {
  nombre: "",
};

export function ListadoMunicipio({ municipios }: Props) {
  const [list, setList] = useState<Municipio[]>(municipios);
  const [formData, setFormData] = useState<FormMunicipio>(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [onDeleting, setOnDeleting] = useState<number | null>(null);

  const form = useRef<HTMLFormElement | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataUser = new FormData(e.currentTarget);

    const formDataObj: Record<string, string | number> = {};
    for (let [key, value] of formDataUser.entries()) {
      if (!value) continue;
      formDataObj[key] = value as string;
    }

    formDataObj.id_departamento = 1;

    try {
      if (!isEdit) {
        // TODO: crear
        const { data } = await axiosInstance(`/municipios/`, {
          method: "POST",
          data: formDataObj,
        });

        setList((prev) => [...prev, data]);
      } else {
        // TODO: editar
        const { data } = await axiosInstance(
          `/municipios/${formData.id_municipio}`,
          {
            method: "PUT",
            data: formDataObj,
          }
        );

        const setDataById = list.map((item) => {
          if (item.id_municipio === formData.id_municipio) {
            item.nombre = formDataObj.nombre as string;
          }
          return item;
        });
        setList(setDataById);
        setIsEdit(false);
        setFormData(initialValue);
      }

      setIsLoading(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.detail || "Ocurrio un error inesperado.";
      }
    } finally {
      if (form.current) {
        form.current.reset();
      }
    }
  };

  const onDelete = async (id: number) => {
    setOnDeleting(id);
    const { data } = await axiosInstance(`/municipios/${id}`, {
      method: "DELETE",
    });

    setList(list.filter((item) => item.id_municipio !== id));
    setOnDeleting(null);
  };

  return (
    <div className="content-crud">
      <form className="content-form" onSubmit={onSubmit} ref={form}>
        <div className="content-input">
          <label htmlFor="nombre" style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}>
            <MapPin className="w-4 h-4 text-primary" /> Nombre
          </label>
          <input
            type="text"
            name="nombre"
            required
            id="nombre"
            placeholder="Nombre"
            defaultValue={formData.nombre}
          />
        </div>

        <div className="content-submit">
          <button type="submit" disabled={isLoading}>
            Guardar
          </button>
          {isEdit && (
            <button
              type="submit"
              disabled={isLoading}
              className="cancel-action"
              onClick={() => {
                setIsEdit(false);
                setFormData(initialValue);
                if (form.current) {
                  form.current.reset();
                }
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="table_component">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!!list.length ? (
              list.map((categoria) => (
                <tr key={categoria.id_municipio}>
                  <td>{categoria.nombre} </td>
                  <td>
                    <div className="content-action-table">
                      <button
                        onClick={() => {
                          setIsEdit(true);
                          setFormData(categoria);
                          if (form.current) {
                            form.current.reset();
                          }
                        }}
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => onDelete(categoria.id_municipio)}>
                        {onDeleting === categoria.id_municipio ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2}>Sin registros</td>
              </tr>
            )}
          </tbody>
        </table>

        <button
          type="submit"
          disabled={isLoading}
          className="cancel-action btn-regresar"
          onClick={() => {
            history.back();
          }}
        >
          Regresar
        </button>
      </div>
    </div>
  );
}
