export type CheckStatus = 'pass' | 'fail' | 'warn' | 'running';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';
export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DatasetCheck {
  id: string;
  name: string;
  description: string;
  status: CheckStatus;
  lastRun: string;
  threshold?: string;
}

export interface Dataset {
  id: string;
  name: string;
  schema: string;
  rowCount: number;
  freshness: string;
  ownerId: string;
  checks: DatasetCheck[];
}

export interface LineageNode {
  id: string;
  label: string;
  type: 'source' | 'transform' | 'dataset' | 'sink';
  datasetId?: string;
}

export interface LineageEdge {
  from: string;
  to: string;
}

export interface PipelineCheck {
  id: string;
  name: string;
  description: string;
  status: CheckStatus;
  lastRun: string;
  dimension: 'completeness' | 'accuracy' | 'timeliness' | 'uniqueness' | 'validity';
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  schedule: string;
  ownerId: string;
  status: 'healthy' | 'degraded' | 'failing';
  lastRun: string;
  datasets: Dataset[];
  checks: PipelineCheck[];
  lineage: {
    nodes: LineageNode[];
    edges: LineageEdge[];
  };
}

export interface DataProduct {
  id: string;
  name: string;
  description: string;
  domain: string;
  tier: 'gold' | 'silver' | 'bronze';
  ownerId: string;
  sla: string;
  pipelines: Pipeline[];
}

export interface Incident {
  id: string;
  title: string;
  checkId: string;
  checkName: string;
  pipelineId: string;
  pipelineName: string;
  productId: string;
  productName: string;
  status: IncidentStatus;
  severity: Severity;
  assigneeId: string | null;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
}
