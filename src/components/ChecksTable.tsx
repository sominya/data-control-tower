import type { DatasetCheck, PipelineCheck } from '../types';
import { CheckBadge } from './StatusBadge';

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface PipelineChecksTableProps {
  checks: PipelineCheck[];
  onOpenIncident?: (check: PipelineCheck) => void;
}

export function PipelineChecksTable({ checks, onOpenIncident }: PipelineChecksTableProps) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Check</th>
          <th>Dimension</th>
          <th>Status</th>
          <th>Last run</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {checks.map((check) => (
          <tr key={check.id} className={check.status === 'fail' ? 'row-fail' : ''}>
            <td>
              <div className="cell-primary">{check.name}</div>
              <div className="cell-muted">{check.description}</div>
            </td>
            <td>
              <span className="tag">{check.dimension}</span>
            </td>
            <td>
              <CheckBadge status={check.status} />
            </td>
            <td className="mono">{formatTime(check.lastRun)}</td>
            <td>
              {check.status === 'fail' && onOpenIncident && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => onOpenIncident(check)}
                >
                  Open incident
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface DatasetChecksTableProps {
  checks: DatasetCheck[];
}

export function DatasetChecksTable({ checks }: DatasetChecksTableProps) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Check</th>
          <th>Status</th>
          <th>Threshold</th>
          <th>Last run</th>
        </tr>
      </thead>
      <tbody>
        {checks.map((check) => (
          <tr key={check.id} className={check.status === 'fail' ? 'row-fail' : ''}>
            <td>
              <div className="cell-primary">{check.name}</div>
              <div className="cell-muted">{check.description}</div>
            </td>
            <td>
              <CheckBadge status={check.status} />
            </td>
            <td className="cell-muted">{check.threshold ?? '—'}</td>
            <td className="mono">{formatTime(check.lastRun)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
