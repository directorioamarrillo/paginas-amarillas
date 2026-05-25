import { navigate } from "astro:transitions/client";
import { TableAdmin } from "../TableAdmin";
import { axiosInstance as api } from "../../../utils/axiosInstance";

export const ReviewAdmin: React.FC = () => {
  return (
    <>
      <TableAdmin
        tableName="Reviews"
        columns={[
          { key: "id_review", label: "ID" },
          { key: "id_empresa", label: "ID Empresa" },
          { key: "id_usuario", label: "ID Usuario" },
          { key: "comentario", label: "Comentario" },
          { key: "calificacion", label: "Calificación" },
          { key: "fecha", label: "Fecha" },
        ]}
        endpoint="/api/reviews"
        primaryKey="id_review"
        onCreate={() => navigate("/admin/reviews/agregar")}
        onEdit={(id: number) => navigate(`/admin/reviews/editar/${id}`)}
        onDelete={(id: number) =>
          console.log("Deleting review with ID:", id)
        }
        actions={(item, refresh) => {
          const approved = item.aprobado || item.aprobado === true;
          return (
            <>
              {!approved && (
                <button
                  title="Aprobar reseña"
                  onClick={async () => {
                    try {
                      await api.patch(`/api/reviews/${item.id_review}`, { aprobado: true });
                      await refresh();
                    } catch (e) {
                      console.error('Error approving review', e);
                    }
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-400 text-gray-700 hover:bg-green-200 transition"
                >
                  ✓
                </button>
              )}
              <button
                title="Rechazar / Eliminar reseña"
                onClick={async () => {
                  try {
                    if (!confirm('¿Eliminar esta reseña?')) return;
                    await api.delete(`/api/reviews/${item.id_review}`);
                    await refresh();
                  } catch (e) {
                    console.error('Error deleting review', e);
                  }
                }}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-400 text-gray-700 hover:bg-red-200 transition"
              >
                ✕
              </button>
            </>
          );
        }}
      />
    </>
  );
};
