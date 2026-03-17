import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Save, ArrowLeft, Shield } from 'lucide-react';
import API from '../api';

const RegisterCourse = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', code: '', semester: '', link: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      await API.post('courses/', formData, { headers: { Authorization: `Bearer ${token}` } });
      alert("Materia registrada con éxito");
      navigate('/dashboard');
    } catch (err) { alert("Error al registrar"); }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-xl">
        {/* BOTÓN VOLVER */}
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 text-[#072146] font-black mb-8 uppercase text-[10px] tracking-widest hover:text-[#49a5e6] transition-all"
        >
          <ArrowLeft size={16}/> Volver al Panel
        </button>

        <div className="bg-white shadow-2xl border border-slate-200 overflow-hidden">
          {/* CABECERA DEL FORMULARIO */}
          <div className="bg-[#072146] p-8 border-b-4 border-[#49a5e6]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 text-[#49a5e6] rounded-lg">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Nueva Materia</h2>
                <p className="text-[#49a5e6] text-[10px] font-bold uppercase tracking-[0.2em]">Registro Académico</p>
              </div>
            </div>
          </div>

          {/* CUERPO DEL FORMULARIO */}
          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 ml-1">Nombre de la Asignatura</label>
                <input 
                  type="text" 
                  placeholder="EJ: INTELIGENCIA ARTIFICIAL" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 text-sm font-bold outline-none focus:border-[#49a5e6] transition-all uppercase"
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 ml-1">Código ID</label>
                  <input 
                    type="text" 
                    placeholder="EJ: IA101" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 text-sm font-bold outline-none focus:border-[#49a5e6] transition-all uppercase"
                    onChange={e => setFormData({...formData, code: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 ml-1">Periodo / Semestre</label>
                  <input 
                    type="text" 
                    placeholder="EJ: AGOSTO-DIC 2025" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 text-sm font-bold outline-none focus:border-[#49a5e6] transition-all uppercase"
                    onChange={e => setFormData({...formData, semester: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 ml-1">URL del Programa Académico (Opcional)</label>
                <input 
                  type="url" 
                  placeholder="https://ejemplo.com/silabo.pdf" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 text-sm font-bold outline-none focus:border-[#49a5e6] transition-all"
                  onChange={e => setFormData({...formData, link: e.target.value})} 
                />
              </div>
            </div>

            {/* BOTÓN DE ACCIÓN */}
            <button className="w-full bg-[#072146] text-white py-5 flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-[0.3em] shadow-lg hover:bg-[#49a5e6] transition-all group">
              <Save size={18} className="group-hover:scale-110 transition-transform"/>
              Guardar Materia
            </button>
          </form>
        </div>

        {/* NOTA AL PIE */}
        <p className="mt-8 text-center text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <Shield size={12}/> Sistema de Gestión Institucional - Acceso Protegido
        </p>
      </div>
    </div>
  );
};

export default RegisterCourse;