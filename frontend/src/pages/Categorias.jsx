import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { ToastContext } from '../App';
import { FiPlus, FiTrash2, FiEdit2, FiChevronDown, FiChevronRight, FiCheck, FiX, FiGrid } from 'react-icons/fi';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [newCat, setNewCat] = useState('');
  const [newSubcats, setNewSubcats] = useState({});
  const [editingCat, setEditingCat] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');
  const { addToast } = useContext(ToastContext);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/api/categorias');
      setCategorias(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const addCategoria = async () => {
    if (!newCat.trim()) return;
    try {
      await api.post('/api/categorias', { nome: newCat.trim() });
      addToast('Categoria criada!');
      setNewCat('');
      loadData();
    } catch (err) { addToast(err.response?.data?.error || 'Erro', 'error'); }
  };

  const updateCategoria = async (id) => {
    if (!editingCatName.trim()) return;
    try {
      await api.put(`/api/categorias/${id}`, { nome: editingCatName.trim() });
      addToast('Categoria atualizada!');
      setEditingCat(null);
      loadData();
    } catch (err) { addToast(err.response?.data?.error || 'Erro', 'error'); }
  };

  const deleteCategoria = async (id, nome) => {
    if (!confirm(`Excluir a categoria "${nome}" e todas as subcategorias?`)) return;
    try {
      await api.delete(`/api/categorias/${id}`);
      addToast('Categoria excluída!');
      loadData();
    } catch (err) { addToast('Erro ao excluir', 'error'); }
  };

  const addSubcategoria = async (catId) => {
    const nome = newSubcats[catId]?.trim();
    if (!nome) return;
    try {
      await api.post(`/api/categorias/${catId}/subcategorias`, { nome });
      addToast('Subcategoria criada!');
      setNewSubcats(p => ({ ...p, [catId]: '' }));
      loadData();
    } catch (err) { addToast(err.response?.data?.error || 'Erro', 'error'); }
  };

  const deleteSubcategoria = async (id) => {
    try {
      await api.delete(`/api/subcategorias/${id}`);
      addToast('Subcategoria excluída!');
      loadData();
    } catch (err) { addToast('Erro ao excluir', 'error'); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h2>Categorias</h2>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {categorias.length} categoria(s)
        </span>
      </div>
      <div className="page-content">
        {/* Adicionar nova */}
        <div className="card" style={{ marginBottom: 20, padding: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="form-input" placeholder="Nome da nova categoria..."
              value={newCat} onChange={e => setNewCat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategoria()} />
            <button className="btn btn-accent" onClick={addCategoria}><FiPlus /> Adicionar</button>
          </div>
        </div>

        {/* Lista */}
        {categorias.map(cat => (
          <div key={cat.id} className="category-item">
            <div className="category-header" onClick={() => toggleExpand(cat.id)}>
              <h4>
                {expanded[cat.id] ? <FiChevronDown /> : <FiChevronRight />}
                {editingCat === cat.id ? (
                  <span onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input className="form-input" value={editingCatName} onChange={e => setEditingCatName(e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.85rem', width: 200 }}
                      onKeyDown={e => e.key === 'Enter' && updateCategoria(cat.id)} />
                    <button className="btn btn-sm btn-success" onClick={() => updateCategoria(cat.id)}><FiCheck /></button>
                    <button className="btn btn-sm btn-ghost" onClick={() => setEditingCat(null)}><FiX /></button>
                  </span>
                ) : (
                  <>
                    {cat.nome}
                    <span className="category-count">{cat.subcategorias?.length || 0}</span>
                  </>
                )}
              </h4>
              <div className="btn-group" onClick={e => e.stopPropagation()}>
                <button className="btn btn-ghost btn-sm" title="Editar"
                  onClick={() => { setEditingCat(cat.id); setEditingCatName(cat.nome); }}>
                  <FiEdit2 />
                </button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} title="Excluir"
                  onClick={() => deleteCategoria(cat.id, cat.nome)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>

            {expanded[cat.id] && (
              <div style={{ padding: '0 18px 14px' }}>
                <div className="subcategory-list">
                  {cat.subcategorias?.map(sub => (
                    <span key={sub.id} className="subcategory-tag">
                      {sub.nome}
                      <button className="remove-btn" onClick={() => deleteSubcategoria(sub.id)}>×</button>
                    </span>
                  ))}
                  {(!cat.subcategorias || cat.subcategorias.length === 0) && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nenhuma subcategoria</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input className="form-input" placeholder="Nova subcategoria..." style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                    value={newSubcats[cat.id] || ''}
                    onChange={e => setNewSubcats(p => ({ ...p, [cat.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addSubcategoria(cat.id)} />
                  <button className="btn btn-primary btn-sm" onClick={() => addSubcategoria(cat.id)}>
                    <FiPlus />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {categorias.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><FiGrid /></div>
            <h3>Nenhuma categoria</h3>
            <p>Adicione categorias para organizar seus fornecedores</p>
          </div>
        )}
      </div>
    </>
  );
}
