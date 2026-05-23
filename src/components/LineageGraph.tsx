import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LineageEdge, LineageNode } from '../types';

interface LineageGraphProps {
  nodes: LineageNode[];
  edges: LineageEdge[];
  productId: string;
  pipelineId: string;
}

const NODE_W = 140;
const NODE_H = 52;
const GAP_X = 48;
const GAP_Y = 72;

function layoutNodes(nodes: LineageNode[], edges: LineageEdge[]) {
  const inDegree = new Map<string, number>();
  const children = new Map<string, string[]>();
  nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    children.set(n.id, []);
  });
  edges.forEach((e) => {
    inDegree.set(e.to, (inDegree.get(e.to) ?? 0) + 1);
    children.get(e.from)?.push(e.to);
  });
  const roots = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0).map((n) => n.id);
  const levels = new Map<string, number>();
  const queue = [...roots];
  roots.forEach((id) => levels.set(id, 0));
  while (queue.length) {
    const id = queue.shift()!;
    const level = levels.get(id) ?? 0;
    for (const child of children.get(id) ?? []) {
      const next = Math.max(level + 1, levels.get(child) ?? 0);
      levels.set(child, next);
      queue.push(child);
    }
  }
  const byLevel = new Map<number, LineageNode[]>();
  nodes.forEach((n) => {
    const lvl = levels.get(n.id) ?? 0;
    if (!byLevel.has(lvl)) byLevel.set(lvl, []);
    byLevel.get(lvl)!.push(n);
  });
  const positions = new Map<string, { x: number; y: number }>();
  let maxLevel = 0;
  byLevel.forEach((_, lvl) => {
    maxLevel = Math.max(maxLevel, lvl);
  });
  byLevel.forEach((levelNodes, lvl) => {
    const totalH = levelNodes.length * NODE_H + (levelNodes.length - 1) * GAP_Y;
    let y = -totalH / 2 + NODE_H / 2;
    levelNodes.forEach((node) => {
      positions.set(node.id, { x: lvl * (NODE_W + GAP_X), y });
      y += NODE_H + GAP_Y;
    });
  });
  let minX = 0,
    maxX = 0,
    minY = 0,
    maxY = 0;
  positions.forEach(({ x, y }) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });
  const pad = 24;
  const width = maxX - minX + NODE_W + pad * 2;
  const height = maxY - minY + NODE_H + pad * 2;
  const offsetX = pad - minX;
  const offsetY = pad - minY + height / 2;
  return { positions, offsetX, offsetY, width, height, maxLevel };
}

export function LineageGraph({ nodes, edges, productId, pipelineId }: LineageGraphProps) {
  const navigate = useNavigate();
  const { positions, offsetX, offsetY, width, height } = useMemo(
    () => layoutNodes(nodes, edges),
    [nodes, edges],
  );

  return (
    <div className="lineage-wrap">
      <svg
        className="lineage-svg"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={Math.min(height, 320)}
        role="img"
        aria-label="Process lineage graph"
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill="var(--text-muted)" />
          </marker>
        </defs>
        {edges.map((e) => {
          const from = positions.get(e.from);
          const to = positions.get(e.to);
          if (!from || !to) return null;
          const x1 = from.x + offsetX + NODE_W;
          const y1 = from.y + offsetY + NODE_H / 2;
          const x2 = to.x + offsetX;
          const y2 = to.y + offsetY + NODE_H / 2;
          const midX = (x1 + x2) / 2;
          return (
            <path
              key={`${e.from}-${e.to}`}
              d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke="var(--border)"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />
          );
        })}
        {nodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const x = pos.x + offsetX;
          const y = pos.y + offsetY;
          const inner = (
            <>
              <rect
                x={x}
                y={y}
                width={NODE_W}
                height={NODE_H}
                rx={8}
                className={`lineage-node lineage-node-${node.type}`}
              />
              <text x={x + NODE_W / 2} y={y + 22} textAnchor="middle" className="lineage-label">
                {node.label.length > 18 ? `${node.label.slice(0, 16)}…` : node.label}
              </text>
              <text x={x + NODE_W / 2} y={y + 38} textAnchor="middle" className="lineage-type">
                {node.type}
              </text>
            </>
          );
          const clickable = Boolean(node.datasetId);
          return (
            <g
              key={node.id}
              className={clickable ? 'lineage-node-clickable' : undefined}
              style={clickable ? { cursor: 'pointer' } : undefined}
              onClick={
                clickable
                  ? () =>
                      navigate(
                        `/products/${productId}/pipelines/${pipelineId}/datasets/${node.datasetId}`,
                      )
                  : undefined
              }
              role={clickable ? 'link' : undefined}
              tabIndex={clickable ? 0 : undefined}
              onKeyDown={
                clickable
                  ? (ev) => {
                      if (ev.key === 'Enter' || ev.key === ' ') {
                        navigate(
                          `/products/${productId}/pipelines/${pipelineId}/datasets/${node.datasetId}`,
                        );
                      }
                    }
                  : undefined
              }
            >
              {inner}
            </g>
          );
        })}
      </svg>
      <div className="lineage-legend">
        {(['source', 'transform', 'dataset', 'sink'] as const).map((t) => (
          <span key={t} className="legend-item">
            <span className={`legend-dot legend-dot-${t}`} />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
