import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    readHistoria, createHistoria, updateHistoria,
    readNodos, createNodo, updateNodo, deleteNodo,
    readOpciones, createOpcion, updateOpcion, deleteOpcion,
    readImagenes, createImagen, deleteImagen,
    readAudios, createAudio, deleteAudio,
    readPersonajes, createPersonaje, updatePersonaje, deletePersonaje,
    readNodoPersonajes, createNodoPersonaje, deleteNodoPersonaje,
} from '../../services/api';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import toast, { Toaster } from 'react-hot-toast';

// -------------------------------------------------------
// Estilos comunes
// -------------------------------------------------------
const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 6,
    padding: '8px 12px',
    color: 'white',
};
const labelStyle = {
    color: 'rgba(255,255,255,0.6)',
    display: 'block',
    marginBottom: 4,
    fontSize: '0.85rem',
};
const selectStyle = { ...inputStyle, background: '#1a1a2e' };
const btnRed = {
    background: '#e94560',
    border: 'none',
    color: 'white',
    padding: '8px 20px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 'bold',
};
const btnGhost = {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: 6,
    cursor: 'pointer',
};

// -------------------------------------------------------
// Tab 1: Info basica de la historia
// -------------------------------------------------------
function TabInfo({ historia, historiaId, usuario, onGuardado }) {
    const FORM_INICIAL = { titulo: '', descripcion: '', publicada: false, id_nodo_inicio: '', id_portada: '' };
    const [form, setForm] = useState(historia
        ? {
            titulo: historia.titulo,
            descripcion: historia.descripcion,
            publicada: historia.publicada,
            id_nodo_inicio: historia.id_nodo_inicio || '',
            id_portada: historia.id_portada || '',
        }
        : FORM_INICIAL);
    const [nodos, setNodos] = useState([]);
    const [portadas, setPortadas] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        if (historiaId) {
            readNodos().then((r) => {
                setNodos(r.data.filter((n) => Number(n.id_historia) === Number(historiaId)));
            }).catch(() => {});
        }
        readImagenes().then((r) => {
            setPortadas(r.data.filter((i) => i.tipo === 'portada'));
        }).catch(() => {});
    }, [historiaId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setErrores({});
        const payload = {
            titulo: form.titulo,
            descripcion: form.descripcion,
            publicada: form.publicada,
            id_creador: usuario.id,
            id_nodo_inicio: form.id_nodo_inicio || null,
            id_portada: form.id_portada || null,
        };
        try {
            if (historiaId) {
                await updateHistoria(historiaId, payload);
                toast.success('Historia guardada');
            } else {
                const res = await createHistoria(payload);
                toast.success('Historia creada');
                onGuardado(res.data.id);
            }
        } catch (err) {
            if (err.response?.data) setErrores(err.response.data);
            toast.error('Error al guardar');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <form onSubmit={handleGuardar} style={{ maxWidth: 600 }}>
            <div className="mb-4">
                <label style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>Titulo *</label>
                <input type="text" name="titulo"
                    value={form.titulo} onChange={handleChange} required disabled={guardando}
                    placeholder="Titulo de la novela visual"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '10px 14px', color: 'white', fontSize: '1rem' }} />
                {errores.titulo && <p style={{ color: '#e94560', fontSize: '0.82rem', marginTop: 4 }}>{errores.titulo.join(', ')}</p>}
            </div>

            <div className="mb-4">
                <label style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>Descripcion / Sinopsis</label>
                <textarea name="descripcion" rows={4}
                    value={form.descripcion} onChange={handleChange} disabled={guardando}
                    placeholder="De que trata tu historia..."
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '10px 14px', color: 'white', resize: 'vertical' }} />
            </div>

            <div className="mb-4">
                <label style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>Imagen de portada</label>
                <select name="id_portada" value={form.id_portada} onChange={handleChange} disabled={guardando}
                    style={{ width: '100%', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '10px 14px', color: 'white' }}>
                    <option value="">-- Sin portada --</option>
                    {portadas.map((p) => (
                        <option key={p.id} value={p.id}>{p.descripcion || `Portada ${p.id}`}</option>
                    ))}
                </select>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: 4 }}>
                    Sube la portada primero en la pestana "Recursos".
                </p>
            </div>

            {historiaId && nodos.length > 0 && (
                <div className="mb-4">
                    <label style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>Nodo de inicio</label>
                    <select name="id_nodo_inicio"
                        value={form.id_nodo_inicio} onChange={handleChange} disabled={guardando}
                        style={{ width: '100%', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '10px 14px', color: 'white' }}>
                        <option value="">-- Sin nodo de inicio --</option>
                        {nodos.map((n) => (
                            <option key={n.id} value={n.id}>{n.titulo_nodo} (ID {n.id})</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="mb-4 d-flex align-items-center gap-3">
                <input type="checkbox" id="publicada" name="publicada"
                    checked={form.publicada} onChange={handleChange} disabled={guardando}
                    style={{ width: 18, height: 18, accentColor: '#e94560' }} />
                <label htmlFor="publicada" style={{ color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                    Publicar historia (visible para todos los lectores)
                </label>
            </div>

            {!form.publicada && (
                <div style={{ background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.3)', borderRadius: 6, padding: '10px 14px', marginBottom: 20 }}>
                    <p style={{ color: '#ffc107', fontSize: '0.85rem', margin: 0 }}>
                        Tu historia esta en modo borrador. Solo tu puedes verla.
                    </p>
                </div>
            )}

            <button type="submit" disabled={guardando} style={btnRed}>
                {guardando ? 'Guardando...' : historiaId ? 'Guardar cambios' : 'Crear historia'}
            </button>
        </form>
    );
}

// -------------------------------------------------------
// Tab 2: Recursos (imagenes y audios)
// -------------------------------------------------------
function TabRecursos() {
    const [imagenes, setImagenes] = useState([]);
    const [audios, setAudios] = useState([]);
    const [subiendo, setSubiendo] = useState(false);

    // Form imagen
    const [imgFile, setImgFile] = useState(null);
    const [imgTipo, setImgTipo] = useState('escenario');
    const [imgDesc, setImgDesc] = useState('');

    // Form audio
    const [audFile, setAudFile] = useState(null);
    const [audDesc, setAudDesc] = useState('');

    const [seccion, setSeccion] = useState('imagenes');

    const cargar = async () => {
        const [ri, ra] = await Promise.all([readImagenes(), readAudios()]);
        setImagenes(ri.data);
        setAudios(ra.data);
    };

    useEffect(() => { cargar(); }, []);

    const subirImagen = async (e) => {
        e.preventDefault();
        if (!imgFile) { toast.error('Selecciona un archivo'); return; }
        setSubiendo(true);
        const fd = new FormData();
        fd.append('imagen_para_binario', imgFile);
        fd.append('tipo', imgTipo);
        fd.append('descripcion', imgDesc);
        try {
            await createImagen(fd);
            toast.success('Imagen subida');
            setImgFile(null);
            setImgDesc('');
            e.target.reset();
            cargar();
        } catch { toast.error('Error al subir imagen'); }
        finally { setSubiendo(false); }
    };

    const subirAudio = async (e) => {
        e.preventDefault();
        if (!audFile) { toast.error('Selecciona un archivo'); return; }
        setSubiendo(true);
        const fd = new FormData();
        fd.append('archivo', audFile);
        fd.append('descripcion', audDesc);
        try {
            await createAudio(fd);
            toast.success('Audio subido');
            setAudFile(null);
            setAudDesc('');
            e.target.reset();
            cargar();
        } catch { toast.error('Error al subir audio'); }
        finally { setSubiendo(false); }
    };

    const eliminarImagen = async (id) => {
        if (!window.confirm('Eliminar imagen?')) return;
        await deleteImagen(id);
        toast.success('Imagen eliminada');
        cargar();
    };

    const eliminarAudio = async (id) => {
        if (!window.confirm('Eliminar audio?')) return;
        await deleteAudio(id);
        toast.success('Audio eliminado');
        cargar();
    };

    const tipoLabel = { escenario: 'Fondo', personaje: 'Personaje', portada: 'Portada' };
    const tipoBadgeColor = { escenario: '#0d6efd', personaje: '#6f42c1', portada: '#e94560' };

    return (
        <div>
            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {['imagenes', 'audios'].map((s) => (
                    <button key={s} onClick={() => setSeccion(s)}
                        style={{
                            background: seccion === s ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.05)',
                            border: seccion === s ? '1px solid #e94560' : '1px solid rgba(255,255,255,0.1)',
                            color: seccion === s ? '#e94560' : 'rgba(255,255,255,0.6)',
                            borderRadius: 6, padding: '6px 18px', cursor: 'pointer',
                        }}>
                        {s === 'imagenes' ? 'Imagenes' : 'Audios'}
                    </button>
                ))}
            </div>

            {seccion === 'imagenes' && (
                <div className="row g-4">
                    {/* Formulario */}
                    <div className="col-md-4">
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', padding: 20 }}>
                            <h6 style={{ color: '#e94560', marginBottom: 16 }}>Subir imagen</h6>
                            <form onSubmit={subirImagen}>
                                <div className="mb-3">
                                    <label style={labelStyle}>Tipo de imagen</label>
                                    <select value={imgTipo} onChange={(e) => setImgTipo(e.target.value)} style={selectStyle}>
                                        <option value="escenario">Fondo de escena</option>
                                        <option value="personaje">Sprite de personaje</option>
                                        <option value="portada">Portada de historia</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label style={labelStyle}>Descripcion</label>
                                    <input type="text" value={imgDesc} onChange={(e) => setImgDesc(e.target.value)}
                                        placeholder="Ej: Bosque nocturno"
                                        style={inputStyle} />
                                </div>
                                <div className="mb-3">
                                    <label style={labelStyle}>Archivo (PNG, JPG, WebP)</label>
                                    <input type="file" accept="image/*"
                                        onChange={(e) => setImgFile(e.target.files[0])}
                                        style={{ ...inputStyle, padding: '6px 10px' }} />
                                </div>
                                <button type="submit" disabled={subiendo} style={{ ...btnRed, width: '100%' }}>
                                    {subiendo ? 'Subiendo...' : 'Subir imagen'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Lista de imagenes */}
                    <div className="col-md-8">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {imagenes.length === 0 && (
                                <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: 40 }}>
                                    Sin imagenes. Sube la primera.
                                </p>
                            )}
                            {imagenes.map((img) => (
                                <div key={img.id} style={{
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14
                                }}>
                                    {/* Preview */}
                                    <div style={{ width: 60, height: 60, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#111' }}>
                                        {img.imagen_base64_display ? (
                                            <img src={`data:image/png;base64,${img.imagen_base64_display}`}
                                                alt={img.descripcion} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : img.url ? (
                                            <img src={`http://localhost:8000${img.url}`}
                                                alt={img.descripcion} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>IMG</div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#f0f0f0', fontWeight: 500 }}>{img.descripcion || `Imagen ${img.id}`}</div>
                                        <span style={{
                                            background: tipoBadgeColor[img.tipo] || '#555',
                                            color: 'white', fontSize: '0.72rem', padding: '2px 8px', borderRadius: 20
                                        }}>{tipoLabel[img.tipo] || img.tipo}</span>
                                    </div>
                                    <button onClick={() => eliminarImagen(img.id)}
                                        style={{ background: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {seccion === 'audios' && (
                <div className="row g-4">
                    {/* Formulario */}
                    <div className="col-md-4">
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', padding: 20 }}>
                            <h6 style={{ color: '#e94560', marginBottom: 16 }}>Subir audio</h6>
                            <form onSubmit={subirAudio}>
                                <div className="mb-3">
                                    <label style={labelStyle}>Descripcion</label>
                                    <input type="text" value={audDesc} onChange={(e) => setAudDesc(e.target.value)}
                                        placeholder="Ej: Musica de tension"
                                        style={inputStyle} />
                                </div>
                                <div className="mb-3">
                                    <label style={labelStyle}>Archivo (MP3, OGG, WAV)</label>
                                    <input type="file" accept="audio/*"
                                        onChange={(e) => setAudFile(e.target.files[0])}
                                        style={{ ...inputStyle, padding: '6px 10px' }} />
                                </div>
                                <button type="submit" disabled={subiendo} style={{ ...btnRed, width: '100%' }}>
                                    {subiendo ? 'Subiendo...' : 'Subir audio'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Lista de audios */}
                    <div className="col-md-8">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {audios.length === 0 && (
                                <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: 40 }}>
                                    Sin audios. Sube el primero.
                                </p>
                            )}
                            {audios.map((a) => (
                                <div key={a.id} style={{
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#f0f0f0', fontWeight: 500 }}>{a.descripcion || `Audio ${a.id}`}</div>
                                        {a.archivo && (
                                            <audio controls style={{ marginTop: 6, height: 28, width: '100%' }}>
                                                <source src={`http://localhost:8000${a.archivo}`} />
                                            </audio>
                                        )}
                                    </div>
                                    <button onClick={() => eliminarAudio(a.id)}
                                        style={{ background: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0 }}>
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// -------------------------------------------------------
// Tab 3: Personajes
// -------------------------------------------------------
function TabPersonajes({ historiaId }) {
    const FORM_P = { nombre: '', id_imagen: '' };
    const [personajes, setPersonajes] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [nodos, setNodos] = useState([]);
    const [nodoPersonajes, setNodoPersonajes] = useState([]);
    const [form, setForm] = useState(FORM_P);
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);

    // Para asignar personaje a nodo
    const [asignForm, setAsignForm] = useState({ id_personaje: '', id_nodo: '', posicion: 'centro' });
    const [asignando, setAsignando] = useState(false);

    const cargar = async () => {
        const [rp, ri, rn, rnp] = await Promise.all([
            readPersonajes(), readImagenes(), readNodos(), readNodoPersonajes()
        ]);
        setPersonajes(rp.data.filter((p) => Number(p.id_historia) === Number(historiaId)));
        setImagenes(ri.data.filter((i) => i.tipo === 'personaje'));
        setNodos(rn.data.filter((n) => Number(n.id_historia) === Number(historiaId)));
        setNodoPersonajes(rnp.data);
    };

    useEffect(() => { cargar(); }, [historiaId]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        const payload = {
            nombre: form.nombre,
            id_historia: Number(historiaId),
            id_imagen: form.id_imagen || null,
        };
        try {
            if (editandoId) { await updatePersonaje(editandoId, payload); toast.success('Personaje actualizado'); }
            else { await createPersonaje(payload); toast.success('Personaje creado'); }
            setForm(FORM_P); setEditandoId(null); cargar();
        } catch { toast.error('Error al guardar personaje'); }
        finally { setGuardando(false); }
    };

    const eliminarPersonaje = async (id) => {
        if (!window.confirm('Eliminar personaje?')) return;
        await deletePersonaje(id);
        toast.success('Personaje eliminado');
        cargar();
    };

    const editar = (p) => {
        setForm({ nombre: p.nombre, id_imagen: p.id_imagen || '' });
        setEditandoId(p.id);
    };

    const handleAsign = async (e) => {
        e.preventDefault();
        setAsignando(true);
        try {
            await createNodoPersonaje({
                id_nodo: Number(asignForm.id_nodo),
                id_personaje: Number(asignForm.id_personaje),
                posicion: asignForm.posicion,
            });
            toast.success('Personaje asignado al nodo');
            setAsignForm({ id_personaje: '', id_nodo: '', posicion: 'centro' });
            cargar();
        } catch { toast.error('Ya existe esa asignacion o hubo un error'); }
        finally { setAsignando(false); }
    };

    const eliminarAsignacion = async (id) => {
        await deleteNodoPersonaje(id);
        toast.success('Asignacion eliminada');
        cargar();
    };

    const getNombrePersonaje = (id) => personajes.find((p) => p.id === id)?.nombre || `P${id}`;
    const getNombreNodo = (id) => nodos.find((n) => n.id === id)?.titulo_nodo || `N${id}`;
    const getImgSrc = (p) => {
        const img = imagenes.find((i) => i.id === p.id_imagen);
        if (!img) return null;
        if (img.imagen_base64_display) return `data:image/png;base64,${img.imagen_base64_display}`;
        if (img.url) return `http://localhost:8000${img.url}`;
        return null;
    };

    return (
        <div className="row g-4">
            {/* Formulario personaje */}
            <div className="col-md-4">
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', padding: 20, marginBottom: 16 }}>
                    <h6 style={{ color: '#e94560', marginBottom: 16 }}>{editandoId ? 'Editar personaje' : 'Nuevo personaje'}</h6>
                    <form onSubmit={handleGuardar}>
                        <div className="mb-3">
                            <label style={labelStyle}>Nombre</label>
                            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required disabled={guardando} style={inputStyle} placeholder="Ej: Aria" />
                        </div>
                        <div className="mb-3">
                            <label style={labelStyle}>Sprite (imagen de personaje)</label>
                            <select name="id_imagen" value={form.id_imagen} onChange={handleChange} disabled={guardando} style={selectStyle}>
                                <option value="">-- Sin sprite --</option>
                                {imagenes.map((i) => <option key={i.id} value={i.id}>{i.descripcion || `Imagen ${i.id}`}</option>)}
                            </select>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: 4 }}>
                                Sube sprites en Recursos → Personaje.
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" disabled={guardando} style={{ ...btnRed, flex: 1 }}>
                                {guardando ? '...' : editandoId ? 'Actualizar' : 'Agregar'}
                            </button>
                            {editandoId && (
                                <button type="button" onClick={() => { setForm(FORM_P); setEditandoId(null); }} style={btnGhost}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Asignar personaje a nodo */}
                {personajes.length > 0 && nodos.length > 0 && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', padding: 20 }}>
                        <h6 style={{ color: '#a78bfa', marginBottom: 16 }}>Asignar a nodo</h6>
                        <form onSubmit={handleAsign}>
                            <div className="mb-3">
                                <label style={labelStyle}>Personaje</label>
                                <select value={asignForm.id_personaje} onChange={(e) => setAsignForm({ ...asignForm, id_personaje: e.target.value })} required style={selectStyle}>
                                    <option value="">-- Personaje --</option>
                                    {personajes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label style={labelStyle}>Nodo</label>
                                <select value={asignForm.id_nodo} onChange={(e) => setAsignForm({ ...asignForm, id_nodo: e.target.value })} required style={selectStyle}>
                                    <option value="">-- Nodo --</option>
                                    {nodos.map((n) => <option key={n.id} value={n.id}>{n.titulo_nodo}</option>)}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label style={labelStyle}>Posicion en pantalla</label>
                                <select value={asignForm.posicion} onChange={(e) => setAsignForm({ ...asignForm, posicion: e.target.value })} style={selectStyle}>
                                    <option value="izquierda">Izquierda</option>
                                    <option value="centro">Centro</option>
                                    <option value="derecha">Derecha</option>
                                </select>
                            </div>
                            <button type="submit" disabled={asignando} style={{ ...btnRed, width: '100%', background: '#7c3aed' }}>
                                {asignando ? '...' : 'Asignar'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Lista de personajes */}
            <div className="col-md-8">
                {personajes.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: 40 }}>Sin personajes. Crea el primero.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {personajes.map((p) => {
                            const src = getImgSrc(p);
                            const asignaciones = nodoPersonajes.filter((np) => np.id_personaje === p.id);
                            return (
                                <div key={p.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: asignaciones.length > 0 ? 10 : 0 }}>
                                        {/* Sprite preview */}
                                        <div style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', background: '#111', flexShrink: 0 }}>
                                            {src ? (
                                                <img src={src} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>SIN</div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: '#f0f0f0', fontWeight: 500 }}>{p.nombre}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
                                                {asignaciones.length} nodo{asignaciones.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button onClick={() => editar(p)} style={{ background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.4)', color: '#ffc107', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
                                            <button onClick={() => eliminarPersonaje(p.id)} style={{ background: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
                                        </div>
                                    </div>
                                    {/* Asignaciones */}
                                    {asignaciones.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                            {asignaciones.map((np) => (
                                                <span key={np.id} style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    {getNombreNodo(np.id_nodo)} · {np.posicion}
                                                    <button onClick={() => eliminarAsignacion(np.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0, fontSize: '0.75rem' }}>×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// -------------------------------------------------------
// Tab 4: Gestion de Nodos
// -------------------------------------------------------
function TabNodos({ historiaId }) {
    const FORM = { titulo_nodo: '', texto: '', es_final: false, id_imagen_escenario: '', id_audio_fondo: '' };
    const [nodos, setNodos] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [audios, setAudios] = useState([]);
    const [form, setForm] = useState(FORM);
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        cargar();
        Promise.all([readImagenes(), readAudios()]).then(([i, a]) => {
            setImagenes(i.data);
            setAudios(a.data);
        }).catch(() => {});
    }, [historiaId]);

    const cargar = async () => {
        const res = await readNodos();
        setNodos(res.data.filter((n) => Number(n.id_historia) === Number(historiaId)));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setErrores({});
        const payload = {
            titulo_nodo: form.titulo_nodo,
            texto: form.texto,
            es_final: form.es_final,
            id_historia: Number(historiaId),
            id_imagen_escenario: form.id_imagen_escenario || null,
            id_audio_fondo: form.id_audio_fondo || null,
        };
        try {
            if (editandoId) { await updateNodo(editandoId, payload); toast.success('Nodo actualizado'); }
            else { await createNodo(payload); toast.success('Nodo creado'); }
            setForm(FORM);
            setEditandoId(null);
            cargar();
        } catch (err) {
            if (err.response?.data) setErrores(err.response.data);
            else toast.error('Error al guardar');
        } finally { setGuardando(false); }
    };

    const editar = (n) => {
        setForm({ titulo_nodo: n.titulo_nodo, texto: n.texto, es_final: n.es_final, id_imagen_escenario: n.id_imagen_escenario || '', id_audio_fondo: n.id_audio_fondo || '' });
        setEditandoId(n.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const eliminar = async (id) => {
        if (!window.confirm('Eliminar este nodo?')) return;
        await deleteNodo(id);
        toast.success('Nodo eliminado');
        cargar();
    };

    return (
        <div className="row g-4">
            {/* Formulario */}
            <div className="col-md-5">
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', padding: 20 }}>
                    <h6 style={{ color: '#e94560', marginBottom: 16 }}>{editandoId ? 'Editar nodo' : 'Nuevo nodo'}</h6>
                    <form onSubmit={handleGuardar}>
                        <div className="mb-3">
                            <label style={labelStyle}>Titulo interno</label>
                            <input type="text" name="titulo_nodo" value={form.titulo_nodo} onChange={handleChange} required disabled={guardando} style={inputStyle} placeholder="Ej: Escena 1" />
                            {errores.titulo_nodo && <p style={{ color: '#e94560', fontSize: '0.8rem' }}>{errores.titulo_nodo.join(', ')}</p>}
                        </div>
                        <div className="mb-3">
                            <label style={labelStyle}>Texto narrativo</label>
                            <textarea name="texto" rows={4} value={form.texto} onChange={handleChange} required disabled={guardando} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Lo que vera el lector..." />
                        </div>
                        <div className="mb-3">
                            <label style={labelStyle}>Imagen de escenario (fondo)</label>
                            <select name="id_imagen_escenario" value={form.id_imagen_escenario} onChange={handleChange} disabled={guardando} style={selectStyle}>
                                <option value="">-- Sin imagen --</option>
                                {imagenes.filter(i => i.tipo === 'escenario').map(i => <option key={i.id} value={i.id}>{i.descripcion || `Imagen ${i.id}`}</option>)}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label style={labelStyle}>Audio de fondo</label>
                            <select name="id_audio_fondo" value={form.id_audio_fondo} onChange={handleChange} disabled={guardando} style={selectStyle}>
                                <option value="">-- Sin audio --</option>
                                {audios.map(a => <option key={a.id} value={a.id}>{a.descripcion || `Audio ${a.id}`}</option>)}
                            </select>
                        </div>
                        <div className="mb-3 d-flex align-items-center gap-2">
                            <input type="checkbox" id="es_final" name="es_final" checked={form.es_final} onChange={handleChange} style={{ accentColor: '#e94560' }} />
                            <label htmlFor="es_final" style={{ ...labelStyle, margin: 0 }}>Es nodo final</label>
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" disabled={guardando} style={{ ...btnRed, flex: 1 }}>
                                {guardando ? '...' : editandoId ? 'Actualizar' : 'Agregar'}
                            </button>
                            {editandoId && <button type="button" onClick={() => { setForm(FORM); setEditandoId(null); }} style={btnGhost}>Cancelar</button>}
                        </div>
                    </form>
                </div>
            </div>

            {/* Lista de nodos */}
            <div className="col-md-7">
                {nodos.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: 40 }}>Sin nodos. Crea el primero.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {nodos.map((n) => (
                            <div key={n.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ color: '#f0f0f0', fontWeight: 500 }}>{n.titulo_nodo}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: 2 }}>
                                        ID {n.id} {n.es_final && '· Final'}
                                        {n.id_imagen_escenario && ' · Con fondo'}
                                        {n.id_audio_fondo && ' · Con audio'}
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button onClick={() => editar(n)} style={{ background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.4)', color: '#ffc107', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
                                    <button onClick={() => eliminar(n.id)} style={{ background: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// -------------------------------------------------------
// Tab 5: Gestion de Opciones
// -------------------------------------------------------
function TabOpciones({ historiaId }) {
    const FORM = { texto_opcion: '', id_nodo_origen: '', id_nodo_destino: '' };
    const [opciones, setOpciones] = useState([]);
    const [nodos, setNodos] = useState([]);
    const [form, setForm] = useState(FORM);
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        cargar();
        readNodos().then(r => setNodos(r.data.filter(n => Number(n.id_historia) === Number(historiaId)))).catch(() => {});
    }, [historiaId]);

    const cargar = async () => {
        const [resOp, resNod] = await Promise.all([readOpciones(), readNodos()]);
        const nodosHistoria = new Set(resNod.data.filter(n => Number(n.id_historia) === Number(historiaId)).map(n => n.id));
        setOpciones(resOp.data.filter(o => nodosHistoria.has(o.id_nodo_origen)));
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        const payload = { texto_opcion: form.texto_opcion, id_nodo_origen: Number(form.id_nodo_origen), id_nodo_destino: Number(form.id_nodo_destino) };
        try {
            if (editandoId) { await updateOpcion(editandoId, payload); toast.success('Opcion actualizada'); }
            else { await createOpcion(payload); toast.success('Opcion creada'); }
            setForm(FORM); setEditandoId(null); cargar();
        } catch { toast.error('Error al guardar'); }
        finally { setGuardando(false); }
    };

    const editar = (o) => { setForm({ texto_opcion: o.texto_opcion, id_nodo_origen: o.id_nodo_origen, id_nodo_destino: o.id_nodo_destino }); setEditandoId(o.id); };
    const eliminar = async (id) => { if (!window.confirm('Eliminar opcion?')) return; await deleteOpcion(id); toast.success('Opcion eliminada'); cargar(); };

    const nombreNodo = (id) => nodos.find(n => n.id === id)?.titulo_nodo || `Nodo ${id}`;

    return (
        <div className="row g-4">
            <div className="col-md-5">
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', padding: 20 }}>
                    <h6 style={{ color: '#e94560', marginBottom: 16 }}>{editandoId ? 'Editar opcion' : 'Nueva opcion'}</h6>
                    <form onSubmit={handleGuardar}>
                        <div className="mb-3">
                            <label style={labelStyle}>Texto de la opcion</label>
                            <input type="text" name="texto_opcion" value={form.texto_opcion} onChange={handleChange} required disabled={guardando} style={inputStyle} placeholder="Lo que elige el lector" />
                        </div>
                        <div className="mb-3">
                            <label style={labelStyle}>Nodo origen</label>
                            <select name="id_nodo_origen" value={form.id_nodo_origen} onChange={handleChange} required disabled={guardando} style={selectStyle}>
                                <option value="">-- Desde que nodo --</option>
                                {nodos.map(n => <option key={n.id} value={n.id}>{n.titulo_nodo}</option>)}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label style={labelStyle}>Nodo destino</label>
                            <select name="id_nodo_destino" value={form.id_nodo_destino} onChange={handleChange} required disabled={guardando} style={selectStyle}>
                                <option value="">-- A que nodo lleva --</option>
                                {nodos.map(n => <option key={n.id} value={n.id}>{n.titulo_nodo}</option>)}
                            </select>
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" disabled={guardando} style={{ ...btnRed, flex: 1 }}>
                                {guardando ? '...' : editandoId ? 'Actualizar' : 'Agregar'}
                            </button>
                            {editandoId && <button type="button" onClick={() => { setForm(FORM); setEditandoId(null); }} style={btnGhost}>Cancelar</button>}
                        </div>
                    </form>
                </div>
            </div>
            <div className="col-md-7">
                {opciones.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: 40 }}>Sin opciones. Conecta tus nodos.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {opciones.map(o => (
                            <div key={o.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ color: '#f0f0f0' }}>"{o.texto_opcion}"</div>
                                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: 2 }}>
                                        {nombreNodo(o.id_nodo_origen)} → {nombreNodo(o.id_nodo_destino)}
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button onClick={() => editar(o)} style={{ background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.4)', color: '#ffc107', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
                                    <button onClick={() => eliminar(o.id)} style={{ background: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// -------------------------------------------------------
// Componente principal
// -------------------------------------------------------
export default function EditorHistoria() {
    const { id } = useParams();
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const [historia, setHistoria] = useState(null);
    const [historiaId, setHistoriaId] = useState(id || null);
    const [tab, setTab] = useState('info');
    const [cargando, setCargando] = useState(!!id);

    useEffect(() => {
        if (id) {
            readHistoria(id)
                .then((r) => setHistoria(r.data))
                .catch(() => toast.error('Historia no encontrada'))
                .finally(() => setCargando(false));
        }
    }, [id]);

    const onHistoriaCreada = (nuevoId) => {
        setHistoriaId(nuevoId);
        navigate(`/creador/historia/${nuevoId}`, { replace: true });
    };

    const tabs = [
        { key: 'info',       label: 'Informacion' },
        { key: 'recursos',   label: 'Recursos', disabled: !historiaId },
        { key: 'personajes', label: 'Personajes', disabled: !historiaId },
        { key: 'nodos',      label: 'Nodos / Escenas', disabled: !historiaId },
        { key: 'opciones',   label: 'Opciones / Decisiones', disabled: !historiaId },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0d0d1a', color: 'white' }}>
            <Toaster position="top-right" />
            <Navbar />

            <div className="container py-5">
                <div className="d-flex align-items-center gap-3 mb-5">
                    <button onClick={() => navigate('/creador')}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0 }}>
                        ← Dashboard
                    </button>
                    <h2 className="fw-bold mb-0">{historiaId ? 'Editar Historia' : 'Nueva Historia'}</h2>
                </div>

                {cargando ? (
                    <div className="text-center py-5"><div className="spinner-border" style={{ color: '#e94560' }} /></div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 32, display: 'flex', gap: 4, overflowX: 'auto' }}>
                            {tabs.map((t) => (
                                <button key={t.key} disabled={t.disabled}
                                    onClick={() => setTab(t.key)}
                                    style={{
                                        background: 'none', border: 'none', padding: '10px 20px', cursor: t.disabled ? 'not-allowed' : 'pointer',
                                        whiteSpace: 'nowrap',
                                        color: tab === t.key ? '#e94560' : t.disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
                                        borderBottom: tab === t.key ? '2px solid #e94560' : '2px solid transparent',
                                        fontWeight: tab === t.key ? 'bold' : 'normal',
                                        transition: 'color .2s',
                                    }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {tab === 'info' && (
                            <TabInfo historia={historia} historiaId={historiaId} usuario={usuario} onGuardado={onHistoriaCreada} />
                        )}
                        {tab === 'recursos' && historiaId && <TabRecursos />}
                        {tab === 'personajes' && historiaId && <TabPersonajes historiaId={historiaId} />}
                        {tab === 'nodos' && historiaId && <TabNodos historiaId={historiaId} />}
                        {tab === 'opciones' && historiaId && <TabOpciones historiaId={historiaId} />}
                    </>
                )}
            </div>
        </div>
    );
}
