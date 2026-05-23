import type { CheckStatus, IncidentStatus } from '../types';

const checkStyles: Record<CheckStatus, { label: string; className: string }> = {
  pass: { label: 'Pass', className: 'badge badge-pass' },
  fail: { label: 'Fail', className: 'badge badge-fail' },
  warn: { label: 'Warn', className: 'badge badge-warn' },
  running: { label: 'Running', className: 'badge badge-running' },
};

const incidentStyles: Record<IncidentStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'badge badge-fail' },
  investigating: { label: 'Investigating', className: 'badge badge-warn' },
  resolved: { label: 'Resolved', className: 'badge badge-pass' },
};

const healthStyles: Record<string, { label: string; className: string }> = {
  healthy: { label: 'Healthy', className: 'badge badge-pass' },
  degraded: { label: 'Degraded', className: 'badge badge-warn' },
  failing: { label: 'Failing', className: 'badge badge-fail' },
};

export function CheckBadge({ status }: { status: CheckStatus }) {
  const s = checkStyles[status];
  return <span className={s.className}>{s.label}</span>;
}

export function IncidentBadge({ status }: { status: IncidentStatus }) {
  const s = incidentStyles[status];
  return <span className={s.className}>{s.label}</span>;
}

export function HealthBadge({ status }: { status: 'healthy' | 'degraded' | 'failing' }) {
  const s = healthStyles[status];
  return <span className={s.className}>{s.label}</span>;
}

export function TierBadge({ tier }: { tier: 'gold' | 'silver' | 'bronze' }) {
  return <span className={`badge badge-tier badge-tier-${tier}`}>{tier}</span>;
}

export function SeverityBadge({ severity }: { severity: string }) {
  return <span className={`badge badge-severity badge-severity-${severity}`}>{severity}</span>;
}
