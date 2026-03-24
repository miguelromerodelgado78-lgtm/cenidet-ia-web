import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Añadimos Link y useNavigate
import { UserPlus, ShieldCheck, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import API from '../api';

const RegisterUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    is_staff: false
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailLower = formData.email.toLowerCase();
    const usernameLower = formData.username.toLowerCase();

    if (!emailLower.endsWith('@cenidet.tecnm.mx')) {
      alert("Error: El correo debe ser institucional (@cenidet.tecnm.mx).");
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      await API.post('accounts/register/', { 
        ...formData, 
        email: emailLower, 
        username: usernameLower 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("¡Investigador registrado con éxito!");
      navigate('/dashboard'); // Redirección automática tras éxito
    } catch (err) {
      alert("Error al crear usuario. Revisa si el nombre de usuario ya existe.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-8 flex flex-col items-center">
      <div className="w-full max-w-md">
        
        {/* BOTÓN VOLVER AL PANEL RESALTADO */}
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 text-[#072146] font-black uppercase text-[11px] tracking-[0.2em] shadow-sm hover:bg-[#072146] hover:text-white hover:border-[#072146] hover:shadow-md transition-all duration-300 rounded-sm group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Volver al Panel
          </Link>
        </div>

        <div className="bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-sm overflow-hidden">
          
          {/* CABECERA ESTILO INSTITUCIONAL */}
          <div className="bg-[#072146] p-10 text-center border-b-4 border-[#49a5e6]">
            <div className="w-16 h-16 bg-white/10 flex items-center justify-center rounded-full mb-4 mx-auto">
              <UserPlus size={32} className="text-[#49a5e6]" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-[0.15em]">
              Alta de Investigador
            </h2>
            <p className="text-[#49a5e6] text-[9px] font-bold uppercase tracking-[0.2em] mt-2">
              Gestión de Cuentas Institucionales
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-6">
            {/* INPUT: USERNAME */}
            <div className="relative">
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Nombre de Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="EJ: MIGUEL.REYES" 
                  className="w-full pl-10 pr-4 py-3 border-b-2 border-slate-100 outline-none focus:border-[#49a5e6] transition-all text-xs font-bold uppercase tracking-widest text-[#072146] placeholder:text-slate-300"
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                  required 
                />
              </div>
            </div>
            
            {/* INPUT: EMAIL */}
            <div className="relative">
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Correo Institucional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={16} />
                <input 
                  type="email" 
                  placeholder="USUARIO@CENIDET.TECNM.MX" 
                  className="w-full pl-10 pr-4 py-3 border-b-2 border-slate-100 outline-none focus:border-[#49a5e6] transition-all text-xs font-bold uppercase tracking-widest text-[#072146] placeholder:text-slate-300"
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>
            </div>
            
            {/* INPUT: PASSWORD */}
            <div className="relative">
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Contraseña Temporal</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={16} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-12 py-3 border-b-2 border-slate-100 outline-none focus:border-[#49a5e6] transition-all text-xs font-bold uppercase tracking-widest text-[#072146] placeholder:text-slate-300"
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-[#49a5e6] transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* NIVEL DE ACCESO */}
            <div className="pt-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Privilegios del Sistema</p>
              <div className="flex items-center gap-4 p-5 bg-slate-50 border-l-4 border-[#072146] rounded-r-xl group cursor-pointer transition-all hover:bg-slate-100">
                <input 
                  type="checkbox" 
                  id="staff" 
                  className="w-5 h-5 accent-[#072146] cursor-pointer" 
                  onChange={e => setFormData({...formData, is_staff: e.target.checked})} 
                />
                <div className="flex flex-col">
                  <label htmlFor="staff" className="text-[10px] font-black text-[#072146] uppercase tracking-widest cursor-pointer flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#49a5e6]"/> Acceso de Administrador
                  </label>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Permite gestionar otros investigadores</span>
                </div>
              </div>
            </div>

            {/* BOTÓN REGISTRAR */}
            <button className="w-full bg-[#072146] hover:bg-[#49a5e6] text-white font-black py-5 flex items-center justify-center gap-3 shadow-lg transition-all uppercase text-[11px] tracking-[0.3em] mt-6 group">
              REGISTRAR INVESTIGADOR
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;