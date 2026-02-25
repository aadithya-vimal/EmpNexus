/**
 * Projects.jsx – Project list + employee assignments
 */
import { useEffect, useState } from 'react';
import { useDB } from '../context/DBContext';
import { Plus, X, FolderKanban, Users } from 'lucide-react';

const STATUS_COLORS = { Active: 'badge-green', Completed: 'badge-blue', 'On Hold': 'badge-yellow' };
const BLANK_PROJ = { name: '', start_date: '', end_date: '', status: 'Active' };
const BLANK_ASSIGN = { emp_id: '', role: '' };

export default function Projects() {
    const { ready, queryAll, runQuery } = useDB();
    const [projects, setProjects] = useState([]);
    const [employees, setEmp] = useState([]);
    const [modal, setModal] = useState(null); // null | 'add' | 'assign'
    const [form, setForm] = useState(BLANK_PROJ);
    const [assignForm, setAssignForm] = useState(BLANK_ASSIGN);
    const [selectedProj, setSelProj] = useState(null);
    const [assignments, setAssignments] = useState([]);

    function load() {
        setProjects(queryAll(`SELECT * FROM Project ORDER BY start_date DESC`));
        setEmp(queryAll('SELECT emp_id,name FROM Employee ORDER BY name'));
    }
    useEffect(() => { if (ready) load(); }, [ready]);

    function loadAssignments(pid) {
        setAssignments(queryAll(`
      SELECT ep.*, e.name
      FROM Employee_Project ep
      JOIN Employee e ON ep.emp_id = e.emp_id
      WHERE ep.project_id = ${pid}
    `));
    }

    function openAssign(proj) {
        setSelProj(proj);
        loadAssignments(proj.project_id);
        setAssignForm(BLANK_ASSIGN);
        setModal('assign');
    }
    function close() { setModal(null); }
    function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }
    function handleAChange(e) { setAssignForm(f => ({ ...f, [e.target.name]: e.target.value })); }

    function saveProject() {
        runQuery(`INSERT INTO Project(name,start_date,end_date,status)
      VALUES('${form.name}','${form.start_date}','${form.end_date || 'NULL'}','${form.status}')`);
        close(); load();
    }

    function addAssignment() {
        const today = new Date().toISOString().slice(0, 10);
        runQuery(`INSERT OR REPLACE INTO Employee_Project(emp_id,project_id,assigned_on,role)
      VALUES(${assignForm.emp_id},${selectedProj.project_id},'${today}','${assignForm.role}')`);
        loadAssignments(selectedProj.project_id);
        setAssignForm(BLANK_ASSIGN);
    }

    function removeAssignment(empId) {
        runQuery(`DELETE FROM Employee_Project WHERE emp_id=${empId} AND project_id=${selectedProj.project_id}`);
        loadAssignments(selectedProj.project_id);
    }

    const getCount = (pid) => queryAll(`SELECT COUNT(*) as c FROM Employee_Project WHERE project_id=${pid}`)[0]?.c ?? 0;

    return (
        <div>
            <div className="page-header">
                <div><h1>Projects</h1><p>Project tracking & assignments</p></div>
                <button className="btn btn-primary" onClick={() => { setForm(BLANK_PROJ); setModal('add') }}><Plus size={14} />New Project</button>
            </div>

            <div className="grid-2" style={{ gap: 16 }}>
                {projects.map(p => (
                    <div key={p.project_id} className="card">
                        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                            <div className="stat-icon orange" style={{ width: 36, height: 36 }}><FolderKanban size={16} /></div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                <div className="text-sm text-muted">{p.start_date} → {p.end_date || 'Ongoing'}</div>
                            </div>
                            <span className={`badge ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                        </div>
                        <div className="flex items-center" style={{ justifyContent: 'space-between' }}>
                            <div className="flex items-center gap-2">
                                <Users size={13} style={{ color: 'var(--text-secondary)' }} />
                                <span className="text-sm text-muted">{getCount(p.project_id)} members</span>
                            </div>
                            <button className="btn btn-sm btn-secondary" onClick={() => openAssign(p)}>Manage Team</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Project Modal */}
            {modal === 'add' && (
                <div className="modal-overlay" onClick={close}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">New Project</h2>
                            <button className="btn btn-icon btn-secondary" onClick={close}><X size={16} /></button>
                        </div>
                        <div className="form-group"><label className="form-label">Project Name</label>
                            <input name="name" className="form-input" value={form.name} onChange={handleChange} /></div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Start Date</label>
                                <input name="start_date" type="date" className="form-input" value={form.start_date} onChange={handleChange} /></div>
                            <div className="form-group"><label className="form-label">End Date</label>
                                <input name="end_date" type="date" className="form-input" value={form.end_date} onChange={handleChange} /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Status</label>
                            <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                                {['Active', 'Completed', 'On Hold'].map(s => <option key={s}>{s}</option>)}</select></div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={close}>Cancel</button>
                            <button className="btn btn-primary" onClick={saveProject}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assignments Modal */}
            {modal === 'assign' && selectedProj && (
                <div className="modal-overlay" onClick={close}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">{selectedProj.name}</h2>
                                <p className="text-sm text-muted">Team management</p>
                            </div>
                            <button className="btn btn-icon btn-secondary" onClick={close}><X size={16} /></button>
                        </div>

                        {/* Add member */}
                        <div className="card" style={{ marginBottom: 16, background: 'var(--bg-secondary)' }}>
                            <div className="card-title" style={{ marginBottom: 12, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Add Member</div>
                            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                                <select name="emp_id" className="form-select" style={{ flex: 1, minWidth: 150 }} value={assignForm.emp_id} onChange={handleAChange}>
                                    <option value="">— Employee —</option>
                                    {employees.map(e => <option key={e.emp_id} value={e.emp_id}>{e.name}</option>)}</select>
                                <input name="role" className="form-input" style={{ flex: 1, minWidth: 120 }} placeholder="Role (e.g. Developer)" value={assignForm.role} onChange={handleAChange} />
                                <button className="btn btn-primary" onClick={addAssignment} disabled={!assignForm.emp_id || !assignForm.role}><Plus size={14} />Add</button>
                            </div>
                        </div>

                        {/* Current members */}
                        <div className="table-wrap">
                            <table>
                                <thead><tr><th>Employee</th><th>Role</th><th>Assigned On</th><th></th></tr></thead>
                                <tbody>
                                    {assignments.map(a => (
                                        <tr key={a.emp_id}>
                                            <td>{a.name}</td>
                                            <td><span className="badge badge-orange">{a.role}</span></td>
                                            <td className="font-mono text-muted">{a.assigned_on}</td>
                                            <td><button className="btn btn-sm btn-danger" onClick={() => removeAssignment(a.emp_id)}><X size={12} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!assignments.length && <div className="empty-state" style={{ padding: 24 }}><p>No members yet.</p></div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
