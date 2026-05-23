import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const nav = [
  { to: '/', label: 'Overview', end: true },
  { to: '/products', label: 'Data Products' },
  { to: '/incidents', label: 'Incidents' },
];

export function Layout() {
  const { incidents, currentUser } = useApp();
  const openIncidents = incidents.filter((i) => i.status !== 'resolved').length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon" aria-hidden>
            ◈
          </div>
          <div>
            <strong>Data Control Tower</strong>
            <span className="brand-sub">Acme Corp</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
              {item.to === '/incidents' && openIncidents > 0 && (
                <span className="nav-badge">{openIncidents}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">{currentUser.name.charAt(0)}</div>
          <div>
            <div className="user-name">{currentUser.name}</div>
            <div className="user-role">{currentUser.role}</div>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
