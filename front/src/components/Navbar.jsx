import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { usuario, rol, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/')
            ? 'nav-link active fw-semibold'
            : 'nav-link';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#1a1a2e' }}>
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/" style={{ color: '#e94560', letterSpacing: 1 }}>
                    NovelaVisual
                </Link>

                <button className="navbar-toggler" type="button"
                    data-bs-toggle="collapse" data-bs-target="#navMain">
                    <span className="navbar-toggler-icon" />
                </button>

                <div className="collapse navbar-collapse" id="navMain">
                    <ul className="navbar-nav me-auto">
                        {/* Siempre visible para autenticados */}
                        {usuario && (
                            <li className="nav-item">
                                <Link className={isActive('/')} to="/">Explorar</Link>
                            </li>
                        )}

                        {/* Solo Creador */}
                        {rol === 'creador' && (
                            <li className="nav-item">
                                <Link className={isActive('/creador')} to="/creador">Mi Dashboard</Link>
                            </li>
                        )}

                        {/* Solo Admin */}
                        {rol === 'admin' && (
                            <li className="nav-item">
                                <Link className={isActive('/admin')} to="/admin">Panel Admin</Link>
                            </li>
                        )}
                    </ul>

                    {/* Usuario autenticado */}
                    {usuario ? (
                        <div className="d-flex align-items-center gap-3">
                            <span className="text-white-50 small">
                                {usuario.nombre} &mdash;
                                <span className="ms-1 badge" style={{
                                    backgroundColor: rol === 'admin' ? '#e94560' : rol === 'creador' ? '#0f3460' : '#16213e'
                                }}>
                                    {rol}
                                </span>
                            </span>
                            <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>
                                Salir
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center gap-2">
                            <button className="btn btn-sm btn-outline-light" onClick={() => navigate('/login')}>
                                Iniciar sesion
                            </button>
                            <button className="btn btn-sm" onClick={() => navigate('/registro')}
                                style={{ backgroundColor: '#e94560', color: 'white', border: 'none' }}>
                                Registrarse
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
