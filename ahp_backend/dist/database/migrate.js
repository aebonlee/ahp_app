"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const connection_1 = require("./connection");
const migrationsDir = path_1.default.join(__dirname, 'migrations');
async function runMigrations() {
    try {
        console.log('🔧 Running database migrations...');
        const files = fs_1.default.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();
        for (const file of files) {
            console.log(`📄 Running migration: ${file}`);
            const filePath = path_1.default.join(migrationsDir, file);
            const sql = fs_1.default.readFileSync(filePath, 'utf8');
            await (0, connection_1.query)(sql);
            console.log(`✅ Migration ${file} completed successfully`);
        }
        console.log('🎉 All migrations completed successfully');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}
