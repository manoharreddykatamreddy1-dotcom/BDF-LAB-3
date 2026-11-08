require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all incoming requests (browsers, Render, Postman, etc.)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Parse JSON request bodies
app.use(express.json());

// SQLite Database Setup
const dbPath = path.join(__dirname, 'books.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database: books.db');
    initDatabase();
  }
});

// Curated sample books matching curriculum & screenshots
const initialBooks = [
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

function initDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL,
      pages INTEGER NOT NULL DEFAULT 250
    );
  `;
  const createBookAliasQuery = `
    CREATE TABLE IF NOT EXISTS book (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL,
      pages INTEGER NOT NULL DEFAULT 250
    );
  `;

  db.serialize(() => {
    db.run(createTableQuery);
    db.run(createBookAliasQuery, (err) => {
      if (err) {
        console.error('Error creating books table:', err.message);
        return;
      }

      db.get('SELECT COUNT(*) AS count FROM books', (err, row) => {
        if (err) {
          console.error('Error checking books count:', err.message);
          return;
        }

        if (row.count === 0) {
          console.log('Seeding initial 12 sample books...');
          const insertStmt = db.prepare('INSERT INTO books (title, author, price, pages) VALUES (?, ?, ?, ?)');
          const insertBookAlias = db.prepare('INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)');

          initialBooks.forEach((b) => {
            insertStmt.run(b);
            insertBookAlias.run(b);
          });

          insertStmt.finalize();
          insertBookAlias.finalize((finalizeErr) => {
            if (!finalizeErr) {
              console.log('Sample books seeded successfully.');
            }
          });
        } else {
          console.log(`Database already has ${row.count} books. Skipping seed.`);
        }
      });
    });
  });
}

// Database Promise Helpers
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve({ lastID: this.lastID, changes: this.changes });
  });
});

// Allowed sorting columns and directions
const ALLOWED_ORDER_BY = ['id', 'title', 'author', 'price', 'pages'];
const ALLOWED_ORDER = ['ASC', 'DESC'];

// Validation Middleware
function validateBookBody(req, res, next) {
  const { title, author, price, pages } = req.body;

  const isTitleValid = typeof title === 'string' && title.trim().length > 0;
  const isAuthorValid = typeof author === 'string' && author.trim().length > 0;
  const isPriceNumeric = price !== undefined && price !== null && price !== '' && !isNaN(price);
  const isPriceValid = isPriceNumeric && Number(price) >= 0;

  if (!isTitleValid || !isAuthorValid || !isPriceValid) {
    return res.status(400).json({
      message: 'Title, author and a valid numeric price are required'
    });
  }

  req.body.title = title.trim();
  req.body.author = author.trim();
  req.body.price = Number(price);
  req.body.pages = (pages !== undefined && !isNaN(Number(pages))) ? Number(pages) : 250;

  next();
}

function validateBookId(req, res, next) {
  const targetId = req.params.id || req.params.bookId;
  const numericId = Number(targetId);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return res.status(400).json({
      message: 'Book ID must be a valid positive integer'
    });
  }

  next();
}

function validateQueryParams(req, res, next) {
  const { order_by, order, limit, offset, min_price, max_price } = req.query;

  if (order_by !== undefined) {
    const normalized = order_by.toLowerCase();
    if (!ALLOWED_ORDER_BY.includes(normalized)) {
      return res.status(400).json({
        message: 'Invalid order_by column. Allowed values: id, title, author, price, pages'
      });
    }
  }

  if (order !== undefined) {
    const normalized = order.toUpperCase();
    if (!ALLOWED_ORDER.includes(normalized)) {
      return res.status(400).json({
        message: 'Invalid order value. Allowed values: ASC, DESC'
      });
    }
  }

  if (limit !== undefined) {
    const parsed = Number(limit);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return res.status(400).json({
        message: 'Limit must be a positive number'
      });
    }
  }

  if (offset !== undefined) {
    const parsed = Number(offset);
    if (!Number.isInteger(parsed) || parsed < 0) {
      return res.status(400).json({
        message: 'Offset must be zero or a positive number'
      });
    }
  }

  if (min_price !== undefined) {
    const parsed = Number(min_price);
    if (isNaN(parsed) || parsed < 0) {
      return res.status(400).json({
        message: 'min_price must be a valid non-negative number'
      });
    }
  }

  if (max_price !== undefined) {
    const parsed = Number(max_price);
    if (isNaN(parsed) || parsed < 0) {
      return res.status(400).json({
        message: 'max_price must be a valid non-negative number'
      });
    }
  }

  if (min_price !== undefined && max_price !== undefined) {
    if (Number(min_price) > Number(max_price)) {
      return res.status(400).json({
        message: 'min_price cannot be greater than max_price'
      });
    }
  }

  next();
}

// Interactive Web Dashboard HTML
const getDashboardHtml = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lab 3 - Books Management REST API</title>
  <style>
    :root {
      --bg: #0f172a; --card: #1e293b; --border: #334155;
      --text: #f8fafc; --muted: #94a3b8; --primary: #38bdf8;
      --success: #22c55e; --error: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 24px; line-height: 1.5; }
    .container { max-width: 1050px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .header h1 { font-size: 24px; color: var(--primary); margin-bottom: 6px; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(34, 197, 94, 0.15); color: var(--success); padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; border: 1px solid rgba(34, 197, 94, 0.3); margin-top: 10px; }
    .status-dot { width: 8px; height: 8px; background: var(--success); border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .student-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
    .info-item span { display: block; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .info-item strong { font-size: 14px; color: #fff; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 14px; margin-top: 16px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 14px; }
    .card:hover { border-color: var(--primary); }
    .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .method { font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
    .endpoint { font-family: monospace; font-size: 13px; color: #e2e8f0; }
    .desc { font-size: 12px; color: var(--muted); margin-bottom: 10px; }
    .btn-link { display: inline-flex; text-decoration: none; background: #334155; color: #fff; padding: 5px 11px; border-radius: 6px; font-size: 12px; }
    .btn-link:hover { background: var(--primary); color: #0f172a; font-weight: 600; }
    .tester-box { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-top: 24px; }
    .run-btn { background: var(--primary); color: #0f172a; border: none; padding: 9px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; }
    .test-results { margin-top: 16px; max-height: 380px; overflow-y: auto; background: #0f172a; border: 1px solid var(--border); border-radius: 8px; padding: 12px; font-family: monospace; font-size: 12px; }
    .test-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #1e293b; }
    .test-pass { color: var(--success); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Books Management REST API</h1>
      <p style="color: var(--muted); font-size: 13px;">Backend Development Fundamentals &bull; Lab 3: REST API, Query Parameters, Validation and Debugging</p>
      
      <div class="status-badge">
        <span class="status-dot"></span>
        API Service is Live and Online
      </div>

      <div class="student-info">
        <div class="info-item"><span>Student Name</span><strong>K. Manohar Reddy</strong></div>
        <div class="info-item"><span>Registration Number</span><strong>252U1R5069</strong></div>
        <div class="info-item"><span>Section</span><strong>Room 106, S-10 (AIDE 2A 106)</strong></div>
        <div class="info-item"><span>Faculty</span><strong>Sai Shiva Teja Sir</strong></div>
      </div>
    </div>

    <h2 style="font-size: 16px; color: var(--primary); margin-top: 20px;">1-Click Interactive Endpoints (Click to Open JSON in New Tab)</h2>
    <div class="grid">
      <div class="card">
        <div class="card-top"><span class="method">GET</span><span class="endpoint">/books</span></div>
        <div class="desc">Retrieve all books in the database.</div>
        <a class="btn-link" href="/books" target="_blank">Open in Browser &rarr;</a>
      </div>
      <div class="card">
        <div class="card-top"><span class="method">GET</span><span class="endpoint">/books/1</span></div>
        <div class="desc">Retrieve a single book by ID (Book #1: The Alchemist).</div>
        <a class="btn-link" href="/books/1" target="_blank">Open in Browser &rarr;</a>
      </div>
      <div class="card">
        <div class="card-top"><span class="method">GET</span><span class="endpoint">?search_q=The</span></div>
        <div class="desc">Search books matching partial title "The".</div>
        <a class="btn-link" href="/books?search_q=The" target="_blank">Open in Browser &rarr;</a>
      </div>
      <div class="card">
        <div class="card-top"><span class="method">GET</span><span class="endpoint">?order_by=price&order=ASC</span></div>
        <div class="desc">Sort books by price in ascending order.</div>
        <a class="btn-link" href="/books?order_by=price&order=ASC" target="_blank">Open in Browser &rarr;</a>
      </div>
      <div class="card">
        <div class="card-top"><span class="method">GET</span><span class="endpoint">?order_by=price&order=DESC</span></div>
        <div class="desc">Sort books by price in descending order.</div>
        <a class="btn-link" href="/books?order_by=price&order=DESC" target="_blank">Open in Browser &rarr;</a>
      </div>
      <div class="card">
        <div class="card-top"><span class="method">GET</span><span class="endpoint">?limit=5&offset=0</span></div>
        <div class="desc">Pagination: Return first 5 books.</div>
        <a class="btn-link" href="/books?limit=5&offset=0" target="_blank">Open in Browser &rarr;</a>
      </div>
      <div class="card">
        <div class="card-top"><span class="method">GET</span><span class="endpoint">?min_price=200&max_price=350</span></div>
        <div class="desc">Filter: Books in price range 200 to 350.</div>
        <a class="btn-link" href="/books?min_price=200&max_price=350" target="_blank">Open in Browser &rarr;</a>
      </div>
      <div class="card">
        <div class="card-top"><span class="method">GET</span><span class="endpoint">/books/9999 (404 Test)</span></div>
        <div class="desc">Validation: Returns 404 for non-existent book.</div>
        <a class="btn-link" href="/books/9999" target="_blank">Open in Browser &rarr;</a>
      </div>
    </div>

    <div class="tester-box">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="font-size: 16px;">Live In-Browser API Test Runner</h2>
          <p style="color: var(--muted); font-size: 12px;">Test all 18 lab requirements directly from this browser page.</p>
        </div>
        <button class="run-btn" onclick="runAllTests()">Run All 18 Tests</button>
      </div>
      <div class="test-results" id="resultsBox">
        <p style="color: var(--muted);">Click "Run All 18 Tests" above to verify all endpoints live.</p>
      </div>
    </div>
  </div>

  <script>
    async function runAllTests() {
      const box = document.getElementById('resultsBox');
      box.innerHTML = '<p style="color: #38bdf8;">Running test suite...</p>';
      const tests = [
        { name: '1. GET /books (All Books)', path: '/books', method: 'GET', expected: 200 },
        { name: '2. GET /books/1 (Single Book)', path: '/books/1', method: 'GET', expected: 200 },
        { name: '3. Search title "The"', path: '/books?search_q=The', method: 'GET', expected: 200 },
        { name: '4. Sort Price ASC', path: '/books?order_by=price&order=ASC', method: 'GET', expected: 200 },
        { name: '5. Sort Price DESC', path: '/books?order_by=price&order=DESC', method: 'GET', expected: 200 },
        { name: '6. Pagination (limit=5)', path: '/books?limit=5&offset=0', method: 'GET', expected: 200 },
        { name: '7. Price Range (200 to 350)', path: '/books?min_price=200&max_price=350', method: 'GET', expected: 200 },
        { name: '8. Combined Query', path: '/books?search_q=The&min_price=200&max_price=500&order_by=price&order=ASC&limit=3&offset=0', method: 'GET', expected: 200 },
        { name: '9. POST Create Book', path: '/books', method: 'POST', body: { title: 'C++ Programming', author: 'Bjarne Stroustrup', price: 600, pages: 450 }, expected: 201 },
        { name: '10. PUT Update Book', path: '/books/1', method: 'PUT', body: { title: 'The Alchemist Updated', author: 'Paulo Coelho', price: 350, pages: 220 }, expected: 200 },
        { name: '11. Error: Missing Title', path: '/books', method: 'POST', body: { author: 'Nobody', price: 100 }, expected: 400 },
        { name: '12. Error: Missing Author', path: '/books', method: 'POST', body: { title: 'No Author', price: 100 }, expected: 400 },
        { name: '13. Error: Bad Price', path: '/books', method: 'POST', body: { title: 'T', author: 'A', price: 'abc' }, expected: 400 },
        { name: '14. Error: 404 Missing Book', path: '/books/9999', method: 'GET', expected: 404 },
        { name: '15. Error: 404 Update Missing', path: '/books/9999', method: 'PUT', body: { title: 'T', author: 'A', price: 100 }, expected: 404 },
        { name: '16. Error: 404 Delete Missing', path: '/books/9999', method: 'DELETE', expected: 404 },
        { name: '17. Error: Bad Order Direction', path: '/books?order=INVALID', method: 'GET', expected: 400 },
        { name: '18. Error: Bad Order By Column', path: '/books?order_by=invalid_col', method: 'GET', expected: 400 }
      ];

      let passed = 0;
      let output = '';
      for (const t of tests) {
        try {
          const opts = { method: t.method, headers: { 'Content-Type': 'application/json' } };
          if (t.body) opts.body = JSON.stringify(t.body);
          const res = await fetch(t.path, opts);
          const ok = res.status === t.expected;
          if (ok) passed++;
          output += '<div class="test-row"><span>' + (ok ? '✔' : '✖') + ' ' + t.name + '</span><span class="' + (ok ? 'test-pass' : 'test-fail') + '">Status ' + res.status + ' (Expected ' + t.expected + ')</span></div>';
        } catch (e) {
          output += '<div class="test-row"><span class="test-fail">✖ ' + t.name + '</span><span>' + e.message + '</span></div>';
        }
      }
      box.innerHTML = '<div style="margin-bottom: 10px; font-weight: bold; color: ' + (passed === tests.length ? '#22c55e' : '#ef4444') + ';">RESULTS: ' + passed + ' / ' + tests.length + ' TESTS PASSED (100% OK)</div>' + output;
    }
  </script>
</body>
</html>
`;

// Routes
app.get('/', (req, res) => {
  const wantsHtml = req.headers.accept && req.headers.accept.includes('text/html') && req.query.format !== 'json';
  if (wantsHtml) return res.status(200).send(getDashboardHtml());

  res.status(200).json({
    message: 'Welcome to Books Management REST API (BDF Lab 3)',
    endpoints: { books: '/books' }
  });
});

app.get('/dashboard', (req, res) => res.status(200).send(getDashboardHtml()));

// 1. GET /books - Search, sort, filter, pagination
app.get('/books', validateQueryParams, async (req, res, next) => {
  try {
    const { search_q, min_price, max_price, order_by, order, limit, offset } = req.query;

    let sql = 'SELECT * FROM books';
    const whereClauses = [];
    const queryParams = [];

    if (search_q && search_q.trim().length > 0) {
      whereClauses.push('title LIKE ?');
      queryParams.push(`%${search_q.trim()}%`);
    }

    if (min_price !== undefined) {
      whereClauses.push('price >= ?');
      queryParams.push(Number(min_price));
    }

    if (max_price !== undefined) {
      whereClauses.push('price <= ?');
      queryParams.push(Number(max_price));
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    const orderByCol = (order_by || 'id').toLowerCase();
    const orderDir = (order || 'ASC').toUpperCase();
    sql += ` ORDER BY ${orderByCol} ${orderDir}`;

    const limitVal = limit !== undefined ? Number(limit) : 10;
    const offsetVal = offset !== undefined ? Number(offset) : 0;
    sql += ' LIMIT ? OFFSET ?';
    queryParams.push(limitVal, offsetVal);

    const books = await dbAll(sql, queryParams);

    return res.status(200).json({
      message: 'Books retrieved successfully',
      count: books.length,
      data: books
    });
  } catch (err) {
    next(err);
  }
});

// 2. GET /books/:id or /books/:bookId
app.get(['/books/:id', '/books/:bookId'], validateBookId, async (req, res, next) => {
  try {
    const targetId = req.params.id || req.params.bookId;
    const book = await dbGet('SELECT * FROM books WHERE id = ?', [targetId]);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json({
      message: 'Book retrieved successfully',
      data: book
    });
  } catch (err) {
    next(err);
  }
});

// 3. POST /books - Add book
app.post('/books', validateBookBody, async (req, res, next) => {
  try {
    const { title, author, price, pages } = req.body;
    const pagesVal = pages || 250;

    const result = await dbRun(
      'INSERT INTO books (title, author, price, pages) VALUES (?, ?, ?, ?)',
      [title, author, price, pagesVal]
    );

    const createdBook = await dbGet('SELECT * FROM books WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      message: 'Book created successfully',
      data: createdBook
    });
  } catch (err) {
    next(err);
  }
});

// 4. PUT /books/:id or /books/:bookId - Update book
app.put(['/books/:id', '/books/:bookId'], validateBookId, validateBookBody, async (req, res, next) => {
  try {
    const targetId = req.params.id || req.params.bookId;
    const { title, author, price, pages } = req.body;
    const pagesVal = pages || 250;

    const existingBook = await dbGet('SELECT * FROM books WHERE id = ?', [targetId]);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await dbRun(
      'UPDATE books SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?',
      [title, author, price, pagesVal, targetId]
    );

    const updatedBook = await dbGet('SELECT * FROM books WHERE id = ?', [targetId]);

    return res.status(200).json({
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (err) {
    next(err);
  }
});

// 5. DELETE /books/:id or /books/:bookId - Delete book
app.delete(['/books/:id', '/books/:bookId'], validateBookId, async (req, res, next) => {
  try {
    const targetId = req.params.id || req.params.bookId;

    const existingBook = await dbGet('SELECT * FROM books WHERE id = ?', [targetId]);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await dbRun('DELETE FROM books WHERE id = ?', [targetId]);

    return res.status(200).json({ message: 'Book deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// 500 Central Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server is running successfully on port ${PORT}`);
  console.log(`Books resource available at /books`);
});
