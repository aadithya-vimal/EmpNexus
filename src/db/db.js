/**
 * db.js – sql.js in-browser SQLite singleton
 *
 * sql.js is loaded as a plain <script> tag in index.html (./sql-wasm.js)
 * so window.initSqlJs is always available — no ESM/CJS Vite issues.
 */

import schemaSql from './schema.sql?raw';
import seedSql from './seed.sql?raw';

let db = null;

export async function initDB() {
    if (db) return db;

    // window.initSqlJs is set by the <script src="./sql-wasm.js"> in index.html
    if (typeof window.initSqlJs !== 'function') {
        throw new Error('sql.js not loaded – make sure sql-wasm.js script tag is in index.html');
    }

    const SQL = await window.initSqlJs({
        // WASM binary is in /public, served at the root
        locateFile: () => './sql-wasm.wasm',
    });

    db = new SQL.Database();
    db.run(schemaSql);
    db.run(seedSql);

    return db;
}

export function getDB() {
    return db;
}

/**
 * Execute a SQL string → { columns, rows, rowsAffected, error }
 */
export function runQuery(sql) {
    if (!db) return { columns: [], rows: [], error: 'Database not initialised yet.' };
    try {
        const results = db.exec(sql);
        if (!results.length) {
            return { columns: [], rows: [], rowsAffected: db.getRowsModified() };
        }
        const { columns, values } = results[0];
        return { columns, rows: values, rowsAffected: 0 };
    } catch (err) {
        return { columns: [], rows: [], error: err.message };
    }
}

/**
 * Execute a query → plain array of objects.
 */
export function queryAll(sql, params = []) {
    if (!db) return [];
    try {
        const stmt = db.prepare(sql);
        if (params.length) stmt.bind(params);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
    } catch {
        return [];
    }
}
