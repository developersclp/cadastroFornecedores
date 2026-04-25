import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { ToastContext } from '../App';
import { FiDownload, FiFileText, FiUser } from 'react-icons/fi';

export default function Exportar() {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const { addToast } = useContext(ToastContext);

  useEffect(() => {
    api.get('/api/fornecedores').then(r => setFornecedores(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const exportAll = async () => {
    setExporting(true);
    try {
      const res = await api.get('/api/export/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fornecedores_rojemac.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast('PDF exportado com sucesso!');
    } catch (err) { addToast('Erro ao exportar PDF', 'error'); }
    finally { setExporting(false); }
  };

  const exportFicha = async () => {
    if (!selectedId) { addToast('Selecione um fornecedor', 'error'); return; }
    setExporting(true);
    try {
      const res = await api.get(`/api/export/pdf/${selectedId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ficha_fornecedor_${selectedId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast('Ficha exportada com sucesso!');
    } catch (err) { addToast('Erro ao exportar ficha', 'error'); }
    finally { setExporting(false); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h2>Exportar PDF</h2>
      </div>
      <div className="page-content">
        <div className="export-cards">
          <div className="export-card" onClick={!exporting ? exportAll : undefined}>
            <div className="export-icon"><FiFileText /></div>
            <h3>Relatório Completo</h3>
            <p>Exportar lista de todos os fornecedores em PDF com tabela formatada nas cores Rojemac</p>
            <button className="btn btn-accent" style={{ marginTop: 16 }} disabled={exporting}>
              <FiDownload /> {exporting ? 'Exportando...' : 'Exportar Todos'}
            </button>
          </div>

          <div className="export-card">
            <div className="export-icon"><FiUser /></div>
            <h3>Ficha Individual</h3>
            <p>Exportar ficha completa de um fornecedor específico com dados e avaliações</p>
            <select className="form-select" value={selectedId} onChange={e => setSelectedId(e.target.value)}
              style={{ marginTop: 12, marginBottom: 12, textAlign: 'left' }}>
              <option value="">Selecione o fornecedor...</option>
              {fornecedores.map(f => <option key={f.id} value={f.id}>{f.codigo} - {f.razao_social}</option>)}
            </select>
            <button className="btn btn-primary" onClick={exportFicha} disabled={exporting || !selectedId}>
              <FiDownload /> {exporting ? 'Exportando...' : 'Exportar Ficha'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
