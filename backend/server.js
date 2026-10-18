
const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, ".env")
});

const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve the frontend from the frontend folder.
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Validate a meeting ID.
function isValidId(id) {
    return /^\d+$/.test(id) && Number(id) > 0;
}

// Validate required meeting fields.
function validateMeeting(body) {
    const fields = [
        "book_title",
        "meeting_date",
        "meeting_time",
        "venue",
        "discussion_topic",
        "facilitator",
        "meeting_goal"
    ];

    for (const field of fields) {
        if (
            typeof body[field] !== "string" ||
            body[field].trim() === ""
        ) {
            return `${field} is required.`;
        }
    }

    return null;
}

// API information
app.get("/api", (req, res) => {
    res.json({
        message: "Book Club Meeting API is running.",
        resource: "meetings"
    });
});

// 1. GET all meetings
app.get("/api/meetings", (req, res) => {
    try {
        const meetings = db.prepare(`
            SELECT * FROM meetings
            ORDER BY meeting_date, meeting_time, id
        `).all();

        res.json(meetings);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to retrieve meetings."
        });
    }
});

// 2. GET one meeting by ID
app.get("/api/meetings/:id", (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({
            error: "Meeting ID must be a positive integer."
        });
    }

    try {
        const meeting = db.prepare(
            "SELECT * FROM meetings WHERE id = ?"
        ).get(Number(req.params.id));

        if (!meeting) {
            return res.status(404).json({
                error: "Meeting not found."
            });
        }

        res.json(meeting);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to retrieve meeting."
        });
    }
});

// 3. POST a new meeting
app.post("/api/meetings", (req, res) => {
    const validationError = validateMeeting(req.body);

    if (validationError) {
        return res.status(400).json({
            error: validationError
        });
    }

    try {
        const result = db.prepare(`
            INSERT INTO meetings (
                book_title,
                meeting_date,
                meeting_time,
                venue,
                discussion_topic,
                facilitator,
                meeting_goal
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            req.body.book_title.trim(),
            req.body.meeting_date.trim(),
            req.body.meeting_time.trim(),
            req.body.venue.trim(),
            req.body.discussion_topic.trim(),
            req.body.facilitator.trim(),
            req.body.meeting_goal.trim()
        );

        const meeting = db.prepare(
            "SELECT * FROM meetings WHERE id = ?"
        ).get(result.lastInsertRowid);

        res.status(201).json({
            message: "Meeting created successfully.",
            meeting
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to create meeting."
        });
    }
});

// 4. PUT: update an existing meeting
app.put("/api/meetings/:id", (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({
            error: "Meeting ID must be a positive integer."
        });
    }

    const validationError = validateMeeting(req.body);

    if (validationError) {
        return res.status(400).json({
            error: validationError
        });
    }

    try {
        const id = Number(req.params.id);

        const existing = db.prepare(
            "SELECT id FROM meetings WHERE id = ?"
        ).get(id);

        if (!existing) {
            return res.status(404).json({
                error: "Meeting not found."
            });
        }

        db.prepare(`
            UPDATE meetings
            SET
                book_title = ?,
                meeting_date = ?,
                meeting_time = ?,
                venue = ?,
                discussion_topic = ?,
                facilitator = ?,
                meeting_goal = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            req.body.book_title.trim(),
            req.body.meeting_date.trim(),
            req.body.meeting_time.trim(),
            req.body.venue.trim(),
            req.body.discussion_topic.trim(),
            req.body.facilitator.trim(),
            req.body.meeting_goal.trim(),
            id
        );

        const meeting = db.prepare(
            "SELECT * FROM meetings WHERE id = ?"
        ).get(id);

        res.json({
            message: "Meeting updated successfully.",
            meeting
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to update meeting."
        });
    }
});

// 5. DELETE a meeting
app.delete("/api/meetings/:id", (req, res) => {
    if (!isValidId(req.params.id)) {
        return res.status(400).json({
            error: "Meeting ID must be a positive integer."
        });
    }

    try {
        const result = db.prepare(
            "DELETE FROM meetings WHERE id = ?"
        ).run(Number(req.params.id));

        if (result.changes === 0) {
            return res.status(404).json({
                error: "Meeting not found."
            });
        }

        res.json({
            message: "Meeting deleted successfully.",
            id: Number(req.params.id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to delete meeting."
        });
    }
});

// Unknown API routes
app.use("/api", (req, res) => {
    res.status(404).json({
        error: "API endpoint not found."
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(
        `Book Club Meeting API running at http://localhost:${PORT}`
    );
});
