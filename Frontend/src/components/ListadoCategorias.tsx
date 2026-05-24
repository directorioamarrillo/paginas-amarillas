import React, { useRef, useState } from "react";
import { Tag, Edit2, Trash, Loader2 } from 'lucide-react';
import "../styles/form.css";
import { axiosInstance } from "../utils/axiosInstance";
import { AxiosError } from "axios";

type Categoria = {
  nombre: string;
  descripcion: string;
  id_categoria: number;
};

type FormCategoria = {
  id_categoria?: number;
} & Omit<Categoria, "id_categoria">;
type Props = {
  categorias: Categoria[];
};

const initialValue: FormCategoria = {
  descripcion: "",
  nombre: "",
};

export function ListadoCategorias({ categorias }: Props) {
  const [list, setList] = useState<Categoria[]>(categorias);
  const [formData, setFormData] = useState<FormCategoria>(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [onDeleting, setOnDeleting] = useState<number | null>(null);

  const form = useRef<HTMLFormElement | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataUser = new FormData(e.currentTarget);

    const formDataObj: Record<string, string> = {};
    for (let [key, value] of formDataUser.entries()) {
      if (!value) continue;
      formDataObj[key] = value as string;
    }

    console.log(formDataObj);
    try {
      if (!isEdit) {
        // TODO: crear
        const { data } = await axiosInstance(`/categorias/`, {
          method: "POST",
          data: formDataObj,
        });

        setList((prev) => [...prev, data]);
      } else {
        // TODO: editar
        const { data } = await axiosInstance(
          `/categorias/${formData.id_categoria}`,
          {
            method: "PUT",
            data: formDataObj,
          }
        );

        const setDataById = list.map((item) => {
          if (item.id_categoria === formData.id_categoria) {
            item.descripcion = formDataObj.descripcion;
            item.nombre = formDataObj.nombre;
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
    const { data } = await axiosInstance(`/categorias/${id}`, {
      method: "DELETE",
    });

    setList(list.filter((item) => item.id_categoria !== id));
    setOnDeleting(null);
  };

  return (
    <div className="content-crud">
      <form className="content-form" onSubmit={onSubmit} ref={form}>
        <div className="content-input">
          <label htmlFor="nombre" style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}>
            <Tag className="w-4 h-4 text-yellow-500" /> Nombre
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
        <div className="content-input">
          <label htmlFor="descripcion">Descripción</label>
          <input
            type="text"
            name="descripcion"
            required
            id="descripcion"
            placeholder="Descripcion"
            defaultValue={formData.descripcion}
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
              <th>Descripción</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!!list.length ? (
              list.map((categoria) => (
                <tr key={categoria.id_categoria}>
                  <td>{categoria.nombre} </td>
                  <td>{categoria.descripcion}</td>
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
                      <button onClick={() => onDelete(categoria.id_categoria)}>
                        {onDeleting === categoria.id_categoria ? (
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
                <td colSpan={3}>Sin registros</td>
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
