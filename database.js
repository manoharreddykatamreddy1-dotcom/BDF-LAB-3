const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the SQLite database file
const dbPath = path.join(__dirname, 'books.db');

// Initialize SQLite database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database: books.db');
    initDatabase();
  }
});

// Function to initialize tables and insert initial sample data
function initDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL
    )
  `;

  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating books table:', err.message);
      return;
    }

    // Check if sample records already exist to prevent duplicate insertions on server restart
    db.get('SELECT COUNT(*) AS count FROM books', (err, row) => {
      if (err) {
        console.error('Error checking books count:', err.message);
        return;
      }

      if (row.count === 0) {
        console.log('No existing records found. Seeding initial 12 sample books...');

        const sampleBooks = [
          ['The Pragmatic Programmer', 'Andrew Hunt and David Thomas', 550.0],
          ['Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 480.0],
          ['JavaScript: The Good Parts', 'Douglas Crockford', 320.0],
          ['Learning Python', 'Mark Lutz', 650.0],
          ['Python Crash Course', 'Eric Matthes', 420.0],
          ['You Don\'t Know JS Yet', 'Kyle Simpson', 280.0],
          ['Designing Data-Intensive Applications', 'Martin Kleppmann', 750.0],
          ['Node.js Web Development', 'David Herron', 390.0],
          ['Introduction to Algorithms', 'Thomas H. Cormen', 850.0],
          ['Head First Design Patterns', 'Eric Freeman', 510.0],
          ['Express in Action', 'Evan Hahn', 340.0],
          ['Eloquent JavaScript', 'Marijn Haverbeke', 260.0]
        ];

        const insertQuery = 'INSERT INTO books (title, author, price) VALUES (?, ?, ?)';
        const stmt = db.prepare(insertQuery);

        sampleBooks.forEach((book) => {
          stmt.run(book, (insertErr) => {
            if (insertErr) {
              console.error(`Error inserting sample book "${book[0]}":`, insertErr.message);
            }
          });
        });

        stmt.finalize((finalizeErr) => {
          if (finalizeErr) {
            console.error('Error finalizing sample book insert statement:', finalizeErr.message);
          } else {
            console.log('Sample books successfully seeded into the database.');
          }
        });
      } else {
        console.log(`Database already initialized with ${row.count} books. Skipping seed.`);
      }
    });
  });
}

// Promise helper for SELECT queries returning multiple rows
const all = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Promise helper for SELECT queries returning a single row
const get = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Promise helper for INSERT, UPDATE, DELETE queries
const run = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

module.exports = {
  db,
  all,
  get,
  run
};
