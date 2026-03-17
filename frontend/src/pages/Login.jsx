import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import ReCAPTCHA from "react-google-recaptcha";
import API from '../api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const captchaRef = useRef(null);
  const navigate = useNavigate();

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    if (token) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!captchaToken) {
      setError("Por favor, confirma que no eres un robot.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await API.post('accounts/login/', {
       username: username.toLowerCase(),
        password: password,
        captcha_token: captchaToken
      });

      // 1. Guardar Token de autenticación
      localStorage.setItem('access_token', response.data.access);
      
      // 2. Guardar ID numérico del usuario (CRÍTICO para validación de dueño de proyecto)
      localStorage.setItem('user_id', response.data.user_id); 
      
      // 3. Guardar datos de perfil
      localStorage.setItem('user_name', response.data.username);
      localStorage.setItem('scholar_id', response.data.scholar_id || "");

      // 4. Guardar booleanos como Strings (Evita fallos de lectura en el Dashboard)
      localStorage.setItem('is_staff', String(response.data.is_staff)); 
      localStorage.setItem('is_superuser', String(response.data.is_superuser));
      localStorage.setItem('has_group_access', String(response.data.has_group_access));

      // Redirigir y recargar para limpiar estados previos
      navigate('/dashboard');
      window.location.reload(); 

    } catch (err) {
      console.error("Error en login:", err);
      const mensajeError = err.response?.data?.detail || "Usuario, contraseña o captcha incorrectos.";
      setError(mensajeError);
      
      setCaptchaToken(null);
      if (captchaRef.current) captchaRef.current.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border">
        <div className="flex justify-center mb-6 text-[#002d55]">
          <LogIn size={48} />
        </div>
        
        <h2 className="text-3xl font-black text-center text-gray-800 mb-8 uppercase tracking-tighter">
          Acceso Doctores
        </h2>
        
        {error && (
          <p className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm text-center font-bold border border-red-100 animate-pulse">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1 block">Usuario</label>
            <input 
              type="text" 
              placeholder="Ej. dr_mariana"
              className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1 block">Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          <div className="flex justify-center py-2">
            <ReCAPTCHA
              ref={captchaRef}
              sitekey="6LeOJIEsAAAAADu5Mx3yS8hmoaqLHy_nD96MwNKt"
              onChange={handleCaptchaChange}
            />
          </div>

          <button 
            type="submit"
            disabled={!captchaToken || isLoading}
            className={`w-full font-black py-4 rounded-xl transition-all shadow-lg uppercase tracking-widest active:scale-95 ${
              captchaToken && !isLoading
                ? 'bg-[#002d55] text-white hover:bg-blue-800' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isLoading ? 'Cargando...' : 'Entrar al Panel'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest">
          Sistema de Gestión TecNM IA
        </p>
      </div>
    </div>
  );
};

export default Login;