import { MapPin, Search } from 'lucide-react';

const SearchBar = () => {
  return (
    <section className="max-w-3xl mx-auto w-full mt-6 md:mt-10">
      <div className="flex items-center rounded-2xl shadow-lg overflow-hidden border" style={{background: 'var(--color-surface)'}}>
        {/* Icono de ubicación */}
        <div className="px-4 text-primary/90">
          <MapPin className="w-5 h-5" />
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Buscar empresas, servicios y más…"
          className="flex-1 px-4 py-3 md:py-4 text-[15px] bg-transparent focus:outline-none"
          aria-label="Buscar"
        />

        {/* Botón de búsqueda */}
        <button className="px-4 py-3 md:py-4 btn-primary rounded-tr-2xl rounded-br-2xl">
          <Search className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

export default SearchBar;
