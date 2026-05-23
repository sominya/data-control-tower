import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { countFailingChecks, getUser, overallHealth } from '../data/mockData';
import { HealthBadge, TierBadge } from '../components/StatusBadge';

export function Products() {
  const { products } = useApp();

  return (
    <>
      <header className="page-header">
        <h1>Data products</h1>
        <p>
          Curated data products with ownership, SLAs, and linked pipelines. Drill into any product
          for lineage and quality detail.
        </p>
      </header>

      <div className="card-grid">
        {products.map((product) => (
          <Link key={product.id} to={`/products/${product.id}`} className="product-card">
            <div className="product-card-meta">
              <TierBadge tier={product.tier} />
              <span className="tag">{product.domain}</span>
              <HealthBadge status={overallHealth(product)} />
            </div>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="product-card-footer">
              <span>
                {product.pipelines.length} pipeline{product.pipelines.length !== 1 ? 's' : ''}
              </span>
              <span>
                {countFailingChecks(product) > 0
                  ? `${countFailingChecks(product)} failing`
                  : 'All checks pass'}
              </span>
              <span>{getUser(product.ownerId)?.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
