import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, Building2, Briefcase, CreditCard,
    CalendarCheck, CalendarOff, FolderKanban, Database, Code2, LogOut,
} from 'lucide-react';

const NAV_MAIN = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employees', icon: Users, label: 'Employees' },
    { to: '/departments', icon: Building2, label: 'Departments' },
    { to: '/roles', icon: Briefcase, label: 'Roles' },
    { to: '/payroll', icon: CreditCard, label: 'Payroll' },
    { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/leaves', icon: CalendarOff, label: 'Leaves' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
];

const NAV_DEV = [
    { to: '/schema', icon: Database, label: 'Schema Viewer' },
    { to: '/sql', icon: Code2, label: 'SQL Editor' },
];

const PAGE_TITLES = {
    '/': 'Dashboard', '/employees': 'Employees', '/departments': 'Departments',
    '/roles': 'Roles', '/payroll': 'Payroll', '/attendance': 'Attendance',
    '/leaves': 'Leaves', '/projects': 'Projects', '/schema': 'Schema Viewer', '/sql': 'SQL Editor',
};

export default function AppShell({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('empnexus_user') || 'null');
    const title = PAGE_TITLES[location.pathname] || 'EmpNexus';

    function logout() {
        localStorage.removeItem('empnexus_user');
        navigate('/login');
    }

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div>
                        <div className="brand-name">EmpNexus</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-label">Main</div>
                        {NAV_MAIN.map(({ to, icon: Icon, label }) => (
                            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                <Icon size={15} />{label}
                            </NavLink>
                        ))}
                    </div>
                    <div className="nav-section">
                        <div className="nav-section-label">Developer</div>
                        {NAV_DEV.map(({ to, icon: Icon, label }) => (
                            <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                <Icon size={15} />{label}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {user && (
                    <div className="sidebar-user">
                        <div className="user-row">
                            <div className="user-avatar">{user.name?.[0] ?? '?'}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="user-name truncate">{user.name}</div>
                                <div className="user-role">{user.role}</div>
                            </div>
                        </div>
                        <button className="logout-btn" onClick={logout}>
                            <LogOut size={13} /> Sign out
                        </button>
                    </div>
                )}
            </aside>

            {/* Main */}
            <div className="page-content">
                <header className="topbar">
                    <span className="topbar-title">{title}</span>
                    <span className="topbar-status"><span className="db-dot" />SQLite · sql.js</span>
                </header>
                <main className="page-body">{children}</main>
            </div>
        </div>
    );
}
