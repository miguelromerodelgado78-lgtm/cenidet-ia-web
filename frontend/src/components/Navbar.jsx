import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { User, LogOut, Mail, Eye, Contrast, ChevronRight } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('user_name');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  // Función para scroll suave hacia las secciones del Home
  const handleScroll = (e, id) => {
    e.preventDefault();
    // Si no estamos en la raíz (/), primero navegamos a ella
    if (window.location.pathname !== '/') {
      navigate('/');
      // Pequeño delay para esperar que cargue el Home antes de scrollear
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="w-full shadow-md sticky top-0 z-50">
      {/* BARRA BLANCA (Institucional) */}
      <div className="bg-white py-2 px-8 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-6">
          <img src="/pleca_educacion_dic24.png" alt="SEP" className="h-10 w-auto" />
          <div className="h-10 w-[1px] bg-gray-200 hidden md:block"></div>
          <img src="/pleca_tecnm.jpg" alt="TecNM" className="h-10 w-auto" />
          <div className="h-10 w-[1px] bg-gray-200 hidden md:block"></div>
          <img src="/pleca_cenidet.jpg" alt="CENIDET" className="h-8 w-auto" />
        </div>
        <div className="hidden lg:flex items-center gap-4 text-slate-400">
          <Mail size={18} className="hover:text-[#004481] cursor-pointer transition-colors" /> 
          <div className="flex gap-2 border-x px-4 text-[10px] font-bold text-slate-500 italic uppercase">
            <span className="text-[#004481] cursor-pointer">MX</span>
            <span className="hover:text-[#004481] cursor-pointer">US</span>
          </div> 
          <Eye size={18} className="hover:text-[#004481] cursor-pointer transition-colors" /> 
          <Contrast size={18} className="hover:text-[#004481] cursor-pointer transition-colors" />
        </div>
      </div>

{/* BARRA AZUL (Navegación Corporativa) */}
<nav className="bg-[#072146] text-white py-3 px-8 flex justify-between items-center">
  
  <div className="flex-1"></div> 
  
  <div className="flex gap-8 items-center font-bold text-[10px] uppercase tracking-[0.15em]">
    {/* ENLACES CON SCROLL AUTOMÁTICO */}
    <button onClick={(e) => handleScroll(e, 'hero')} className="hover:text-[#49a5e6] transition-colors uppercase">Inicio</button>
    
    {/* APARTADO CONÓCENOS: AHORA REDIRIGE A LA PÁGINA EN /pages */}
    <Link 
      to="/conocenos" 
      className="hover:text-[#49a5e6] transition-colors uppercase border-b-2 border-transparent hover:border-[#49a5e6] pb-1"
    >
      Conócenos
    </Link>
    
    <button onClick={(e) => handleScroll(e, 'noticias')} className="hover:text-[#49a5e6] transition-colors uppercase">Noticias</button>
    <button onClick={(e) => handleScroll(e, 'equipo')} className="hover:text-[#49a5e6] transition-colors uppercase">Equipo</button>
    <button onClick={(e) => handleScroll(e, 'proyectos')} className="hover:text-[#49a5e6] transition-colors uppercase">Proyectos</button>

    {userName ? (
      <div className="flex items-center gap-4 bg-white/5 p-1 rounded-full pl-4 border border-white/10 group">
        <Link to="/dashboard" className="text-[#49a5e6] normal-case italic text-xs group-hover:text-white transition-colors">Dr. {userName}</Link>
        <button onClick={handleLogout} className="bg-red-500/80 p-2 rounded-full hover:bg-red-600 transition shadow-lg">
          <LogOut size={12}/>
        </button>
      </div>
    ) : (
      <Link to="/login" className="bg-[#004481] hover:bg-[#003366] border border-white/10 px-6 py-2 rounded-sm flex items-center gap-2 transition-all font-bold group shadow-sm">
        <User size={14} className="group-hover:text-[#49a5e6]" /> 
        Acceso 
        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    )}
  </div>
</nav>
    </header>
  );
};

export default Navbar;