import { useState, useEffect } from 'react';
import api from '../services/api';
import { FiUsers, FiCheckCircle, FiAlertCircle, FiXCircle, FiStar, FiTrendingUp } from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const res = await api.get('/api/dashboard/stats');
      setStats(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const maxCat = stats?.por_categoria?.length ? Math.max(...stats.por_categoria.map(c => c.total), 1) : 1;

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Visão geral dos fornecedores
        </span>
      </div>

      <div className="page-content">
        {/* KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card total">
            <div className="kpi-icon"><FiUsers /></div>
            <div className="kpi-info">
              <h3>{stats?.total || 0}</h3>
              <p>Total de Fornecedores</p>
            </div>
          </div>
          <div className="kpi-card ativo">
            <div className="kpi-icon"><FiCheckCircle /></div>
            <div className="kpi-info">
              <h3>{stats?.ativos || 0}</h3>
              <p>Ativos</p>
            </div>
          </div>
          <div className="kpi-card inativo">
            <div className="kpi-icon"><FiAlertCircle /></div>
            <div className="kpi-info">
              <h3>{stats?.inativos || 0}</h3>
              <p>Inativos</p>
            </div>
          </div>
          <div className="kpi-card bloqueado">
            <div className="kpi-icon"><FiXCircle /></div>
            <div className="kpi-info">
              <h3>{stats?.bloqueados || 0}</h3>
              <p>Bloqueados</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Por Categoria */}
          <div className="card">
            <h3 className="section-title"><FiTrendingUp /> Fornecedores por Categoria</h3>
            <div className="chart-bar-container">
              {stats?.por_categoria?.filter(c => c.total > 0).map((cat, i) => (
                <div key={i} className="chart-bar-item">
                  <div className="chart-bar-label">
                    <span>{cat.nome}</span>
                    <span>{cat.total}</span>
                  </div>
                  <div className="chart-bar-track">
                    <div className="chart-bar-fill" style={{ width: `${(cat.total / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
              {(!stats?.por_categoria || stats.por_categoria.filter(c => c.total > 0).length === 0) && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>
                  Nenhum fornecedor cadastrado ainda
                </p>
              )}
            </div>
          </div>

          {/* Top Fornecedores */}
          <div className="card">
            <h3 className="section-title"><FiStar /> Top Fornecedores</h3>
            {stats?.top_fornecedores?.length > 0 ? (
              <ul className="top-list">
                {stats.top_fornecedores.map((f, i) => (
                  <li key={i} className="top-list-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="top-rank">{i + 1}</div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{f.nome}</p>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.codigo}</span>
                      </div>
                    </div>
                    <div className={`nota-display ${f.nota_media >= 7 ? 'alta' : f.nota_media >= 4 ? 'media' : 'baixa'}`}>
                      <FiStar /> {f.nota_media.toFixed(1)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>
                Nenhuma avaliação realizada
              </p>
            )}
          </div>
        </div>

        {/* Últimas Avaliações */}
        {stats?.ultimas_avaliacoes?.length > 0 && (
          <div className="card" style={{ marginTop: 20 }}>
            <h3 className="section-title"><FiStar /> Últimas Avaliações</h3>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Fornecedor</th>
                    <th>Data</th>
                    <th>Qualidade</th>
                    <th>Prazo</th>
                    <th>Atendimento</th>
                    <th>Custo-Benefício</th>
                    <th>Nota Final</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.ultimas_avaliacoes.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.fornecedor_nome}</td>
                      <td>{a.data_avaliacao ? new Date(a.data_avaliacao + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</td>
                      <td>{a.qualidade?.toFixed(1)}</td>
                      <td>{a.prazo_entrega?.toFixed(1)}</td>
                      <td>{a.atendimento?.toFixed(1)}</td>
                      <td>{a.custo_beneficio?.toFixed(1)}</td>
                      <td>
                        <span className={`nota-display ${a.nota_final >= 7 ? 'alta' : a.nota_final >= 4 ? 'media' : 'baixa'}`}>
                          {a.nota_final?.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
