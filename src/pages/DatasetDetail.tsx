import { Link, useParams } from 'react-router-dom';
import { DatasetChecksTable } from '../components/ChecksTable';
import { CheckBadge } from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { getUser } from '../data/mockData';

export function DatasetDetail() {
  const { productId, pipelineId, datasetId } = useParams<{
    productId: string;
    pipelineId: string;
    datasetId: string;
  }>();
  const { products } = useApp();

  const product = products.find((p) => p.id === productId);
  const pipeline = product?.pipelines.find((pl) => pl.id === pipelineId);
  const dataset = pipeline?.datasets.find((d) => d.id === datasetId);

  if (!product || !pipeline || !dataset) {
    return (
      <div className="empty-state">
        <p>Dataset not found.</p>
        <Link to="/products">Back to products</Link>
      </div>
    );
  }

  const worstStatus = dataset.checks.some((c) => c.status === 'fail')
    ? 'fail'
    : dataset.checks.some((c) => c.status === 'warn')
      ? 'warn'
      : 'pass';

  return (
    <>
      <div className="breadcrumb">
        <Link to="/products">Data products</Link> /{' '}
        <Link to={`/products/${product.id}`}>{product.name}</Link> /{' '}
        <Link to={`/products/${product.id}/pipelines/${pipeline.id}`}>
          {pipeline.name}
        </Link>{' '}
        / <span className="mono">{dataset.name}</span>
      </div>
      <header className="page-header">
        <div className="product-card-meta">
          <CheckBadge status={worstStatus} />
        </div>
        <h1 className="mono">{dataset.name}</h1>
        <p>
          Schema: <span className="mono">{dataset.schema}</span>
        </p>
      </header>

      <div className="detail-grid">
        <div className="detail-item">
          <label>Row count</label>
          <span>{dataset.rowCount.toLocaleString()}</span>
        </div>
        <div className="detail-item">
          <label>Freshness</label>
          <span className="mono">{new Date(dataset.freshness).toLocaleString()}</span>
        </div>
        <div className="detail-item">
          <label>Dataset owner</label>
          <span>{getUser(dataset.ownerId)?.name}</span>
        </div>
        <div className="detail-item">
          <label>Checks</label>
          <span>{dataset.checks.length}</span>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Dataset checks</h2>
        </div>
        <DatasetChecksTable checks={dataset.checks} />
      </section>
    </>
  );
}
