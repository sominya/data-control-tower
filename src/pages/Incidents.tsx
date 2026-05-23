import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AssignIncidentModal } from '../components/AssignIncidentModal';
import { IncidentBadge, SeverityBadge } from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { getUser } from '../data/mockData';
import type { Incident, IncidentStatus } from '../types';

export function Incidents() {
  const { incidents, updateIncidentStatus } = useApp();
  const [modalIncident, setModalIncident] = useState<Incident | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const filtered = incidents.filter((i) => {
    if (filter === 'open') return i.status !== 'resolved';
    if (filter === 'resolved') return i.status === 'resolved';
    return true;
  });

  return (
    <>
      <header className="page-header">
        <h1>Incidents</h1>
        <p>
          Operational incidents linked to failed quality checks. Assign owners and track
          resolution.
        </p>
      </header>

      <div className="tabs">
        {(['all', 'open', 'resolved'] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={filter === f ? 'tab active' : 'tab'}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <section className="panel">
        {filtered.length === 0 ? (
          <div className="empty-state">No incidents match this filter.</div>
        ) : (
          filtered.map((inc) => (
            <div key={inc.id} className="incident-card">
              <div className="incident-card-header">
                <div>
                  <h3>{inc.title}</h3>
                  <div className="incident-meta">
                    <Link to={`/products/${inc.productId}`}>{inc.productName}</Link>
                    {' → '}
                    <Link
                      to={`/products/${inc.productId}/pipelines/${inc.pipelineId}`}
                      className="mono"
                    >
                      {inc.pipelineName}
                    </Link>
                    {' · '}
                    <span className="mono">{inc.checkName}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <SeverityBadge severity={inc.severity} />
                  <IncidentBadge status={inc.status} />
                </div>
              </div>
              <p className="cell-muted" style={{ margin: '0 0 0.75rem', fontSize: '0.85rem' }}>
                {inc.notes}
              </p>
              <div className="incident-actions">
                <span className="cell-muted">
                  Assignee:{' '}
                  {inc.assigneeId ? getUser(inc.assigneeId)?.name : 'Unassigned'}
                </span>
                <span className="cell-muted">
                  Reporter: {getUser(inc.reporterId)?.name}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => setModalIncident(inc)}
                >
                  Assign
                </button>
                <select
                  className="field-input"
                  style={{ width: 'auto', margin: 0, padding: '0.35rem 0.5rem' }}
                  value={inc.status}
                  onChange={(e) =>
                    updateIncidentStatus(inc.id, e.target.value as IncidentStatus)
                  }
                >
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          ))
        )}
      </section>

      <AssignIncidentModal
        incident={modalIncident}
        onClose={() => setModalIncident(null)}
      />
    </>
  );
}
