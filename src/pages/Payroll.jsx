/**
 * Payroll.jsx – Payroll table + printable salary slip modal
 */
import { useEffect, useRef, useState } from 'react';
import { useDB } from '../context/DBContext';
import { Plus, Search, FileText, Printer, X } from 'lucide-react';

const MONTHS = ['2025-01', '2025-02', '2025-03', '2024-12', '2024-11', '2024-10'];
const BLANK = { emp_id: '', month: '2025-01', basic_salary: '', allowances: '', deductions: '' };

export default function Payroll() {
    const { ready, queryAll, runQuery } = useDB();
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [monthFilter, setMonthF] = useState('');
    const [modal, setModal] = useState(null); // null | 'add' | 'slip'
    const [form, setForm] = useState(BLANK);
    const [slip, setSlip] = useState(null);
    const slipRef = useRef();

    function load() {
        setRecords(queryAll(`
      SELECT p.*, e.name, e.email, e.phone, d.dept_name
      FROM Payroll p
      JOIN Employee e ON p.emp_id = e.emp_id
      LEFT JOIN Department d ON e.dept_id = d.dept_id
      ORDER BY p.month DESC, e.name
    `));
        setEmployees(queryAll('SELECT emp_id, name FROM Employee ORDER BY name'));
    }

    useEffect(() => { if (ready) load(); }, [ready]);

    const filtered = records.filter(r => {
        const q = search.toLowerCase();
        const matchName = r.name.toLowerCase().includes(q);
        const matchMonth = monthFilter ? r.month === monthFilter : true;
        return matchName && matchMonth;
    });

    function openSlip(r) { setSlip(r); setModal('slip'); }
    function openAdd() { setForm(BLANK); setModal('add'); }
    function close() { setModal(null); }
    function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

    function save() {
        const net = Number(form.basic_salary) + Number(form.allowances) - Number(form.deductions);
        runQuery(`INSERT INTO Payroll(emp_id,month,basic_salary,allowances,deductions)
      VALUES(${form.emp_id},'${form.month}',${form.basic_salary},${form.allowances || 0},${form.deductions || 0})`);
        close(); load();
    }

    function handlePrint() { window.print(); }

    const months = [...new Set(records.map(r => r.month))].sort().reverse();

    return (
        <div>
            <div className="page-header">
                <div><h1>Payroll</h1><p>Salary records & slip generation</p></div>
                <button className="btn btn-primary" onClick={openAdd}><Plus size={14} />Add Payroll</button>
            </div>

            <div className="card">
                <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
                    <div className="search-bar" style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
                        <Search /><input placeholder="Search employee…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="form-select" style={{ width: 160 }} value={monthFilter} onChange={e => setMonthF(e.target.value)}>
                        <option value="">All months</option>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <span className="text-sm text-muted">{filtered.length} records</span>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead><tr>
                            <th>Employee</th><th>Department</th><th>Month</th>
                            <th>Basic</th><th>Allowances</th><th>Deductions</th><th>Net Salary</th><th>Slip</th>
                        </tr></thead>
                        <tbody>
                            {filtered.map(r => (
                                <tr key={r.payroll_id}>
                                    <td>{r.name}</td>
                                    <td><span className="badge badge-blue">{r.dept_name || '—'}</span></td>
                                    <td className="font-mono">{r.month}</td>
                                    <td className="font-mono">₹{Number(r.basic_salary).toLocaleString()}</td>
                                    <td className="font-mono" style={{ color: 'var(--success)' }}>+₹{Number(r.allowances).toLocaleString()}</td>
                                    <td className="font-mono" style={{ color: 'var(--danger)' }}>-₹{Number(r.deductions).toLocaleString()}</td>
                                    <td className="font-mono" style={{ fontWeight: 700, color: 'var(--success)' }}>₹{Number(r.net_salary).toLocaleString()}</td>
                                    <td>
                                        <button className="btn btn-sm btn-secondary" onClick={() => openSlip(r)}>
                                            <FileText size={12} /> Slip
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!filtered.length && <div className="empty-state" style={{ padding: 32 }}><p>No payroll records found.</p></div>}
                </div>
            </div>

            {/* Add Payroll Modal */}
            {modal === 'add' && (
                <div className="modal-overlay" onClick={close}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add Payroll Record</h2>
                            <button className="btn btn-icon btn-secondary" onClick={close}><X size={16} /></button>
                        </div>
                        <div className="form-group"><label className="form-label">Employee</label>
                            <select name="emp_id" className="form-select" value={form.emp_id} onChange={handleChange}>
                                <option value="">— Select —</option>
                                {employees.map(e => <option key={e.emp_id} value={e.emp_id}>{e.name}</option>)}
                            </select></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Month</label>
                                <select name="month" className="form-select" value={form.month} onChange={handleChange}>
                                    {MONTHS.map(m => <option key={m}>{m}</option>)}</select></div>
                            <div className="form-group"><label className="form-label">Basic Salary</label>
                                <input name="basic_salary" type="number" className="form-input" value={form.basic_salary} onChange={handleChange} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Allowances</label>
                                <input name="allowances" type="number" className="form-input" value={form.allowances} onChange={handleChange} /></div>
                            <div className="form-group"><label className="form-label">Deductions</label>
                                <input name="deductions" type="number" className="form-input" value={form.deductions} onChange={handleChange} /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={close}>Cancel</button>
                            <button className="btn btn-primary" onClick={save}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Salary Slip Modal */}
            {modal === 'slip' && slip && (
                <div className="modal-overlay" onClick={close}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()} ref={slipRef}>
                        <div className="modal-header">
                            <h2 className="modal-title">Salary Slip</h2>
                            <div className="flex gap-2">
                                <button className="btn btn-primary btn-sm" onClick={handlePrint}><Printer size={13} />Print</button>
                                <button className="btn btn-icon btn-secondary" onClick={close}><X size={16} /></button>
                            </div>
                        </div>

                        <div className="slip">
                            <div className="slip-header">
                                <h2>EmpNexus HR</h2>
                                <p>Salary Slip for {slip.month}</p>
                                <p style={{ fontSize: 11, marginTop: 4, color: 'var(--text-muted)' }}>Generated on {new Date().toLocaleDateString('en-IN')}</p>
                            </div>

                            <div className="slip-info">
                                <div>
                                    <div className="slip-info-row"><span className="slip-info-label">Employee Name</span><span className="slip-info-value">{slip.name}</span></div>
                                    <div className="slip-info-row"><span className="slip-info-label">Email</span><span className="slip-info-value">{slip.email}</span></div>
                                    <div className="slip-info-row"><span className="slip-info-label">Phone</span><span className="slip-info-value">{slip.phone}</span></div>
                                </div>
                                <div>
                                    <div className="slip-info-row"><span className="slip-info-label">Department</span><span className="slip-info-value">{slip.dept_name || '—'}</span></div>
                                    <div className="slip-info-row"><span className="slip-info-label">Employee ID</span><span className="slip-info-value font-mono">EMP-{String(slip.emp_id).padStart(4, '0')}</span></div>
                                    <div className="slip-info-row"><span className="slip-info-label">Pay Period</span><span className="slip-info-value">{slip.month}</span></div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="slip-section">
                                    <h4>Earnings</h4>
                                    <div className="slip-row"><span>Basic Salary</span><span>₹{Number(slip.basic_salary).toLocaleString()}</span></div>
                                    <div className="slip-row"><span>HRA (40% of Basic)</span><span>₹{(Number(slip.basic_salary) * 0.4).toFixed(0)}</span></div>
                                    <div className="slip-row"><span>Other Allowances</span><span>₹{Number(slip.allowances).toLocaleString()}</span></div>
                                    <div className="slip-total"><span>Gross Earnings</span><span>₹{(Number(slip.basic_salary) + Number(slip.allowances)).toLocaleString()}</span></div>
                                </div>
                                <div className="slip-section">
                                    <h4>Deductions</h4>
                                    <div className="slip-row"><span>Provident Fund (12%)</span><span>₹{(Number(slip.basic_salary) * 0.12).toFixed(0)}</span></div>
                                    <div className="slip-row"><span>Professional Tax</span><span>₹200</span></div>
                                    <div className="slip-row"><span>Other Deductions</span><span>₹{Math.max(0, Number(slip.deductions) - Number(slip.basic_salary) * 0.12 - 200).toFixed(0)}</span></div>
                                    <div className="slip-total"><span>Total Deductions</span><span>₹{Number(slip.deductions).toLocaleString()}</span></div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', marginTop: 24, padding: '16px', background: 'var(--success-dim)', borderRadius: 'var(--radius)', border: '1px solid rgba(63,185,80,0.3)' }}>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>NET SALARY PAYABLE</div>
                                <div className="slip-net">₹{Number(slip.net_salary).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
