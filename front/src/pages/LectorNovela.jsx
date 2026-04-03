import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    readHistoria, readNodos, readOpciones,
    readNodoPersonajes, readPersonajes, readImagenes, readAudios,
    readProgresos, createProgreso, updateProgreso,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

// Resuelve src de una imagen: prioriza base64, luego URL con host
const resolverImagen = (img) => {
    if (!img) return null;
    if (img.imagen_base64_display) return `data:image/png;base64,${img.imagen_base64_display}`;
    if (img.url) return img.url.startsWith('http') ? img.url : `http://localhost:8000${img.url}`;
    return null;
};

// Efecto typewriter: muestra el texto caracter a caracter
function useTypewriter(texto, velocidad = 28) {
    const [displayado, setDisplayado] = useState('');
    const [listo, setListo] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!texto) { setDisplayado(''); setListo(true); return; }
        setDisplayado('');
        setListo(false);
        let i = 0;
        intervalRef.current = setInterval(() => {
            i++;
            setDisplayado(texto.slice(0, i));
            if (i >= texto.length) {
                clearInterval(intervalRef.current);
                setListo(true);
            }
        }, velocidad);
        return () => clearInterval(intervalRef.current);
    }, [texto]);

    const terminar = useCallback(() => {
        clearInterval(intervalRef.current);
        setDisplayado(texto);
        setListo(true);
    }, [texto]);

    return { displayado, listo, terminar };
}

export default function LectorNovela() {
    const { historiaId } = useParams();
    const { usuario } = useAuth();
    const navigate = useNavigate();

    // Datos pre-cargados
    const [historia, setHistoria] = useState(null);
    const [nodosMap, setNodosMap] = useState({});       // { id: nodo }
    const [opcionesMap, setOpcionesMap] = useState({}); // { id_nodo_origen: [opciones] }
    const [npMap, setNpMap] = useState({});             // { id_nodo: [nodoPersonajes] }
    const [personajesMap, setPersonajesMap] = useState({}); // { id: personaje }
    const [imagenesMap, setImagenesMap] = useState({}); // { id: imagen }
    const [audiosMap, setAudiosMap] = useState({});     // { id: audio }
    const [progresoId, setProgresoId] = useState(null);

    const [nodoActual, setNodoActual] = useState(null);
    const [cargandoInicial, setCargandoInicial] = useState(true);
    const [error, setError] = useState('');
    const [muted, setMuted] = useState(false);

    const audioRef = useRef(null);
    const { displayado, listo, terminar } = useTypewriter(nodoActual?.texto || '');

    // -------------------------------------------------------
    // Carga inicial: todo lo necesario para la historia
    // -------------------------------------------------------
    useEffect(() => {
        if (!historiaId) return;

        const cargar = async () => {
            try {
                const [
                    resHistoria, resNodos, resOpciones,
                    resNP, resPersonajes, resImagenes,
                    resAudios, resProgresos,
                ] = await Promise.all([
                    readHistoria(historiaId),
                    readNodos(),
                    readOpciones(),
                    readNodoPersonajes(),
                    readPersonajes(),
                    readImagenes(),
                    readAudios(),
                    usuario ? readProgresos() : Promise.resolve({ data: [] }),
                ]);

                const hist = resHistoria.data;
                setHistoria(hist);

                // Nodos de esta historia
                const nodosFiltrados = resNodos.data.filter(
                    (n) => Number(n.id_historia) === Number(historiaId)
                );
                const nm = {};
                nodosFiltrados.forEach((n) => { nm[n.id] = n; });
                setNodosMap(nm);

                // Opciones indexadas por id_nodo_origen
                const om = {};
                resOpciones.data.forEach((o) => {
                    const key = o.id_nodo_origen;
                    if (!om[key]) om[key] = [];
                    om[key].push(o);
                });
                setOpcionesMap(om);

                // NodoPersonajes indexados por id_nodo
                const npm = {};
                resNP.data.forEach((np) => {
                    const key = np.id_nodo;
                    if (!npm[key]) npm[key] = [];
                    npm[key].push(np);
                });
                setNpMap(npm);

                // Maps de soporte
                const pm = {};
                resPersonajes.data.forEach((p) => { pm[p.id] = p; });
                setPersonajesMap(pm);

                const im = {};
                resImagenes.data.forEach((i) => { im[i.id] = i; });
                setImagenesMap(im);

                const am = {};
                resAudios.data.forEach((a) => { am[a.id] = a; });
                setAudiosMap(am);

                // Progreso existente (solo si hay sesion)
                let nodoInicial;
                const progresoExistente = usuario
                    ? resProgresos.data.find((p) => Number(p.id_historia) === Number(historiaId))
                    : null;

                if (progresoExistente) {
                    setProgresoId(progresoExistente.id);
                    nodoInicial = nm[progresoExistente.id_nodo_actual];
                }
                // Si no hay progreso o el nodo guardado no existe, usar id_nodo_inicio
                if (!nodoInicial) {
                    nodoInicial = nm[hist.id_nodo_inicio];
                }
                // Fallback: primer nodo disponible
                if (!nodoInicial) {
                    const primero = nodosFiltrados[0];
                    if (primero) nodoInicial = primero;
                }

                setNodoActual(nodoInicial || null);
            } catch (err) {
                console.error(err);
                setError('Error al cargar la historia. Verifica que el backend este activo.');
            } finally {
                setCargandoInicial(false);
            }
        };

        cargar();
    }, [historiaId]);

    // -------------------------------------------------------
    // Audio de fondo: cambia al cambiar de nodo
    // -------------------------------------------------------
    useEffect(() => {
        if (!nodoActual) return;
        const audio = audiosMap[nodoActual.id_audio_fondo];
        const url = audio?.archivo
            ? (audio.archivo.startsWith('http') ? audio.archivo : `http://localhost:8000${audio.archivo}`)
            : null;

        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (url) {
            audioRef.current = new Audio(url);
            audioRef.current.loop = true;
            audioRef.current.volume = 0.4;
            audioRef.current.muted = muted;
            audioRef.current.play().catch(() => {});
        } else {
            audioRef.current = null;
        }
        return () => { audioRef.current?.pause(); };
    }, [nodoActual?.id]);

    // -------------------------------------------------------
    // Guardar progreso
    // -------------------------------------------------------
    const guardarProgreso = async (nodoId) => {
        if (!usuario) return;
        try {
            if (progresoId) {
                await updateProgreso(progresoId, {
                    id_usuario: usuario.id,
                    id_historia: Number(historiaId),
                    id_nodo_actual: nodoId,
                });
            } else {
                const res = await createProgreso({
                    id_usuario: usuario.id,
                    id_historia: Number(historiaId),
                    id_nodo_actual: nodoId,
                });
                setProgresoId(res.data.id);
            }
        } catch (err) {
            console.error('Error al guardar progreso:', err);
        }
    };

    // -------------------------------------------------------
    // Navegar al siguiente nodo
    // -------------------------------------------------------
    const irANodo = (nodoId) => {
        const nodo = nodosMap[nodoId];
        if (!nodo) return;
        setNodoActual(nodo);
        guardarProgreso(nodoId);
    };

    // Click en el area de texto: termina el typewriter o avanza
    const handleTextClick = () => {
        if (!listo) terminar();
    };

    // Toggle mute
    const toggleMute = () => {
        const nuevoMuted = !muted;
        setMuted(nuevoMuted);
        if (audioRef.current) audioRef.current.muted = nuevoMuted;
    };

    // -------------------------------------------------------
    // Derivados del nodo actual
    // -------------------------------------------------------
    const opciones = nodoActual ? (opcionesMap[nodoActual.id] || []) : [];
    const personajesEnNodo = nodoActual ? (npMap[nodoActual.id] || []) : [];
    const imagenFondo = nodoActual?.id_imagen_escenario
        ? imagenesMap[nodoActual.id_imagen_escenario]
        : null;

    // Personajes con su imagen, agrupados por posicion
    const personajesPorPos = { izquierda: null, centro: null, derecha: null };
    personajesEnNodo.forEach((np) => {
        const p = personajesMap[np.id_personaje];
        if (!p) return;
        const img = imagenesMap[p.id_imagen];
        personajesPorPos[np.posicion] = { ...p, imagenUrl: resolverImagen(img) };
    });

    // -------------------------------------------------------
    // Pantalla de carga
    // -------------------------------------------------------
    if (cargandoInicial) {
        return (
            <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0d0d1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner-border mb-3" style={{ color: '#e94560', width: 48, height: 48 }} />
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Cargando historia...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0d0d1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#e94560', fontSize: '1.2rem' }}>{error}</p>
                <button className="btn btn-outline-light mt-3" onClick={() => navigate('/')}>Volver</button>
            </div>
        );
    }

    if (!nodoActual) {
        return (
            <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0d0d1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem' }}>Esta historia no tiene nodos configurados.</p>
                <button className="btn btn-outline-light mt-3" onClick={() => navigate('/')}>Volver al inicio</button>
            </div>
        );
    }

    // -------------------------------------------------------
    // Estilos del reader
    // -------------------------------------------------------
    const fondoSrc = resolverImagen(imagenFondo);
    const bgStyle = fondoSrc
        ? { backgroundImage: `url(${fondoSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: 'linear-gradient(160deg, #1a1a2e 0%, #0f3460 100%)' };

    // Cada personaje se centra en su tercio: izq=20%, centro=50%, der=80%
    // maxWidth limita el ancho para que no invada el tercio vecino
    const estiloPersonaje = (pos) => {
        const base = {
            position: 'absolute',
            bottom: 0,
            height: '82%',
            maxHeight: 700,
            maxWidth: '30%',
            objectFit: 'contain',
            transform: 'translateX(-50%)',
            filter: 'drop-shadow(4px 8px 16px rgba(0,0,0,0.85))',
            transition: 'all .35s ease',
        };
        if (pos === 'izquierda') return { ...base, left: '20%' };
        if (pos === 'centro')    return { ...base, left: '50%' };
        return { ...base, left: '80%' };
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', userSelect: 'none', ...bgStyle }}>

            {/* z-index: fondo(bg) → overlay(1) → personajes(2) → panel texto(10) → botones(20) */}

            {/* Overlay oscuro sobre el fondo */}
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)', zIndex: 1 }} />

            {/* Boton volver */}
            <button
                style={{ position: 'absolute', top: 16, left: 16, zIndex: 20, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 6, padding: '4px 12px', cursor: 'pointer' }}
                onClick={() => navigate(`/historia/${historiaId}`)}>
                ← Salir
            </button>

            {/* Controles superior derecha */}
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Boton mute */}
                <button
                    onClick={toggleMute}
                    title={muted ? 'Activar audio' : 'Silenciar'}
                    style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        borderRadius: 6,
                        width: 34,
                        height: 34,
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    {muted ? '🔇' : '🔊'}
                </button>
                {/* Titulo del nodo */}
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                    {nodoActual.titulo_nodo}
                </span>
            </div>

            {/* Personajes — sobre el overlay, bajo el panel de texto */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
                {['izquierda', 'centro', 'derecha'].map((pos) => {
                    const p = personajesPorPos[pos];
                    if (!p?.imagenUrl) return null;
                    return (
                        <img key={pos} src={p.imagenUrl} alt={p.nombre}
                            style={estiloPersonaje(pos)} />
                    );
                })}
            </div>

            {/* Panel de texto — sobre personajes */}
            <div
                style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
                    background: 'linear-gradient(to top, rgba(10,10,20,0.97) 0%, rgba(10,10,20,0.92) 100%)',
                    borderTop: '1px solid rgba(233,69,96,0.3)',
                    padding: '24px 32px 28px',
                    cursor: listo ? 'default' : 'pointer',
                    minHeight: opciones.length > 0 ? 'auto' : 160,
                }}
                onClick={handleTextClick}
            >
                {/* Texto narrativo */}
                <p style={{ color: '#f0f0f0', fontSize: '1.05rem', lineHeight: 1.75, margin: 0, marginBottom: opciones.length > 0 ? 20 : 0, minHeight: 60 }}>
                    {displayado}
                    {!listo && <span style={{ opacity: 0.4, animation: 'pulse 1s infinite' }}>|</span>}
                </p>

                {/* Opciones (solo cuando termina el typewriter) */}
                {listo && opciones.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                        {opciones.map((op) => (
                            <button key={op.id}
                                style={{
                                    background: 'rgba(233,69,96,0.12)',
                                    border: '1px solid rgba(233,69,96,0.5)',
                                    color: '#f0f0f0',
                                    padding: '10px 20px',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontSize: '0.95rem',
                                    transition: 'background .2s, border-color .2s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(233,69,96,0.3)'; e.currentTarget.style.borderColor = '#e94560'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(233,69,96,0.12)'; e.currentTarget.style.borderColor = 'rgba(233,69,96,0.5)'; }}
                                onClick={() => irANodo(op.id_nodo_destino)}>
                                {op.texto_opcion}
                            </button>
                        ))}
                    </div>
                )}

                {/* Nodo final */}
                {listo && nodoActual.es_final && opciones.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                        <div style={{ color: '#e94560', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 16 }}>
                            — FIN —
                        </div>
                        <button
                            style={{ background: '#e94560', border: 'none', color: 'white', padding: '10px 28px', borderRadius: 6, cursor: 'pointer', fontSize: '1rem' }}
                            onClick={() => navigate('/')}>
                            Volver al inicio
                        </button>
                    </div>
                )}

                {/* Sin opciones y no es final: indicador de click */}
                {listo && !nodoActual.es_final && opciones.length === 0 && (
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: 12, textAlign: 'right' }}>
                        Sin continuacion configurada
                    </p>
                )}
            </div>
        </div>
    );
}
