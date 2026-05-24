/**
 * Enterprise Footer Component (New)
 * Minimal footer with links and branding
 */

import { COLORS, BORDER_RADIUS } from '../../config/designSystem';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = [
    { label: 'Términos', href: '/terminos' },
    { label: 'Privacidad', href: '/privacidad' },
    { label: 'Contacto', href: '/contacto' },
    { label: 'Soporte', href: '/soporte' },
  ];

  return (
    <footer
      className="border-t px-6 py-6"
      style={{ borderColor: COLORS.dark.tertiary, backgroundColor: COLORS.dark.secondary }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                style={{
                  backgroundColor: COLORS.brand.yellow,
                  color: COLORS.dark.primary,
                }}
              >
                D
              </div>
              <div>
                <p className="text-sm font-bold text-white">DIRECTORIO 2.0</p>
                <p className="text-xs text-neutral-500">Enterprise Platform</p>
              </div>
            </div>
            <p className="text-sm text-neutral-400 max-w-xs">
              Plataforma moderna de marketplace inspirada en Páginas Amarillas
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-sm font-semibold text-white mb-3">Acceso Rápido</p>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="text-sm font-semibold text-white mb-3">Síguenos</p>
            <div className="flex gap-3">
              {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                <a
                  key={social}
                  href={`https://${social}.com`}
                  className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-brand-yellow text-neutral-400 hover:text-dark-primary flex items-center justify-center transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social}
                >
                  <span className="text-xs font-bold">{social.charAt(0)}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderColor: COLORS.dark.tertiary }} className="border-t my-6" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <p>&copy; {currentYear} DIRECTORIO 2.0. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="/privacidad" className="hover:text-white transition-colors">
              Política de Privacidad
            </a>
            <span>•</span>
            <a href="/terminos" className="hover:text-white transition-colors">
              Términos de Servicio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
