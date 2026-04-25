import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../App';
import api from '../services/api';
import { FiHome, FiUsers, FiStar, FiGrid, FiDownload, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

export default function Layout() {
  const { user, setUser } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
    navigate('/login');
  };

  const links = [
    { to: '/', icon: <FiHome />, label: 'Dashboard' },
    { to: '/fornecedores', icon: <FiUsers />, label: 'Fornecedores' },
    { to: '/avaliacoes', icon: <FiStar />, label: 'Avaliações' },
    { to: '/categorias', icon: <FiGrid />, label: 'Categorias' },
    { to: '/exportar', icon: <FiDownload />, label: 'Exportar' },
  ];

  return (
    <div className="app-layout">
      <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      {sidebarOpen && <div className="sidebar-overlay show" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logo.png" alt="Rojemac" className="sidebar-logo" />
          <div className="sidebar-brand">
            <h1>GRUPO ROJEMAC</h1>
            <span>Controle de Fornecedores</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.nome?.charAt(0) || 'A'}
            </div>
            <div className="sidebar-user-info">
              <p>{user?.nome || 'Admin'}</p>
              <span>{user?.email}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width: '100%', marginTop: 10, justifyContent: 'center' }}>
            <FiLogOut /> Sair
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
