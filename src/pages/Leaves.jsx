/**
 * Leaves.jsx – Leave requests with approve / reject actions
 */
import { useEffect, useState } from 'react';
import { useDB } from '../context/DBContext';
import { Plus, Check, X, Search } from 'lucide-react';

const TYPES = ['Sick', 'Casual', 'Earned', 'Maternity', 'Unpaid'];
const STATUSES = ['Pending', 'Approved', 'Rejected'];
const STATUS_BADGE = { Pending: 'badge-yellow', Approved: 'badge-green', Rejected: 'badge-red' };
const BLANK = { emp_id: '', start_date: '', end_date: '', leave_type: 'Casual', reason: '' };

export default function Leaves() {
    const { ready, queryAll, runQuery } = useDB();
    const [leaves, setLeaves] = useState([]);
    const [employees, setEmp] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setSF] = useState('');
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(BLANK);

    function load() {
        setLeaves(queryAll(`
      SELECT lv.*, e.name
      FROM Leave lv
      JOIN Employee e ON lv.emp_id = e.emp_id
      ORDER BY lv.leave_id DESC
    `));
        setEmp(queryAll('SELECT emp_id,name FROM Employee ORDER BY name'));
    }
    useEffect(() => { if (ready) load(); }, [ready]);

    const filtered = leaves.filter(l => {
        const matchName = l.name.toLowerCase().includes(search.toLowerCase());
        const matchStat = statusFilter ? l.status === statusFilter : true;
        return matchName && matchStat;
    });

    function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

    function save() {
        runQuery(`INSERT INTO Leave(emp_id,start_date,end_date,leave_type,reason,status)
      VALUES(${form.emp_id},'${form.start_date}','${form.end_date}','${form.leave_type}','${form.reason}','Pending')`);
        setModal(false); load();
    }

    function setStatus(id, s) {
        runQuery(`UPDATE Leave SET status='${s}' WHERE leave_id=${id}`);
        load();
    }

    const pending = leaves.filter(l => l.status === 'Pending').length;
    const approved = leaves.filter(l => l.status === 'Approved').length;
    const rejected = leaves.filter(l => l.status === 'Rejected').length;

    return (
        <div>
            <div className="page-header">
                <div><h1>Leave Management</h1><p>Requests & approvals</p></div>
                <button className="btn btn-primary" onClick={() => { setForm(BLANK); setModal(true); }}><Plus size={14} />New Request</button>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
                {[['Pending', pending, 'yellow'], ['Approved', approved, 'green'], ['Rejected', rejected, 'red']].map(([label, val, color]) => (
                    <div key={label} className={`stat-card ${color}`} style={{ cursor: 'pointer' }} onClick={() => setSF(label === 'All' ? '' : label)}>
                        <div className="stat-value" style={{ fontSize: 24 }}>{val}</div>
                        <div className="stat-label">{label} Leaves</div>
                    </div>
                ))}
            </div>

            <div className="card">
                <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
                    <div className="search-bar" style={{ flex: 1, minWidth: 200, maxWidth: 300 }}>
                        <Search /><input placeholder="Search employee…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={e => setSF(e.target.value)}>
                        <option value="">All statuses</option>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <span className="text-sm text-muted">{filtered.length} requests</span>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead><tr>
                            <th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                            {filtered.map(l => (
                                <tr key={l.leave_id}>
                                    <td>{l.name}</td>
                                    <td><span className="badge badge-purple">{l.leave_type}</span></td>
                                    <td className="font-mono">{l.start_date}</td>
                                    <td className="font-mono">{l.end_date}</td>
                                    <td className="text-muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                                    <td><span className={`badge ${STATUS_BADGE[l.status]}`}>{l.status}</span></td>
                                    <td>
                                        {l.status === 'Pending' && (
                                            <div className="flex gap-2">
                                                <button className="btn btn-sm btn-success" onClick={() => setStatus(l.leave_id, 'Approved')} title="Approve"><Check size={12} /></button>
                                                <button className="btn btn-sm btn-danger" onClick={() => setStatus(l.leave_id, 'Rejected')} title="Reject"><X size={12} /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!filtered.length && <div className="empty-state" style={{ padding: 32 }}><p>No leave requests found.</p></div>}
                </div>
            </div>

            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">New Leave Request</h2>
                            <button className="btn btn-icon btn-secondary" onClick={() => setModal(false)}><X size={16} /></button>
                        </div>
                        <div className="form-group"><label className="form-label">Employee</label>
                            <select name="emp_id" className="form-select" value={form.emp_id} onChange={handleChange}>
                                <option value="">— Select —</option>
                                {employees.map(e => <option key={e.emp_id} value={e.emp_id}>{e.name}</option>)}</select></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Start Date</label>
                                <input name="start_date" type="date" className="form-input" value={form.start_date} onChange={handleChange} /></div>
                            <div className="form-group"><label className="form-label">End Date</label>
                                <input name="end_date" type="date" className="form-input" value={form.end_date} onChange={handleChange} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Leave Type</label>
                            <select name="leave_type" className="form-select" value={form.leave_type} onChange={handleChange}>
                                {TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                        <div className="form-group"><label className="form-label">Reason</label>
                            <textarea name="reason" className="form-textarea" value={form.reason} onChange={handleChange} /></div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save}>Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
