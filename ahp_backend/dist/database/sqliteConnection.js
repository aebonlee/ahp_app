"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = exports.query = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
// SQLite 데이터베이스 파일 경로
const dbPath = path_1.default.join(__dirname, '../../database.sqlite');
// SQLite 데이터베이스 연결
const db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    }
    else {
        console.log('Connected to SQLite database:', dbPath);
    }
});
// Promise 기반 쿼리 함수
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        // SELECT 쿼리인지 확인
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
// 데이터베이스 초기화 함수
const initDatabase = async () => {
    try {
        // Users 테이블 생성
        await (0, exports.query)(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'evaluator')) NOT NULL DEFAULT 'evaluator',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Projects 테이블 생성
        await (0, exports.query)(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        objective TEXT,
        status TEXT CHECK(status IN ('draft', 'active', 'completed')) NOT NULL DEFAULT 'draft',
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
        // 기본 관리자 사용자 생성 (패스워드: password123)
        const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // bcrypt hash of 'password123'
        await (0, exports.query)(`
      INSERT OR IGNORE INTO users (email, password, first_name, last_name, role) 
      VALUES (?, ?, ?, ?, ?)
    `, ['admin@ahp-system.com', hashedPassword, 'Admin', 'User', 'admin']);
        console.log('Database initialized successfully');
    }
    catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};
exports.initDatabase = initDatabase;
exports.default = db;
