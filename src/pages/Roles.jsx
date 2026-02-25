/**
 * Roles.jsx – CRUD for roles
 */
import { useEffect, useState } from 'react';
import { useDB } from '../context/DBContext';
import { Plus, Pencil, Trash2, X, Shield } from 'lucide-react';

const BLANK = { role_name: '', title: '' };

export default function Roles() {
    const { ready, queryAll, runQuery } = useDB();
    const [roles, setRoles] = useState([]);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(BLANK);
    const [editId, setEditId] = useState(null);

    function load() { setRoles(queryAll('SELECT * FROM Role ORDER BY role_name')); }
    useEffect(() => { if (ready) load(); }, [ready]);

    function openAdd() { setForm(BLANK); setEditId(null); setModal('add'); }
    function openEdit(r) { setForm({ role_name: r.role_name, title: r.title }); setEditId(r.role_id); setModal('edit'); }
    function close() { setModal(null); }
    function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

    function save() {
        if (modal === 'add') {
            runQuery(`INSERT INTO Role(role_name,title) VALUES('${form.role_name}','${form.title}')`);
        } else {
            runQuery(`UPDATE Role SET role_name='${form.role_name}',title='${form.title}' WHERE role_id=${editId}`);
        }
        close(); load();
    }

    function del(id) {
        if (!confirm('Delete role?')) return;
        runQuery(`DELETE FROM Role WHERE role_id=${id}`);
        load();
    }

    const COLORS = ['blue', 'green', 'orange', 'purple', 'red', 'yellow', 'gray'];

    return (
        <div>
            <div className="page-header">
                <div><h1>Roles</h1><p>Job roles & access titles</p></div>
                <button className="btn btn-primary" onClick={openAdd}><Plus size={14} />Add Role</button>
            </div>

            <div className="card">
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>#</th><th>Role Key</th><th>Title</th><th>Users</th><th>Actions</th></tr></thead>
                        <tbody>
                            {roles.map((r, i) => {
                                const userCnt = queryAll(`SELECT COUNT(*) as c FROM Login WHERE role_id=${r.role_id}`)[0]?.c ?? 0;
                                return (
                                    <tr key={r.role_id}>
                                        <td className="text-muted font-mono">{r.role_id}</td>
                                        <td><span className={`badge badge-${COLORS[i % COLORS.length]}`}>{r.role_name}</span></td>
                                        <td>{r.title}</td>
                                        <td><span className="badge badge-gray">{userCnt} users</span></td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button className="btn btn-sm btn-secondary" onClick={() => openEdit(r)}><Pencil size={12} /></button>
                                                <button className="btn btn-sm btn-danger" onClick={() => del(r.role_id)}><Trash2 size={12} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <div className="modal-overlay" onClick={close}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{modal === 'add' ? 'Add Role' : 'Edit Role'}</h2>
                            <button className="btn btn-icon btn-secondary" onClick={close}><X size={16} /></button>
                        </div>
                        <div className="form-group"><label className="form-label">Role Key (slug)</label>
                            <input name="role_name" className="form-input" placeholder="e.g. manager" value={form.role_name} onChange={handleChange} /></div>
                        <div className="form-group"><label className="form-label">Display Title</label>
                            <input name="title" className="form-input" placeholder="e.g. Department Manager" value={form.title} onChange={handleChange} /></div>
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
