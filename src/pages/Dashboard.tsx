import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { countFailingChecks, getUser, overallHealth } from '../data/mockData';
import { HealthBadge, TierBadge } from '../components/StatusBadge';

export function Dashboard() {
  const { products, incidents } = useApp();

  const openIncidents = incidents.filter((i) => i.status !== 'resolved');
  const failingProducts = products.filter((p) => overallHealth(p) === 'failing');
  const totalPipelines = products.reduce((n, p) => n + p.pipelines.length, 0);
  const totalFailingChecks = products.reduce((n, p) => n + countFailingChecks(p), 0);

  return (
    <>
      <header className="page-header">
        <h1>Control tower overview</h1>
        <p>
          Operational view across data products, pipeline health, quality checks, and open
          incidents.
        </p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{products.length}</div>
          <div className="stat-label">Data products</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalPipelines}</div>
          <div className="stat-label">Pipelines</div>
        </div>
        <div className={`stat-card ${totalFailingChecks > 0 ? 'stat-fail' : ''}`}>
          <div className="stat-value">{totalFailingChecks}</div>
          <div className="stat-label">Failing checks</div>
        </div>
        <div className={`stat-card ${openIncidents.length > 0 ? 'stat-warn' : ''}`}>
          <div className="stat-value">{openIncidents.length}</div>
          <div className="stat-label">Open incidents</div>
        </div>
      </div>

      {failingProducts.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <h2>Needs attention</h2>
            <Link to="/incidents">View incidents →</Link>
          </div>
          <div className="panel-body">
            <div className="card-grid">
              {failingProducts.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`} className="product-card">
                  <div className="product-card-meta">
                    <TierBadge tier={product.tier} />
                    <HealthBadge status={overallHealth(product)} />
                  </div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-card-footer">
                    <span>{countFailingChecks(product)} failing checks</span>
                    <span>Owner: {getUser(product.ownerId)?.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="panel-header">
          <h2>Recent incidents</h2>
          <Link to="/incidents">All incidents →</Link>
        </div>
        <div>
          {openIncidents.slice(0, 3).map((inc) => (
            <div key={inc.id} className="incident-card">
              <div className="incident-card-header">
                <h3>{inc.title}</h3>
              </div>
              <div className="incident-meta">
                {inc.productName} → {inc.pipelineName} · {inc.checkName}
              </div>
            </div>
          ))}
          {openIncidents.length === 0 && (
            <div className="empty-state">No open incidents — all checks green.</div>
          )}
        </div>
      </section>
    </>
  );
}
