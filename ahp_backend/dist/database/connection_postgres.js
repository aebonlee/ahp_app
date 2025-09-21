"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
const query = (text, params) => pool.query(text, params);
exports.query = query;
exports.default = pool;
