import { useState } from "react";
import { useAsyncData } from "../hooks/useAsyncData";
import { categoriasApi } from "../services/api";
import { Loading } from "../components/common/Loading";
import { Input } from "../components/common/Input";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";

export function AdminCategoriasPage() {
  const { pushToast } = useToast();
  const confirm = useConfirm();
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [editId, setEditId] = useState(null);

  const categorias = useAsyncData(async () => {
    const { data } = await categoriasApi.list({ limit: 500 });
    // Only active categories (deleted go to Archivo de Registros Eliminados)
    return (data || []).filter((x) => !x.deleted_at);
  });

  const crearCategoria = async (e) => {
    e.preventDefault();
    try {
      await categoriasApi.create(form);
      pushToast({ title: "Categoría creada", message: "OK", type: "success" });
      setForm({ nombre: "", descripcion: "" });
      categorias.reload();
    } catch (err) {
      pushToast({ title: "Error", message: err?.response?.data?.detail || "No se pudo crear", type: "error" });
    }
  };

  const iniciarEdicion = (cat) => {
    setEditId(cat.id);
    setForm({ nombre: cat.nombre || "", descripcion: cat.descripcion || "" });
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    try {
      await categoriasApi.update(editId, form);
      pushToast({ title: "Categoría actualizada", message: "OK", type: "success" });
      setEditId(null);
      setForm({ nombre: "", descripcion: "" });
      categorias.reload();
    } catch (err) {
      pushToast({ title: "Error", message: err?.response?.data?.detail || "No se pudo actualizar", type: "error" });
    }
  };

  const eliminar = async (id) => {
    const isConfirmed = await confirm("¿Desactivar categoría? Se moverá al Archivo de Registros Eliminados.", "Desactivar Categoría");
    if (!isConfirmed) return;
    try {
      await categoriasApi.remove(id);
      pushToast({ title: "Categoría desactivada", message: "Movida al archivo", type: "success" });
      categorias.reload();
    } catch (err) {
      pushToast({ title: "Error", message: err?.response?.data?.detail || "No se pudo eliminar", type: "error" });
    }
  };

  if (categorias.loading) return <Loading />;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Gestión de Categorías</h3>
        <p className="mt-1 text-sm text-slate-600">Crea, edita y desactiva categorías disponibles.</p>

        <form onSubmit={editId ? guardarEdicion : crearCategoria} className="mt-4 grid gap-3 md:grid-cols-2">
          <Input label="Nombre" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} required />
          <Input label="Descripción" value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} />
          <div className="md:col-span-2">
            <button type="submit" className="rounded-xl bg-teal-600 px-4 py-2 text-white">{editId ? "Guardar" : "Crear"}</button>
            {editId ? (
              <button type="button" className="ml-2 rounded-xl bg-gray-200 px-4 py-2" onClick={() => { setEditId(null); setForm({ nombre: "", descripcion: "" }); }}>Cancelar</button>
            ) : null}
          </div>
        </form>

        <div className="mt-6 grid gap-2">
          {(categorias.data || []).map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-semibold">{c.nombre}</div>
                <div className="text-sm text-slate-500">{c.descripcion}</div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg bg-indigo-600 px-2 py-1 text-xs text-white" onClick={() => iniciarEdicion(c)}>Editar</button>
                <button className="rounded-lg bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => eliminar(c.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdminCategoriasPage;
