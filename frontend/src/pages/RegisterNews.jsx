import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Megaphone, ArrowLeft, Send, Star, Link as LinkIcon, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import API from '../api';

const RegisterNews = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  const isStaff = localStorage.getItem('is_staff') === 'true';

  const [canPostAsGroup, setCanPostAsGroup] = useState(
    localStorage.getItem('has_group_access') === 'true' || isStaff
  );
  
  const [formData, setFormData] = useState({
    date_text: '', 
    content: '',
    link: '',
    is_important: false,
    is_group_announcement: isStaff 
  });

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const res = await API.get('accounts/manage-profile/');
        const hasAccess = res.data.has_group_access || res.data.can_post_as_group || isStaff;
        setCanPostAsGroup(hasAccess);

        if (isStaff) {
          setFormData(prev => ({ ...prev, is_group_announcement: true }));
        }
      } catch (err) {
        console.error("Error verificando permisos", err);
      }
    };
    checkPermissions();
  }, [isStaff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // --- GENERACIÓN DE FECHA AUTOMÁTICA CON DÍA ---
    const meses = [
      "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
      "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ];
    const fechaActual = new Date();
    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();
    
    const fechaAutomatica = `${dia} DE ${mes} ${anio}`;
    // Resultado ej: "12 DE MARZO 2026"
    // ----------------------------------------------

    const data = new FormData();
    data.append('date_text', fechaAutomatica); 
    data.append('content', formData.content);
    data.append('link', formData.link);
    data.append('is_important', formData.is_important ? 'true' : 'false');
    data.append('is_group_announcement', formData.is_group_announcement ? 'true' : 'false');
    
    if (imageFile) {
        data.append('image', imageFile);
    }

    try {
      const token = localStorage.getItem('access_token');
      await API.post('news/', data, {
        headers: { 
            'Authorization': `Bearer ${token}` 
        }
      });
      alert(isStaff ? "¡Comunicado institucional publicado!" : "¡Noticia publicada con éxito!");
      navigate('/dashboard'); 
    } catch (err) {
      console.error("Error detalle:", err.response?.data);
      alert("Error al publicar la noticia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-2xl">
        
        <Link to="/dashboard" className="flex items-center gap-2 text-[#072146] font-black mb-8 uppercase text-[10px] tracking-widest hover:text-[#49a5e6] transition-all">
          <ArrowLeft size={16} /> Volver al Panel
        </Link>

        <div className="bg-white shadow-2xl border border-slate-200 overflow-hidden rounded-sm">
          <div className="bg-[#072146] p-10 text-white border-b-4 border-[#49a5e6]">
            <div className="flex items-center gap-5">
              <div className="bg-white/10 p-4 rounded-xl text-[#49a5e6]">
                <Megaphone size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">
                    {isStaff ? "Comunicado de Staff" : "Nueva Noticia"}
                </h2>
                <p className="text-[#49a5e6] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Portal de Noticias y Avisos</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            
            {canPostAsGroup && (
              <div className={`flex items-center gap-4 p-5 rounded-r-xl transition-all animate-in slide-in-from-left duration-500 ${
                isStaff ? 'bg-[#072146] text-white shadow-lg border-l-4 border-[#49a5e6]' : 'bg-blue-50 border-l-4 border-blue-600'
              }`}>
                <input 
                  type="checkbox" 
                  id="group_ann" 
                  checked={formData.is_group_announcement}
                  disabled={isStaff} 
                  className="w-5 h-5 accent-[#49a5e6] cursor-pointer" 
                  onChange={(e) => setFormData({...formData, is_group_announcement: e.target.checked})} 
                />
                <div className="flex flex-col">
                  <label htmlFor="group_ann" className={`text-[10px] font-black cursor-pointer uppercase flex items-center gap-2 ${
                    isStaff ? 'text-white' : 'text-[#072146]'
                  }`}>
                    <ShieldCheck size={14} className={isStaff ? 'text-[#49a5e6]' : ''}/> 
                    {isStaff ? 'Modo Administrador: Publicación de Grupo Activa' : 'Publicar como Grupo Oficial'}
                  </label>
                  <span className={`text-[9px] font-bold uppercase tracking-tight ${
                    isStaff ? 'text-[#49a5e6]' : 'text-blue-600'
                  }`}>CENIDET - INVESTIGACIÓN</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Link Externo (Opcional)</label>
                <div className="relative">
                  <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                  <input type="url" className="w-full p-4 pl-10 bg-slate-50 border border-slate-200 focus:border-[#49a5e6] outline-none text-sm" placeholder="https://..."
                    value={formData.link}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Cuerpo del Anuncio</label>
              <textarea required rows="5" className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-[#49a5e6] outline-none transition text-sm font-medium" placeholder="Redacta el contenido de la noticia aquí..."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              ></textarea>
            </div>

            <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-3 tracking-widest flex items-center gap-2">
                <ImageIcon size={14}/> Imagen de Portada
              </label>
              <input 
                type="file" accept="image/*"
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#072146] file:text-white hover:file:bg-[#49a5e6] transition-all cursor-pointer"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>

            <div className="flex items-center gap-4 p-5 bg-slate-900 rounded-xl border-b-4 border-yellow-500">
              <input 
                type="checkbox" 
                id="imp" 
                checked={formData.is_important}
                className="w-5 h-5 accent-yellow-500 cursor-pointer" 
                onChange={(e) => setFormData({...formData, is_important: e.target.checked})} 
              />
              <div className="flex flex-col">
                <label htmlFor="imp" className="text-[11px] font-black text-white cursor-pointer uppercase tracking-tighter flex items-center gap-2">
                  <Star size={14} className="text-yellow-500 fill-yellow-500"/> Noticia Destacada
                </label>
                <p className="text-[9px] text-slate-400 uppercase font-bold">Aparecerá en la sección principal de la página</p>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#072146] text-white font-black py-5 flex items-center justify-center gap-3 shadow-lg hover:bg-[#49a5e6] transition-all uppercase text-[11px] tracking-[0.3em] disabled:opacity-50 group">
              {loading ? "PROCESANDO..." : <><Send size={18} className="group-hover:translate-x-1 transition-transform"/> PUBLICAR NOTICIA</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterNews;