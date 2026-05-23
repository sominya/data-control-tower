import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { countFailingChecks, getUser } from '../data/mockData';
import { HealthBadge, TierBadge } from '../components/StatusBadge';

export function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const { products, users, setProductOwner } = useApp();
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="empty-state">
        <p>Product not found.</p>
        <Link to="/products">Back to products</Link>
      </div>
    );
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/products">Data products</Link> / {product.name}
      </div>
      <header className="page-header">
        <div className="product-card-meta">
          <TierBadge tier={product.tier} />
          <span className="tag">{product.domain}</span>
        </div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
      </header>

      <div className="detail-grid">
        <div className="detail-item">
          <label>SLA</label>
          <span>{product.sla}</span>
        </div>
        <div className="detail-item">
          <label>Owner</label>
          <select
            className="field-input owner-select"
            value={product.ownerId}
            onChange={(e) => setProductOwner(product.id, e.target.value)}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div className="detail-item">
          <label>Pipelines</label>
          <span>{product.pipelines.length}</span>
        </div>
        <div className="detail-item">
          <label>Failing checks</label>
          <span>{countFailingChecks(product)}</span>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Pipelines</h2>
        </div>
        <div className="panel-body">
          <div className="pipeline-list">
            {product.pipelines.map((pipeline) => {
              const failCount =
                pipeline.checks.filter((c) => c.status === 'fail').length +
                pipeline.datasets.reduce(
                  (n, d) => n + d.checks.filter((c) => c.status === 'fail').length,
                  0,
                );
              return (
                <Link
                  key={pipeline.id}
                  to={`/products/${product.id}/pipelines/${pipeline.id}`}
                  className="pipeline-row"
                >
                  <div className="pipeline-row-info">
                    <h4 className="mono">{pipeline.name}</h4>
                    <span>{pipeline.description}</span>
                  </div>
                  <div className="pipeline-row-meta">
                    <HealthBadge status={pipeline.status} />
                    <span className="cell-muted">
                      {pipeline.datasets.length} datasets · {failCount} failing
                    </span>
                    <span className="cell-muted">{getUser(pipeline.ownerId)?.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
