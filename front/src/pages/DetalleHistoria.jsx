import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { readHistoria, readNodos, readProgresos, deleteProgreso, readUsuarios } from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function DetalleHistoria() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth();

    const [historia, setHistoria] = useState(null);
    const [totalNodos, setTotalNodos] = useState(0);
    const [progreso, setProgreso] = useState(null);
    const [autor, setAutor] = useState('');
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            try {
                // Historia y nodos son publicos; progreso y usuarios requieren auth
                const [resHistoria, resNodos] = await Promise.all([
                    readHistoria(id),
                    readNodos(),
                ]);

                const hist = resHistoria.data;
                setHistoria(hist);

                setTotalNodos(resNodos.data.filter(
                    (n) => Number(n.id_historia) === Number(id)
                ).length);

                // Solo si hay sesion activa
                if (usuario) {
                    const [resProgresos, resUsuarios] = await Promise.all([
                        readProgresos(),
                        readUsuarios(),
                    ]);
                    const progresoExistente = resProgresos.data.find(
                        (p) => Number(p.id_historia) === Number(id)
                    );
                    setProgreso(progresoExistente || null);
                    const autorObj = resUsuarios.data.find((u) => u.id === hist.id_creador);
                    if (autorObj) setAutor(`${autorObj.nombre} ${autorObj.apellido_paterno}`);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [id, usuario]);

    const handleComenzar = () => navigate(`/leer/${id}`);

    const handleReiniciar = async () => {
        if (progreso) {
            try { await deleteProgreso(progreso.id); } catch { /* continuar igual */ }
        }
        navigate(`/leer/${id}`);
    };

    if (cargando) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#0d0d1a' }}>
                <Navbar />
                <div className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 56px)' }}>
                    <div className="spinner-border" style={{ color: '#e94560' }} />
                </div>
            </div>
        );
    }

    if (!historia) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#0d0d1a' }}>
                <Navbar />
                <div className="container py-5 text-center">
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Historia no encontrada.</p>
                    <button className="btn btn-outline-light mt-3" onClick={() => navigate('/')}>Volver</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0d0d1a', color: 'white' }}>
            <Navbar />

            {/* Header con fondo */}
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
                padding: '60px 0 40px',
                borderBottom: '1px solid rgba(233,69,96,0.2)',
            }}>
                <div className="container">
                    <button
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: 20, padding: 0 }}
                        onClick={() => navigate('/')}>
                        ← Volver al inicio
                    </button>

                    <div className="row align-items-center g-4">
                        {/* Portada */}
                        <div className="col-md-3 text-center">
                            {(() => {
                                const src = historia.portada_base64
                                    ? `data:image/png;base64,${historia.portada_base64}`
                                    : historia.portada_url || null;
                                return src ? (
                                    <img src={src} alt={historia.titulo} style={{
                                        width: '100%', maxWidth: 200, aspectRatio: '2/3',
                                        objectFit: 'cover', borderRadius: 12,
                                        border: '1px solid rgba(233,69,96,0.3)',
                                        display: 'block', margin: '0 auto',
                                    }} />
                                ) : (
                                    <div style={{
                                        width: '100%', maxWidth: 200, aspectRatio: '2/3',
                                        background: 'linear-gradient(135deg, #16213e, #0f3460)',
                                        borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto', border: '1px solid rgba(233,69,96,0.3)',
                                        fontSize: 64,
                                    }}>📖</div>
                                );
                            })()}
                        </div>

                        {/* Info */}
                        <div className="col-md-9">
                            <h1 className="fw-bold mb-2" style={{ fontSize: '2rem', color: '#f0f0f0' }}>
                                {historia.titulo}
                            </h1>
                            {autor && (
                                <p style={{ color: '#e94560', marginBottom: 12 }}>
                                    por <strong>{autor}</strong>
                                </p>
                            )}
                            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, maxWidth: 600 }}>
                                {historia.descripcion || 'Sin descripcion disponible.'}
                            </p>

                            {/* Stats */}
                            <div className="d-flex gap-4 mt-3 mb-4">
                                <div>
                                    <div style={{ color: '#e94560', fontWeight: 'bold', fontSize: '1.5rem' }}>{totalNodos}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>Escenas</div>
                                </div>
                                <div>
                                    <div style={{ color: '#e94560', fontWeight: 'bold', fontSize: '1.5rem' }}>
                                        {new Date(historia.fecha_creacion).getFullYear()}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>Año</div>
                                </div>
                                {progreso && (
                                    <div>
                                        <div style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1rem' }}>En curso</div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>Tu progreso</div>
                                    </div>
                                )}
                            </div>

                            {/* Botones */}
                            <div className="d-flex gap-3 flex-wrap">
                                <button
                                    style={{
                                        background: '#e94560', border: 'none', color: 'white',
                                        padding: '12px 32px', borderRadius: 8, fontSize: '1rem',
                                        fontWeight: 'bold', cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(233,69,96,0.4)',
                                    }}
                                    onClick={handleComenzar}>
                                    {progreso ? 'Continuar leyendo' : 'Comenzar a leer'}
                                </button>
                                {progreso && (
                                    <button
                                        style={{
                                            background: 'transparent', border: '1px solid rgba(255,255,255,0.3)',
                                            color: 'rgba(255,255,255,0.7)', padding: '12px 24px',
                                            borderRadius: 8, fontSize: '0.9rem', cursor: 'pointer',
                                        }}
                                        onClick={handleReiniciar}>
                                        Reiniciar historia
                                    </button>
                                )}
                                {!usuario && (
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', margin: '8px 0 0', width: '100%' }}>
                                        <span
                                            style={{ color: '#e94560', cursor: 'pointer', textDecoration: 'underline' }}
                                            onClick={() => navigate('/login')}>Inicia sesion</span> para guardar tu progreso.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
