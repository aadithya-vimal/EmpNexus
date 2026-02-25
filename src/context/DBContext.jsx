import { createContext, useContext, useEffect, useState } from 'react';
import { initDB, runQuery, queryAll } from '../db/db';

const DBContext = createContext(null);

export function DBProvider({ children }) {
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        initDB()
            .then(() => setReady(true))
            .catch(e => setError(e.message));
    }, []);

    if (error) return (
        <div className="db-loading">
            <div className="brand">EmpNexus</div>
            <div style={{ color: 'var(--red)', fontSize: 13 }}>Database error: {error}</div>
            <button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>Reload</button>
        </div>
    );

    if (!ready) return (
        <div className="db-loading">
            <div className="brand">EmpNexus</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="spinner" />
                <span style={{ fontSize: 13 }}>Initialising database…</span>
            </div>
        </div>
    );

    return (
        <DBContext.Provider value={{ ready, runQuery, queryAll }}>
            {children}
        </DBContext.Provider>
    );
}

export function useDB() { return useContext(DBContext); }
