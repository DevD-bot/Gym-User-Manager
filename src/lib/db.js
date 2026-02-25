import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: './dev.db',
      driver: sqlite3.Database
    });

    // Initialize the database table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS Member (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        paymentDate TEXT NOT NULL,
        durationMonths INTEGER NOT NULL,
        imageUrl TEXT,
        createdAt TEXT NOT NULL
      )
    `);

    try {
      await db.exec(`ALTER TABLE Member ADD COLUMN trainer TEXT`);
    } catch (e) {
      // Ignore if column already exists
    }
  }
  return db;
}
