import { useState, useEffect } from 'react';
import {
    readHistorias, updateHistoria,
    readUsuarios, deleteUsuario,
    readRoles, createRol, updateRol, deleteRol,
} from '../../services/api';
import Navbar from '../../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import toast, { Toaster } from 'react-hot-toast';

// -------------------------------------------------------
// Tab Historias: aprobar / despublicar
// -------------------------------------------------------
function TabHistorias() {
    const [historias, setHistorias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [filtro, setFiltro] = useState('todos'); // todos | publicadas | borradores
    const [cargando, setCargando] = useState(true);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try {
            const [rh, ru] = await Promise.all([readHistorias(), readUsuarios()]);
            setHistorias(rh.data);
            setUsuarios(ru.data);
        } catch { toast.error('Error al cargar historias'); }
        finally { setCargando(false); }
    };

    const togglePublicar = async (h) => {
        const tid = toast.loading(h.publicada ? 'Despublicando...' : 'Publicando...');
        try {
            await updateHistoria(h.id, { ...h, publicada: !h.publicada });
            toast.success(h.publicada ? 'Historia despublicada' : 'Historia publicada', { id: tid });
            cargar();
        } catch { toast.error('Error al cambiar estado', { id: tid }); }
    };

    const autorNombre = (id) => {
        const u = usuarios.find((u) => u.id === id);
        return u ? `${u.nombre} ${u.apellido_paterno}` : `ID ${id}`;
    };

    const filtradas = historias.filter((h) => {
        if (filtro === 'publicadas') return h.publicada;
        if (filtro === 'borradores') return !h.publicada;
        return true;
    });

    return (
        <div>
            {/* Filtros */}
            <div className="d-flex gap-2 mb-4 flex-wrap">
                {['todos', 'publicadas', 'borradores'].map((f) => (
                    <button key={f} onClick={() => setFiltro(f)}
                        style={{
                            background: filtro === f ? '#e94560' : 'rgba(255,255,255,0.06)',
                            border: '1px solid ' + (filtro === f ? '#e94560' : 'rgba(255,255,255,0.12)'),
                            color: 'white', borderRadius: 20, padding: '5px 18px',
                            cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.85rem',
                        }}>
                        {f} {filtro === f && `(${filtradas.length})`}
                    </button>
                ))}
            </div>

            {cargando ? (
                <div className="text-center py-5"><div className="spinner-border" style={{ color: '#e94560' }} /></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtradas.length === 0 && (
                        <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: 32 }}>Sin historias.</p>
                    )}
                    {filtradas.map((h) => (
                        <div key={h.id} style={{
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 10, padding: '16px 20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                        }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                    <span style={{ color: '#f0f0f0', fontWeight: 500 }}>{h.titulo}</span>
                                    <span style={{
                                        background: h.publicada ? 'rgba(76,175,80,0.2)' : 'rgba(158,158,158,0.2)',
                                        color: h.publicada ? '#4caf50' : '#9e9e9e',
                                        border: `1px solid ${h.publicada ? '#4caf5044' : '#9e9e9e44'}`,
                                        borderRadius: 20, padding: '1px 10px', fontSize: '0.72rem',
                                    }}>
                                        {h.publicada ? 'Publicada' : 'Borrador'}
                                    </span>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
                                    Autor: {autorNombre(h.id_creador)} &nbsp;·&nbsp; ID {h.id} &nbsp;·&nbsp; {new Date(h.fecha_creacion).toLocaleDateString('es-MX')}
                                </div>
                                {h.descripcion && (
                                    <p style={{
                                        color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', margin: '6px 0 0',
                                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                                    }}>
                                        {h.descripcion}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => togglePublicar(h)}
                                style={{
                                    background: h.publicada ? 'rgba(244,67,54,0.15)' : 'rgba(76,175,80,0.15)',
                                    border: `1px solid ${h.publicada ? 'rgba(244,67,54,0.4)' : 'rgba(76,175,80,0.4)'}`,
                                    color: h.publicada ? '#f44336' : '#4caf50',
                                    borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: '0.82rem',
                                    whiteSpace: 'nowrap',
                                }}>
                                {h.publicada ? 'Despublicar' : 'Publicar'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// -------------------------------------------------------
// Tab Usuarios: ver, activar/desactivar, eliminar
// -------------------------------------------------------
function TabUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [cargando, setCargando] = useState(true);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try {
            const [ru, rr] = await Promise.all([readUsuarios(), readRoles()]);
            setUsuarios(ru.data);
            setRoles(rr.data);
        } catch { toast.error('Error al cargar usuarios'); }
        finally { setCargando(false); }
    };

    const toggleActivo = async (u) => {
        const tid = toast.loading(u.activo ? 'Desactivando...' : 'Activando...');
        try {
            // PATCH solo el campo activo
            const res = await fetch(`http://localhost:8000/api/usuarios/${u.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({ activo: !u.activo }),
            });
            if (!res.ok) throw new Error();
            toast.success(u.activo ? 'Usuario desactivado' : 'Usuario activado', { id: tid });
            cargar();
        } catch { toast.error('Error al cambiar estado', { id: tid }); }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('Eliminar este usuario permanentemente?')) return;
        const tid = toast.loading('Eliminando...');
        try {
            await deleteUsuario(id);
            toast.success('Usuario eliminado', { id: tid });
            cargar();
        } catch { toast.error('Error al eliminar', { id: tid }); }
    };

    const nombreRol = (id) => roles.find((r) => r.id === id)?.nombre_rol || '—';

    const filtrados = usuarios.filter((u) =>
        `${u.nombre} ${u.apellido_paterno} ${u.email}`.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div>
            <input type="text" value={filtro} onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar por nombre o email..."
                style={{ width: '100%', maxWidth: 380, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '8px 14px', color: 'white', marginBottom: 20 }} />

            {cargando ? (
                <div className="text-center py-5"><div className="spinner-border" style={{ color: '#e94560' }} /></div>
            ) : (
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                {['ID', 'Nombre', 'Email', 'Rol', 'Estado', 'Acciones'].map((h) => (
                                    <th key={h} style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500, padding: '8px 12px', textAlign: 'left', fontSize: '0.82rem' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map((u) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>{u.id}</td>
                                    <td style={{ padding: '10px 12px', color: '#f0f0f0' }}>{u.nombre} {u.apellido_paterno}</td>
                                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>{u.email}</td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <span style={{ background: 'rgba(233,69,96,0.15)', color: '#e94560', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem' }}>
                                            {nombreRol(u.id_rol)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <span style={{
                                            background: u.activo ? 'rgba(76,175,80,0.15)' : 'rgba(244,67,54,0.15)',
                                            color: u.activo ? '#4caf50' : '#f44336',
                                            border: `1px solid ${u.activo ? 'rgba(76,175,80,0.3)' : 'rgba(244,67,54,0.3)'}`,
                                            borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem',
                                        }}>
                                            {u.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <div className="d-flex gap-2">
                                            <button onClick={() => toggleActivo(u)}
                                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 5, padding: '3px 10px', cursor: 'pointer', fontSize: '0.78rem' }}>
                                                {u.activo ? 'Desactivar' : 'Activar'}
                                            </button>
                                            <button onClick={() => handleEliminar(u.id)}
                                                style={{ background: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', borderRadius: 5, padding: '3px 10px', cursor: 'pointer', fontSize: '0.78rem' }}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// -------------------------------------------------------
// Tab Roles: CRUD
// -------------------------------------------------------
function TabRoles() {
    const FORM = { nombre_rol: '' };
    const [roles, setRoles] = useState([]);
    const [form, setForm] = useState(FORM);
    const [editandoId, setEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [cargando, setCargando] = useState(true);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        setCargando(true);
        try { setRoles((await readRoles()).data); }
        catch { toast.error('Error al cargar roles'); }
        finally { setCargando(false); }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        try {
            if (editandoId) { await updateRol(editandoId, form); toast.success('Rol actualizado'); }
            else { await createRol(form); toast.success('Rol creado'); }
            setForm(FORM); setEditandoId(null); cargar();
        } catch { toast.error('Error al guardar'); }
        finally { setGuardando(false); }
    };

    const editar = (r) => { setForm({ nombre_rol: r.nombre_rol }); setEditandoId(r.id); };
    const eliminar = async (id) => {
        if (!window.confirm('Eliminar este rol?')) return;
        try { await deleteRol(id); toast.success('Rol eliminado'); cargar(); }
        catch { toast.error('Error al eliminar'); }
    };

    return (
        <div className="row g-4">
            <div className="col-md-4">
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', padding: 20 }}>
                    <h6 style={{ color: '#e94560', marginBottom: 16 }}>{editandoId ? 'Editar rol' : 'Nuevo rol'}</h6>
                    <form onSubmit={handleGuardar}>
                        <div className="mb-3">
                            <input type="text" value={form.nombre_rol} onChange={(e) => setForm({ nombre_rol: e.target.value })}
                                required disabled={guardando} placeholder="Ej: administrador, lector, creador"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '8px 12px', color: 'white' }} />
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" disabled={guardando}
                                style={{ flex: 1, background: '#e94560', border: 'none', color: 'white', padding: '8px', borderRadius: 6, cursor: 'pointer' }}>
                                {guardando ? '...' : editandoId ? 'Actualizar' : 'Crear'}
                            </button>
                            {editandoId && (
                                <button type="button" onClick={() => { setForm(FORM); setEditandoId(null); }}
                                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            <div className="col-md-8">
                {cargando ? (
                    <div className="text-center py-4"><div className="spinner-border" style={{ color: '#e94560' }} /></div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {roles.map((r) => (
                            <div key={r.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <span style={{ color: '#f0f0f0', fontWeight: 500 }}>{r.nombre_rol}</span>
                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginLeft: 10 }}>ID {r.id}</span>
                                </div>
                                <div className="d-flex gap-2">
                                    <button onClick={() => editar(r)} style={{ background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.3)', color: '#ffc107', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
                                    <button onClick={() => eliminar(r.id)} style={{ background: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
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
export default function AdminPanel() {
    const [tab, setTab] = useState('historias');

    const tabs = [
        { key: 'historias', label: 'Historias' },
        { key: 'usuarios', label: 'Usuarios' },
        { key: 'roles', label: 'Roles' },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0d0d1a', color: 'white' }}>
            <Toaster position="top-right" />
            <Navbar />

            <div className="container py-5">
                <div className="mb-5">
                    <h2 className="fw-bold mb-1">Panel de Administracion</h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>Gestiona historias, usuarios y roles del sistema</p>
                </div>

                {/* Tabs */}
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 32, display: 'flex', gap: 4 }}>
                    {tabs.map((t) => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            style={{
                                background: 'none', border: 'none', padding: '10px 24px', cursor: 'pointer',
                                color: tab === t.key ? '#e94560' : 'rgba(255,255,255,0.5)',
                                borderBottom: tab === t.key ? '2px solid #e94560' : '2px solid transparent',
                                fontWeight: tab === t.key ? 'bold' : 'normal',
                                fontSize: '0.95rem', transition: 'color .2s',
                            }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'historias' && <TabHistorias />}
                {tab === 'usuarios' && <TabUsuarios />}
                {tab === 'roles' && <TabRoles />}
            </div>
        </div>
    );
}
