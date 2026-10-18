
-- Question 8: Book Club Meeting Page
-- Database table: meetings

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

-- Insert 10 sample book club meetings

INSERT INTO meetings (
    book_title,
    meeting_date,
    meeting_time,
    venue,
    discussion_topic,
    facilitator,
    meeting_goal
)
VALUES
('Things Fall Apart', '2026-11-01', '10:00', 'Library Room 1', 'Culture and tradition', 'John Banda', 'Understand cultural traditions'),
('The River Between', '2026-11-03', '14:00', 'Lecture Room 2', 'Tradition and change', 'Mary Phiri', 'Discuss conflict between traditions'),
('Animal Farm', '2026-11-05', '09:00', 'Library Room 2', 'Power and leadership', 'Peter Zulu', 'Examine leadership and corruption'),
('The Alchemist', '2026-11-07', '11:00', 'Student Centre', 'Personal dreams', 'Grace Tembo', 'Explore personal goals'),
('Born a Crime', '2026-11-09', '13:00', 'Meeting Room A', 'Identity and society', 'David Mwila', 'Discuss identity and belonging'),
('The Old Man and the Sea', '2026-11-11', '10:30', 'Library Room 1', 'Courage and perseverance', 'Ruth Chanda', 'Understand perseverance'),
('Purple Hibiscus', '2026-11-13', '15:00', 'Lecture Room 3', 'Character development', 'James Phiri', 'Analyse character decisions'),
('The Great Gatsby', '2026-11-15', '12:00', 'Student Centre', 'Wealth and ambition', 'Esther Banda', 'Examine ambition and social class'),
('The Hobbit', '2026-11-17', '14:30', 'Library Room 2', 'Adventure and courage', 'Michael Zulu', 'Explore courage and adventure'),
('The Lion, the Witch and the Wardrobe', '2026-11-19', '10:00', 'Meeting Room B', 'Good versus evil', 'Sarah Mwape', 'Explore moral choices');
