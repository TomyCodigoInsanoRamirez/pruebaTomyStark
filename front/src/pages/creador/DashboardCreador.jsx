import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { readHistorias, deleteHistoria, readProgresos, deleteProgreso } from '../../services/api';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import toast, { Toaster } from 'react-hot-toast';

export default function DashboardCreador() {
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const [historias, setHistorias] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try {
            const res = await readHistorias();
            // Solo las historias de este creador
            setHistorias(res.data.filter((h) => h.id_creador === usuario?.id));
        } catch {
            toast.error('Error al cargar historias');
        } finally {
            setCargando(false);
        }
    };

    const handlePrevisualizar = async (historiaId) => {
        try {
            const res = await readProgresos();
            const progreso = res.data.find((p) => Number(p.id_historia) === Number(historiaId));
            if (progreso) await deleteProgreso(progreso.id);
        } catch { /* si falla, igual navegamos */ }
        navigate(`/leer/${historiaId}`);
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('Eliminar esta historia? Se eliminaran todos sus nodos.')) return;
        const tid = toast.loading('Eliminando...');
        try {
            await deleteHistoria(id);
            toast.success('Historia eliminada', { id: tid });
            cargar();
        } catch {
            toast.error('Error al eliminar', { id: tid });
        }
    };

    const estadoBadge = (h) => h.publicada
        ? { label: 'Publicada', color: '#4caf50' }
        : { label: 'Borrador', color: '#9e9e9e' };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0d0d1a', color: 'white' }}>
            <Toaster position="top-right" />
            <Navbar />

            <div className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 className="fw-bold mb-1">Mis Historias</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Gestiona y crea tus novelas visuales</p>
                    </div>
                    <button
                        style={{ background: '#e94560', border: 'none', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => navigate('/creador/nueva')}>
                        + Nueva Historia
                    </button>
                </div>

                {cargando ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" style={{ color: '#e94560' }} />
                    </div>
                ) : historias.length === 0 ? (
                    <div className="text-center py-5">
                        <div style={{ fontSize: 64, marginBottom: 16 }}>✍️</div>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem' }}>
                            Aun no tienes historias. Crea tu primera novela visual.
                        </p>
                        <button
                            style={{ background: '#e94560', border: 'none', color: 'white', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', marginTop: 12 }}
                            onClick={() => navigate('/creador/nueva')}>
                            Crear historia
                        </button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {historias.map((h) => {
                            const { label, color } = estadoBadge(h);
                            return (
                                <div className="col-md-6 col-lg-4" key={h.id}>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.04)', borderRadius: 12,
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        overflow: 'hidden', transition: 'border-color .2s',
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(233,69,96,0.4)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>

                                        {/* Cabecera de la card — portada */}
                                        {(() => {
                                            const src = h.portada_base64
                                                ? `data:image/png;base64,${h.portada_base64}`
                                                : h.portada_url || null;
                                            return (
                                                <div style={{
                                                    height: 120,
                                                    background: src
                                                        ? `url(${src}) center/cover`
                                                        : 'linear-gradient(135deg, #16213e, #0f3460)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40,
                                                }}>
                                                    {!src && '📖'}
                                                </div>
                                            );
                                        })()}

                                        <div style={{ padding: '16px 20px' }}>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h5 style={{ color: '#f0f0f0', margin: 0, fontSize: '1rem' }}>{h.titulo}</h5>
                                                <span style={{
                                                    background: color + '22', color: color,
                                                    border: `1px solid ${color}44`,
                                                    borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem',
                                                }}>
                                                    {label}
                                                </span>
                                            </div>

                                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: '0 0 16px',
                                                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {h.descripcion || 'Sin descripcion'}
                                            </p>

                                            <div className="d-flex gap-2">
                                                <button
                                                    style={{ flex: 1, background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.4)', color: '#e94560', borderRadius: 6, padding: '6px 0', cursor: 'pointer', fontSize: '0.85rem' }}
                                                    onClick={() => navigate(`/creador/historia/${h.id}`)}>
                                                    Editar
                                                </button>
                                                <button
                                                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: '6px 0', cursor: 'pointer', fontSize: '0.85rem' }}
                                                    onClick={() => handlePrevisualizar(h.id)}>
                                                    Previsualizar
                                                </button>
                                                <button
                                                    style={{ background: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: '0.85rem' }}
                                                    onClick={() => handleEliminar(h.id)}>
                                                    🗑
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
