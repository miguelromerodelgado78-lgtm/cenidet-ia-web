import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Trash2, Eye, 
  Users, UserPlus, PlusCircle, GraduationCap, 
  UserCog, Save, CheckCircle, BookOpen, Megaphone,
  ExternalLink, Shield, Star, AlertCircle, ShieldCheck, Lock, 
  Sun, Moon, X, Edit3, Plus, ShieldAlert
} from 'lucide-react';
import API from '../api';

const Dashboard = () => {
  const [data, setData] = useState([]); 
  const [activeTab, setActiveTab] = useState(localStorage.getItem('is_staff') === 'true' ? 'news' : 'publications'); 
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [scholarIdInput, setScholarIdInput] = useState("");
  const [currentScholarId, setCurrentScholarId] = useState(localStorage.getItem('scholar_id') || "");
  const [profileForm, setProfileForm] = useState({
    bio: '', office_location: '', phone: '', github_url: '', linkedin_url: '', scholar_id: ''
  });

const currentUserId = parseInt(localStorage.getItem('user_id'));
  const userName = localStorage.getItem('user_name');
  const isStaff = localStorage.getItem('is_staff') === 'true';
  
  // 1. Primero definimos el objeto user (para evitar el error de 'not defined')
  const user = JSON.parse(localStorage.getItem('user')) || {}; 

  // 2. Ahora definimos los permisos. 
  // Intentamos obtenerlo del objeto user, y si no existe, del localStorage directamente
  const hasGroupAccess = user.current_group_permission || localStorage.getItem('has_group_access') === 'true';

  // 3. Esta ya no es necesaria si usas hasGroupAccess, pero si la quieres dejar, 
  // asegúrate de que esté DESPUÉS de definir 'user'
  const currentUserGroupPermission = user?.current_group_permission || false;

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      let endpoint = '';
      switch (activeTab) {
        case 'publications': endpoint = 'publications/'; break;
        case 'users': endpoint = 'accounts/users-list/'; break;
        case 'courses': endpoint = 'courses/'; break;
        case 'students': endpoint = 'students/'; break;
        case 'news': endpoint = 'news/'; break;
        case 'projects': endpoint = 'projects/'; break;
        default: endpoint = 'publications/';
      }
      const response = await API.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (err) { 
      setData([]); 
    }
    setLoading(false);
  }, [activeTab]);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await API.get('accounts/manage-profile/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileForm(res.data);
    } catch (err) { 
      console.error(err); 
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchProfile();
    } else {
      fetchData();
    }
  }, [activeTab, fetchData, fetchProfile]);

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await API.post('accounts/manage-profile/', profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('scholar_id', profileForm.scholar_id);
      setCurrentScholarId(profileForm.scholar_id);
      alert("Configuración de perfil actualizada.");
    } catch (err) { alert("Error al guardar perfil"); }
  };

  const handleSaveScholar = async () => {
    if (!scholarIdInput) return alert("Ingrese un ID");
    try {
      const token = localStorage.getItem('access_token');
      await API.post('accounts/manage-profile/', { scholar_id: scholarIdInput }, { headers: { Authorization: `Bearer ${token}` }});
      localStorage.setItem('scholar_id', scholarIdInput);
      setCurrentScholarId(scholarIdInput);
      alert("ID vinculado.");
      window.location.reload(); 
    } catch (err) { alert("Error al vincular"); }
  };

  const handleEdit = (item) => {
  setSelectedItem(item);
  // Usamos el spread operator para crear un objeto NUEVO
  // y que no sea una referencia al objeto de la lista principal
  setEditFormData({ ...item }); 
  setIsEditModalOpen(true);
};

  const handleUpdate = async (e) => {
  if (e) e.preventDefault();
  try {
    const token = localStorage.getItem('access_token');
    let endpoint = '';
    
    // 1. Definir el endpoint correcto
    if (activeTab === 'projects') endpoint = `projects/${selectedItem.id}/`;
    else if (activeTab === 'news') endpoint = `news/${selectedItem.id}/`;
    else if (activeTab === 'students') endpoint = `students/${selectedItem.id}/`;
    else if (activeTab === 'courses') endpoint = `courses/${selectedItem.id}/`;
    else if (activeTab === 'publications') endpoint = `publications/${selectedItem.id}/`;

    // 2. MAPEO DE SALIDA: Aseguramos que los nombres coincidan con Django
    // Extraemos la imagen para no enviarla como string (causaría error 400)
    const { image, ...baseData } = editFormData;
    
    let dataToSave = { ...baseData };

    // Ajustes específicos según el modelo de Django
    if (activeTab === 'news') {
        // Django espera 'date_text' y 'content'
        dataToSave.date_text = editFormData.date_text;
        dataToSave.content = editFormData.content;
    } else if (activeTab === 'publications') {
        // Django espera 'abstract' en lugar de 'description'
        dataToSave.abstract = editFormData.abstract || editFormData.description;
    } else if (activeTab === 'students' || activeTab === 'courses') {
        // Django espera 'name'
        dataToSave.name = editFormData.name;
    }

    const response = await API.patch(endpoint, dataToSave, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      // Actualizamos el estado local para que el cambio se vea sin recargar
      setData(prevData => prevData.map(item => 
        item.id === selectedItem.id ? { ...item, ...response.data } : item
      ));
      setIsEditModalOpen(false);
      // Un alert más elegante o un toast sería genial después
    }
  } catch (err) {
    console.error("Error detallado:", err.response?.data);
    alert("Error al actualizar: " + JSON.stringify(err.response?.data || "Error de red"));
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm("¿Deseas eliminar este registro?")) return;
    try {
      const token = localStorage.getItem('access_token');
      let endpoint = activeTab === 'users' ? `accounts/users-list/${id}/` : `${activeTab}/${id}/`;
      await API.delete(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) { alert("Error al eliminar."); }
  };

  const handleTogglePermission = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      await API.patch(`accounts/toggle-group-permission/${userId}/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(prevData => prevData.map(item => 
        item.id === userId ? { ...item, current_group_permission: !item.current_group_permission } : item
      ));
    } catch (err) {
      alert("No se pudo cambiar el permiso institucional.");
    }
  };

  const allTabs = [
    { id: 'publications', label: 'Publicaciones', icon: <FileText size={16}/>, staff: false },
    { id: 'students', label: 'Estudiantes', icon: <GraduationCap size={16}/>, staff: false },
    { id: 'courses', label: 'Cátedras', icon: <BookOpen size={16}/>, staff: false },
    { id: 'projects', label: 'Proyectos', icon: <PlusCircle size={16}/>, staff: true }, 
    { id: 'news', label: 'Noticias', icon: <Megaphone size={16}/>, staff: true },
    { id: 'profile', label: 'Mi Perfil', icon: <UserCog size={16}/>, staff: false },
    { id: 'users', label: 'Doctores', icon: <Users size={16}/>, staff: true }
  ];

  const visibleTabs = allTabs.filter(tab => isStaff ? tab.staff : (tab.id !== 'users'));

  return (
    <div className={`w-full min-h-screen transition-colors duration-500 ${darkMode ? 'bg-[#020617]' : 'bg-slate-100'}`}>
      <div className="p-8 max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center bg-[#072146] p-8 shadow-lg border-b-4 border-[#49a5e6] rounded-t-xl relative overflow-hidden">
          <div className="text-white relative z-10">
            <h1 className="text-xl font-black tracking-[0.2em] uppercase">Gestión Académica</h1>
            <p className="text-[#49a5e6] text-[10px] font-bold uppercase tracking-widest mt-1">
              {isStaff ? "Administrador: " : "Investigador: "} <span className="text-white">{userName}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <button 
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all font-black text-[9px] uppercase tracking-tighter shadow-inner
                ${darkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-[#004481] border-[#49a5e6] text-white'}`}
            >
              {darkMode ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} />}
              {darkMode ? 'Modo Día' : 'Modo Noche'}
            </button>

            {currentScholarId && !isStaff && (
              <Link to={`/doctor/${currentScholarId}`} target="_blank" className="flex items-center gap-2 bg-white text-[#072146] px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-[#49a5e6] hover:text-white transition-all shadow-md">
                Perfil Público <ExternalLink size={14} />
              </Link>
            )}
          </div>
        </header>

        {!isStaff && (
          <div className={`transition-all p-6 shadow-xl mb-8 flex flex-col md:flex-row justify-between items-center gap-4 rounded-r-xl border-y border-r border-white/5 border-l-4
            ${darkMode ? 'bg-[#0b1a31] border-l-[#49a5e6]' : 'bg-white border-l-[#072146]'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded shadow-inner border ${darkMode ? 'bg-[#072146] text-[#49a5e6] border-white/10' : 'bg-slate-50 text-[#072146] border-slate-200'}`}>
                <Shield size={24} />
              </div>
              <div>
                <h2 className={`text-[10px] font-black uppercase tracking-widest text-slate-400`}>Scholar Integration</h2>
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-[#072146]'}`}>{currentScholarId || "No vinculado"}</p>
              </div>
            </div>
            <div className={`flex border rounded overflow-hidden shadow-sm ${darkMode ? 'bg-[#072146] border-white/10' : 'bg-white border-slate-200'}`}>
              <input 
                type="text" 
                placeholder="ID INVESTIGADOR" 
                className={`px-4 py-2 text-xs font-bold outline-none w-48 bg-transparent ${darkMode ? 'text-white' : 'text-slate-800'}`} 
                onChange={(e) => setScholarIdInput(e.target.value)} 
              />
              <button onClick={handleSaveScholar} className={`px-4 py-2 font-black uppercase text-[10px] transition ${darkMode ? 'bg-[#49a5e6] text-[#072146]' : 'bg-[#072146] text-white hover:bg-[#49a5e6]'}`}>Vincular</button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {visibleTabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`px-8 py-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-lg shadow-md border-b-4
                ${activeTab === tab.id 
                  ? 'bg-[#004481] text-white border-[#49a5e6] scale-105 z-10 brightness-110 shadow-lg' 
                  : 'bg-[#072146] text-white/70 border-transparent hover:text-white hover:brightness-125'}`}
            >
              <span className={activeTab === tab.id ? 'text-[#49a5e6]' : 'text-white/40'}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className={`transition-all shadow-2xl min-h-[500px] rounded-b-2xl overflow-hidden mb-10 border-t-4 border-[#49a5e6] bg-white`}>
          
          {activeTab === 'profile' ? (
            <div className="p-10 animate-in fade-in duration-500 max-w-4xl">
              <h2 className="text-xs font-black text-[#072146] mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1 h-4 bg-[#49a5e6]" /> Perfil Profesional
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Biografía</label>
                  <textarea className="w-full p-4 bg-slate-50 border text-sm h-32 outline-none focus:border-[#49a5e6]" value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} />
                </div>
                {['office_location', 'phone', 'github_url', 'linkedin_url'].map(field => (
                  <div key={field}>
                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">{field.replace('_', ' ')}</label>
                    <input className="w-full p-3 bg-slate-50 border text-xs font-bold outline-none focus:border-[#49a5e6]" value={profileForm[field] || ''} onChange={e => setProfileForm({...profileForm, [field]: e.target.value})} />
                  </div>
                ))}
              </div>
              <button onClick={handleSaveProfile} className="mt-8 bg-[#072146] text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition flex items-center gap-2 shadow-md">
                <Save size={16} /> Guardar Cambios
              </button>
            </div>
          ) : (
            <div>
              <div className="px-10 py-5 bg-slate-50 border-b flex items-center justify-between">
                <h3 className="text-[10px] font-black text-[#072146] uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle className="text-[#49a5e6]" size={16} /> Registros en {activeTab}
                </h3>
                <div className="flex gap-2">
                  {activeTab === 'users' && isStaff && (
                    <Link to="/registrar-usuario" className="bg-[#072146] text-white px-4 py-2 flex items-center gap-2 font-bold text-[9px] uppercase hover:bg-[#49a5e6] transition shadow-sm">
                      <UserPlus size={14} /> Registrar Doctor
                    </Link>
                  )}
                  {activeTab === 'news' && isStaff && (
                    <Link to="/registrar-noticia" className="bg-[#004481] text-white px-4 py-2 flex items-center gap-2 font-bold text-[9px] uppercase hover:bg-[#49a5e6] transition shadow-lg border-b-2 border-blue-400">
                      <Plus size={14} /> Añadir Noticia de Grupo
                    </Link>
                  )}
                  {!isStaff && (
                    <>
                      {activeTab === 'students' && <Link to="/registrar-estudiante" className="bg-[#072146] text-white px-4 py-2 flex items-center gap-2 font-bold text-[9px] uppercase hover:bg-[#49a5e6] transition shadow-sm"><PlusCircle size={14} /> Nuevo Alumno</Link>}
                      {activeTab === 'courses' && <Link to="/registrar-curso" className="bg-[#072146] text-white px-4 py-2 flex items-center gap-2 font-bold text-[9px] uppercase hover:bg-[#49a5e6] transition shadow-sm"><PlusCircle size={14} /> Nueva Cátedra</Link>}
                      {activeTab === 'news' && <Link to="/registrar-noticia" className="bg-[#072146] text-white px-4 py-2 flex items-center gap-2 font-bold text-[9px] uppercase hover:bg-[#49a5e6] transition shadow-sm"><PlusCircle size={14} /> Nueva Noticia</Link>}
                    </>
                  )}
                  {activeTab === 'projects' && (isStaff || hasGroupAccess) && (
                    <Link to="/registrar-proyecto" className="bg-[#072146] text-white px-4 py-2 flex items-center gap-2 font-bold text-[9px] uppercase hover:bg-[#49a5e6] transition shadow-sm">
                      <PlusCircle size={14} /> Nuevo Proyecto
                    </Link>
                  )}
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Título / Registro</th>
                    {activeTab === 'users' && <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left w-1/4">Permiso Grupo</th>}
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right w-32">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {data.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all duration-200">
                      <td className="px-10 py-6">
                        {activeTab === 'publications' && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="bg-blue-100 text-[#072146] text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">
                                {item.year || item.publication_year || '2025'}
                              </span>
                              <span className="text-[#49a5e6] font-bold text-[10px] uppercase tracking-widest line-clamp-1">
                                {item.journal_name || item.journal || 'Revista Académica'}
                              </span>
                            </div>
                            <p className="font-extrabold text-slate-900 text-sm uppercase leading-tight tracking-tight">{item.title}</p>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                              <span className="text-[#49a5e6] shrink-0">Autores:</span> 
                              <span className="line-clamp-1">{item.authors_list || item.authors || 'Investigadores CENIDET'}</span>
                            </div>
                          </div>
                        )}

                        {activeTab === 'students' && (
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-[#072146] border border-slate-200"><GraduationCap size={20} /></div>
                            <div>
                              <p className="font-extrabold text-slate-900 text-sm uppercase">{item.name}</p>
                              <div className="flex gap-3 mt-1">
                                <span className="text-[10px] text-slate-500 font-bold">{item.email || 'sin@correo.com'}</span>
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 rounded font-black uppercase">{item.student_id || 'Matrícula Activa'}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === 'courses' && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <BookOpen size={14} className="text-[#49a5e6]" />
                              <p className="font-extrabold text-slate-900 text-sm uppercase">{item.name}</p>
                            </div>
                            <div className="flex gap-2 items-center">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Periodo:</span>
                              <span className="text-[10px] font-bold text-[#072146]">{item.semester || 'Ene - Jun 2026'}</span>
                              <span className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded font-bold uppercase">ID: {item.course_code || 'CAT-00'}</span>
                            </div>
                          </div>
                        )}

                        {activeTab === 'news' && (
                          <div className="flex items-center gap-6 max-w-4xl">
                            <div className="relative shrink-0">
                              {item.image ? (
                                <img src={item.image.startsWith('http') ? item.image : `http://localhost:8000${item.image}`} className="w-28 h-20 object-cover rounded-lg border border-slate-200" alt="Noticia" />
                              ) : (
                                <div className="w-28 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-[9px] text-slate-400 font-black uppercase">Sin Imagen</div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                <span className="text-[9px] font-black bg-[#072146] text-white px-2 py-1 rounded">{item.date_text || 'RECIENTE'}</span>
                                <span className="text-[10px] font-black text-[#49a5e6] uppercase flex items-center gap-1">
                                  <UserCog size={12} /> Por: <span className="text-slate-600">{item.doctor_username || 'Administración'}</span>
                                </span>
                                {item.is_important && <span className="flex items-center gap-1 text-[9px] font-black bg-yellow-400 text-yellow-900 px-2 py-1 rounded animate-pulse"><Star size={10} fill="currentColor" /> DESTACADA</span>}
                                {item.is_group_announcement && <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1"><ShieldCheck size={10} /> GRUPO</span>}
                              </div>
                              <p className="font-bold text-slate-800 text-sm leading-relaxed line-clamp-2">{item.content}</p>
                            </div>
                          </div>
                        )}

                        {activeTab === 'projects' && (
                          <div className="flex items-center gap-4">
                            {item.image && <img src={item.image.startsWith('http') ? item.image : `http://localhost:8000${item.image}`} className="w-20 h-14 object-cover rounded-lg border-2 border-white shadow-md" alt="Proyecto" />}
                            <div>
                              <p className="font-extrabold text-slate-900 text-sm uppercase tracking-tight">{item.title}</p>
                              <p className="text-[10px] text-slate-500 font-bold mt-1">Liderado por: {item.participants || 'Investigador Principal'}</p>
                            </div>
                          </div>
                        )}

                        {activeTab === 'users' && (
                          <div className="flex items-center gap-4">
                            <div className="relative group">
                              {item.profile_image ? (
                                <img src={item.profile_image.startsWith('http') ? item.profile_image : `http://localhost:8000${item.profile_image}`} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-110 transition-transform" alt={item.username} />
                              ) : (
                                <div className="w-11 h-11 bg-[#072146] text-white rounded-full flex items-center justify-center text-sm font-black border-2 border-white shadow-md uppercase">
                                  {item.username ? item.username.charAt(0) : 'U'}
                                </div>
                              )}
                              {item.is_staff && (
                                <div className="absolute -top-1 -right-1 bg-[#49a5e6] text-white rounded-full p-1 border-2 border-white"><ShieldCheck size={8} /></div>
                              )}
                            </div>
                            <div>
                              <p className="font-extrabold text-[#072146] text-sm uppercase leading-none">{item.first_name ? `${item.first_name} ${item.last_name || ''}` : item.username}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 tracking-tighter">{item.email}</p>
                            </div>
                          </div>
                        )}
                      </td>

                      {activeTab === 'users' && (
                        <td className="px-10 py-6">
                          <button
                            onClick={() => handleTogglePermission(item.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black transition-all border-2 ${item.current_group_permission ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400'}`}
                          >
                            {item.current_group_permission ? <ShieldCheck size={12} /> : <Lock size={12} />}
                            {item.current_group_permission ? 'GRUPO ACTIVO' : 'SIN ACCESO'}
                          </button>
                        </td>
                      )}

<td className="px-10 py-6 text-right">
  <div className="flex justify-end gap-3">
    {/* BOTÓN VER (Solo para doctores en la pestaña de usuarios) - ESTO SE QUEDA IGUAL */}
    {activeTab === 'users' && item.scholar_id && (
      <Link to={`/doctor/${item.scholar_id}`} target="_blank" className="p-2.5 bg-white border border-slate-200 text-[#072146] hover:bg-[#49a5e6] hover:text-white rounded-lg transition-all shadow-sm">
        <Eye size={16}/>
      </Link>
    )}
    
    {/* BOTÓN EDITAR - AQUÍ ESTÁ EL CAMBIO */}
    {(
      activeTab !== 'users' && ( // <--- ESTO BLOQUEA EL BOTÓN EN LA PESTAÑA DOCTORES
        isStaff || 
        (item.doctor === currentUserId || item.user === currentUserId) || 
        (activeTab === 'students' || activeTab === 'courses') ||
        (activeTab === 'projects' && hasGroupAccess)
      )
    ) && (
      <button 
        onClick={() => handleEdit(item)} 
        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-[#49a5e6] hover:bg-blue-50 rounded-lg transition-all shadow-sm"
      >
        <Edit3 size={16} />
      </button>
    )}

    {/* BOTÓN ELIMINAR - SE QUEDA IGUAL (El staff podrá seguir eliminando si es necesario) */}
    {(
      isStaff || 
      ((item.doctor === currentUserId || item.user === currentUserId) && activeTab !== 'projects') ||
      (activeTab === 'projects' && hasGroupAccess)
    ) && (
      <button 
        onClick={() => handleDelete(item.id)} 
        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shadow-sm"
      >
        <Trash2 size={16} />
      </button>
    )}
  </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.length === 0 && !loading && (
                <div className="py-32 text-center opacity-20">
                  <AlertCircle size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sin información</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
{/* MODAL DE EDICIÓN AMPLIADO Y CORREGIDO */}
{/* MODAL DE EDICIÓN INTELIGENTE (ADAPTADO A TUS MODELOS) */}
{isEditModalOpen && selectedItem && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#072146]/80 backdrop-blur-md p-4">
    <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-y-auto max-h-[90vh]">
      
      {/* CABECERA DINÁMICA */}
      <div className="bg-[#072146] px-8 py-6 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h2 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">
            Panel de Edición
          </h2>
          <p className="text-[#49a5e6] text-[9px] font-bold uppercase mt-1">
            Editando: {activeTab === 'news' ? 'Noticia' : activeTab === 'projects' ? 'Proyecto' : activeTab === 'publications' ? 'Publicación' : 'Registro'}
          </p>
        </div>
        <button onClick={() => setIsEditModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-8 space-y-6">
        
        {/* 1. CAMPO DE TÍTULO / IDENTIFICADOR */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {activeTab === 'news' ? 'Referencia / Fecha (date_text)' : 'Título / Nombre'}
          </label>
          <input 
            type="text" 
            /* Lógica de extracción de datos según tu modelo */
            value={
              activeTab === 'news' ? (editFormData.date_text || '') : 
              (activeTab === 'students' || activeTab === 'courses') ? (editFormData.name || '') :
              (editFormData.title || '')
            } 
            onChange={(e) => {
              const val = e.target.value;
              if (activeTab === 'news') setEditFormData({...editFormData, date_text: val});
              else if (activeTab === 'students' || activeTab === 'courses') setEditFormData({...editFormData, name: val});
              else setEditFormData({...editFormData, title: val});
            }}
            className="w-full border-b-2 border-slate-100 py-2 outline-none focus:border-[#49a5e6] text-sm font-bold text-[#072146] uppercase"
          />
        </div>

        {/* 2. ÁREA DE TEXTO (CONTENIDO / DESCRIPCIÓN) */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {activeTab === 'news' ? 'Cuerpo del Comunicado (content)' : 
             activeTab === 'publications' ? 'Resumen (abstract)' : 'Descripción'}
          </label>
          <textarea 
            rows="5"
            value={
              activeTab === 'news' ? (editFormData.content || '') : 
              activeTab === 'publications' ? (editFormData.abstract || '') :
              (editFormData.description || '')
            } 
            onChange={(e) => {
              const val = e.target.value;
              if (activeTab === 'news') setEditFormData({...editFormData, content: val});
              else if (activeTab === 'publications') setEditFormData({...editFormData, abstract: val});
              else setEditFormData({...editFormData, description: val});
            }}
            className="w-full border-2 border-slate-100 p-3 outline-none focus:border-[#49a5e6] text-sm text-slate-600 rounded-sm"
          />
        </div>

        {/* 3. CAMPOS EXTRAS (SOLO SI ES NOTICIA O PROYECTO) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(activeTab === 'news' || activeTab === 'projects' || activeTab === 'courses' || activeTab === 'students') && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enlace (Link/URL)</label>
              <input 
                type="url" 
                value={editFormData.link || editFormData.external_url || ''} 
                onChange={(e) => setEditFormData({...editFormData, link: e.target.value, external_url: e.target.value})}
                className="w-full border-b-2 border-slate-100 py-2 outline-none focus:border-[#49a5e6] text-sm text-[#072146]"
                placeholder="https://..."
              />
            </div>
          )}

          {activeTab === 'news' && (
            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={editFormData.is_important || false} 
                  onChange={(e) => setEditFormData({...editFormData, is_important: e.target.checked})}
                  className="w-4 h-4 accent-[#49a5e6]"
                />
                <span className="text-[10px] font-black text-slate-600 uppercase">Destacada</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={editFormData.is_group_announcement || false} 
                  onChange={(e) => setEditFormData({...editFormData, is_group_announcement: e.target.checked})}
                  className="w-4 h-4 accent-blue-800"
                />
                <span className="text-[10px] font-black text-slate-600 uppercase">Comunicado</span>
              </label>
            </div>
          )}
        </div>

        {/* 4. VISUALIZACIÓN DE IMAGEN ACTUAL */}
        {editFormData.image && (
          <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm">
            <label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Imagen Cargada</label>
            <img 
              src={editFormData.image.startsWith('http') ? editFormData.image : `http://localhost:8000${editFormData.image}`} 
              className="h-20 w-auto rounded border border-white shadow-sm"
              alt="Vista previa"
            />
          </div>
        )}

        {/* BOTONES DE ACCIÓN */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
          <button 
            onClick={() => setIsEditModalOpen(false)} 
            className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600"
          >
            Cancelar
          </button>
          <button 
            onClick={handleUpdate} 
            className="bg-[#072146] text-white px-10 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#49a5e6] transition-all shadow-xl flex items-center gap-2"
          >
            <Save size={14} /> Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Dashboard;