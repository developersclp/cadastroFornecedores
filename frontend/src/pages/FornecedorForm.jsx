import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { ToastContext } from '../App';
import { FiSave, FiArrowLeft, FiUser, FiPhone, FiMapPin, FiDollarSign, FiLink } from 'react-icons/fi';

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export default function FornecedorForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { addToast } = useContext(ToastContext);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    razao_social: '', nome_fantasia: '', cnpj: '', inscricao_estadual: '',
    categoria_id: '', subcategoria: '', tipo_fornecedor: 'produto',
    porte_empresa: '', status: 'ativo',
    contato_nome: '', contato_cargo: '', telefone: '', email: '', whatsapp: '',
    cidade: '', estado: '', pais: 'Brasil',
    forma_pagamento: '', prazo_pagamento: '',
    site_url: '', observacoes: ''
  });

  useEffect(() => {
    loadCategorias();
    if (isEdit) loadFornecedor();
  }, [id]);

  const loadCategorias = async () => {
    try {
      const res = await api.get('/api/categorias');
      setCategorias(res.data);
    } catch (err) { console.error(err); }
  };

  const loadFornecedor = async () => {
    try {
      const res = await api.get(`/api/fornecedores/${id}`);
      const d = res.data;
      setForm({
        razao_social: d.razao_social || '', nome_fantasia: d.nome_fantasia || '',
        cnpj: d.cnpj || '', inscricao_estadual: d.inscricao_estadual || '',
        categoria_id: d.categoria_id || '', subcategoria: d.subcategoria || '',
        tipo_fornecedor: d.tipo_fornecedor || 'produto', porte_empresa: d.porte_empresa || '',
        status: d.status || 'ativo',
        contato_nome: d.contato_nome || '', contato_cargo: d.contato_cargo || '',
        telefone: d.telefone || '', email: d.email || '', whatsapp: d.whatsapp || '',
        cidade: d.cidade || '', estado: d.estado || '', pais: d.pais || 'Brasil',
        forma_pagamento: d.forma_pagamento || '', prazo_pagamento: d.prazo_pagamento || '',
        site_url: d.site_url || '', observacoes: d.observacoes || ''
      });
    } catch (err) { addToast('Erro ao carregar fornecedor', 'error'); }
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.razao_social.trim()) { addToast('Razão social é obrigatória', 'error'); return; }
    setLoading(true);
    try {
      const payload = { ...form, categoria_id: form.categoria_id ? parseInt(form.categoria_id) : null };
      if (isEdit) {
        await api.put(`/api/fornecedores/${id}`, payload);
        addToast('Fornecedor atualizado!');
      } else {
        await api.post('/api/fornecedores', payload);
        addToast('Fornecedor cadastrado!');
      }
      navigate('/fornecedores');
    } catch (err) {
      addToast(err.response?.data?.error || 'Erro ao salvar', 'error');
    } finally { setLoading(false); }
  };

  const selectedCat = categorias.find(c => c.id === parseInt(form.categoria_id));

  return (
    <>
      <div className="page-header">
        <h2>{isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
        <button className="btn btn-ghost" onClick={() => navigate('/fornecedores')}>
          <FiArrowLeft /> Voltar
        </button>
      </div>

      <div className="page-content">
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="form-section">
              <div className="form-section-title"><FiUser /> Dados Gerais</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Razão Social *</label>
                  <input className="form-input" value={form.razao_social} onChange={e => handleChange('razao_social', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Nome Fantasia</label>
                  <input className="form-input" value={form.nome_fantasia} onChange={e => handleChange('nome_fantasia', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">CNPJ</label>
                  <input className="form-input" value={form.cnpj} onChange={e => handleChange('cnpj', e.target.value)} placeholder="00.000.000/0000-00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Inscrição Estadual</label>
                  <input className="form-input" value={form.inscricao_estadual} onChange={e => handleChange('inscricao_estadual', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select className="form-select" value={form.categoria_id} onChange={e => handleChange('categoria_id', e.target.value)}>
                    <option value="">Selecione...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subcategoria</label>
                  {selectedCat?.subcategorias?.length > 0 ? (
                    <select className="form-select" value={form.subcategoria} onChange={e => handleChange('subcategoria', e.target.value)}>
                      <option value="">Selecione...</option>
                      {selectedCat.subcategorias.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                    </select>
                  ) : (
                    <input className="form-input" value={form.subcategoria} onChange={e => handleChange('subcategoria', e.target.value)} placeholder="Ex: Impressão, Brindes..." />
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de Fornecedor</label>
                  <select className="form-select" value={form.tipo_fornecedor} onChange={e => handleChange('tipo_fornecedor', e.target.value)}>
                    <option value="produto">Produto</option>
                    <option value="servico">Serviço</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Porte da Empresa</label>
                  <select className="form-select" value={form.porte_empresa} onChange={e => handleChange('porte_empresa', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="MEI">MEI</option>
                    <option value="ME">ME - Microempresa</option>
                    <option value="EPP">EPP - Empresa de Pequeno Porte</option>
                    <option value="Médio">Médio Porte</option>
                    <option value="Grande">Grande Porte</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title"><FiPhone /> Contato</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nome do Contato</label>
                  <input className="form-input" value={form.contato_nome} onChange={e => handleChange('contato_nome', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cargo</label>
                  <input className="form-input" value={form.contato_cargo} onChange={e => handleChange('contato_cargo', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input className="form-input" value={form.telefone} onChange={e => handleChange('telefone', e.target.value)} placeholder="(00) 0000-0000" />
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input className="form-input" value={form.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} placeholder="(00) 00000-0000" />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title"><FiMapPin /> Endereço</div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input className="form-input" value={form.cidade} onChange={e => handleChange('cidade', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-select" value={form.estado} onChange={e => handleChange('estado', e.target.value)}>
                    <option value="">Selecione...</option>
                    {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">País</label>
                  <input className="form-input" value={form.pais} onChange={e => handleChange('pais', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title"><FiDollarSign /> Informações Financeiras</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Forma de Pagamento</label>
                  <select className="form-select" value={form.forma_pagamento} onChange={e => handleChange('forma_pagamento', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="Boleto">Boleto</option>
                    <option value="PIX">PIX</option>
                    <option value="Transferência">Transferência Bancária</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Prazo de Pagamento</label>
                  <select className="form-select" value={form.prazo_pagamento} onChange={e => handleChange('prazo_pagamento', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="À vista">À vista</option>
                    <option value="7 dias">7 dias</option>
                    <option value="15 dias">15 dias</option>
                    <option value="30 dias">30 dias</option>
                    <option value="45 dias">45 dias</option>
                    <option value="60 dias">60 dias</option>
                    <option value="90 dias">90 dias</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
              <div className="form-section-title"><FiLink /> Link / Site / Contato</div>
              <div className="form-group">
                <label className="form-label">URL do Site ou Link de Contato</label>
                <input className="form-input" value={form.site_url} onChange={e => handleChange('site_url', e.target.value)} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea className="form-textarea" value={form.observacoes} onChange={e => handleChange('observacoes', e.target.value)} placeholder="Anotações sobre este fornecedor..." />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/fornecedores')}>Cancelar</button>
            <button type="submit" className="btn btn-accent" disabled={loading}>
              <FiSave /> {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Cadastrar')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
