/**
 * SQLEditor.jsx – Full in-browser SQL editor
 */
import { useState } from 'react';
import { useDB } from '../context/DBContext';
import { Play, Eraser, Copy, CheckCircle } from 'lucide-react';

const QUICK = [
    { label: 'All Employees', sql: 'SELECT * FROM Employee LIMIT 20;' },
    { label: 'Employee + Dept', sql: `SELECT e.name, d.dept_name, e.salary\nFROM Employee e\nJOIN Department d ON e.dept_id = d.dept_id\nORDER BY e.salary DESC;` },
    { label: 'Jan 2025 Payroll', sql: `SELECT e.name, p.month, p.basic_salary, p.allowances, p.deductions, p.net_salary\nFROM Payroll p\nJOIN Employee e ON p.emp_id = e.emp_id\nWHERE p.month = '2025-01'\nORDER BY p.net_salary DESC;` },
    { label: 'Pending Leaves', sql: `SELECT e.name, l.leave_type, l.start_date, l.end_date, l.status\nFROM Leave l\nJOIN Employee e ON l.emp_id = e.emp_id\nWHERE l.status = 'Pending';` },
    { label: 'Active Projects', sql: `SELECT p.name, p.start_date, COUNT(ep.emp_id) as team_size\nFROM Project p\nLEFT JOIN Employee_Project ep ON p.project_id = ep.project_id\nWHERE p.status = 'Active'\nGROUP BY p.project_id;` },
    { label: 'Attendance Summary', sql: `SELECT e.name, \n  SUM(CASE WHEN a.status='Present' THEN 1 ELSE 0 END) as present,\n  SUM(CASE WHEN a.status='Absent' THEN 1 ELSE 0 END) as absent\nFROM Attendance a\nJOIN Employee e ON a.emp_id = e.emp_id\nGROUP BY a.emp_id\nORDER BY present DESC;` },
    { label: 'List All Tables', sql: `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;` },
    { label: 'Schema Info', sql: `SELECT name, sql FROM sqlite_master WHERE type='table';` },
];

export default function SQLEditor() {
    const { runQuery } = useDB();
    const [sql, setSql] = useState('SELECT * FROM Employee LIMIT 10;');
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [copied, setCopied] = useState(false);

    function execute() {
        const r = runQuery(sql);
        setResult(r);
        setHistory(h => [{ sql, time: new Date().toLocaleTimeString(), ok: !r.error }, ...h.slice(0, 9)]);
    }

    function handleKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); execute(); }
        // Tab inserts spaces
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const next = sql.slice(0, start) + '  ' + sql.slice(end);
            setSql(next);
            requestAnimationFrame(() => { e.target.selectionStart = e.target.selectionEnd = start + 2; });
        }
    }

    function copyResult() {
        if (!result?.rows?.length) return;
        const tsv = [result.columns.join('\t'), ...result.rows.map(r => r.join('\t'))].join('\n');
        navigator.clipboard.writeText(tsv);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div>
            <div className="page-header">
                <div><h1>SQL Editor</h1><p>Run raw SQLite queries against the live database</p></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 16, alignItems: 'start' }}>
                {/* Main editor */}
                <div>
                    <div className="sql-editor-wrap">
                        <div className="sql-toolbar">
                            <span className="text-sm text-muted font-mono">SQLite (sql.js)</span>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                <button className="btn btn-sm btn-secondary" onClick={() => { setSql(''); setResult(null); }}><Eraser size={12} />Clear</button>
                                <button id="run-sql-btn" className="btn btn-sm btn-primary" onClick={execute}><Play size={12} />Run <span className="text-muted" style={{ fontSize: 10, fontWeight: 400 }}>Ctrl+Enter</span></button>
                            </div>
                        </div>
                        <textarea
                            id="sql-input"
                            className="sql-textarea"
                            value={sql}
                            onChange={e => setSql(e.target.value)}
                            onKeyDown={handleKeyDown}
                            spellCheck={false}
                            placeholder="-- Type your SQL here…&#10;-- Ctrl+Enter to run"
                        />
                    </div>

                    {/* Results */}
                    {result && (
                        <div style={{ marginTop: 12 }}>
                            {result.error ? (
                                <div className="sql-error">⚠ {result.error}</div>
                            ) : result.columns.length === 0 ? (
                                <div className="sql-success">✓ Query executed. {result.rowsAffected ?? 0} row(s) affected.</div>
                            ) : (
                                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <div className="card-header" style={{ padding: '10px 14px' }}>
                                        <div className="card-title" style={{ fontSize: 12 }}>{result.rows.length} row{result.rows.length !== 1 ? 's' : ''} returned</div>
                                        <button className="btn btn-sm btn-secondary" onClick={copyResult}>
                                            {copied ? <CheckCircle size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
                                            {copied ? 'Copied!' : 'Copy TSV'}
                                        </button>
                                    </div>
                                    <div className="sql-result-table table-wrap">
                                        <table>
                                            <thead>
                                                <tr>{result.columns.map(c => <th key={c}>{c}</th>)}</tr>
                                            </thead>
                                            <tbody>
                                                {result.rows.map((row, i) => (
                                                    <tr key={i}>{row.map((cell, j) => (
                                                        <td key={j} className="font-mono" style={{ fontSize: 12 }}>{cell === null ? <span className="text-muted">NULL</span> : String(cell)}</td>
                                                    ))}</tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* History */}
                    {history.length > 0 && (
                        <div className="card" style={{ marginTop: 12 }}>
                            <div className="card-header"><div className="card-title">Query History</div></div>
                            {history.map((h, i) => (
                                <div key={i} onClick={() => setSql(h.sql)}
                                    style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                                    <span style={{ fontSize: 10, color: h.ok ? 'var(--success)' : 'var(--danger)', marginTop: 3 }}>{h.ok ? '✓' : '✗'}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="font-mono" style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.sql}</div>
                                        <div className="text-muted" style={{ fontSize: 10 }}>{h.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick queries sidebar */}
                <div>
                    <div className="card">
                        <div className="card-header"><div className="card-title">Quick Queries</div></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {QUICK.map(q => (
                                <button key={q.label} className="btn btn-secondary" style={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: 12 }}
                                    onClick={() => { setSql(q.sql); setResult(null); }}>
                                    {q.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ marginTop: 12 }}>
                        <div className="card-header"><div className="card-title">Tips</div></div>
                        <div style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                            <div>• <kbd style={{ background: 'var(--bg-hover)', padding: '1px 5px', borderRadius: 3, fontFamily: 'monospace', fontSize: 11 }}>Ctrl+Enter</kbd> to run</div>
                            <div>• <kbd style={{ background: 'var(--bg-hover)', padding: '1px 5px', borderRadius: 3, fontFamily: 'monospace', fontSize: 11 }}>Tab</kbd> for indentation</div>
                            <div>• SELECT, INSERT, UPDATE, DELETE all work</div>
                            <div>• Changes persist in-session (page refresh resets)</div>
                            <div>• NULL values shown as <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>NULL</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
