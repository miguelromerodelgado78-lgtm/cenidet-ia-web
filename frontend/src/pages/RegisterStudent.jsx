import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, GraduationCap, Info, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import API from '../api';

const RegisterStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'phd', // Valor por defecto
    link: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      await API.post('students/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("¡Estudiante añadido al grupo de investigación!");
      navigate('/dashboard'); // Regresamos al panel
    } catch (err) {
      console.error(err);
      alert("Hubo un error al registrar al alumno. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* BOTÓN REGRESAR */}
        <Link to="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-blue-700 transition font-bold mb-8 text-sm uppercase tracking-widest">
          <ArrowLeft size={18} /> Volver al Panel
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
          {/* ENCABEZADO */}
          <div className="bg-[#002d55] p-10 text-white flex items-center gap-4">
             <div className="bg-white/20 p-3 rounded-2xl">
                <UserPlus size={32} />
             </div>
             <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Nuevo Estudiante</h2>
                <p className="text-blue-200 text-sm italic">Agrégalo a tu grupo de investigación</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            
            {/* NOMBRE COMPLETO */}
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase text-gray-400 mb-3 tracking-widest">
                 <UserPlus size={14} /> Nombre del Alumno
              </label>
              <input 
                type="text" required
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition font-bold text-gray-700 shadow-inner"
                placeholder="Ej: Eric Ji"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* CATEGORÍA */}
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase text-gray-400 mb-3 tracking-widest">
                 <GraduationCap size={14} /> Nivel Académico
              </label>
              <select 
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition font-bold text-gray-700 shadow-inner appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="phd">Estudiante de Doctorado</option>
                <option value="undergrad">Estudiante de Pregrado</option>
                <option value="alumni">Antiguo Alumno / Egresado</option>
              </select>
            </div>

            {/* DESCRIPCIÓN / ESTADO */}
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase text-gray-400 mb-3 tracking-widest">
                 <Info size={14} /> Descripción de apoyo
              </label>
              <input 
                type="text" required
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition font-bold text-gray-700 shadow-inner"
                placeholder="Ej: desde otoño de 2025 o coasesorado por el profesor Minh Do"
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            {/* LINK (OPCIONAL) */}
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase text-gray-400 mb-3 tracking-widest">
                 <LinkIcon size={14} /> Perfil Personal o LinkedIn (Opcional)
              </label>
              <input 
                type="url"
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition font-bold text-gray-700 shadow-inner"
                placeholder="https://..."
                onChange={(e) => setFormData({...formData, link: e.target.value})}
              />
            </div>

            {/* BOTÓN FINAL */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-blue-200 transform hover:-translate-y-1 uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Confirmar Registro"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;