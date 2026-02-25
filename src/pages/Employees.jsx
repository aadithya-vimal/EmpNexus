/**
 * Employees.jsx – Full CRUD for employees
 */
import { useEffect, useState } from 'react';
import { useDB } from '../context/DBContext';
import { Plus, Search, Pencil, Trash2, X, UserCircle2 } from 'lucide-react';

const GENDERS = ['Male', 'Female', 'Other'];
const BLANK = { name: '', address: '', gender: 'Male', email: '', phone: '', dob: '', dept_id: '', salary: '' };

export default function Employees() {
    const { ready, queryAll, runQuery } = useDB();
    const [employees, setEmployees] = useState([]);
    const [depts, setDepts] = useState([]);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null); // null | 'add' | 'edit'
    const [form, setForm] = useState(BLANK);
    const [editId, setEditId] = useState(null);

    function load() {
        const rows = queryAll(`
      SELECT e.*, d.dept_name
      FROM Employee e
      LEFT JOIN Department d ON e.dept_id = d.dept_id
      ORDER BY e.emp_id
    `);
        setEmployees(rows);
        setDepts(queryAll('SELECT * FROM Department ORDER BY dept_name'));
    }

    useEffect(() => { if (ready) load(); }, [ready]);

    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        (e.dept_name || '').toLowerCase().includes(search.toLowerCase())
    );

    function openAdd() { setForm(BLANK); setEditId(null); setModal('add'); }
    function openEdit(e) {
        setForm({ name: e.name, address: e.address || '', gender: e.gender || 'Male', email: e.email, phone: e.phone || '', dob: e.dob || '', dept_id: e.dept_id || '', salary: e.salary });
        setEditId(e.emp_id);
        setModal('edit');
    }
    function closeModal() { setModal(null); }

    function handleChange(ev) { setForm(f => ({ ...f, [ev.target.name]: ev.target.value })); }

    function handleSave() {
        if (modal === 'add') {
            runQuery(`INSERT INTO Employee (name,address,gender,email,phone,dob,dept_id,salary)
        VALUES ('${form.name}','${form.address}','${form.gender}','${form.email}','${form.phone}','${form.dob}',${form.dept_id || 'NULL'},${form.salary || 0})`);
        } else {
            runQuery(`UPDATE Employee SET name='${form.name}',address='${form.address}',gender='${form.gender}',
        email='${form.email}',phone='${form.phone}',dob='${form.dob}',
        dept_id=${form.dept_id || 'NULL'},salary=${form.salary || 0}
        WHERE emp_id=${editId}`);
        }
        closeModal(); load();
    }

    function handleDelete(id) {
        if (!confirm('Delete this employee and all their records?')) return;
        runQuery(`DELETE FROM Login          WHERE emp_id=${id}`);
        runQuery(`DELETE FROM Payroll        WHERE emp_id=${id}`);
        runQuery(`DELETE FROM Attendance     WHERE emp_id=${id}`);
        runQuery(`DELETE FROM Leave          WHERE emp_id=${id}`);
        runQuery(`DELETE FROM Employee_Project WHERE emp_id=${id}`);
        runQuery(`DELETE FROM Employee       WHERE emp_id=${id}`);
        load();
    }

    return (
        <div>
            <div className="page-header">
                <div><h1>Employees</h1><p>Manage your workforce</p></div>
                <button id="add-employee-btn" className="btn btn-primary" onClick={openAdd}><Plus size={14} />Add Employee</button>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
                        <Search /><input placeholder="Search by name, email, department…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <span className="text-sm text-muted">{filtered.length} employees</span>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead><tr>
                            <th>#</th><th>Name</th><th>Department</th><th>Email</th>
                            <th>Phone</th><th>Gender</th><th>Salary</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                            {filtered.map(e => (
                                <tr key={e.emp_id}>
                                    <td className="text-muted font-mono">{e.emp_id}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                                                {e.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                            </div>
                                            {e.name}
                                        </div>
                                    </td>
                                    <td><span className="badge badge-blue">{e.dept_name || '—'}</span></td>
                                    <td className="text-muted">{e.email}</td>
                                    <td>{e.phone}</td>
                                    <td><span className={`badge ${e.gender === 'Female' ? 'badge-purple' : e.gender === 'Other' ? 'badge-orange' : 'badge-blue'}`}>{e.gender}</span></td>
                                    <td className="font-mono">₹{Number(e.salary).toLocaleString()}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn btn-sm btn-secondary" onClick={() => openEdit(e)}><Pencil size={12} /></button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(e.emp_id)}><Trash2 size={12} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!filtered.length && (
                        <div className="empty-state"><UserCircle2 /><h3>No employees found</h3></div>
                    )}
                </div>
            </div>

            {modal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{modal === 'add' ? 'Add Employee' : 'Edit Employee'}</h2>
                            <button className="btn btn-icon btn-secondary" onClick={closeModal}><X size={16} /></button>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Full Name</label>
                                <input name="name" className="form-input" value={form.name} onChange={handleChange} /></div>
                            <div className="form-group"><label className="form-label">Email</label>
                                <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Phone</label>
                                <input name="phone" className="form-input" value={form.phone} onChange={handleChange} /></div>
                            <div className="form-group"><label className="form-label">DOB</label>
                                <input name="dob" type="date" className="form-input" value={form.dob} onChange={handleChange} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Gender</label>
                                <select name="gender" className="form-select" value={form.gender} onChange={handleChange}>
                                    {GENDERS.map(g => <option key={g}>{g}</option>)}</select></div>
                            <div className="form-group"><label className="form-label">Department</label>
                                <select name="dept_id" className="form-select" value={form.dept_id} onChange={handleChange}>
                                    <option value="">— None —</option>
                                    {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}</select></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Salary (₹)</label>
                                <input name="salary" type="number" className="form-input" value={form.salary} onChange={handleChange} /></div>
                            <div className="form-group"><label className="form-label">Address</label>
                                <input name="address" className="form-input" value={form.address} onChange={handleChange} /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
