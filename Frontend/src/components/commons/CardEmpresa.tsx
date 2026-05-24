import React, { useState, useEffect } from "react";
import { Trash, Edit, Plus, Store, ExternalLink, FileText } from "lucide-react";
import { axiosInstance } from "../../utils/axiosInstance";
import CardImageGallery from "./CardImageGallery";

interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
}

interface Municipio {
  id_municipio: number;
  nombre: string;
  id_departamento: number;
}

interface Empresa {
  id_empresa: number;
  nombre: string;
  nit: string;
  correo: string;
  direccion: string;
  telefono: string;
  logo?: string;
  photos?: string[];
  catalog?: string;
  id_categoria: number;
  id_municipio: number;
  categoria?: Categoria;
  municipio?: Municipio;
}

interface CardEmpresaProps {
  empresas: Empresa[];
}



const CardEmpresa: React.FC<CardEmpresaProps> = ({ empresas: initialEmpresas }) => {
  const [empresas, setEmpresas] = useState<Empresa[]>(initialEmpresas);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Verificar si el usuario es admin
    const rol = document.cookie
      .split('; ')
      .find(row => row.startsWith('rol='))
      ?.split('=')[1];
    setIsAdmin(rol === 'admin');
  }, []);

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar la empresa "${nombre}"?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/empresas/${id}`);
      setEmpresas(empresas.filter(e => e.id_empresa !== id));
      alert('Empresa eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar empresa:', error);
      alert('Error al eliminar la empresa');
    }
  };

  const handleEdit = (id: number) => {
    window.location.href = `/admin/empresas/editar/${id}`;
  };

  const handleCreate = () => {
    window.location.href = '/admin/empresas/agregar';
  };
  
  if (!empresas || empresas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-700 text-lg mb-4">No hay empresas registradas aún</p>
        {isAdmin && (
          <button
            onClick={handleCreate}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3"
          >
            <Plus className="w-5 h-5" />
            Crear Primera Empresa
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {isAdmin && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Crear Nueva Empresa
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {empresas.map((empresa) => (
          <article
            key={empresa.id_empresa}
            className="card hover:scale-[1.01] transform-gpu"
            aria-labelledby={`empresa-${empresa.id_empresa}-title`}
          >
            {/* Botones de admin en la esquina superior derecha */}
            {isAdmin && (
              <div className="absolute top-3 right-3 z-20 flex gap-2">
                <button
                  onClick={() => handleEdit(empresa.id_empresa)}
                  className="p-2 bg-white text-primary rounded-full hover:shadow-md transition"
                  title="Editar empresa"
                  aria-label={`Editar ${empresa.nombre}`}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(empresa.id_empresa, empresa.nombre)}
                  className="p-2 bg-white text-red-600 rounded-full hover:shadow-md transition"
                  title="Eliminar empresa"
                  aria-label={`Eliminar ${empresa.nombre}`}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            )}

            <a href={`/empresas/${empresa.id_empresa}`} className="block">
              <div className="aspect-video w-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
                  <CardImageGallery
                    images={(empresa.photos && empresa.photos.length > 0) ? empresa.photos : (empresa.logo ? [empresa.logo] : [])}
                    alt={empresa.nombre}
                    badge={empresa.categoria?.nombre ?? ''}
                  />
                </div>
              
              <div className="p-6">
                <h2 id={`empresa-${empresa.id_empresa}-title`} className="text-xl font-semibold mb-2 text-heading">{empresa.nombre}</h2>
                
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p>
                    <strong>NIT:</strong> {empresa.nit}
                  </p>
                  <p>
                    <strong>Correo:</strong> {empresa.correo}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {empresa.telefono}
                  </p>
                  <p>
                    <strong>Dirección:</strong> {empresa.direccion}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {empresa.categoria && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">{empresa.categoria.nombre}</span>
                  )}
                  {empresa.municipio && (
                    <span className="inline-block bg-primary text-white text-xs px-3 py-1 rounded-full">{empresa.municipio.nombre}</span>
                  )}
                </div>
                
                {/* Catalog area: show link if exists and upload control for admin */}
                <div className="mt-4">
                  {empresa.catalog ? (
                    <a href={empresa.catalog} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                      <FileText className="icon-sm" /> Ver catálogo
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">No hay catálogo disponible</span>
                  )}

                  {isAdmin && (
                    <div className="mt-2">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                        <input type="file" accept="application/pdf,image/*" className="hidden" onChange={async (ev) => {
                          const file = (ev.target as HTMLInputElement).files?.[0];
                          if (!file) return;
                          const form = new FormData();
                          form.append('file', file);
                          try {
                            const { data } = await axiosInstance(`/api/empresas/${empresa.id_empresa}/catalog`, {
                              method: 'POST',
                              data: form,
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            // expect data.url or similar
                            const url = data?.url || data;
                            if (url) {
                              setEmpresas(prev => prev.map(p => p.id_empresa === empresa.id_empresa ? { ...p, catalog: url } : p));
                              try { localStorage.setItem(`catalog_${empresa.id_empresa}`, url); } catch (e) {}
                              alert('Catálogo subido correctamente');
                            }
                          } catch (err) {
                            // fallback: save file as data URL to localStorage
                            try {
                              const reader = new FileReader();
                              reader.onload = () => {
                                const result = reader.result as string;
                                setEmpresas(prev => prev.map(p => p.id_empresa === empresa.id_empresa ? { ...p, catalog: result } : p));
                                try { localStorage.setItem(`catalog_${empresa.id_empresa}`, result); } catch (e) {}
                                alert('Catálogo guardado localmente (demo)');
                              };
                              reader.readAsDataURL(file);
                            } catch (e) {
                              console.error('No se pudo guardar catálogo', e);
                              alert('Error subiendo catálogo');
                            }
                          }
                        }}>
                        </input>
                        <FileText className="icon-sm" /> <span className="underline">Subir catálogo</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </a>
          </article>
        ))}
      </div>
    </>
  );
};

export default CardEmpresa;
