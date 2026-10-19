
/*
============================================================
BOOK CLUB MEETING MANAGER
Frontend JavaScript
Question 8 - Single-Table CRUD App
MAYBIN MWEEMBA
============================================================
*/

const API_URL = "api/meetings";

// Form elements
const meetingForm = document.getElementById("meetingForm");
const formTitle = document.getElementById("formTitle");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const statusMessage = document.getElementById("status");
const meetingsTable = document.getElementById("meetingsTable");

let editingId = null;

// Check that the HTML elements exist
if (
    !meetingForm ||
    !formTitle ||
    !saveButton ||
    !cancelButton ||
    !statusMessage ||
    !meetingsTable
) {
    console.error(
        "Required HTML elements are missing. Check index.html."
    );
}

// ============================================================
// 1. DISPLAY STATUS MESSAGE
// ============================================================

function showStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = type;
}

// ============================================================
// 2. ESCAPE HTML
// ============================================================

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// ============================================================
// 3. API REQUEST HELPER
// Reports HTTP errors and invalid JSON responses.
// ============================================================

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.body ? {
                "Content-Type": "application/json"
            } : {}),
            ...options.headers
        }
    });

    const responseText = await response.text();
    let data = null;

    if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(
                `The server returned non-JSON data (HTTP ${response.status}). ` +
                `Response: ${responseText.slice(0, 200)}`
            );
        }
    }

    if (!response.ok) {
        const message =
            data?.error ||
            data?.message ||
            `The server returned HTTP ${response.status}.`;

        throw new Error(message);
    }

    return data;
}

// ============================================================
// 4. LOAD ALL MEETINGS
// GET /api/meetings
// ============================================================

async function loadMeetings() {
    meetingsTable.innerHTML = `
        <tr>
            <td colspan="9">Loading meetings...</td>
        </tr>
    `;

    try {
        const result = await apiRequest(API_URL);

        // The API is expected to return an array.
        const meetings = Array.isArray(result)
            ? result
            : result?.meetings;

        if (!Array.isArray(meetings)) {
            throw new Error(
                "The API response is not a list of meetings. " +
                "Check the GET /api/meetings route in server.js."
            );
        }

        displayMeetings(meetings);

    } catch (error) {
        console.error("Load meetings error:", error);

        meetingsTable.innerHTML = `
            <tr>
                <td colspan="9">
                    Could not load meetings:
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;

        showStatus(
            `Unable to load meetings: ${error.message}`,
            "error"
        );
    }
}

// ============================================================
// 5. DISPLAY MEETINGS
// ============================================================

function displayMeetings(meetings) {
    if (meetings.length === 0) {
        meetingsTable.innerHTML = `
            <tr>
                <td colspan="9">No meetings have been added yet.</td>
            </tr>
        `;
        return;
    }

    meetingsTable.innerHTML = meetings.map(meeting => `
        <tr>
            <td>${escapeHtml(meeting.id)}</td>
            <td>${escapeHtml(meeting.book_title)}</td>
            <td>${escapeHtml(meeting.meeting_date)}</td>
            <td>${escapeHtml(meeting.meeting_time)}</td>
            <td>${escapeHtml(meeting.venue)}</td>
            <td>${escapeHtml(meeting.discussion_topic)}</td>
            <td>${escapeHtml(meeting.facilitator)}</td>
            <td>${escapeHtml(meeting.meeting_goal)}</td>
            <td>
                <div class="buttons">
                    <button
                        class="edit"
                        type="button"
                        data-action="edit"
                        data-id="${escapeHtml(meeting.id)}">
                        Edit
                    </button>
                    <button
                        class="delete"
                        type="button"
                        data-action="delete"
                        data-id="${escapeHtml(meeting.id)}">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

// ============================================================
// 6. GET ONE MEETING
// GET /api/meetings/:id
// ============================================================

async function getMeeting(id) {
    return await apiRequest(
        `${API_URL}/${encodeURIComponent(id)}`
    );
}

// ============================================================
// 7. EDIT A MEETING
// ============================================================

async function editMeeting(id) {
    try {
        const meeting = await getMeeting(id);

        editingId = id;

        const fields = [
            "book_title",
            "meeting_date",
            "meeting_time",
            "venue",
            "discussion_topic",
            "facilitator",
            "meeting_goal"
        ];

        fields.forEach(field => {
            const input = document.getElementById(field);
            input.value = meeting[field] ?? "";
        });

        formTitle.textContent = "Edit Book Club Meeting";
        saveButton.textContent = "Update Meeting";
        cancelButton.hidden = false;

        showStatus(`Editing meeting #${id}.`, "success");

        meetingForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        console.error("Edit meeting error:", error);
        showStatus(
            `Could not load meeting for editing: ${error.message}`,
            "error"
        );
    }
}

// ============================================================
// 8. DELETE A MEETING
// DELETE /api/meetings/:id
// ============================================================

async function deleteMeeting(id) {
    if (!confirm(`Are you sure you want to delete meeting #${id}?`)) {
        return;
    }

    try {
        await apiRequest(
            `${API_URL}/${encodeURIComponent(id)}`,
            { method: "DELETE" }
        );

        if (String(editingId) === String(id)) {
            resetForm();
        }

        showStatus(
            `Meeting #${id} deleted successfully.`,
            "success"
        );

        await loadMeetings();

    } catch (error) {
        console.error("Delete meeting error:", error);
        showStatus(
            `Could not delete meeting: ${error.message}`,
            "error"
        );
    }
}

// ============================================================
// 9. CREATE OR UPDATE A MEETING
// POST /api/meetings
// PUT /api/meetings/:id
// ============================================================

meetingForm.addEventListener("submit", async event => {
    event.preventDefault();

    const fields = [
        "book_title",
        "meeting_date",
        "meeting_time",
        "venue",
        "discussion_topic",
        "facilitator",
        "meeting_goal"
    ];

    const meetingData = {};

    fields.forEach(field => {
        meetingData[field] =
            document.getElementById(field).value.trim();
    });

    saveButton.disabled = true;
    showStatus("Saving meeting...");

    try {
        const isEditing = editingId !== null;

        const url = isEditing
            ? `${API_URL}/${encodeURIComponent(editingId)}`
            : API_URL;

        await apiRequest(url, {
            method: isEditing ? "PUT" : "POST",
            body: JSON.stringify(meetingData)
        });

        showStatus(
            isEditing
                ? "Meeting updated successfully."
                : "Meeting added successfully.",
            "success"
        );

        resetForm();
        await loadMeetings();

    } catch (error) {
        console.error("Save meeting error:", error);
        showStatus(
            `Could not save meeting: ${error.message}`,
            "error"
        );
    } finally {
        saveButton.disabled = false;
    }
});

// ============================================================
// 10. CANCEL EDITING
// ============================================================

cancelButton.addEventListener("click", () => {
    resetForm();
    showStatus("Editing cancelled.");
});

// ============================================================
// 11. RESET FORM
// ============================================================

function resetForm() {
    editingId = null;
    meetingForm.reset();

    formTitle.textContent = "Add a Book Club Meeting";
    saveButton.textContent = "Add Meeting";
    cancelButton.hidden = true;
}

// ============================================================
// 12. EDIT AND DELETE BUTTON HANDLING
// ============================================================

meetingsTable.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;

    if (button.dataset.action === "edit") {
        editMeeting(id);
    } else if (button.dataset.action === "delete") {
        deleteMeeting(id);
    }
});

// ============================================================
// 13. LOAD MEETINGS WHEN PAGE OPENS
// ============================================================

loadMeetings();
