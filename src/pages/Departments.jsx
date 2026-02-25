/**
 * Departments.jsx – CRUD for departments
 */
import { useEffect, useState } from 'react';
import { useDB } from '../context/DBContext';
import { Plus, Pencil, Trash2, X, Building2 } from 'lucide-react';

const BLANK = { dept_name: '', location: '' };

export default function Departments() {
    const { ready, queryAll, runQuery } = useDB();
    const [depts, setDepts] = useState([]);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(BLANK);
    const [editId, setEditId] = useState(null);

    function load() { setDepts(queryAll('SELECT * FROM Department ORDER BY dept_name')); }
    useEffect(() => { if (ready) load(); }, [ready]);

    function openAdd() { setForm(BLANK); setEditId(null); setModal('add'); }
    function openEdit(d) { setForm({ dept_name: d.dept_name, location: d.location }); setEditId(d.dept_id); setModal('edit'); }
    function close() { setModal(null); }
    function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

    function save() {
        if (modal === 'add') {
            runQuery(`INSERT INTO Department(dept_name,location) VALUES('${form.dept_name}','${form.location}')`);
        } else {
            runQuery(`UPDATE Department SET dept_name='${form.dept_name}',location='${form.location}' WHERE dept_id=${editId}`);
        }
        close(); load();
    }

    function del(id) {
        if (!confirm('Delete department?')) return;
        runQuery(`DELETE FROM Department WHERE dept_id=${id}`);
        load();
    }

    const empCounts = depts.reduce((acc, d) => {
        const cnt = queryAll(`SELECT COUNT(*) as c FROM Employee WHERE dept_id=${d.dept_id}`)[0]?.c ?? 0;
        acc[d.dept_id] = cnt;
        return acc;
    }, {});

    return (
        <div>
            <div className="page-header">
                <div><h1>Departments</h1><p>Organisational structure</p></div>
                <button className="btn btn-primary" onClick={openAdd}><Plus size={14} />Add Department</button>
            </div>

            <div className="grid-3">
                {depts.map(d => (
                    <div key={d.dept_id} className="card">
                        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                            <div className="stat-icon blue" style={{ width: 36, height: 36 }}><Building2 size={16} /></div>
                            <div>
                                <div style={{ fontWeight: 700 }}>{d.dept_name}</div>
                                <div className="text-sm text-muted">{d.location}</div>
                            </div>
                        </div>
                        <div className="flex items-center" style={{ justifyContent: 'space-between' }}>
                            <span className="badge badge-blue">{empCounts[d.dept_id] ?? 0} employees</span>
                            <div className="flex gap-2">
                                <button className="btn btn-sm btn-secondary" onClick={() => openEdit(d)}><Pencil size={12} /></button>
                                <button className="btn btn-sm btn-danger" onClick={() => del(d.dept_id)}><Trash2 size={12} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {modal && (
                <div className="modal-overlay" onClick={close}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{modal === 'add' ? 'Add Department' : 'Edit Department'}</h2>
                            <button className="btn btn-icon btn-secondary" onClick={close}><X size={16} /></button>
                        </div>
                        <div className="form-group"><label className="form-label">Department Name</label>
                            <input name="dept_name" className="form-input" value={form.dept_name} onChange={handleChange} /></div>
                        <div className="form-group"><label className="form-label">Location</label>
                            <input name="location" className="form-input" value={form.location} onChange={handleChange} /></div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={close}>Cancel</button>
                            <button className="btn btn-primary" onClick={save}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
