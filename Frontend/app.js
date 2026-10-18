// ============================================================
// BOOK CLUB MEETING MANAGER
// Frontend JavaScript
// Question 8 - Single-Table CRUD App
// ============================================================

// API endpoint
const API_URL = "/api/meetings";

// Form elements
const meetingForm = document.getElementById("meetingForm");
const formTitle = document.getElementById("formTitle");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const statusMessage = document.getElementById("status");
const meetingsTable = document.getElementById("meetingsTable");

// Keep track of whether we are adding or editing
let editingId = null;


// ============================================================
// 1. DISPLAY STATUS MESSAGE
// ============================================================

function showStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = type;

    // Automatically remove the message after 4 seconds
    setTimeout(() => {
        statusMessage.textContent = "";
        statusMessage.className = "";
    }, 4000);
}


// ============================================================
// 2. ESCAPE HTML
// Prevent unsafe HTML from being inserted into the page
// ============================================================

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// 3. LOAD ALL MEETINGS
// GET /api/meetings
// ============================================================

async function loadMeetings() {
    meetingsTable.innerHTML = `
        <tr>
            <td colspan="9">Loading meetings...</td>
        </tr>
    `;

    try {
        const response = await fetch(API_URL);

        const meetings = await response.json();

        if (!response.ok) {
            throw new Error(
                meetings.error || "Failed to load meetings."
            );
        }

        displayMeetings(meetings);

    } catch (error) {
        console.error("Load meetings error:", error);

        meetingsTable.innerHTML = `
            <tr>
                <td colspan="9">
                    Unable to load meetings.
                </td>
            </tr>
        `;

        showStatus(
            "Could not load meetings. Make sure the server is running.",
            "error"
        );
    }
}


// ============================================================
// 4. DISPLAY MEETINGS IN THE TABLE
// ============================================================

function displayMeetings(meetings) {

    if (meetings.length === 0) {
        meetingsTable.innerHTML = `
            <tr>
                <td colspan="9">
                    No meetings have been added yet.
                </td>
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
                        data-id="${meeting.id}">
                        Edit
                    </button>

                    <button
                        class="delete"
                        type="button"
                        data-action="delete"
                        data-id="${meeting.id}">
                        Delete
                    </button>

                </div>
            </td>
        </tr>
    `).join("");
}


// ============================================================
// 5. GET ONE MEETING
// GET /api/meetings/:id
// ============================================================

async function getMeeting(id) {

    const response = await fetch(`${API_URL}/${id}`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to retrieve meeting."
        );
    }

    return data;
}


// ============================================================
// 6. START EDITING A MEETING
// ============================================================

async function editMeeting(id) {

    try {

        const meeting = await getMeeting(id);

        // Store the ID currently being edited
        editingId = id;

        // Put the meeting information into the form
        document.getElementById("book_title").value =
            meeting.book_title;

        document.getElementById("meeting_date").value =
            meeting.meeting_date;

        document.getElementById("meeting_time").value =
            meeting.meeting_time;

        document.getElementById("venue").value =
            meeting.venue;

        document.getElementById("discussion_topic").value =
            meeting.discussion_topic;

        document.getElementById("facilitator").value =
            meeting.facilitator;

        document.getElementById("meeting_goal").value =
            meeting.meeting_goal;

        // Change form appearance
        formTitle.textContent = "Edit Book Club Meeting";

        saveButton.textContent = "Update Meeting";

        cancelButton.hidden = false;

        showStatus(
            `Editing meeting #${id}. Make your changes and click Update Meeting.`,
            "success"
        );

        // Move user back to the form
        meetingForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {

        console.error("Edit meeting error:", error);

        showStatus(
            error.message || "Could not load meeting for editing.",
            "error"
        );
    }
}


// ============================================================
// 7. DELETE A MEETING
// DELETE /api/meetings/:id
// ============================================================

async function deleteMeeting(id) {

    const confirmed = confirm(
        `Are you sure you want to delete meeting #${id}?`
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Failed to delete meeting."
            );
        }

        showStatus(
            `Meeting #${id} was deleted successfully.`,
            "success"
        );

        // If the deleted meeting was being edited,
        // return the form to Add mode.
        if (editingId === id) {
            resetForm();
        }

        // Refresh table
        await loadMeetings();

    } catch (error) {

        console.error("Delete meeting error:", error);

        showStatus(
            error.message || "Could not delete meeting.",
            "error"
        );
    }
}


// ============================================================
// 8. FORM SUBMISSION
// POST = CREATE
// PUT  = UPDATE
// ============================================================

meetingForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    // Collect form data
    const formData = new FormData(meetingForm);

    const meetingData = {
        book_title: formData.get("book_title").trim(),
        meeting_date: formData.get("meeting_date").trim(),
        meeting_time: formData.get("meeting_time").trim(),
        venue: formData.get("venue").trim(),
        discussion_topic: formData.get("discussion_topic").trim(),
        facilitator: formData.get("facilitator").trim(),
        meeting_goal: formData.get("meeting_goal").trim()
    };

    try {

        let response;

        // ----------------------------------------------------
        // CREATE
        // ----------------------------------------------------

        if (editingId === null) {

            response = await fetch(API_URL, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(meetingData)
            });

        }

        // ----------------------------------------------------
        // UPDATE
        // ----------------------------------------------------

        else {

            response = await fetch(
                `${API_URL}/${editingId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(meetingData)
                }
            );
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Operation failed."
            );
        }

        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        if (editingId === null) {

            showStatus(
                "Meeting added successfully.",
                "success"
            );

        } else {

            showStatus(
                "Meeting updated successfully.",
                "success"
            );
        }

        // Reset form
        resetForm();

        // Refresh meetings table
        await loadMeetings();

    } catch (error) {

        console.error("Save meeting error:", error);

        showStatus(
            error.message || "Could not save meeting.",
            "error"
        );
    }
});


// ============================================================
// 9. CANCEL EDITING
// ============================================================

cancelButton.addEventListener("click", function() {

    resetForm();

    showStatus(
        "Editing cancelled.",
        ""
    );
});


// ============================================================
// 10. RESET FORM
// Return form to ADD mode
// ============================================================

function resetForm() {

    editingId = null;

    meetingForm.reset();

    formTitle.textContent = "Add a Book Club Meeting";

    saveButton.textContent = "Add Meeting";

    cancelButton.hidden = true;
}


// ============================================================
// 11. HANDLE EDIT AND DELETE BUTTONS
// Event delegation
// ============================================================

meetingsTable.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    const action = button.dataset.action;

    const id = Number(button.dataset.id);

    if (!id) {
        return;
    }

    // Edit button
    if (action === "edit") {
        editMeeting(id);
    }

    // Delete button
    if (action === "delete") {
        deleteMeeting(id);
    }
});


// ============================================================
// 12. LOAD MEETINGS WHEN PAGE OPENS
// ============================================================

loadMeetings();