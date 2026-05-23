import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AssignIncidentModal } from '../components/AssignIncidentModal';
import { PipelineChecksTable } from '../components/ChecksTable';
import { LineageGraph } from '../components/LineageGraph';
import { HealthBadge } from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { getUser } from '../data/mockData';
import type { PipelineCheck } from '../types';

export function PipelineDetail() {
  const { productId, pipelineId } = useParams<{ productId: string; pipelineId: string }>();
  const { products, users, setPipelineOwner, createIncidentFromCheck, incidents } = useApp();
  const [tab, setTab] = useState<'checks' | 'datasets' | 'lineage'>('checks');
  const [assignIncident, setAssignIncident] = useState<
    (typeof incidents)[0] | null
  >(null);

  const product = products.find((p) => p.id === productId);
  const pipeline = product?.pipelines.find((pl) => pl.id === pipelineId);

  if (!product || !pipeline) {
    return (
      <div className="empty-state">
        <p>Pipeline not found.</p>
        <Link to="/products">Back to products</Link>
      </div>
    );
  }

  const handleOpenIncident = (check: PipelineCheck) => {
    const existing = incidents.find(
      (i) => i.checkId === check.id && i.status !== 'resolved',
    );
    if (existing) {
      setAssignIncident(existing);
      return;
    }
    const incident = createIncidentFromCheck({
      checkId: check.id,
      checkName: check.name,
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      productId: product.id,
      productName: product.name,
      severity: check.dimension === 'timeliness' ? 'high' : 'critical',
      title: `${check.name} failed on ${pipeline.name}`,
    });
    setAssignIncident(incident);
  };

  return (
    <>
      <div className="breadcrumb">
        <Link to="/products">Data products</Link> /{' '}
        <Link to={`/products/${product.id}`}>{product.name}</Link> /{' '}
        <span className="mono">{pipeline.name}</span>
      </div>
      <header className="page-header">
        <div className="product-card-meta">
          <HealthBadge status={pipeline.status} />
          <span className="tag mono">{pipeline.schedule}</span>
        </div>
        <h1 className="mono">{pipeline.name}</h1>
        <p>{pipeline.description}</p>
      </header>

      <div className="detail-grid">
        <div className="detail-item">
          <label>Last run</label>
          <span className="mono">
            {new Date(pipeline.lastRun).toLocaleString()}
          </span>
        </div>
        <div className="detail-item">
          <label>Pipeline owner</label>
          <select
            className="field-input owner-select"
            value={pipeline.ownerId}
            onChange={(e) => setPipelineOwner(product.id, pipeline.id, e.target.value)}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div className="detail-item">
          <label>Datasets</label>
          <span>{pipeline.datasets.length}</span>
        </div>
        <div className="detail-item">
          <label>Owner</label>
          <span>{getUser(pipeline.ownerId)?.name}</span>
        </div>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={tab === 'checks' ? 'tab active' : 'tab'}
          onClick={() => setTab('checks')}
        >
          Quality checks
        </button>
        <button
          type="button"
          className={tab === 'datasets' ? 'tab active' : 'tab'}
          onClick={() => setTab('datasets')}
        >
          Datasets
        </button>
        <button
          type="button"
          className={tab === 'lineage' ? 'tab active' : 'tab'}
          onClick={() => setTab('lineage')}
        >
          Process lineage
        </button>
      </div>

      {tab === 'checks' && (
        <section className="panel">
          <div className="panel-header">
            <h2>Pipeline quality checks</h2>
          </div>
          <PipelineChecksTable checks={pipeline.checks} onOpenIncident={handleOpenIncident} />
        </section>
      )}

      {tab === 'datasets' && (
        <section className="panel">
          <div className="panel-header">
            <h2>Datasets in this pipeline</h2>
          </div>
          <div className="pipeline-list" style={{ padding: '1rem' }}>
            {pipeline.datasets.map((ds) => {
              const fails = ds.checks.filter((c) => c.status === 'fail').length;
              return (
                <Link
                  key={ds.id}
                  to={`/products/${product.id}/pipelines/${pipeline.id}/datasets/${ds.id}`}
                  className="pipeline-row"
                >
                  <div className="pipeline-row-info">
                    <h4 className="mono">{ds.name}</h4>
                    <span>{ds.schema}</span>
                  </div>
                  <div className="pipeline-row-meta">
                    <span className="cell-muted">
                      {(ds.rowCount / 1_000_000).toFixed(2)}M rows
                    </span>
                    <span className="cell-muted">
                      {ds.checks.length} checks · {fails} failing
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {tab === 'lineage' && (
        <section className="panel">
          <div className="panel-header">
            <h2>Process lineage</h2>
            <span className="cell-muted">Click dataset nodes to view checks</span>
          </div>
          <div className="panel-body">
            <LineageGraph
              nodes={pipeline.lineage.nodes}
              edges={pipeline.lineage.edges}
              productId={product.id}
              pipelineId={pipeline.id}
            />
          </div>
        </section>
      )}

      <AssignIncidentModal incident={assignIncident} onClose={() => setAssignIncident(null)} />
    </>
  );
}
