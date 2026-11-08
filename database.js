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
    CREATE TABLE IF NOT EXISTS book (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL,
      pages INTEGER NOT NULL DEFAULT 250
    );
  `;

  // We also create view/alias for books if needed, or table books
  const createBooksTableQuery = `
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL,
      pages INTEGER NOT NULL DEFAULT 250
    );
  `;

  db.serialize(() => {
    db.run(createTableQuery);
    db.run(createBooksTableQuery, (err) => {
      if (err) {
        console.error('Error creating books table:', err.message);
        return;
      }

      // Check if sample records already exist in books table
      db.get('SELECT COUNT(*) AS count FROM books', (err, row) => {
        if (err) {
          console.error('Error checking books count:', err.message);
          return;
        }

        if (row.count === 0) {
          console.log('Seeding initial curated sample books...');

          const sampleBooks = [
            ['The Alchemist', 'Paulo Coelho', 250, 208],
            ['Atomic Habits', 'James Clear', 450, 320],
            ['Rich Dad Poor Dad', 'Robert Kiyosaki', 300, 336],
            ['Wings of Fire', 'A.P.J. Abdul Kalam', 200, 180],
            ['Ikigai', 'Hector Garcia', 350, 194],
            ['Think Like a Monk', 'Jay Shetty', 400, 288],
            ['Deep Work', 'Cal Newport', 500, 304],
            ['The Power of Now', 'Eckhart Tolle', 280, 236],
            ['Zero to One', 'Peter Thiel', 320, 210],
            ['The 5 AM Club', 'Robin Sharma', 380, 336],
            ['Python Crash Course', 'Eric Matthes', 420, 544],
            ['Learning Python', 'Mark Lutz', 650, 1590]
          ];

          const insertBook = db.prepare('INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)');
          const insertBooks = db.prepare('INSERT INTO books (title, author, price, pages) VALUES (?, ?, ?, ?)');

          sampleBooks.forEach((b) => {
            insertBook.run(b);
            insertBooks.run(b);
          });

          insertBook.finalize();
          insertBooks.finalize((finalizeErr) => {
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
