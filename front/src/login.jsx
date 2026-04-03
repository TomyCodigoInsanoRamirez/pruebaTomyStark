import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './auth.css';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(formData);
            navigate('/');
        } catch (apiError) {
            const message =
                apiError.response?.data?.detail ||
                'No fue posible iniciar sesion. Verifica tus credenciales.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-background-shape auth-shape-1" />
            <div className="auth-background-shape auth-shape-2" />

            <section className="auth-card">
                <h1 className="auth-title">Iniciar sesion</h1>
                <p className="auth-subtitle">Accede con tu email y contrasena para continuar.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email"
                        value={formData.email} onChange={handleChange}
                        required placeholder="correo@ejemplo.com" />

                    <label htmlFor="password">Contrasena</label>
                    <input id="password" name="password" type="password"
                        value={formData.password} onChange={handleChange}
                        required placeholder="********" />

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Entrar'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    No tienes cuenta? <Link to="/registro">Registrate</Link>
                </p>
            </section>
        </div>
    );
}

export default Login;
