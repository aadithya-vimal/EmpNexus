/**
 * Login.jsx – Employee login with role-based redirect
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDB } from '../context/DBContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const { ready, queryAll } = useDB();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!ready) return (
        <div className="loading-screen">
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)' }}>Initialising database…</p>
        </div>
    );

    function handleChange(e) {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setError('');
    }

    function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const rows = queryAll(
            `SELECT l.*, e.name, e.emp_id, r.role_name
       FROM Login l
       JOIN Employee e ON l.emp_id = e.emp_id
       JOIN Role    r ON l.role_id = r.role_id
       WHERE l.username = ? AND l.password = ?`,
            [form.username, form.password]
        );

        setTimeout(() => {
            setLoading(false);
            if (!rows.length) {
                setError('Invalid username or password.');
                return;
            }
            const u = rows[0];
            localStorage.setItem('empnexus_user', JSON.stringify({
                loginId: u.login_id,
                empId: u.emp_id,
                name: u.name,
                username: u.username,
                role: u.role_name,
            }));
            navigate('/');
        }, 400);
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <div className="login-logo-icon">E</div>
                    <h1>EmpNexus</h1>
                    <p>Employee Management System</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            id="username"
                            name="username"
                            className="form-input"
                            placeholder="e.g. admin"
                            value={form.username}
                            onChange={handleChange}
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="password"
                                name="password"
                                type={showPass ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Enter password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(x => !x)}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button id="login-btn" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
                        <LogIn size={15} />
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <div className="login-hint">
                    <strong>Demo credentials:</strong><br />
                    Admin → <code>admin</code> / <code>admin123</code><br />
                    Employee → <code>priya.patel</code> / <code>pass1234</code>
                </div>
            </div>
        </div>
    );
}
