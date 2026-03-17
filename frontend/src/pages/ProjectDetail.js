import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import Footer from '../components/Footer';
import { Clock, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProjectDetail = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get(`projects/${id}/`)
            .then(res => {
                setProject(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar el proyecto:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando proyecto...</div>;
    if (!project) return <div className="min-h-screen flex items-center justify-center">No se encontró el proyecto.</div>;

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Aquí puedes poner tu Navbar */}
            
            <main className="max-w-6xl mx-auto px-6 py-12">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#49a5e6] mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
                    <ArrowLeft size={16} /> Volver al inicio
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Columna Izquierda: Imagen */}
                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
                        <img 
                            src={project.image?.startsWith('http') ? project.image : `http://127.0.0.1:8000${project.image}`} 
                            alt={project.title}
                            className="w-full h-auto object-cover"
                        />
                    </div>

                    {/* Columna Derecha: Info Principal */}
                    <div className="flex flex-col">
                        <h1 className="text-5xl font-extrabold text-[#007bff] tracking-tighter mb-6 uppercase">
                            {project.title}
                        </h1>

                        <div className="mb-8">
                            <h3 className="text-red-600 font-black text-xl mb-4 uppercase tracking-tight">
                                Autores:
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium border border-slate-200">
                                    {project.participants}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] border-t border-slate-100 pt-6">
                            <span className="flex items-center gap-1"><Clock size={12} /> Actualizado: {new Date(project.created_at).toLocaleDateString()}</span>
                            <span>• 3 min de lectura</span>
                        </div>
                    </div>
                </div>

                {/* Sección de Contenido */}
                <div className="mt-16 max-w-4xl">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                        <span className="text-[#49a5e6]">🤖</span> Descripción del Proyecto
                    </h2>
                    <div className="bg-slate-50 p-8 rounded-2xl border-l-4 border-[#007bff] shadow-sm">
                        <p className="text-lg leading-relaxed text-slate-700 italic font-light">
                            "{project.description}"
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProjectDetail;