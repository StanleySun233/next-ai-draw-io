import fs from "node:fs"
import path from "node:path"
import Database from "better-sqlite3"

const DB_PATH =
    process.env.DB_PATH || path.join(process.cwd(), "data", "app.db")

let _db: Database.Database | null = null

export function getDb(): Database.Database {
    if (_db) return _db

    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    _db = new Database(DB_PATH)
    _db.pragma("journal_mode = WAL")
    _db.pragma("foreign_keys = ON")

    _db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            username   TEXT    NOT NULL UNIQUE,
            password   TEXT    NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
        CREATE TABLE IF NOT EXISTS model_configs (
            user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            config     TEXT    NOT NULL,
            updated_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
    `)

    return _db
}
