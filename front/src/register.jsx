import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from './services/api';
import './auth.css';

const initialState = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    password: '',
};

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await registerUser(formData);
            setSuccess('Registro completado. Ahora puedes iniciar sesion.');
            setFormData(initialState);
            setTimeout(() => navigate('/login'), 900);
        } catch (apiError) {
            const responseData = apiError.response?.data;
            if (responseData && typeof responseData === 'object') {
                const readableErrors = Object.values(responseData).flat().join(' ');
                setError(readableErrors || 'No fue posible completar el registro.');
            } else {
                setError('No fue posible completar el registro.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-background-shape auth-shape-1" />
            <div className="auth-background-shape auth-shape-2" />

            <section className="auth-card">
                <h1 className="auth-title">Crear cuenta</h1>
                <p className="auth-subtitle">Registra tus datos para usar la plataforma.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label htmlFor="nombre">Nombre</label>
                    <input id="nombre" name="nombre" type="text"
                        value={formData.nombre} onChange={handleChange}
                        required placeholder="Tu nombre" />

                    <label htmlFor="apellido_paterno">Apellido paterno</label>
                    <input id="apellido_paterno" name="apellido_paterno" type="text"
                        value={formData.apellido_paterno} onChange={handleChange}
                        required placeholder="Apellido paterno" />

                    <label htmlFor="apellido_materno">Apellido materno</label>
                    <input id="apellido_materno" name="apellido_materno" type="text"
                        value={formData.apellido_materno} onChange={handleChange}
                        placeholder="Apellido materno (opcional)" />

                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email"
                        value={formData.email} onChange={handleChange}
                        required placeholder="correo@ejemplo.com" />

                    <label htmlFor="password">Contrasena</label>
                    <input id="password" name="password" type="password"
                        value={formData.password} onChange={handleChange}
                        required placeholder="********" />

                    {error && <p className="auth-error">{error}</p>}
                    {success && <p className="auth-success">{success}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Creando cuenta...' : 'Registrarme'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
                </p>
            </section>
        </div>
    );
}

export default Register;
