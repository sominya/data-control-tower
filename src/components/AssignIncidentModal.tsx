import { useState } from 'react';
import type { Incident } from '../types';
import { useApp } from '../context/AppContext';

interface AssignIncidentModalProps {
  incident: Incident | null;
  onClose: () => void;
}

export function AssignIncidentModal({ incident, onClose }: AssignIncidentModalProps) {
  const { users, assignIncident } = useApp();
  const [assigneeId, setAssigneeId] = useState(incident?.assigneeId ?? '');

  if (!incident) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignIncident(incident.id, assigneeId || null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="assign-title"
      >
        <h2 id="assign-title">Assign incident</h2>
        <p className="modal-sub">{incident.title}</p>
        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="assignee">
            Assign to
          </label>
          <select
            id="assignee"
            className="field-input"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.role}
              </option>
            ))}
          </select>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
