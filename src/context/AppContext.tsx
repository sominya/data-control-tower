import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { dataProducts, initialIncidents, users } from '../data/mockData';
import type { DataProduct, Incident, IncidentStatus, Severity, User } from '../types';

interface AppContextValue {
  products: DataProduct[];
  incidents: Incident[];
  users: User[];
  currentUser: User;
  assignIncident: (incidentId: string, assigneeId: string | null) => void;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus) => void;
  createIncidentFromCheck: (params: {
    checkId: string;
    checkName: string;
    pipelineId: string;
    pipelineName: string;
    productId: string;
    productName: string;
    severity: Severity;
    title: string;
  }) => Incident;
  setProductOwner: (productId: string, ownerId: string) => void;
  setPipelineOwner: (productId: string, pipelineId: string, ownerId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<DataProduct[]>(dataProducts);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const currentUser = users[0];

  const assignIncident = useCallback((incidentId: string, assigneeId: string | null) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? { ...inc, assigneeId, updatedAt: new Date().toISOString() }
          : inc,
      ),
    );
  }, []);

  const updateIncidentStatus = useCallback((incidentId: string, status: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? { ...inc, status, updatedAt: new Date().toISOString() }
          : inc,
      ),
    );
  }, []);

  const createIncidentFromCheck = useCallback(
    (params: {
      checkId: string;
      checkName: string;
      pipelineId: string;
      pipelineName: string;
      productId: string;
      productName: string;
      severity: Severity;
      title: string;
    }) => {
      const incident: Incident = {
        id: `inc-${Date.now()}`,
        title: params.title,
        checkId: params.checkId,
        checkName: params.checkName,
        pipelineId: params.pipelineId,
        pipelineName: params.pipelineName,
        productId: params.productId,
        productName: params.productName,
        status: 'open',
        severity: params.severity,
        assigneeId: null,
        reporterId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: 'Opened from Data Control Tower.',
      };
      setIncidents((prev) => [incident, ...prev]);
      return incident;
    },
    [currentUser.id],
  );

  const setProductOwner = useCallback((productId: string, ownerId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ownerId } : p)),
    );
  }, []);

  const setPipelineOwner = useCallback(
    (productId: string, pipelineId: string, ownerId: string) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id !== productId
            ? p
            : {
                ...p,
                pipelines: p.pipelines.map((pl) =>
                  pl.id === pipelineId ? { ...pl, ownerId } : pl,
                ),
              },
        ),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      products,
      incidents,
      users,
      currentUser,
      assignIncident,
      updateIncidentStatus,
      createIncidentFromCheck,
      setProductOwner,
      setPipelineOwner,
    }),
    [
      products,
      incidents,
      currentUser,
      assignIncident,
      updateIncidentStatus,
      createIncidentFromCheck,
      setProductOwner,
      setPipelineOwner,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
