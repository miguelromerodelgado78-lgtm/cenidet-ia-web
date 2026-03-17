import React, { useState } from 'react';
import { UserPlus, ShieldCheck, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import API from '../api';

const RegisterUser = () => {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    is_staff: false
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // NORMALIZACIÓN: Forzamos minúsculas para evitar errores de login después
    const emailLower = formData.email.toLowerCase();
    const usernameLower = formData.username.toLowerCase();

    if (!emailLower.endsWith('@cenidet.tecnm.mx')) {
      alert("Error: El correo debe ser institucional (@cenidet.tecnm.mx).");
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      
      // Enviamos los datos normalizados a la base de datos
      await API.post('accounts/register/', { 
        ...formData, 
        email: emailLower, 
        username: usernameLower 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("¡Investigador registrado con éxito!");
    } catch (err) {
      alert("Error al crear usuario. Revisa si el nombre de usuario ya existe.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-10 bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-sm">
      {/* CABECERA ESTILO INSTITUCIONAL */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-16 h-16 bg-[#f4f7f9] flex items-center justify-center rounded-full mb-4">
          <UserPlus size={32} className="text-[#072146]" />
        </div>
        <h2 className="text-xl font-black text-[#072146] uppercase tracking-[0.15em]">
          Alta de Investigador
        </h2>
        <div className="w-12 h-1 bg-[#49a5e6] mt-2"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* INPUT: USERNAME */}
        <div className="relative">
          <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="NOMBRE DE USUARIO" 
            className="w-full pl-10 pr-4 py-3 border-b-2 border-slate-100 outline-none focus:border-[#49a5e6] transition-all text-xs font-bold uppercase tracking-widest text-[#072146] placeholder:text-slate-300"
            onChange={e => setFormData({...formData, username: e.target.value})} 
            required 
          />
        </div>
        
        {/* INPUT: EMAIL */}
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
          <input 
            type="email" 
            placeholder="CORREO@CENIDET.TECNM.MX" 
            className="w-full pl-10 pr-4 py-3 border-b-2 border-slate-100 outline-none focus:border-[#49a5e6] transition-all text-xs font-bold uppercase tracking-widest text-[#072146] placeholder:text-slate-300"
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required 
          />
        </div>
        
        {/* INPUT: PASSWORD CON BOTÓN DE ICONO */}
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="CONTRASEÑA TEMPORAL" 
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

        {/* SECCIÓN DE PERMISOS */}
        <div className="pt-4 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nivel de Acceso</p>
          
          <div className="flex items-center gap-3 p-4 bg-[#f4f7f9] hover:bg-[#e9f0f5] transition-colors cursor-pointer group rounded-sm">
            <input 
              type="checkbox" 
              id="staff" 
              className="w-4 h-4 accent-[#072146] cursor-pointer" 
              onChange={e => setFormData({...formData, is_staff: e.target.checked})} 
            />
            <label htmlFor="staff" className="text-[10px] font-black text-[#072146] uppercase tracking-widest cursor-pointer flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#49a5e6]"/> Privilegios de Administrador (Staff)
            </label>
          </div>
        </div>

        {/* BOTÓN DE ACCIÓN */}
        <button className="w-full bg-[#072146] hover:bg-[#004481] text-white font-bold py-4 rounded-sm transition-all shadow-lg text-[11px] uppercase tracking-[0.2em] mt-6">
          Registrar Investigador
        </button>
      </form>
    </div>
  );
};

export default RegisterUser;