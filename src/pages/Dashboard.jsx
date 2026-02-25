/**
 * Dashboard.jsx – Summary stat cards + quick links
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDB } from '../context/DBContext';
import { Users, Building2, FolderKanban, FileText, CalendarCheck, Wallet, Terminal, Database } from 'lucide-react';

export default function Dashboard() {
    const { ready, queryAll } = useDB();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('empnexus_user') || '{}');
    const [stats, setStats] = useState({});

    useEffect(() => {
        if (!ready) return;
        const empCount = queryAll('SELECT COUNT(*) as c FROM Employee')[0]?.c ?? 0;
        const deptCount = queryAll('SELECT COUNT(*) as c FROM Department')[0]?.c ?? 0;
        const projCount = queryAll("SELECT COUNT(*) as c FROM Project WHERE status = 'Active'")[0]?.c ?? 0;
        const leaveCount = queryAll("SELECT COUNT(*) as c FROM Leave WHERE status = 'Pending'")[0]?.c ?? 0;
        const attToday = queryAll("SELECT COUNT(*) as c FROM Attendance WHERE status='Present' AND date = date('now')")[0]?.c ?? 0;
        const payTotal = queryAll("SELECT SUM(net_salary) as s FROM Payroll WHERE month = '2025-01'")[0]?.s ?? 0;
        setStats({ empCount, deptCount, projCount, leaveCount, attToday, payTotal });
    }, [ready]);

    const CARDS = [
        { label: 'Total Employees', value: stats.empCount, color: 'blue', icon: Users, path: '/employees' },
        { label: 'Departments', value: stats.deptCount, color: 'green', icon: Building2, path: '/departments' },
        { label: 'Active Projects', value: stats.projCount, color: 'orange', icon: FolderKanban, path: '/projects' },
        { label: 'Pending Leaves', value: stats.leaveCount, color: 'red', icon: FileText, path: '/leaves' },
        { label: 'Present Today', value: stats.attToday, color: 'purple', icon: CalendarCheck, path: '/attendance' },
        { label: 'Jan 2025 Payroll', value: stats.payTotal ? `₹${(stats.payTotal / 100000).toFixed(1)}L` : '—', color: 'blue', icon: Wallet, path: '/payroll' },
    ];

    const QUICK = [
        { icon: Terminal, label: 'SQL Editor', sub: 'Query the raw database', path: '/sql', color: 'orange' },
        { icon: Database, label: 'Schema Viewer', sub: 'ER diagram & DDL', path: '/schema', color: 'purple' },
        { icon: Wallet, label: 'Salary Slips', sub: 'Generate payslips', path: '/payroll', color: 'green' },
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Good day, {user.name?.split(' ')[0] || 'User'} 👋</h1>
                    <p>Here's what's happening in your organization today.</p>
                </div>
            </div>

            <div className="stats-grid">
                {CARDS.map(({ label, value, color, icon: Icon, path }) => (
                    <div key={label} className={`stat-card ${color}`} style={{ cursor: 'pointer' }} onClick={() => navigate(path)}>
                        <div className={`stat-icon ${color}`}><Icon size={18} /></div>
                        <div className="stat-value">{value ?? '—'}</div>
                        <div className="stat-label">{label}</div>
                    </div>
                ))}
            </div>

            <div className="grid-3" style={{ gap: 16 }}>
                {QUICK.map(({ icon: Icon, label, sub, path, color }) => (
                    <div key={label} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(path)}>
                        <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                            <div className={`stat-icon ${color}`} style={{ width: 32, height: 32 }}><Icon size={15} /></div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
                                <div className="text-sm text-muted">{sub}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
