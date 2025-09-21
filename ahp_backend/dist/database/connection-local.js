"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = exports.query = void 0;
// 로컬 개발용 SQLite 연결
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '../../database.sqlite');
const db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    }
    else {
        console.log('Connected to SQLite database:', dbPath);
    }
});
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const isSelect = sql.trim().toLowerCase().startsWith('select');
        if (isSelect) {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ rows, rowCount: rows.length });
                }
            });
        }
        else {
            db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        rows: [{ id: this.lastID }],
                        rowCount: this.changes,
                        lastID: this.lastID,
                        changes: this.changes
                    });
                }
            });
        }
    });
};
exports.query = query;
const initDatabase = async () => {
    try {
        await (0, exports.query)(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'evaluator')) NOT NULL DEFAULT 'evaluator',
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 10);
        await (0, exports.query)(`
      INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, is_active) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['admin@ahp-system.com', hashedPassword, 'Admin', 'User', 'admin', 1]);
        console.log('SQLite database initialized successfully');
    }
    catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};
exports.initDatabase = initDatabase;
exports.default = db;
