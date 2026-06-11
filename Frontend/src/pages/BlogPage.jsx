import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faArrowRight, faChevronLeft, faChevronRight, faBookOpen, faUsers, faBuilding, faFire, faChartLine, faLaptopCode, faStore, faPiggyBank, faRocket, faShareNodes, faFileAlt, faChartBar, faListCheck, faDownload } from "@fortawesome/free-solid-svg-icons";
import { mockBlogPosts } from "../data/mockBlogPosts";
import { useToast } from "../context/ToastContext";

export function BlogPage() {
  const { pushToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [emailSidebar, setEmailSidebar] = useState("");
  const [emailBottom, setEmailBottom] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const categories = [
    { name: "Todas", icon: faBookOpen },
    { name: "Tendencias", icon: faFire },
    { name: "Marketing", icon: faChartLine },
    { name: "Tecnología", icon: faLaptopCode },
    { name: "Empresas", icon: faBuilding },
    { name: "Ventas", icon: faStore },
    { name: "Emprendimiento", icon: faRocket },
    { name: "Redes Sociales", icon: faShareNodes },
  ];

  // Smart filter to map mock categories to UI categories
  const filteredPosts = mockBlogPosts.filter((post) => {
    // Category filter
    let matchesCategory = true;
    if (activeCategory !== "Todas") {
      const catLower = post.cat.toLowerCase();
      const activeLower = activeCategory.toLowerCase();
      
      if (activeLower === "marketing") {
        matchesCategory = catLower.includes("marketing") || catLower.includes("comercio") || catLower.includes("ventas");
      } else if (activeLower === "tecnología") {
        matchesCategory = catLower.includes("tecnolog") || catLower.includes("digital") || catLower.includes("seguridad") || catLower.includes("cloud");
      } else if (activeLower === "empresas") {
        matchesCategory = catLower.includes("empresa") || catLower.includes("negocio") || catLower.includes("gobierno");
      } else if (activeLower === "ventas") {
        matchesCategory = catLower.includes("venta") || catLower.includes("comercio");
      } else if (activeLower === "tendencias") {
        matchesCategory = catLower.includes("tendencia") || catLower.includes("estudio") || catLower.includes("estadística") || catLower.includes("brecha");
      } else if (activeLower === "emprendimiento") {
        matchesCategory = catLower.includes("emprend");
      } else {
        matchesCategory = catLower.includes(activeLower);
      }
    }
    
    // Search query filter
    let matchesSearch = true;
    if (debouncedSearchQuery.trim() !== "") {
      const q = debouncedSearchQuery.toLowerCase();
      matchesSearch = 
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.cat.toLowerCase().includes(q);
    }
    
    return matchesCategory && matchesSearch;
  });

  const carouselPosts = mockBlogPosts.slice(1); // Exclude first featured post for sliding carousel
  const visibleCarouselPosts = carouselPosts.slice(carouselIndex, carouselIndex + 4);

  const handlePrevCarousel = () => {
    setCarouselIndex((prev) => (prev > 0 ? prev - 1 : carouselPosts.length - 4));
  };
  const handleNextCarousel = () => {
    setCarouselIndex((prev) => (prev < carouselPosts.length - 4 ? prev + 1 : 0));
  };

  const handleSubscribeSidebar = (e) => {
    e.preventDefault();
    if (!emailSidebar.trim()) {
      pushToast({ title: "Dato requerido", message: "Ingresa tu correo electrónico", type: "error" });
      return;
    }
    pushToast({ title: "Suscripción exitosa", message: "Te has suscrito a nuestro boletín semanal", type: "success" });
    setEmailSidebar("");
  };

  const handleSubscribeBottom = (e) => {
    e.preventDefault();
    if (!emailBottom.trim()) {
      pushToast({ title: "Dato requerido", message: "Ingresa tu correo electrónico", type: "error" });
      return;
    }
    pushToast({ title: "Suscripción exitosa", message: "Te has suscrito a nuestro boletín semanal", type: "success" });
    setEmailBottom("");
  };


  return (
    <div className="w-full bg-white font-sans text-brand-dark pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-12 lg:py-16 items-center">
          {/* Left: Text & Search */}
          <div className="flex flex-col">
            <span className="inline-block bg-primary/10 text-primary-dark font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-6">
              Centro de conocimiento
            </span>
            <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6 text-brand-dark">
              Blog de <br/>
              <span className="text-primary">Directorio 2.0</span>
            </h1>
            <p className="text-brand-gray text-lg mb-8 max-w-md">
              Consejos prácticos, estrategias de marketing y las últimas tendencias para hacer crecer tu negocio en el entorno digital.
            </p>
            
            <div className="relative w-full max-w-md mb-10">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-gray-light">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <input
                type="text"
                placeholder="Buscar artículos por título o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-brand-gray-light text-brand-dark rounded-full py-3.5 pl-12 pr-6 focus:outline-none focus:border-primary transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-brand-gray-light"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col bg-white border border-brand-gray-light p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-brand-dark"><FontAwesomeIcon icon={faBookOpen} /></div>
                  <span className="text-xl font-black">120</span>
                </div>
                <span className="text-[10px] font-bold text-brand-gray">Artículos publicados</span>
              </div>
              <div className="flex flex-col bg-white border border-brand-gray-light p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-brand-dark"><FontAwesomeIcon icon={faUsers} /></div>
                  <span className="text-xl font-black">1.500</span>
                </div>
                <span className="text-[10px] font-bold text-brand-gray">Lectores activos</span>
              </div>
              <div className="flex flex-col bg-white border border-brand-gray-light p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-brand-dark"><FontAwesomeIcon icon={faBuilding} /></div>
                  <span className="text-xl font-black">300</span>
                </div>
                <span className="text-[10px] font-bold text-brand-gray">Empresas beneficiadas</span>
              </div>
            </div>
          </div>

          {/* Right: Featured Article */}
          <Link to={`/blog/${mockBlogPosts[0].id}`} className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden group block">
            <img 
              src={mockBlogPosts[0].img} 
              alt="Featured" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            
            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 w-full p-8">
              <span className="inline-block bg-[#2A2A2A] text-primary font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-md mb-4 border border-primary/20">
                Artículo Destacado
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-6 max-w-lg">
                {mockBlogPosts[0].title}
              </h2>
              <div className="flex items-center justify-between text-white/80 text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Fuente: {mockBlogPosts[0].source}
                </div>
                <span className="flex items-center gap-2 text-primary hover:text-white transition-colors">
                  Leer artículo <FontAwesomeIcon icon={faArrowRight} />
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* CATEGORIES PILLS */}
        <section className="py-8 flex flex-wrap justify-center gap-3 border-b border-brand-gray-light">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                activeCategory === cat.name 
                  ? "bg-primary/20 text-primary-dark border-primary" 
                  : "bg-white border-brand-gray-light text-brand-gray hover:border-brand-gray hover:text-brand-dark"
              } border`}
            >
              <FontAwesomeIcon icon={cat.icon} className={activeCategory === cat.name ? "text-brand-dark" : "text-brand-gray-light"} />
              {cat.name}
            </button>
          ))}
        </section>

        {/* MAIN LAYOUT: LEFT (CONTENT) & RIGHT (SIDEBAR) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
          
          {/* LEFT CONTENT */}
          <div className="lg:col-span-8 flex flex-col gap-12">
            
            {/* Más leídos esta semana (Carousel style) */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-brand-dark border-l-4 border-primary pl-3">Más leídos esta semana</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrevCarousel}
                    className="w-8 h-8 rounded-full border border-brand-gray-light flex items-center justify-center text-brand-gray hover:bg-brand-gray-light/10 transition-colors"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                  </button>
                  <button 
                    onClick={handleNextCarousel}
                    className="w-8 h-8 rounded-full border border-brand-gray-light flex items-center justify-center text-brand-gray hover:bg-brand-gray-light/10 transition-colors"
                  >
                    <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visibleCarouselPosts.map((item, idx) => (
                  <Link to={`/blog/${item.id}`} key={item.id} className="group flex flex-col">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-brand-gray-light/20">
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary text-brand-dark font-black text-xs flex items-center justify-center border-2 border-white shadow-sm">
                        {carouselIndex + idx + 1}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-brand-gray uppercase tracking-wider mb-1">{item.cat}</span>
                    <h4 className="text-sm font-bold text-brand-dark leading-snug group-hover:text-primary-dark transition-colors">{item.title}</h4>
                  </Link>
                ))}
              </div>
            </div>

            {/* Últimos artículos (List style) */}
            <div>
              <h3 className="text-xl font-black text-brand-dark border-l-4 border-primary pl-3 mb-6">Últimos artículos</h3>
              
              <div className="flex flex-col gap-8">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((item) => (
                    <article key={item.id} className="flex flex-col md:flex-row gap-6 group">
                      <Link to={`/blog/${item.id}`} className="shrink-0 w-full md:w-64 aspect-[16/10] md:aspect-auto md:h-40 rounded-xl overflow-hidden bg-brand-gray-light/20 relative">
                        <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </Link>
                      <div className="flex flex-col flex-1 py-1">
                        <span className="inline-block bg-primary/10 text-primary-dark font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded w-fit mb-2">
                          {item.cat}
                        </span>
                        <Link to={`/blog/${item.id}`}>
                          <h4 className="text-lg font-black text-brand-dark leading-snug mb-2 group-hover:text-primary-dark transition-colors">{item.title}</h4>
                        </Link>
                        <p className="text-xs text-brand-gray leading-relaxed mb-4 flex-1">{item.excerpt}</p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-3 text-[11px] font-semibold text-brand-gray-light">
                            <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Fuente: {item.source}</span>
                          </div>
                          <Link to={`/blog/${item.id}`} className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
                            Leer completo <FontAwesomeIcon icon={faArrowRight} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="text-center py-12 border border-dashed border-brand-gray-light rounded-2xl bg-brand-gray-light/5">
                    <p className="text-brand-gray font-bold">No se encontraron artículos que coincidan con la búsqueda.</p>
                    <button 
                      onClick={() => { setActiveCategory("Todas"); setSearchQuery(""); }}
                      className="mt-4 px-4 py-2 bg-primary text-brand-dark text-xs font-black rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </div>

              {filteredPosts.length > 0 && (
                <div className="mt-10 text-center">
                  <button 
                    onClick={() => {
                      pushToast({ title: "Fin del contenido", message: "Estás viendo todos los artículos que coinciden con los filtros actuales.", type: "info" });
                    }}
                    className="px-6 py-2.5 rounded-full border border-brand-gray-light bg-white text-sm font-bold text-brand-dark hover:border-brand-gray transition-colors shadow-sm inline-flex items-center gap-2"
                  >
                    Ver más artículos <FontAwesomeIcon icon={faArrowRight} className="rotate-90 text-brand-gray-light" />
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Buscar */}
            <div className="p-6 rounded-2xl border border-brand-gray-light bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h3 className="text-sm font-black text-brand-dark mb-4">Buscar en el blog</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Buscar artículos..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-brand-gray-light rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary" 
                />
                <button 
                  onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
                  className="bg-primary text-brand-dark px-4 py-2 rounded-lg hover:bg-primary-dark hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>
            </div>

            {/* Artículos más leídos list */}
            <div className="p-6 rounded-2xl border border-brand-gray-light bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h3 className="text-sm font-black text-brand-dark mb-4">Artículos más leídos</h3>
              <div className="flex flex-col gap-4">
                {mockBlogPosts.slice(0, 5).map((item, i) => (
                  <Link to={`/blog/${item.id}`} key={item.id} className="flex gap-3 group">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary-dark font-black text-[10px] flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <h4 className="text-xs font-bold text-brand-gray group-hover:text-primary-dark leading-snug transition-colors">
                      {item.title}
                    </h4>
                  </Link>
                ))}
              </div>
              <button 
                onClick={() => {
                  setActiveCategory("Todas");
                  setSearchQuery("");
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                  pushToast({ title: "Filtros limpiados", message: "Mostrando todos los artículos", type: "info" });
                }}
                className="w-full mt-6 py-2 rounded-lg border border-brand-gray-light text-xs font-bold text-brand-dark hover:bg-brand-gray-light/10 transition-colors"
              >
                Ver todos los artículos
              </button>
            </div>

            {/* Categorías Populares */}
            <div className="p-6 rounded-2xl border border-brand-gray-light bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h3 className="text-sm font-black text-brand-dark mb-4">Categorías populares</h3>
              <div className="flex flex-col gap-3">
                {[
                  { n: "Marketing", c: 24 },
                  { n: "Empresas", c: 18 },
                  { n: "Tecnología", c: 15 },
                  { n: "Ventas", c: 14 },
                  { n: "Emprendimiento", c: 12 },
                  { n: "Redes Sociales", c: 10 },
                ].map((cat, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      setActiveCategory(cat.n);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="flex items-center justify-between group w-full text-left"
                  >
                    <span className="text-xs font-bold text-brand-gray group-hover:text-primary-dark transition-colors">{cat.n}</span>
                    <span className="bg-primary/10 text-primary-dark text-[10px] font-black px-2 py-0.5 rounded-full">{cat.c}</span>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => {
                  setActiveCategory("Todas");
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="w-full mt-6 py-2 rounded-lg border border-brand-gray-light text-xs font-bold text-brand-dark hover:bg-brand-gray-light/10 transition-colors"
              >
                Ver todas las categorías
              </button>
            </div>

            {/* Newsletter */}
            <div className="p-6 rounded-2xl border border-brand-gray-light bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-center">
              <h3 className="text-sm font-black text-brand-dark mb-2">Suscríbete a nuestro newsletter</h3>
              <p className="text-[11px] text-brand-gray mb-4">Recibe los mejores consejos y novedades directamente en tu correo.</p>
              <form onSubmit={handleSubscribeSidebar}>
                <input 
                  type="email" 
                  placeholder="Tu correo electrónico" 
                  value={emailSidebar}
                  onChange={(e) => setEmailSidebar(e.target.value)}
                  className="w-full text-center bg-white border border-brand-gray-light rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary mb-3" 
                />
                <button type="submit" className="w-full bg-primary text-brand-dark font-black py-2.5 rounded-lg hover:bg-primary-dark hover:text-white transition-colors text-xs uppercase tracking-wider mb-2">
                  Suscribirme
                </button>
              </form>
              <p className="text-[9px] text-brand-gray-light">Sin spam. Cancela cuando quieras.</p>
            </div>

          </aside>
        </div>

        {/* BOTTOM RESOURCES SECTION */}
        <section className="mt-16 pt-12 border-t border-brand-gray-light">
          <h3 className="text-xl font-black text-brand-dark border-l-4 border-primary pl-3 mb-8">Recursos gratuitos para tu negocio</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { title: "Plantillas", desc: "Descarga plantillas listas para usar en tu negocio.", icon: faFileAlt, color: "text-brand-dark", section: "plantillas" },
              { title: "Guías", desc: "Guías paso a paso para emprendedores.", icon: faChartBar, color: "text-brand-dark", section: "guias" },
              { title: "Convocatorias", desc: "Programas y convocatorias del gobierno para tu negocio.", icon: faListCheck, color: "text-brand-dark", section: "convocatorias" },
              { title: "Herramientas", desc: "Herramientas digitales gratuitas para tu gestión diaria.", icon: faDownload, color: "text-brand-dark", section: "herramientas" },
            ].map((res, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-brand-gray-light shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all">
                <div className={`w-12 h-12 rounded-xl bg-brand-gray-light/10 flex items-center justify-center text-2xl mb-4 ${res.color}`}>
                  <FontAwesomeIcon icon={res.icon} />
                </div>
                <h4 className="text-sm font-black text-brand-dark mb-2">{res.title}</h4>
                <p className="text-[11px] text-brand-gray mb-4 flex-1">{res.desc}</p>
                <Link to={`/recursos#${res.section}`} className="text-[10px] font-bold text-primary hover:text-primary-dark uppercase tracking-wider transition-colors">
                  Ver {res.title.toLowerCase()} <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
                </Link>
              </div>
            ))}
          </div>

          {/* Banner */}
          <div className="flex flex-col md:flex-row items-center justify-between bg-white border border-brand-gray-light rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-6 mb-6 md:mb-0">
              <div className="relative w-24 h-24 hidden md:block">
                {/* Simulated Envelope Icon Illustration */}
                <div className="absolute inset-0 bg-primary/20 rounded-2xl rotate-3"></div>
                <div className="absolute inset-0 bg-white border-2 border-primary rounded-2xl -rotate-3 flex items-center justify-center">
                  <div className="w-12 h-8 border-2 border-primary border-b-0 rounded-t-lg absolute bottom-2"></div>
                  <div className="w-16 h-2 bg-primary rounded-full absolute top-6"></div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-brand-dark mb-2">Mantente actualizado</h3>
                <p className="text-sm text-brand-gray">Recibe consejos, novedades y recursos exclusivos para hacer crecer tu negocio.</p>
              </div>
            </div>
            <div className="flex flex-col w-full md:w-auto">
              <form onSubmit={handleSubscribeBottom} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Tu correo electrónico" 
                  value={emailBottom}
                  onChange={(e) => setEmailBottom(e.target.value)}
                  className="w-full sm:w-64 bg-white border border-brand-gray-light rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary" 
                />
                <button type="submit" className="bg-primary text-brand-dark font-black px-6 py-3 rounded-lg hover:bg-primary-dark hover:text-white transition-colors text-sm uppercase tracking-wider whitespace-nowrap">
                  Suscribirme
                </button>
              </form>
              <p className="text-[9px] text-brand-gray-light mt-2 ml-1">Sin spam. Cancela cuando quieras.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
