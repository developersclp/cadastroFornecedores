import { useState, useContext } from 'react';
import { AuthContext } from '../App';
import api from '../services/api';

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, senha });
      setUser(res.data.usuario);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src="/logo.png" alt="Grupo Rojemac" />
          <h1>GRUPO ROJEMAC</h1>
          <p>Controle de Fornecedores</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input type="email" className="form-input" placeholder="seu@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={senha} onChange={e => setSenha(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-accent" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
