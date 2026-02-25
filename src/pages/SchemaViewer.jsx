import { useState } from 'react';

/* ─── Table Layout Constants ─────────────────────────── */
const TW = 215;  // table box width
const HH = 32;   // header height
const RH = 24;   // row height

/* ─── Table Definitions ──────────────────────────────── */
const TABLES = [
    {
        id: 'Department', x: 30, y: 30,
        fields: [
            { name: 'dept_id', type: 'INT', pk: true },
            { name: 'dept_name', type: 'TEXT' },
            { name: 'location', type: 'TEXT' },
        ],
    },
    {
        id: 'Role', x: 860, y: 30,
        fields: [
            { name: 'role_id', type: 'INT', pk: true },
            { name: 'role_name', type: 'TEXT' },
            { name: 'title', type: 'TEXT' },
        ],
    },
    {
        id: 'Employee', x: 320, y: 70,
        fields: [
            { name: 'emp_id', type: 'INT', pk: true },
            { name: 'name', type: 'TEXT' },
            { name: 'address', type: 'TEXT' },
            { name: 'gender', type: 'TEXT' },
            { name: 'email', type: 'TEXT' },
            { name: 'phone', type: 'TEXT' },
            { name: 'dob', type: 'TEXT' },
            { name: 'dept_id', type: 'INT', fk: 'Department' },
            { name: 'salary', type: 'REAL' },
        ],
    },
    {
        id: 'Login', x: 650, y: 200,
        fields: [
            { name: 'login_id', type: 'INT', pk: true },
            { name: 'username', type: 'TEXT' },
            { name: 'password', type: 'TEXT' },
            { name: 'emp_id', type: 'INT', fk: 'Employee' },
            { name: 'role_id', type: 'INT', fk: 'Role' },
        ],
    },
    {
        id: 'Payroll', x: 30, y: 290,
        fields: [
            { name: 'payroll_id', type: 'INT', pk: true },
            { name: 'emp_id', type: 'INT', fk: 'Employee' },
            { name: 'month', type: 'TEXT' },
            { name: 'basic_salary', type: 'REAL' },
            { name: 'allowances', type: 'REAL' },
            { name: 'deductions', type: 'REAL' },
            { name: 'net_salary', type: 'REAL' },
        ],
    },
    {
        id: 'Attendance', x: 320, y: 430,
        fields: [
            { name: 'att_id', type: 'INT', pk: true },
            { name: 'emp_id', type: 'INT', fk: 'Employee' },
            { name: 'date', type: 'TEXT' },
            { name: 'status', type: 'TEXT' },
        ],
    },
    {
        id: 'Leave', x: 30, y: 565,
        fields: [
            { name: 'leave_id', type: 'INT', pk: true },
            { name: 'emp_id', type: 'INT', fk: 'Employee' },
            { name: 'start_date', type: 'TEXT' },
            { name: 'end_date', type: 'TEXT' },
            { name: 'leave_type', type: 'TEXT' },
            { name: 'reason', type: 'TEXT' },
            { name: 'status', type: 'TEXT' },
        ],
    },
    {
        id: 'Project', x: 860, y: 370,
        fields: [
            { name: 'project_id', type: 'INT', pk: true },
            { name: 'name', type: 'TEXT' },
            { name: 'start_date', type: 'TEXT' },
            { name: 'end_date', type: 'TEXT' },
            { name: 'status', type: 'TEXT' },
        ],
    },
    {
        id: 'Employee_Project', x: 590, y: 540,
        fields: [
            { name: 'emp_id', type: 'INT', pk: true, fk: 'Employee' },
            { name: 'project_id', type: 'INT', pk: true, fk: 'Project' },
            { name: 'assigned_on', type: 'TEXT' },
            { name: 'role', type: 'TEXT' },
        ],
    },
];

/* ─── Relationship edges ─────────────────────────────── */
const RELS = [
    ['Employee', 'dept_id', 'Department', 'dept_id'],
    ['Login', 'emp_id', 'Employee', 'emp_id'],
    ['Login', 'role_id', 'Role', 'role_id'],
    ['Payroll', 'emp_id', 'Employee', 'emp_id'],
    ['Attendance', 'emp_id', 'Employee', 'emp_id'],
    ['Leave', 'emp_id', 'Employee', 'emp_id'],
    ['Employee_Project', 'emp_id', 'Employee', 'emp_id'],
    ['Employee_Project', 'project_id', 'Project', 'project_id'],
];

/* ─── Helpers ────────────────────────────────────────── */
function tH(t) { return HH + t.fields.length * RH; }
function getT(id) { return TABLES.find(t => t.id === id); }
function fieldY(t, name) {
    const i = t.fields.findIndex(f => f.name === name);
    return t.y + HH + i * RH + RH / 2;
}

function connPoints(fromId, fromField, toId, toField) {
    const F = getT(fromId), T = getT(toId);
    const fy = fieldY(F, fromField);
    const ty = fieldY(T, toField);
    // Decide which sides to connect
    let fx, tx;
    if (T.x >= F.x + TW) { fx = F.x + TW; tx = T.x; }         // T to the right
    else if (T.x + TW <= F.x) { fx = F.x; tx = T.x + TW; }    // T to the left
    else { fx = F.x + TW; tx = T.x; }                           // overlapping – default right→left
    return { fx, fy, tx, ty };
}

function pathD(fx, fy, tx, ty) {
    const gap = Math.abs(tx - fx);
    const cp = Math.min(gap * 0.55, 90);
    const sx = tx > fx ? 1 : -1;
    return `M ${fx} ${fy} C ${fx + sx * cp} ${fy} ${tx - sx * cp} ${ty} ${tx} ${ty}`;
}

/* ─── ER Diagram SVG ─────────────────────────────────── */
function ERDiagram() {
    const W = 1105, H = 840;

    return (
        <div className="erd-scroll">
            <svg width={W} height={H} style={{ display: 'block', minWidth: W }}>
                <defs>
                    <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                        <polygon points="0 0, 7 3.5, 0 7" fill="#3b82f6" opacity=".7" />
                    </marker>
                    <marker id="dot" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
                        <circle cx="2.5" cy="2.5" r="2" fill="#3b82f6" opacity=".6" />
                    </marker>
                </defs>

                {/* Relationship lines */}
                {RELS.map(([fid, ff, tid, tf], i) => {
                    const { fx, fy, tx, ty } = connPoints(fid, ff, tid, tf);
                    return (
                        <path
                            key={i}
                            d={pathD(fx, fy, tx, ty)}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="1.4"
                            strokeOpacity=".55"
                            strokeDasharray="5 3"
                            markerEnd="url(#arr)"
                            markerStart="url(#dot)"
                        />
                    );
                })}

                {/* Table boxes */}
                {TABLES.map(t => (
                    <g key={t.id}>
                        {/* Box shadow / border */}
                        <rect x={t.x} y={t.y} width={TW} height={tH(t)}
                            rx="5" fill="#161616" stroke="#2a2a2a" strokeWidth="1" />
                        {/* Header */}
                        <rect x={t.x} y={t.y} width={TW} height={HH}
                            rx="5" fill="#1e1e1e" />
                        <rect x={t.x} y={t.y + HH - 5} width={TW} height={5} fill="#1e1e1e" />
                        <rect x={t.x} y={t.y} width={3} height={HH} rx="1" fill="#5865f2" />
                        <text x={t.x + 12} y={t.y + 21} fontSize="12" fontWeight="700"
                            fill="#e8e8e8" fontFamily="Inter, system-ui, sans-serif">{t.id}</text>

                        {/* Rows */}
                        {t.fields.map((f, i) => {
                            const ry = t.y + HH + i * RH;
                            const isLast = i === t.fields.length - 1;
                            return (
                                <g key={f.name}>
                                    {!isLast && <line x1={t.x} y1={ry + RH} x2={t.x + TW} y2={ry + RH}
                                        stroke="#222" strokeWidth="1" />}
                                    {/* PK/FK badge */}
                                    {f.pk && (
                                        <rect x={t.x + 7} y={ry + 7} width={18} height={10} rx="2" fill="#5865f2" fillOpacity=".25" />
                                    )}
                                    {f.pk && <text x={t.x + 9} y={ry + 16} fontSize="8.5" fill="#5865f2"
                                        fontFamily="Inter, sans-serif" fontWeight="700">PK</text>}
                                    {f.fk && !f.pk && (
                                        <rect x={t.x + 7} y={ry + 7} width={14} height={10} rx="2" fill="#3b82f6" fillOpacity=".25" />
                                    )}
                                    {f.fk && !f.pk && <text x={t.x + 9} y={ry + 16} fontSize="8.5" fill="#3b82f6"
                                        fontFamily="Inter, sans-serif" fontWeight="700">FK</text>}
                                    {/* Field name */}
                                    <text x={t.x + 32} y={ry + 16} fontSize="11.5" fill={f.pk ? '#e8e8e8' : '#aaa'}
                                        fontFamily="Inter, system-ui, sans-serif" fontWeight={f.pk ? '600' : '400'}>{f.name}</text>
                                    {/* Type */}
                                    <text x={t.x + TW - 8} y={ry + 16} fontSize="10" fill="#555"
                                        fontFamily="JetBrains Mono, monospace" textAnchor="end">{f.type}</text>
                                </g>
                            );
                        })}
                    </g>
                ))}
            </svg>
        </div>
    );
}

/* ─── DDL data ───────────────────────────────────────── */
const DDL = [
    { name: 'Department', sql: `CREATE TABLE Department (\n  dept_id   INTEGER PRIMARY KEY AUTOINCREMENT,\n  dept_name TEXT    NOT NULL UNIQUE,\n  location  TEXT    NOT NULL\n);` },
    { name: 'Role', sql: `CREATE TABLE Role (\n  role_id   INTEGER PRIMARY KEY AUTOINCREMENT,\n  role_name TEXT    NOT NULL,\n  title     TEXT    NOT NULL\n);` },
    { name: 'Employee', sql: `CREATE TABLE Employee (\n  emp_id    INTEGER PRIMARY KEY AUTOINCREMENT,\n  name      TEXT    NOT NULL,\n  address   TEXT,\n  gender    TEXT    CHECK(gender IN ('Male','Female','Other')),\n  email     TEXT    UNIQUE NOT NULL,\n  phone     TEXT,\n  dob       TEXT,\n  dept_id   INTEGER REFERENCES Department(dept_id),\n  salary    REAL    NOT NULL DEFAULT 0\n);` },
    { name: 'Login', sql: `CREATE TABLE Login (\n  login_id  INTEGER PRIMARY KEY AUTOINCREMENT,\n  username  TEXT    NOT NULL UNIQUE,\n  password  TEXT    NOT NULL,\n  emp_id    INTEGER REFERENCES Employee(emp_id),\n  role_id   INTEGER REFERENCES Role(role_id)\n);` },
    { name: 'Payroll', sql: `CREATE TABLE Payroll (\n  payroll_id    INTEGER PRIMARY KEY AUTOINCREMENT,\n  emp_id        INTEGER REFERENCES Employee(emp_id),\n  month         TEXT    NOT NULL,\n  basic_salary  REAL    NOT NULL,\n  allowances    REAL    NOT NULL DEFAULT 0,\n  deductions    REAL    NOT NULL DEFAULT 0,\n  net_salary    REAL    NOT NULL DEFAULT 0\n);` },
    { name: 'Attendance', sql: `CREATE TABLE Attendance (\n  att_id    INTEGER PRIMARY KEY AUTOINCREMENT,\n  emp_id    INTEGER REFERENCES Employee(emp_id),\n  date      TEXT    NOT NULL,\n  status    TEXT    NOT NULL CHECK(status IN ('Present','Absent','Leave','Holiday'))\n);` },
    { name: 'Leave', sql: `CREATE TABLE Leave (\n  leave_id    INTEGER PRIMARY KEY AUTOINCREMENT,\n  emp_id      INTEGER REFERENCES Employee(emp_id),\n  start_date  TEXT    NOT NULL,\n  end_date    TEXT    NOT NULL,\n  leave_type  TEXT    NOT NULL,\n  reason      TEXT,\n  status      TEXT    NOT NULL DEFAULT 'Pending'\n);` },
    { name: 'Project', sql: `CREATE TABLE Project (\n  project_id  INTEGER PRIMARY KEY AUTOINCREMENT,\n  name        TEXT    NOT NULL,\n  start_date  TEXT    NOT NULL,\n  end_date    TEXT,\n  status      TEXT    NOT NULL DEFAULT 'Active'\n);` },
    { name: 'Employee_Project', sql: `CREATE TABLE Employee_Project (\n  emp_id      INTEGER REFERENCES Employee(emp_id),\n  project_id  INTEGER REFERENCES Project(project_id),\n  assigned_on TEXT    NOT NULL,\n  role        TEXT    NOT NULL,\n  PRIMARY KEY (emp_id, project_id)\n);` },
];

const KW = new Set(['CREATE', 'TABLE', 'IF', 'NOT', 'EXISTS', 'PRIMARY', 'KEY', 'AUTOINCREMENT', 'REFERENCES', 'DEFAULT', 'CHECK', 'STORED', 'INTEGER', 'TEXT', 'REAL', 'NULL', 'UNIQUE', 'IN']);
function highlight(sql) {
    return sql.split(/(\b\w+\b|'[^']*'|[(),;\n])/g).map((p, i) => {
        if (KW.has(p.toUpperCase())) return <span key={i} className="ddl-kw">{p}</span>;
        if (p.startsWith("'")) return <span key={i} style={{ color: '#a6e3a1' }}>{p}</span>;
        return p;
    });
}

/* ─── Main Component ─────────────────────────────────── */
export default function SchemaViewer() {
    const [tab, setTab] = useState('erd');
    const [open, setOpen] = useState({});
    const toggle = n => setOpen(o => ({ ...o, [n]: !o[n] }));

    return (
        <div>
            <div className="page-header">
                <div><h1>Schema Viewer</h1><p>ER diagram, table definitions, and relationships</p></div>
            </div>

            <div className="schema-tabs">
                {[['erd', 'ER Diagram'], ['ddl', 'DDL Definitions'], ['rel', 'Relationships']].map(([v, l]) => (
                    <button key={v} className={`schema-tab${tab === v ? ' active' : ''}`} onClick={() => setTab(v)}>{l}</button>
                ))}
            </div>

            {tab === 'erd' && <ERDiagram />}

            {tab === 'ddl' && DDL.map(t => (
                <div key={t.name} className="ddl-block">
                    <div className="ddl-header" onClick={() => toggle(t.name)}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{open[t.name] ? '▲' : '▼'}</span>
                    </div>
                    {open[t.name] && <div className="ddl-code">{highlight(t.sql)}</div>}
                </div>
            ))}

            {tab === 'rel' && (
                <div className="card">
                    <div className="card-header"><div className="card-title">Foreign Key Relationships</div></div>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Table</th><th>Column (FK)</th><th>References</th></tr></thead>
                            <tbody>
                                {RELS.map(([f, fc, t, tc]) => (
                                    <tr key={`${f}.${fc}`}>
                                        <td><span className="badge badge-blue">{f}</span></td>
                                        <td className="font-mono" style={{ fontSize: 12 }}>{fc}</td>
                                        <td><span className="badge badge-gray">{t}({tc})</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
