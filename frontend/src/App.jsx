import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext } from 'react';
import api from './services/api';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Fornecedores from './pages/Fornecedores';
import FornecedorForm from './pages/FornecedorForm';
import Avaliacoes from './pages/Avaliacoes';
import Categorias from './pages/Categorias';
import Exportar from './pages/Exportar';

export const AuthContext = createContext(null);
export const ToastContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data.usuario);
    } catch { setUser(null); }
    finally { setLoading(false); }
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1923' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, checkAuth }}>
      <ToastContext.Provider value={{ addToast }}>
        <BrowserRouter>
          <div className="toast-container">
            {toasts.map(t => (
              <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
            ))}
          </div>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route element={user ? <Layout /> : <Navigate to="/login" />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/fornecedores" element={<Fornecedores />} />
              <Route path="/fornecedores/novo" element={<FornecedorForm />} />
              <Route path="/fornecedores/:id/editar" element={<FornecedorForm />} />
              <Route path="/avaliacoes" element={<Avaliacoes />} />
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/exportar" element={<Exportar />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
