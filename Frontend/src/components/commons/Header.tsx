import React from "react";
import { ShoppingCart, LogIn, LogOut, UserPlus, Grid } from "lucide-react";

type Props = {
  title?: string;
  token?: string;
  rol?: string;
};

const Header: React.FC<Props> = ({ title, token, rol }) => {
  return (
    <header className="w-full border-b site-header" style={{borderColor: 'rgba(0,0,0,0.06)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3" aria-label="Ir al inicio">
          <div className="w-10 h-10 rounded-lg" style={{background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700}}>PA</div>
          <div>
            <div className="text-lg font-semibold text-heading">{title || 'Páginas Amarillas 360'}</div>
            <div className="text-xs text-muted">Directorio y marketplace local</div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-6">
          <a href="/marketplace" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition">
            <ShoppingCart size={16} /> Marketplace
          </a>

          {rol === 'admin' && (
            <a href="/admin" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition">
              <Grid className="icon-sm" />
              Admin
            </a>
          )}

          {!token ? (
            <>
              <a href="/iniciar-sesion" className="text-sm text-gray-700 hover:text-primary transition flex items-center gap-2">
                <LogIn className="icon-sm" /> Iniciar Sesión
              </a>
              <a href="/crear-cuenta" className="btn btn-primary">
                <UserPlus className="icon-sm" /> Crear Cuenta
              </a>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{rol ? `Rol: ${rol}` : ''}</span>
              <button
                onClick={() => {
                  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                  document.cookie = 'rol=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                  window.location.href = '/';
                }}
                className="btn btn-danger"
              >
                <LogOut className="icon-sm" /> Cerrar Sesión
              </button>
            </div>
          )}
        </nav>

        {/* Mobile menu placeholder (simple) */}
        <div className="md:hidden">
          <a href="/iniciar-sesion" className="text-sm text-gray-700">Entrar</a>
        </div>
      </div>
    </header>
  );
};

export default Header;
