/**
 * Attendance.jsx – Mark and view attendance records
 */
import { useEffect, useState } from 'react';
import { useDB } from '../context/DBContext';
import { Search, Plus, X } from 'lucide-react';

const STATUSES = ['Present', 'Absent', 'Leave', 'Holiday'];
const STATUS_BADGE = { Present: 'badge-green', Absent: 'badge-red', Leave: 'badge-yellow', Holiday: 'badge-purple' };
const BLANK = { emp_id: '', date: new Date().toISOString().slice(0, 10), status: 'Present' };

export default function Attendance() {
    const { ready, queryAll, runQuery } = useDB();
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [dateFilter, setDateF] = useState('');
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(BLANK);

    function load() {
        setRecords(queryAll(`
      SELECT a.*, e.name
      FROM Attendance a
      JOIN Employee e ON a.emp_id = e.emp_id
      ORDER BY a.date DESC, e.name
    `));
        setEmployees(queryAll('SELECT emp_id,name FROM Employee ORDER BY name'));
    }
    useEffect(() => { if (ready) load(); }, [ready]);

    const filtered = records.filter(r => {
        const matchName = r.name.toLowerCase().includes(search.toLowerCase());
        const matchDate = dateFilter ? r.date === dateFilter : true;
        return matchName && matchDate;
    });

    const summary = { Present: 0, Absent: 0, Leave: 0, Holiday: 0 };
    filtered.forEach(r => summary[r.status] = (summary[r.status] || 0) + 1);

    function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

    function save() {
        runQuery(`INSERT OR REPLACE INTO Attendance(emp_id,date,status)
      VALUES(${form.emp_id},'${form.date}','${form.status}')`);
        setModal(false); load();
    }

    function del(id) { runQuery(`DELETE FROM Attendance WHERE att_id=${id}`); load(); }

    return (
        <div>
            <div className="page-header">
                <div><h1>Attendance</h1><p>Daily attendance tracking</p></div>
                <button className="btn btn-primary" onClick={() => { setForm(BLANK); setModal(true); }}><Plus size={14} />Mark Attendance</button>
            </div>

            {/* Summary pills */}
            <div className="flex gap-2" style={{ marginBottom: 20 }}>
                {Object.entries(summary).map(([k, v]) => (
                    <div key={k} className={`badge ${STATUS_BADGE[k]}`} style={{ padding: '6px 14px', fontSize: 13 }}>{k}: {v}</div>
                ))}
            </div>

            <div className="card">
                <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
                    <div className="search-bar" style={{ flex: 1, minWidth: 200, maxWidth: 300 }}>
                        <Search /><input placeholder="Search employee…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <input type="date" className="form-input" style={{ width: 180 }} value={dateFilter} onChange={e => setDateF(e.target.value)} />
                    {dateFilter && <button className="btn btn-secondary btn-sm" onClick={() => setDateF('')}>Clear Date</button>}
                    <span className="text-sm text-muted">{filtered.length} records</span>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>#</th><th>Employee</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.map(r => (
                                <tr key={r.att_id}>
                                    <td className="text-muted font-mono">{r.att_id}</td>
                                    <td>{r.name}</td>
                                    <td className="font-mono">{r.date}</td>
                                    <td><span className={`badge ${STATUS_BADGE[r.status]}`}>{r.status}</span></td>
                                    <td><button className="btn btn-sm btn-danger" onClick={() => del(r.att_id)}><X size={12} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!filtered.length && <div className="empty-state" style={{ padding: 32 }}><p>No records found.</p></div>}
                </div>
            </div>

            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Mark Attendance</h2>
                            <button className="btn btn-icon btn-secondary" onClick={() => setModal(false)}><X size={16} /></button>
                        </div>
                        <div className="form-group"><label className="form-label">Employee</label>
                            <select name="emp_id" className="form-select" value={form.emp_id} onChange={handleChange}>
                                <option value="">— Select —</option>
                                {employees.map(e => <option key={e.emp_id} value={e.emp_id}>{e.name}</option>)}</select></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Date</label>
                                <input name="date" type="date" className="form-input" value={form.date} onChange={handleChange} /></div>
                            <div className="form-group"><label className="form-label">Status</label>
                                <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                                    {STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
