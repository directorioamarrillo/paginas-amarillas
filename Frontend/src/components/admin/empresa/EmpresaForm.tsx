import React, { useEffect, useState } from "react";

interface EmpresaFormProps {
  id_empresa?: string;
}

// Wrapper ligero: solo en cliente se carga el componente pesado
const EmpresaForm: React.FC<EmpresaFormProps> = (props) => {
  const [Loaded, setLoaded] = useState<null | React.ComponentType<any>>(null);
  useEffect(() => {
    let mounted = true;
    if (typeof window === "undefined") return;
    (async () => {
      try {
        const mod = await import("./EmpresaFormInner");
        if (mounted) setLoaded(() => mod.default || mod.EmpresaFormInner || mod);
      } catch (e) {
        console.error("Error loading EmpresaFormInner:", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!Loaded) return <div className="h-40 flex items-center justify-center text-gray-500">Cargando formulario...</div>;
  const Comp = Loaded as any;
  return <Comp {...props} />;
};

export default EmpresaForm;
