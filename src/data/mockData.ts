import type { DataProduct, Incident, User } from '../types';

export const users: User[] = [
  { id: 'u1', name: 'Alex Chen', email: 'alex.chen@acme.com', role: 'Data Platform Lead' },
  { id: 'u2', name: 'Jordan Blake', email: 'jordan.blake@acme.com', role: 'Analytics Engineer' },
  { id: 'u3', name: 'Sam Rivera', email: 'sam.rivera@acme.com', role: 'Data Quality Analyst' },
  { id: 'u4', name: 'Morgan Lee', email: 'morgan.lee@acme.com', role: 'Product Owner' },
  { id: 'u5', name: 'Taylor Kim', email: 'taylor.kim@acme.com', role: 'SRE / On-call' },
];

export const initialIncidents: Incident[] = [
  {
    id: 'inc-001',
    title: 'Customer revenue null rate exceeded threshold',
    checkId: 'pc-cust-002',
    checkName: 'Revenue completeness',
    pipelineId: 'pl-cust-rev',
    pipelineName: 'customer_revenue_daily',
    productId: 'dp-customer-360',
    productName: 'Customer 360',
    status: 'investigating',
    severity: 'critical',
    assigneeId: 'u2',
    reporterId: 'u3',
    createdAt: '2026-05-22T08:14:00Z',
    updatedAt: '2026-05-23T09:30:00Z',
    notes: 'Spike in nulls after upstream CRM export delay. Backfill scheduled.',
  },
  {
    id: 'inc-002',
    title: 'Order fact freshness SLA breach',
    checkId: 'pc-ord-001',
    checkName: 'Fact table freshness',
    pipelineId: 'pl-order-fact',
    pipelineName: 'order_fact_hourly',
    productId: 'dp-order-analytics',
    productName: 'Order Analytics',
    status: 'open',
    severity: 'high',
    assigneeId: 'u5',
    reporterId: 'u1',
    createdAt: '2026-05-23T06:00:00Z',
    updatedAt: '2026-05-23T06:00:00Z',
    notes: 'Warehouse load job delayed 2h. Monitoring retry.',
  },
  {
    id: 'inc-003',
    title: 'Duplicate product keys in dimension',
    checkId: 'dc-prod-003',
    checkName: 'Primary key uniqueness',
    pipelineId: 'pl-product-dim',
    pipelineName: 'product_dimension',
    productId: 'dp-product-catalog',
    productName: 'Product Catalog',
    status: 'open',
    severity: 'medium',
    assigneeId: null,
    reporterId: 'u3',
    createdAt: '2026-05-23T11:45:00Z',
    updatedAt: '2026-05-23T11:45:00Z',
    notes: 'Unassigned — needs owner from catalog team.',
  },
];

export const dataProducts: DataProduct[] = [
  {
    id: 'dp-customer-360',
    name: 'Customer 360',
    description: 'Unified customer profile, segments, and lifetime value for GTM teams.',
    domain: 'Customer',
    tier: 'gold',
    ownerId: 'u4',
    sla: '99.5% daily by 08:00 UTC',
    pipelines: [
      {
        id: 'pl-cust-rev',
        name: 'customer_revenue_daily',
        description: 'Aggregates billing and subscription revenue per customer.',
        schedule: '0 6 * * *',
        ownerId: 'u2',
        status: 'failing',
        lastRun: '2026-05-23T06:12:00Z',
        checks: [
          {
            id: 'pc-cust-001',
            name: 'Row count vs prior day',
            description: 'Daily row count within ±15% of 7-day median.',
            status: 'pass',
            lastRun: '2026-05-23T06:15:00Z',
            dimension: 'completeness',
          },
          {
            id: 'pc-cust-002',
            name: 'Revenue completeness',
            description: 'Null rate on total_revenue must be < 0.1%.',
            status: 'fail',
            lastRun: '2026-05-23T06:15:00Z',
            dimension: 'completeness',
          },
          {
            id: 'pc-cust-003',
            name: 'Currency validity',
            description: 'All amounts use ISO 4217 codes.',
            status: 'pass',
            lastRun: '2026-05-23T06:15:00Z',
            dimension: 'validity',
          },
        ],
        datasets: [
          {
            id: 'ds-cust-rev-fact',
            name: 'fct_customer_revenue',
            schema: 'analytics.customer',
            rowCount: 2_450_000,
            freshness: '2026-05-23T06:10:00Z',
            ownerId: 'u2',
            checks: [
              {
                id: 'dc-cust-001',
                name: 'Partition coverage',
                description: 'All regions present for run date.',
                status: 'pass',
                lastRun: '2026-05-23T06:14:00Z',
              },
              {
                id: 'dc-cust-002',
                name: 'Revenue non-negative',
                description: 'total_revenue >= 0 for all rows.',
                status: 'pass',
                lastRun: '2026-05-23T06:14:00Z',
              },
            ],
          },
          {
            id: 'ds-cust-rev-stg',
            name: 'stg_billing_events',
            schema: 'staging.billing',
            rowCount: 18_200_000,
            freshness: '2026-05-23T05:55:00Z',
            ownerId: 'u2',
            checks: [
              {
                id: 'dc-cust-003',
                name: 'Event id uniqueness',
                description: 'No duplicate event_id in staging.',
                status: 'warn',
                lastRun: '2026-05-23T06:14:00Z',
                threshold: '< 0.01% duplicates',
              },
            ],
          },
        ],
        lineage: {
          nodes: [
            { id: 'n1', label: 'CRM Export', type: 'source' },
            { id: 'n2', label: 'Billing API', type: 'source' },
            { id: 'n3', label: 'Merge & Normalize', type: 'transform' },
            { id: 'n4', label: 'stg_billing_events', type: 'dataset', datasetId: 'ds-cust-rev-stg' },
            { id: 'n5', label: 'Revenue Aggregate', type: 'transform' },
            { id: 'n6', label: 'fct_customer_revenue', type: 'dataset', datasetId: 'ds-cust-rev-fact' },
            { id: 'n7', label: 'BI Semantic Layer', type: 'sink' },
          ],
          edges: [
            { from: 'n1', to: 'n3' },
            { from: 'n2', to: 'n4' },
            { from: 'n3', to: 'n4' },
            { from: 'n4', to: 'n5' },
            { from: 'n5', to: 'n6' },
            { from: 'n6', to: 'n7' },
          ],
        },
      },
      {
        id: 'pl-cust-seg',
        name: 'customer_segmentation',
        description: 'RFM and behavioral segments refreshed weekly.',
        schedule: '0 8 * * 1',
        ownerId: 'u2',
        status: 'healthy',
        lastRun: '2026-05-19T08:05:00Z',
        checks: [
          {
            id: 'pc-cust-010',
            name: 'Segment coverage',
            description: 'Every active customer has exactly one primary segment.',
            status: 'pass',
            lastRun: '2026-05-19T08:10:00Z',
            dimension: 'completeness',
          },
        ],
        datasets: [
          {
            id: 'ds-cust-seg',
            name: 'dim_customer_segment',
            schema: 'analytics.customer',
            rowCount: 2_450_000,
            freshness: '2026-05-19T08:04:00Z',
            ownerId: 'u2',
            checks: [
              {
                id: 'dc-cust-010',
                name: 'Segment enum valid',
                description: 'segment_code in allowed reference set.',
                status: 'pass',
                lastRun: '2026-05-19T08:09:00Z',
              },
            ],
          },
        ],
        lineage: {
          nodes: [
            { id: 's1', label: 'fct_customer_revenue', type: 'dataset' },
            { id: 's2', label: 'Activity Events', type: 'source' },
            { id: 's3', label: 'RFM Scoring', type: 'transform' },
            { id: 's4', label: 'dim_customer_segment', type: 'dataset', datasetId: 'ds-cust-seg' },
          ],
          edges: [
            { from: 's1', to: 's3' },
            { from: 's2', to: 's3' },
            { from: 's3', to: 's4' },
          ],
        },
      },
    ],
  },
  {
    id: 'dp-order-analytics',
    name: 'Order Analytics',
    description: 'Order facts, funnel metrics, and fulfillment KPIs for operations.',
    domain: 'Commerce',
    tier: 'gold',
    ownerId: 'u4',
    sla: '99.9% hourly within 30 min',
    pipelines: [
      {
        id: 'pl-order-fact',
        name: 'order_fact_hourly',
        description: 'Hourly order and line-item facts from OMS.',
        schedule: '15 * * * *',
        ownerId: 'u1',
        status: 'degraded',
        lastRun: '2026-05-23T14:15:00Z',
        checks: [
          {
            id: 'pc-ord-001',
            name: 'Fact table freshness',
            description: 'max(order_ts) within 45 minutes of now.',
            status: 'fail',
            lastRun: '2026-05-23T14:20:00Z',
            dimension: 'timeliness',
          },
          {
            id: 'pc-ord-002',
            name: 'Order id uniqueness',
            description: 'No duplicate order_id per hour partition.',
            status: 'pass',
            lastRun: '2026-05-23T14:20:00Z',
            dimension: 'uniqueness',
          },
        ],
        datasets: [
          {
            id: 'ds-order-fact',
            name: 'fct_orders',
            schema: 'analytics.commerce',
            rowCount: 89_400_000,
            freshness: '2026-05-23T12:30:00Z',
            ownerId: 'u1',
            checks: [
              {
                id: 'dc-ord-001',
                name: 'Status code valid',
                description: 'order_status in reference table.',
                status: 'pass',
                lastRun: '2026-05-23T14:19:00Z',
              },
            ],
          },
        ],
        lineage: {
          nodes: [
            { id: 'o1', label: 'OMS Stream', type: 'source' },
            { id: 'o2', label: 'Dedupe & Enrich', type: 'transform' },
            { id: 'o3', label: 'fct_orders', type: 'dataset', datasetId: 'ds-order-fact' },
            { id: 'o4', label: 'Metrics Mart', type: 'sink' },
          ],
          edges: [
            { from: 'o1', to: 'o2' },
            { from: 'o2', to: 'o3' },
            { from: 'o3', to: 'o4' },
          ],
        },
      },
    ],
  },
  {
    id: 'dp-product-catalog',
    name: 'Product Catalog',
    description: 'Master product, SKU, and category hierarchy for merchandising.',
    domain: 'Product',
    tier: 'silver',
    ownerId: 'u4',
    sla: 'Daily by 10:00 UTC',
    pipelines: [
      {
        id: 'pl-product-dim',
        name: 'product_dimension',
        description: 'SCD Type 2 product dimension from PIM.',
        schedule: '0 9 * * *',
        ownerId: 'u2',
        status: 'degraded',
        lastRun: '2026-05-23T09:05:00Z',
        checks: [
          {
            id: 'pc-prod-001',
            name: 'Active SKU count',
            description: 'Active SKU count within expected band.',
            status: 'pass',
            lastRun: '2026-05-23T09:10:00Z',
            dimension: 'completeness',
          },
        ],
        datasets: [
          {
            id: 'ds-product-dim',
            name: 'dim_product',
            schema: 'analytics.product',
            rowCount: 1_240_000,
            freshness: '2026-05-23T09:04:00Z',
            ownerId: 'u2',
            checks: [
              {
                id: 'dc-prod-003',
                name: 'Primary key uniqueness',
                description: 'product_key unique per effective date.',
                status: 'fail',
                lastRun: '2026-05-23T09:10:00Z',
                threshold: '0 duplicates',
              },
              {
                id: 'dc-prod-004',
                name: 'Category hierarchy',
                description: 'No orphan category_id references.',
                status: 'pass',
                lastRun: '2026-05-23T09:10:00Z',
              },
            ],
          },
        ],
        lineage: {
          nodes: [
            { id: 'p1', label: 'PIM API', type: 'source' },
            { id: 'p2', label: 'SCD2 Builder', type: 'transform' },
            { id: 'p3', label: 'dim_product', type: 'dataset', datasetId: 'ds-product-dim' },
          ],
          edges: [
            { from: 'p1', to: 'p2' },
            { from: 'p2', to: 'p3' },
          ],
        },
      },
    ],
  },
  {
    id: 'dp-finance-reporting',
    name: 'Finance Reporting',
    description: 'GL balances, sub-ledger reconciliation, and regulatory extracts.',
    domain: 'Finance',
    tier: 'gold',
    ownerId: 'u1',
    sla: 'Business day close by 18:00 UTC',
    pipelines: [
      {
        id: 'pl-gl-balance',
        name: 'gl_balance_daily',
        description: 'Daily general ledger balance snapshot.',
        schedule: '0 17 * * 1-5',
        ownerId: 'u1',
        status: 'healthy',
        lastRun: '2026-05-22T17:08:00Z',
        checks: [
          {
            id: 'pc-fin-001',
            name: 'Trial balance tie-out',
            description: 'Debits equal credits within tolerance.',
            status: 'pass',
            lastRun: '2026-05-22T17:12:00Z',
            dimension: 'accuracy',
          },
        ],
        datasets: [
          {
            id: 'ds-gl-balance',
            name: 'fct_gl_balance',
            schema: 'finance.core',
            rowCount: 4_800_000,
            freshness: '2026-05-22T17:07:00Z',
            ownerId: 'u1',
            checks: [
              {
                id: 'dc-fin-001',
                name: 'Account code valid',
                description: 'account_id exists in chart of accounts.',
                status: 'pass',
                lastRun: '2026-05-22T17:11:00Z',
              },
            ],
          },
        ],
        lineage: {
          nodes: [
            { id: 'f1', label: 'ERP GL', type: 'source' },
            { id: 'f2', label: 'Balance Rollup', type: 'transform' },
            { id: 'f3', label: 'fct_gl_balance', type: 'dataset', datasetId: 'ds-gl-balance' },
            { id: 'f4', label: 'Regulatory Export', type: 'sink' },
          ],
          edges: [
            { from: 'f1', to: 'f2' },
            { from: 'f2', to: 'f3' },
            { from: 'f3', to: 'f4' },
          ],
        },
      },
    ],
  },
];

export function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function findProduct(id: string): DataProduct | undefined {
  return dataProducts.find((p) => p.id === id);
}

export function findPipeline(productId: string, pipelineId: string) {
  const product = findProduct(productId);
  return product?.pipelines.find((p) => p.id === pipelineId);
}

export function findDataset(productId: string, pipelineId: string, datasetId: string) {
  const pipeline = findPipeline(productId, pipelineId);
  return pipeline?.datasets.find((d) => d.id === datasetId);
}

export function countFailingChecks(product: DataProduct): number {
  let count = 0;
  for (const pipeline of product.pipelines) {
    count += pipeline.checks.filter((c) => c.status === 'fail').length;
    for (const dataset of pipeline.datasets) {
      count += dataset.checks.filter((c) => c.status === 'fail').length;
    }
  }
  return count;
}

export function overallHealth(product: DataProduct): 'healthy' | 'degraded' | 'failing' {
  const statuses = product.pipelines.map((p) => p.status);
  if (statuses.some((s) => s === 'failing')) return 'failing';
  if (statuses.some((s) => s === 'degraded')) return 'degraded';
  return 'healthy';
}
