import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DataTable } from "../components/common/DataTable";
import { EmptyState } from "../components/common/EmptyState";
import { busquedaApi, categoriasApi } from "../services/api";
import { useAsyncData } from "../hooks/useAsyncData";
import { useToast } from "../context/ToastContext";

export function BusquedaPage() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialQuery = searchParams.get("q") || "";
  const initialCategoria = searchParams.get("categoria_id") || "";

  const [query, setQuery] = useState(initialQuery);
  const [categoriaId, setCategoriaId] = useState(initialCategoria);
  
  const [result, setResult] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const categorias = useAsyncData(async () => {
    const { data } = await categoriasApi.list({ limit: 100 });
    return data || [];
  });

  const buscar = async (q = query, cat = categoriaId) => {
    if (!q || q.length < 2) {
      pushToast({ title: "Dato requerido", message: "Ingresa mínimo 2 caracteres", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const params = { query: q, limit: 50 };
      if (cat) params.categoria_id = cat;
      const { data } = await busquedaApi.global(params);
      setResult(data);
      setHasSearched(true);
      
      // Update URL without reloading
      setSearchParams(cat ? { q, categoria_id: cat } : { q }, { replace: true });
    } catch (error) {
      pushToast({ title: "Error", message: error?.response?.data?.detail || "No se pudo buscar", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery && !hasSearched) {
      buscar(initialQuery, initialCategoria);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const run = async () => {
        if (!query || query.length < 1) {
          setSugerencias([]);
          return;
        }
        try {
          const { data } = await busquedaApi.sugerencias({ query, limit: 10 });
          setSugerencias(data.sugerencias || []);
        } catch {
          setSugerencias([]);
        }
      };
      run();
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1F1F1F]">Búsqueda global</h3>
        <div className="mt-3 flex gap-2">
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 min-w-[160px] bg-white cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {(categorias.data || []).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          <input 
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200" 
            placeholder="Buscar en empresas y productos" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
          />
          <button 
            className="rounded-xl bg-[#212121] px-6 py-3 text-sm font-bold text-white hover:bg-neutral-800 transition shadow" 
            onClick={() => buscar(query, categoriaId)}
          >
            Buscar
          </button>
        </div>
        {sugerencias.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {sugerencias.map((item) => (
              <button 
                key={item} 
                className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-primary/10 hover:text-yellow-800 transition duration-200" 
                onClick={() => {
                  setQuery(item);
                  buscar(item, categoriaId);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {loading ? <p className="text-sm text-slate-500 font-medium">Consultando el directorio...</p> : null}
      {!loading && result && (result.empresas?.length || 0) === 0 && (result.productos?.length || 0) === 0 ? (
        <EmptyState title="Sin coincidencias" description="Intenta con otro término de búsqueda." />
      ) : null}

      {result?.empresas?.length ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 mb-3 px-2">Empresas encontradas</h4>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "nombre", label: "Empresa" },
              { key: "correo", label: "Correo" },
              {
                key: "acciones",
                label: "Ir",
                render: () => (
                  <button 
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-[#1F1F1F] hover:bg-primary-hover transition shadow-sm" 
                    onClick={() => navigate(`/empresas?search=${encodeURIComponent(query)}`)}
                  >
                    Ver empresas
                  </button>
                ),
              },
            ]}
            rows={result.empresas}
          />
        </div>
      ) : null}

      {result?.productos?.length ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 mb-3 px-2">Productos encontrados</h4>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "nombre", label: "Producto" },
              { key: "precio", label: "Precio" },
              {
                key: "acciones",
                label: "Ir",
                render: () => (
                  <button 
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-[#1F1F1F] hover:bg-primary-hover transition shadow-sm" 
                    onClick={() => navigate(`/marketplace?search=${encodeURIComponent(query)}`)}
                  >
                    Ver marketplace
                  </button>
                ),
              },
            ]}
            rows={result.productos}
          />
        </div>
      ) : null}
    </section>
  );
}
