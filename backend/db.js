
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

require("dotenv").config({
    path: path.join(__dirname, ".env")
});

// Determine the location of the SQLite database.
const databasePath = path.resolve(
    __dirname,
    process.env.DB_FILE || "meetings.db"
);

// Open the database or create it if it does not exist.
const db = new Database(databasePath);

// Enable foreign key enforcement.
db.pragma("foreign_keys = ON");

// Read the SQL schema.
const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

// Create the table if it does not exist.
db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_title TEXT NOT NULL,
        meeting_date TEXT NOT NULL,
        meeting_time TEXT NOT NULL,
        venue TEXT NOT NULL,
        discussion_topic TEXT NOT NULL,
        facilitator TEXT NOT NULL,
        meeting_goal TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`);

// Insert the sample meetings only when the table is empty.
// This prevents duplicate sample records on server restarts.
const count = db.prepare(
    "SELECT COUNT(*) AS total FROM meetings"
).get();

if (count.total === 0) {
    db.exec(schema);
}

console.log("SQLite database connected successfully.");
console.log("Database location:", databasePath);

module.exports = db;
