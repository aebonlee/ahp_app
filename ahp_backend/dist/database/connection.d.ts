import { Pool } from 'pg';
declare const pool: Pool;
export declare const query: (text: string, params?: any[]) => Promise<import("pg").QueryResult<any>>;
export default pool;
