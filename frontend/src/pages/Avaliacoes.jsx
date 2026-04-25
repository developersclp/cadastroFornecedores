import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { ToastContext } from '../App';
import { FiStar, FiPlus, FiTrash2 } from 'react-icons/fi';

function RatingInput({ value, onChange, label }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}: {value.toFixed(1)}</label>
      <input type="range" min="0" max="10" step="0.5" value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)' }} />
    </div>
  );
}

export default function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filtroFornecedor, setFiltroFornecedor] = useState('');
  const { addToast } = useContext(ToastContext);
  const [form, setForm] = useState({
    fornecedor_id: '', qualidade: 5, prazo_entrega: 5,
    atendimento: 5, custo_beneficio: 5, confiabilidade: 5, observacoes: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [aRes, fRes] = await Promise.all([
        api.get('/api/avaliacoes'),
        api.get('/api/fornecedores')
      ]);
      setAvaliacoes(aRes.data);
      setFornecedores(fRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fornecedor_id) { addToast('Selecione um fornecedor', 'error'); return; }
    try {
      await api.post('/api/avaliacoes', { ...form, fornecedor_id: parseInt(form.fornecedor_id) });
      addToast('Avaliação registrada!');
      setShowModal(false);
      setForm({ fornecedor_id: '', qualidade: 5, prazo_entrega: 5, atendimento: 5, custo_beneficio: 5, confiabilidade: 5, observacoes: '' });
      loadData();
    } catch (err) { addToast(err.response?.data?.error || 'Erro ao salvar', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta avaliação?')) return;
    try {
      await api.delete(`/api/avaliacoes/${id}`);
      addToast('Avaliação excluída!');
      loadData();
    } catch (err) { addToast('Erro ao excluir', 'error'); }
  };

  const mediaForm = ((form.qualidade + form.prazo_entrega + form.atendimento + form.custo_beneficio + form.confiabilidade) / 5).toFixed(1);

  const filtered = filtroFornecedor
    ? avaliacoes.filter(a => a.fornecedor_id === parseInt(filtroFornecedor))
    : avaliacoes;

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h2>Avaliações</h2>
        <button className="btn btn-accent" onClick={() => setShowModal(true)}><FiPlus /> Nova Avaliação</button>
      </div>
      <div className="page-content">
        <div className="card" style={{ marginBottom: 20, padding: 16 }}>
          <div className="filters-bar">
            <select className="filter-select" value={filtroFornecedor} onChange={e => setFiltroFornecedor(e.target.value)}>
              <option value="">Todos os Fornecedores</option>
              {fornecedores.map(f => <option key={f.id} value={f.id}>{f.codigo} - {f.razao_social}</option>)}
            </select>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{filtered.length} avaliação(ões)</span>
          </div>
        </div>

        <div className="table-container">
          {filtered.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Fornecedor</th><th>Data</th><th>Qualidade</th><th>Prazo</th>
                    <th>Atendimento</th><th>Custo-Benefício</th><th>Confiabilidade</th>
                    <th>Nota Final</th><th>Obs.</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>
                        <div>{a.fornecedor_nome}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--accent)' }}>{a.fornecedor_codigo}</div>
                      </td>
                      <td>{a.data_avaliacao ? new Date(a.data_avaliacao + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</td>
                      <td>{a.qualidade?.toFixed(1)}</td>
                      <td>{a.prazo_entrega?.toFixed(1)}</td>
                      <td>{a.atendimento?.toFixed(1)}</td>
                      <td>{a.custo_beneficio?.toFixed(1)}</td>
                      <td>{a.confiabilidade?.toFixed(1)}</td>
                      <td>
                        <span className={`nota-display ${a.nota_final >= 7 ? 'alta' : a.nota_final >= 4 ? 'media' : 'baixa'}`}>
                          <FiStar /> {a.nota_final?.toFixed(1)}
                        </span>
                      </td>
                      <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.observacoes || '-'}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(a.id)} style={{ color: 'var(--danger)' }}>
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">⭐</div>
              <h3>Nenhuma avaliação encontrada</h3>
              <p>Registre avaliações para seus fornecedores</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nova Avaliação</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Fornecedor *</label>
                  <select className="form-select" value={form.fornecedor_id} onChange={e => setForm(p => ({ ...p, fornecedor_id: e.target.value }))} required>
                    <option value="">Selecione...</option>
                    {fornecedores.filter(f => f.status === 'ativo').map(f => (
                      <option key={f.id} value={f.id}>{f.codigo} - {f.razao_social}</option>
                    ))}
                  </select>
                </div>
                <div className="form-grid">
                  <RatingInput label="Qualidade" value={form.qualidade} onChange={v => setForm(p => ({ ...p, qualidade: v }))} />
                  <RatingInput label="Prazo de Entrega" value={form.prazo_entrega} onChange={v => setForm(p => ({ ...p, prazo_entrega: v }))} />
                  <RatingInput label="Atendimento" value={form.atendimento} onChange={v => setForm(p => ({ ...p, atendimento: v }))} />
                  <RatingInput label="Custo-Benefício" value={form.custo_beneficio} onChange={v => setForm(p => ({ ...p, custo_beneficio: v }))} />
                  <RatingInput label="Confiabilidade" value={form.confiabilidade} onChange={v => setForm(p => ({ ...p, confiabilidade: v }))} />
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius)', margin: '10px 0' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nota Final (média): </span>
                  <span className={`nota-display ${mediaForm >= 7 ? 'alta' : mediaForm >= 4 ? 'media' : 'baixa'}`} style={{ fontSize: '1.3rem' }}>
                    {mediaForm}
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label">Observações</label>
                  <textarea className="form-textarea" value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-accent"><FiStar /> Registrar Avaliação</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
