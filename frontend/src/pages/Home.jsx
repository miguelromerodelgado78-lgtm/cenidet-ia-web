import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import Footer from '../components/Footer';
import { 
  Globe, ArrowRight, ArrowUpRight, Megaphone, Calendar, 
  ChevronRight, Bookmark, ShieldCheck, Users 
} from 'lucide-react';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [loading, setLoading] = useState(true); 
  
  const groupScrollRef = useRef(null);
  const doctorScrollRef = useRef(null);

  // --- CONFIGURACIÓN DE URL DINÁMICA ---
  const baseURL = API.defaults.baseURL.replace('/api/', '');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [resDocs, resProj, resNews] = await Promise.all([
          API.get('accounts/public-doctors/').catch(() => ({ data: [] })),
          API.get('projects/').catch(() => ({ data: [] })),
          API.get('news/').catch(() => ({ data: [] }))
        ]);

        setDoctors(resDocs.data);
        setProjects(resProj.data);
        setFeaturedNews(resNews.data);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const offset = clientWidth * 0.8; 
      const scrollToValue = direction === 'left' ? scrollLeft - offset : scrollLeft + offset;

      ref.current.scrollTo({
        left: scrollToValue,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#072146] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#49a5e6]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F7F9] min-h-screen font-sans text-[#072146]">
      
      {/* --- SECCIÓN 1: HERO --- */}
      <header id="hero" className="relative bg-[#072146] min-h-[65vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          <div className="animate-in fade-in slide-in-from-left duration-1000">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="text-[#49a5e6] animate-pulse" size={20} />
              <span className="text-[#49a5e6] font-bold tracking-[0.3em] text-[10px] uppercase">Conectando Ciencia y Futuro</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-8 tracking-tighter">
              Área de Inteligencia <span className="text-[#49a5e6]">Artificial</span>
            </h1>
            <p className="text-white/70 text-lg mb-10 max-w-lg leading-relaxed font-light italic border-l-2 border-[#49a5e6] pl-6">
              Investigación de vanguardia y desarrollo tecnológico para los desafíos globales de la nueva era digital.
            </p>
            <Link to="/conocenos">
              <button className="bg-[#49a5e6] hover:bg-white text-[#072146] px-10 py-4 rounded-sm font-bold text-xs uppercase tracking-widest transition-all shadow-lg">
                Conócenos
              </button>
            </Link>
          </div>
          <div className="hidden lg:block relative">
            <div className="relative z-10 w-full h-[450px] rounded-lg shadow-2xl overflow-hidden border border-white/10 group">
              <img src="/cenit.jpeg" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Cenidet" />
              <div className="absolute inset-0 bg-[#072146]/20"></div>
            </div>
          </div>
        </div>
      </header>

      {/* --- SECCIÓN 2: COMUNICADOS --- */}
      {featuredNews.length > 0 && (
        <section id="noticias" className="py-24 px-6 max-w-7xl mx-auto space-y-20">
          
          {/* --- 2.1 COMUNICADOS OFICIALES DEL GRUPO --- */}
          {(() => {
            const groupNews = featuredNews.filter(n => n.is_group_announcement);
            if (groupNews.length === 0) return null;

            return (
              <div className="animate-in fade-in slide-in-from-bottom duration-700">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-[#072146] rounded-xl text-[#49a5e6] shadow-lg">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-[#072146] tracking-tighter uppercase">Comunicados del Grupo</h2>
                    <p className="text-[#49a5e6] font-bold text-[10px] uppercase tracking-[0.3em]">TecNM Inteligencia Artificial</p>
                  </div>
                </div>

                <div className="relative group/container">
                  {groupNews.length > 1 && (
                    <>
                      <button onClick={() => scroll(groupScrollRef, 'left')} className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-xl hover:bg-[#072146] hover:text-white transition-all hidden md:block border border-slate-100">
                        <ChevronRight size={24} className="rotate-180" />
                      </button>
                      <button onClick={() => scroll(groupScrollRef, 'right')} className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-xl hover:bg-[#072146] hover:text-white transition-all hidden md:block border border-slate-100">
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}

                  <div ref={groupScrollRef} className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide scroll-smooth">
                    {groupNews.map(item => (
                      <div key={item.id} className="flex-none w-[90vw] md:w-[800px] snap-center bg-[#072146] text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10">
                        {item.image && (
                          <div className="md:w-96 h-64 md:h-auto overflow-hidden shrink-0">
                            <img 
                              src={item.image.startsWith('http') ? item.image : `${baseURL}${item.image}`} 
                              alt="Oficial" 
                              className="w-full h-full object-cover opacity-80" 
                            />
                          </div>
                        )}
                        <div className="p-10 flex-1 flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-6 text-[#49a5e6]">
                            <Calendar size={14}/><span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.date_text}</span>
                            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase">Oficial</span>
                          </div>
                          <p className="text-white/60 text-sm leading-relaxed mb-8 font-light italic line-clamp-4">"{item.content}"</p>
                          {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[#49a5e6] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-white">Leer más <ArrowUpRight size={16}/></a>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* --- 2.2 ACTIVIDAD DE INVESTIGADORES --- */}
          {(() => {
            const docNews = featuredNews.filter(n => n.is_important && !n.is_group_announcement);
            if (docNews.length === 0) return null;

            return (
              <div className="animate-in fade-in slide-in-from-bottom duration-1000">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-slate-100 rounded-xl text-[#072146]">
                    <Megaphone size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[#072146] tracking-tighter uppercase">Actividad Académica</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Últimos logros del claustro</p>
                  </div>
                </div>

                <div className="relative group/docs">
                  {docNews.length > 1 && (
                    <>
                      <button onClick={() => scroll(doctorScrollRef, 'left')} className="absolute left-[-10px] top-1/2 -translate-y-1/2 z-30 bg-white p-3 rounded-full shadow-lg text-[#072146] hover:bg-[#49a5e6] hover:text-white transition-all hidden md:flex"><ChevronRight size={20} className="rotate-180" /></button>
                      <button onClick={() => scroll(doctorScrollRef, 'right')} className="absolute right-[-10px] top-1/2 -translate-y-1/2 z-30 bg-white p-3 rounded-full shadow-lg text-[#072146] hover:bg-[#49a5e6] hover:text-white transition-all hidden md:flex"><ChevronRight size={20} /></button>
                    </>
                  )}

                  <div ref={doctorScrollRef} className="flex overflow-x-auto gap-6 pb-10 snap-x snap-mandatory scrollbar-hide scroll-smooth">
                    {docNews.map(item => (
                      <div key={item.id} className="flex-none w-[280px] md:w-[400px] snap-start bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all flex flex-col overflow-hidden group">
                        {item.image && (
                          <div className="w-full h-44 overflow-hidden">
                            <img 
                              src={item.image.startsWith('http') ? item.image : `${baseURL}${item.image}`} 
                              alt="News" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            />
                          </div>
                        )}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-center gap-2 mb-3 text-slate-400 uppercase text-[9px] font-bold tracking-widest">
                            <Calendar size={12}/> {item.date_text}
                          </div>
                          <h3 className="text-sm font-black text-[#072146] mb-2 uppercase group-hover:text-[#49a5e6]">
                            Dr. {item.doctor_name || item.doctor_username || "Investigador"}
                          </h3>
                          <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-6 font-light">"{item.content}"</p>
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-auto flex items-center gap-2 text-[#49a5e6] font-bold text-[9px] uppercase tracking-widest">
                              Detalles <ArrowUpRight size={14}/>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* --- SECCIÓN 3: EQUIPO --- */}
      <section 
        id="equipo" 
        className="py-24 px-6 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(7, 33, 70, 0.85), rgba(7, 33, 70, 0.85)), url('/fondo3.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-black text-white uppercase tracking-wider">
              Claustro doctoral
            </h2>
            <div className="w-16 h-1 bg-[#49a5e6] mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map(doc => (
              <Link 
                key={doc.id} 
                to={`/doctor/${doc.scholar_id}`} 
                className="bg-white p-8 rounded-sm shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 mb-6 group-hover:border-[#49a5e6] transition-colors">
                    <img 
                      src={doc.image_url ? (doc.image_url.startsWith('http') ? doc.image_url : `${baseURL}${doc.image_url}`) : `https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=${doc.scholar_id}`} 
                      className="w-full h-full object-cover" 
                      alt={doc.username} 
                    />
                  </div>
                  <h3 className="text-sm font-black text-[#072146] uppercase text-center">
                    {doc.first_name} {doc.last_name || doc.username}
                  </h3>
                  <div className="mt-6 text-[#49a5e6] text-[9px] font-black uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                    Ver Perfil <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 4: PROYECTOS --- */}
      {projects.length > 0 && (
        <section id="proyectos" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b pb-8 border-slate-100">
            <div className="flex items-center gap-4">
              <Bookmark className="text-[#49a5e6]" size={28} />
              <div>
                <h2 className="text-3xl font-bold text-[#072146] tracking-tighter uppercase">Portafolio de Proyectos</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1 text-left">Casos de Éxito</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map(project => (
              <div
                key={project.id}
                className="group relative h-[450px] bg-[#072146] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 rounded-sm"
              >
                <img
                  src={project.image?.startsWith('http') ? project.image : `${baseURL}${project.image}`}
                  alt={project.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700"
                />

                <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-[#072146] via-transparent to-transparent">
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight uppercase leading-none border-l-4 border-[#49a5e6] pl-4">
                    {project.title}
                  </h3>

                  <div className="max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden">
                    <p className="text-slate-200 text-xs font-light leading-relaxed mb-6 italic">
                      "{project.description}"
                    </p>
                    <p className="text-[9px] font-black text-[#49a5e6] uppercase tracking-[0.2em] mb-4">
                       {project.participants}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 mt-2">
                    <Link 
                      to={`/proyecto/${project.id}`} 
                      className="text-[10px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2 hover:text-[#49a5e6] transition-colors"
                    >
                      Ver especificaciones <ChevronRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <Footer />
    </div>
  );
};

export default Home;