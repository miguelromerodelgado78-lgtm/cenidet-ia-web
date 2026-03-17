import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Save, X, Image as ImageIcon, Users, FileText } from 'lucide-react';
import API from '../api';

const RegistrarProyecto = () => {
  // 1. Definimos los estados (Esto corrige los errores 'not defined')
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 2. Obtenemos el token del localStorage (Bearer)
    const token = localStorage.getItem('access_token');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('participants', participants);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      // 3. Enviamos la petición con el encabezado de Autorización corregido
      await API.post('projects/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // Esto quita el error 401
        }
      });

      alert("¡Proyecto registrado exitosamente!");
      navigate('/dashboard');
    } catch (err) {
      console.error("Error al subir:", err.response?.data);
      setError("Error al registrar el proyecto. Revisa los permisos o los campos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border p-8">
        <div className="flex items-center gap-4 mb-8 text-[#002d55]">
          <Layout size={32} />
          <h2 className="text-2xl font-black uppercase">Nuevo Proyecto</h2>
        </div>

        {error && (
          <p className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-2">
              <FileText size={14} /> Título del Proyecto
            </label>
            <input 
              type="text" 
              className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-2">
              <Layout size={14} /> Descripción
            </label>
            <textarea 
              className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold min-h-[120px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Participantes */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-2">
              <Users size={14} /> Participantes (Separados por coma)
            </label>
            <input 
              type="text" 
              className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="Dr. Juan Perez, Dra. Maria Lopez"
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-2">
              <ImageIcon size={14} /> Imagen de Portada
            </label>
            <input 
              type="file" 
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#002d55] text-white font-black py-4 rounded-xl hover:bg-blue-800 transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <Save size={20} />
              {loading ? 'Guardando...' : 'Registrar Proyecto'}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/dashboard')}
              className="bg-gray-100 text-gray-500 px-6 rounded-xl hover:bg-gray-200 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrarProyecto;