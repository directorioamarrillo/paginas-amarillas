import React from "react";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded" style={{background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600}}>PA</div>
          <div>
            <p className="text-sm text-gray-700">&copy; {year} Páginas Amarillas 360</p>
            <p className="text-xs text-gray-500">Directorio y marketplace local</p>
          </div>
        </div>

        <nav className="flex items-center gap-5 text-sm font-medium text-gray-600">
          <a href="/terminos-condiciones" className="hover:text-gray-900 transition">Condiciones</a>
          <a href="/contacto" className="hover:text-gray-900 transition">Contacto</a>
          <a href="/ayuda" className="hover:text-gray-900 transition">Ayuda</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
