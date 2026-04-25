import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ToastContext } from '../App';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiExternalLink, FiStar, FiFilter } from 'react-icons/fi';

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useContext(ToastContext);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [fRes, cRes] = await Promise.all([
        api.get('/api/fornecedores'),
        api.get('/api/categorias')
      ]);
      setFornecedores(fRes.data);
      setCategorias(cRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/api/fornecedores/${deleteModal.id}`);
      addToast('Fornecedor excluído com sucesso!');
      setDeleteModal(null);
      loadData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Erro ao excluir', 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/api/fornecedores/${id}/status`, { status });
      addToast(`Status alterado para ${status}`);
      loadData();
    } catch (err) {
      addToast('Erro ao alterar status', 'error');
    }
  };

  const filtered = fornecedores.filter(f => {
    if (filtroStatus && f.status !== filtroStatus) return false;
    if (filtroCategoria && f.categoria_id !== parseInt(filtroCategoria)) return false;
    if (filtroTipo && f.tipo_fornecedor !== filtroTipo) return false;
    if (busca) {
      const s = busca.toLowerCase();
      return (f.razao_social?.toLowerCase().includes(s) ||
        f.nome_fantasia?.toLowerCase().includes(s) ||
        f.cnpj?.includes(s) || f.codigo?.toLowerCase().includes(s));
    }
    return true;
  });

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h2>Fornecedores</h2>
        <div className="page-header-actions">
          <button className="btn btn-accent" onClick={() => navigate('/fornecedores/novo')}>
            <FiPlus /> Novo Fornecedor
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Filtros */}
        <div className="card" style={{ marginBottom: 20, padding: 16 }}>
          <div className="filters-bar">
            <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
              <FiSearch className="search-icon" />
              <input placeholder="Buscar por nome, CNPJ ou código..." value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
            <select className="filter-select" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
              <option value="">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
            <select className="filter-select" value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
              <option value="">Todas as Categorias</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select className="filter-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
              <option value="">Todos os Tipos</option>
              <option value="produto">Produto</option>
              <option value="servico">Serviço</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="table-container">
          <div className="table-header">
            <h3>{filtered.length} fornecedor(es)</h3>
          </div>
          {filtered.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Razão Social</th>
                    <th>Nome Fantasia</th>
                    <th>CNPJ</th>
                    <th>Categoria</th>
                    <th>Status</th>
                    <th>Nota</th>
                    <th>Contato</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{f.codigo}</td>
                      <td style={{ fontWeight: 600 }}>{f.razao_social}</td>
                      <td>{f.nome_fantasia || '-'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{f.cnpj || '-'}</td>
                      <td>{f.categoria_nome || '-'}</td>
                      <td>
                        <select className="filter-select" value={f.status}
                          onChange={e => handleStatusChange(f.id, e.target.value)}
                          style={{ padding: '4px 8px', fontSize: '0.72rem',
                            color: f.status === 'ativo' ? 'var(--success)' : f.status === 'bloqueado' ? 'var(--danger)' : 'var(--warning)',
                            borderColor: f.status === 'ativo' ? 'var(--success)' : f.status === 'bloqueado' ? 'var(--danger)' : 'var(--warning)'
                          }}>
                          <option value="ativo">ATIVO</option>
                          <option value="inativo">INATIVO</option>
                          <option value="bloqueado">BLOQUEADO</option>
                        </select>
                      </td>
                      <td>
                        {f.nota_media !== null ? (
                          <span className={`nota-display ${f.nota_media >= 7 ? 'alta' : f.nota_media >= 4 ? 'media' : 'baixa'}`}>
                            <FiStar /> {f.nota_media.toFixed(1)}
                          </span>
                        ) : '-'}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.78rem' }}>
                          {f.contato_nome && <div>{f.contato_nome}</div>}
                          {f.telefone && <div style={{ color: 'var(--text-muted)' }}>{f.telefone}</div>}
                        </div>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/fornecedores/${f.id}/editar`)} title="Editar">
                            <FiEdit2 />
                          </button>
                          {f.site_url && (
                            <a href={f.site_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" title="Site">
                              <FiExternalLink />
                            </a>
                          )}
                          <button className="btn btn-ghost btn-sm" onClick={() => setDeleteModal(f)} title="Excluir"
                            style={{ color: 'var(--danger)' }}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>Nenhum fornecedor encontrado</h3>
              <p>Cadastre seu primeiro fornecedor clicando no botão acima</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de exclusão */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h3>Confirmar Exclusão</h3>
              <button className="modal-close" onClick={() => setDeleteModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Deseja excluir o fornecedor <strong>{deleteModal.razao_social}</strong> ({deleteModal.codigo})?</p>
              <p style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: 8 }}>
                Esta ação não pode ser desfeita. Todas as avaliações serão removidas.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteModal(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
