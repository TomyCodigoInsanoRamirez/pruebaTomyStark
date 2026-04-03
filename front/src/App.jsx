import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import Login from './login';
import Register from './register';

// Publico / Lector
import Home from './pages/Home';
import DetalleHistoria from './pages/DetalleHistoria';
import LectorNovela from './pages/LectorNovela';

// Creador
import DashboardCreador from './pages/creador/DashboardCreador';
import EditorHistoria from './pages/creador/EditorHistoria';

// Admin
import AdminPanel from './pages/admin/AdminPanel';

// CRUDs de soporte (admin)
import HistoriasApp from './HistoriasApp';
import NodosApp from './NodosApp';
import PersonajesApp from './PersonajesApp';
import RecursosApp from './RecursosApp';
import UsuariosApp from './UsuariosApp';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Publicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Register />} />

                    {/* Publicas — cualquiera puede explorar */}
                    <Route path="/" element={<Home />} />
                    <Route path="/historia/:id" element={<DetalleHistoria />} />

                    {/* Lector publico — progreso solo se guarda si hay sesion */}
                    <Route path="/leer/:historiaId" element={<LectorNovela />} />

                    {/* Solo creador (y admin) */}
                    <Route path="/creador" element={
                        <ProtectedRoute rolesPermitidos={['creador', 'admin']}>
                            <DashboardCreador />
                        </ProtectedRoute>
                    } />
                    <Route path="/creador/nueva" element={
                        <ProtectedRoute rolesPermitidos={['creador', 'admin']}>
                            <EditorHistoria />
                        </ProtectedRoute>
                    } />
                    <Route path="/creador/historia/:id" element={
                        <ProtectedRoute rolesPermitidos={['creador', 'admin']}>
                            <EditorHistoria />
                        </ProtectedRoute>
                    } />

                    {/* Solo admin */}
                    <Route path="/admin" element={
                        <ProtectedRoute rolesPermitidos={['admin']}>
                            <AdminPanel />
                        </ProtectedRoute>
                    } />
                    <Route path="/historias" element={
                        <ProtectedRoute rolesPermitidos={['admin']}>
                            <HistoriasApp />
                        </ProtectedRoute>
                    } />
                    <Route path="/nodos" element={
                        <ProtectedRoute rolesPermitidos={['admin']}>
                            <NodosApp />
                        </ProtectedRoute>
                    } />
                    <Route path="/personajes" element={
                        <ProtectedRoute rolesPermitidos={['admin']}>
                            <PersonajesApp />
                        </ProtectedRoute>
                    } />
                    <Route path="/recursos" element={
                        <ProtectedRoute rolesPermitidos={['admin']}>
                            <RecursosApp />
                        </ProtectedRoute>
                    } />
                    <Route path="/usuarios" element={
                        <ProtectedRoute rolesPermitidos={['admin']}>
                            <UsuariosApp />
                        </ProtectedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
