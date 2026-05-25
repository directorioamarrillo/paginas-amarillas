import React, { useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import "../../styles/botones.css";
import { Loader2, Trash } from 'lucide-react';
import { navigate } from "astro:transitions/client";
type Props = {
  id: string;
};

export function BotonEliminarEmpresa({ id }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async () => {
    setIsLoading(true);
    try {
      await axiosInstance(`/empresas/${id}`, {
        method: "DELETE",
      });
      navigate("/");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button className="btn-delete" onClick={onDelete} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <Trash className="w-4 h-4 mr-2" /> Eliminar
        </>
      )}
    </button>
  );
}
