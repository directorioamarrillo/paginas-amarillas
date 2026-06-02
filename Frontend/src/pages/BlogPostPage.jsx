import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, faCalendar, faEye, faExternalLinkAlt, faShareNodes, faXmark, faLink, faEnvelope
} from "@fortawesome/free-solid-svg-icons";
import { 
  faWhatsapp, faFacebook 
} from "@fortawesome/free-brands-svg-icons";
import { mockBlogPosts } from "../data/mockBlogPosts";

export function BlogPostPage() {
  const { id } = useParams();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const post = mockBlogPosts.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const currentUrl = window.location.href;
  const encodedTitle = encodeURIComponent(post.title);
  const encodedUrl = encodeURIComponent(currentUrl);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white font-sans text-brand-dark pb-20 relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Back Button */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-brand-gray hover:text-primary transition-colors mb-8 font-bold text-sm">
          <FontAwesomeIcon icon={faArrowLeft} /> Volver al Blog
        </Link>

        {/* Header */}
        <header className="mb-10">
          <span className="inline-block bg-primary/10 text-primary-dark font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-md mb-4 border border-primary/20">
            {post.cat}
          </span>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight text-brand-dark mb-6">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-brand-gray-light border-y border-brand-gray-light/30 py-4">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendar} className="text-brand-dark" />
              {post.date}
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faEye} className="text-brand-dark" />
              {post.reads}
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faExternalLinkAlt} className="text-brand-dark" />
              Basado en: {post.source}
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <div className="w-full aspect-[16/9] lg:aspect-[21/9] rounded-3xl overflow-hidden mb-12 bg-brand-gray-light/20 shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
          <img src={post.img} alt={post.title} className="w-full h-full object-cover" />
        </div>

        {/* Content */}
        <article 
          className="prose prose-lg prose-headings:font-black prose-headings:text-brand-dark prose-p:text-brand-gray prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-primary-dark max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Original Source CTA */}
        <div className="bg-brand-gray-light/10 border border-brand-gray-light rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mb-16">
          <div>
            <h4 className="text-lg font-black text-brand-dark mb-2">Lee el artículo original completo</h4>
            <p className="text-sm text-brand-gray">Este contenido es un resumen curado. Apoyamos el periodismo y la investigación original de {post.source}.</p>
          </div>
          <a 
            href={`https://www.google.com/search?q=${encodeURIComponent(post.title)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-brand-gray transition-colors flex items-center gap-2"
          >
            Ir a la fuente original <FontAwesomeIcon icon={faExternalLinkAlt} />
          </a>
        </div>

        {/* Share Button (Triggers Modal) */}
        <div className="flex items-center justify-center gap-4 border-t border-brand-gray-light/30 pt-10">
          <span className="font-bold text-brand-dark">Compartir artículo:</span>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="w-10 h-10 rounded-full bg-brand-gray-light/20 text-brand-dark hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
            title="Compartir"
          >
            <FontAwesomeIcon icon={faShareNodes} />
          </button>
        </div>
      </div>

      {/* Share Modal Overlay */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-brand-gray-light/30">
              <h3 className="font-black text-brand-dark text-lg">Compartir este artículo</h3>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-brand-gray hover:bg-brand-gray-light/20 hover:text-brand-dark transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
                <div className="grid grid-cols-4 gap-3">
                  <a 
                    href={`https://wa.me/?text=${encodedTitle}%0A${encodedUrl}`} 
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center py-4 px-2 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors gap-3 group text-center"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-3xl" />
                    <span className="text-[10px] font-bold group-hover:text-white">WhatsApp</span>
                  </a>
                  
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} 
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center py-4 px-2 rounded-xl bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-colors gap-3 group text-center"
                  >
                    <FontAwesomeIcon icon={faFacebook} className="text-3xl" />
                    <span className="text-[10px] font-bold group-hover:text-white">Facebook</span>
                  </a>

                  <a 
                    href={`mailto:?subject=${encodedTitle}&body=Mira este artículo: ${encodedUrl}`} 
                    className="flex flex-col items-center justify-center py-4 px-2 rounded-xl bg-brand-gray-light/30 text-brand-gray hover:bg-brand-gray hover:text-white transition-colors gap-3 group text-center"
                  >
                    <FontAwesomeIcon icon={faEnvelope} className="text-3xl" />
                    <span className="text-[10px] font-bold group-hover:text-white">Correo</span>
                  </a>

                  <button 
                    onClick={handleCopyLink}
                    className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl transition-colors gap-3 group text-center ${
                      copied 
                      ? 'bg-green-500/20 text-green-600 hover:bg-green-500 hover:text-white' 
                      : 'bg-primary/20 text-brand-dark hover:bg-primary hover:text-white'
                    }`}
                  >
                    <FontAwesomeIcon icon={faLink} className="text-3xl" />
                    <span className="text-[10px] font-bold group-hover:text-white">{copied ? '¡Copiado!' : 'Enlace'}</span>
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
