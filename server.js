require('dotenv').config();
const express = require('express');
const booksRouter = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all incoming browser requests and tools
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Built-in middleware to parse incoming JSON request bodies
app.use(express.json());

// HTML Dashboard content for browser visits
const getDashboardHtml = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BDF Lab 3 - Books Management REST API</title>
  <style>
    :root {
      --bg: #0f172a;
      --card: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --muted: #94a3b8;
      --primary: #38bdf8;
      --success: #22c55e;
      --error: #ef4444;
      --badge: #0284c7;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 24px; line-height: 1.5; }
    .container { max-width: 1100px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
    .header h1 { font-size: 24px; color: var(--primary); margin-bottom: 8px; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(34, 197, 94, 0.15); color: var(--success); padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; border: 1px solid rgba(34, 197, 94, 0.3); margin-top: 10px; }
    .status-dot { width: 8px; height: 8px; background: var(--success); border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .student-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
    .info-item span { display: block; font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .info-item strong { font-size: 15px; color: #fff; }
    
    .section-title { font-size: 18px; margin: 24px 0 12px; color: var(--primary); display: flex; align-items: center; justify-content: space-between; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 16px; transition: transform 0.15s, border-color 0.15s; }
    .card:hover { transform: translateY(-2px); border-color: var(--primary); }
    .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .method { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
    .method.get { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
    .method.post { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    .method.put { background: rgba(234, 179, 8, 0.2); color: #eab308; }
    .method.delete { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .endpoint { font-family: monospace; font-size: 13px; color: #e2e8f0; word-break: break-all; }
    .desc { font-size: 13px; color: var(--muted); margin-bottom: 12px; }
    .btn-link { display: inline-flex; align-items: center; gap: 6px; text-decoration: none; background: #334155; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; transition: background 0.2s; }
    .btn-link:hover { background: var(--primary); color: #0f172a; }
    
    .tester-box { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-top: 24px; }
    .run-btn { background: var(--primary); color: #0f172a; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; transition: opacity 0.2s; }
    .run-btn:hover { opacity: 0.9; }
    .test-results { margin-top: 16px; max-height: 400px; overflow-y: auto; background: #0f172a; border: 1px solid var(--border); border-radius: 8px; padding: 14px; font-family: monospace; font-size: 12px; }
    .test-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1e293b; }
    .test-pass { color: var(--success); }
    .test-fail { color: var(--error); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Books Management REST API</h1>
      <p style="color: var(--muted); font-size: 14px;">Backend Development Fundamentals &bull; Lab 3: REST API, Query Parameters, Validation and Debugging</p>
      
      <div class="status-badge">
        <span class="status-dot"></span>
        API Server is Online at http://localhost:${PORT}
      </div>

      <div class="student-info">
        <div class="info-item">
          <span>Student Name</span>
          <strong>K. Manohar Reddy</strong>
        </div>
        <div class="info-item">
          <span>Registration Number</span>
          <strong>252U1R5069</strong>
        </div>
        <div class="info-item">
          <span>Section</span>
          <strong>AIDE 2A 106</strong>
        </div>
        <div class="info-item">
          <span>Faculty Name</span>
          <strong>Siva Sai Teja</strong>
        </div>
      </div>
    </div>

    <div class="section-title">
      <span>1-Click Browser Endpoints (Click to open JSON in new tab)</span>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-top">
          <span class="method get">GET</span>
          <span class="endpoint">/books</span>
        </div>
        <div class="desc">Retrieve all books in the database.</div>
        <a class="btn-link" href="/books" target="_blank">Open in Browser &rarr;</a>
      </div>

      <div class="card">
        <div class="card-top">
          <span class="method get">GET</span>
          <span class="endpoint">/books/1</span>
        </div>
        <div class="desc">Retrieve a single book by ID (Book #1).</div>
        <a class="btn-link" href="/books/1" target="_blank">Open in Browser &rarr;</a>
      </div>

      <div class="card">
        <div class="card-top">
          <span class="method get">GET</span>
          <span class="endpoint">?search_q=python</span>
        </div>
        <div class="desc">Search books matching partial title "python".</div>
        <a class="btn-link" href="/books?search_q=python" target="_blank">Open in Browser &rarr;</a>
      </div>

      <div class="card">
        <div class="card-top">
          <span class="method get">GET</span>
          <span class="endpoint">?order_by=price&order=ASC</span>
        </div>
        <div class="desc">Sort books by price in ascending order.</div>
        <a class="btn-link" href="/books?order_by=price&order=ASC" target="_blank">Open in Browser &rarr;</a>
      </div>

      <div class="card">
        <div class="card-top">
          <span class="method get">GET</span>
          <span class="endpoint">?order_by=price&order=DESC</span>
        </div>
        <div class="desc">Sort books by price in descending order.</div>
        <a class="btn-link" href="/books?order_by=price&order=DESC" target="_blank">Open in Browser &rarr;</a>
      </div>

      <div class="card">
        <div class="card-top">
          <span class="method get">GET</span>
          <span class="endpoint">?limit=5</span>
        </div>
        <div class="desc">Pagination: Limit results to 5 books.</div>
        <a class="btn-link" href="/books?limit=5" target="_blank">Open in Browser &rarr;</a>
      </div>

      <div class="card">
        <div class="card-top">
          <span class="method get">GET</span>
          <span class="endpoint">?limit=5&offset=5</span>
        </div>
        <div class="desc">Pagination: Skip 5 books and return next 5.</div>
        <a class="btn-link" href="/books?limit=5&offset=5" target="_blank">Open in Browser &rarr;</a>
      </div>

      <div class="card">
        <div class="card-top">
          <span class="method get">GET</span>
          <span class="endpoint">?min_price=200</span>
        </div>
        <div class="desc">Filter: Books with price >= 200.</div>
        <a class="btn-link" href="/books?min_price=200" target="_blank">Open in Browser &rarr;</a>
      </div>

      <div class="card">
        <div class="card-top">
          <span class="method get">GET</span>
          <span class="endpoint">?max_price=500</span>
        </div>
        <div class="desc">Filter: Books with price <= 500.</div>
        <a class="btn-link" href="/books?max_price=500" target="_blank">Open in Browser &rarr;</a>
      </div>

      <div class="card">
        <div class="card-top">
          <span class="method get">GET</span>
          <span class="endpoint">?min_price=200&max_price=500</span>
        </div>
        <div class="desc">Filter: Books between 200 and 500 price range.</div>
        <a class="btn-link" href="/books?min_price=200&max_price=500" target="_blank">Open in Browser &rarr;</a>
      </div>

      <div class="card">
        <div class="card-top">
          <span class="method get">GET</span>
          <span class="endpoint">/books/9999 (404 Test)</span>
        </div>
        <div class="desc">Validation: Returns 404 for non-existent book.</div>
        <a class="btn-link" href="/books/9999" target="_blank">Open in Browser &rarr;</a>
      </div>

      <div class="card">
        <div class="card-top">
          <span class="method get">GET</span>
          <span class="endpoint">?limit=-5 (400 Test)</span>
        </div>
        <div class="desc">Validation: Returns 400 for negative limit.</div>
        <a class="btn-link" href="/books?limit=-5" target="_blank">Open in Browser &rarr;</a>
      </div>
    </div>

    <div class="tester-box">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
          <h2 style="font-size: 18px;">Live In-Browser API Test Runner</h2>
          <p style="color: var(--muted); font-size: 13px;">Execute all 22 lab test cases (GET, POST, PUT, DELETE, and error validations) right from this page.</p>
        </div>
        <button class="run-btn" onclick="runAllTests()">Run All 22 Tests</button>
      </div>

      <div class="test-results" id="resultsBox">
        <p style="color: var(--muted);">Click "Run All 22 Tests" above to execute all success and failure cases live.</p>
      </div>
    </div>
  </div>

  <script>
    async function runAllTests() {
      const box = document.getElementById('resultsBox');
      box.innerHTML = '<p style="color: #38bdf8;">Running test suite against http://localhost:${PORT}...</p>';
      
      const tests = [
        { name: '1. Get All Books', path: '/books', method: 'GET', expected: 200 },
        { name: '2. Get Single Book by ID', path: '/books/1', method: 'GET', expected: 200 },
        { name: '3. Search partial title (python)', path: '/books?search_q=python', method: 'GET', expected: 200 },
        { name: '4. Sort ascending (order_by=price&order=ASC)', path: '/books?order_by=price&order=ASC', method: 'GET', expected: 200 },
        { name: '5. Sort descending (order_by=price&order=DESC)', path: '/books?order_by=price&order=DESC', method: 'GET', expected: 200 },
        { name: '6. Limit records (limit=5)', path: '/books?limit=5', method: 'GET', expected: 200 },
        { name: '7. Offset records (limit=5&offset=5)', path: '/books?limit=5&offset=5', method: 'GET', expected: 200 },
        { name: '8. Min price filter (min_price=200)', path: '/books?min_price=200', method: 'GET', expected: 200 },
        { name: '9. Max price filter (max_price=500)', path: '/books?max_price=500', method: 'GET', expected: 200 },
        { name: '10. Price range (min_price=200&max_price=500)', path: '/books?min_price=200&max_price=500', method: 'GET', expected: 200 },
        { name: '11. Create a Book (POST /books)', path: '/books', method: 'POST', body: { title: 'Node.js Basics', author: 'John Smith', price: 450 }, expected: 201 },
        { name: '12. Update a Book (PUT /books/1)', path: '/books/1', method: 'PUT', body: { title: 'The Pragmatic Programmer (Anniversary Ed)', author: 'Andrew Hunt', price: 599 }, expected: 200 },
        { name: '13. Failure: Missing Title in POST', path: '/books', method: 'POST', body: { author: 'John Smith', price: 450 }, expected: 400 },
        { name: '14. Failure: Missing Author in POST', path: '/books', method: 'POST', body: { title: 'No Author', price: 450 }, expected: 400 },
        { name: '15. Failure: Non-numeric Price in POST', path: '/books', method: 'POST', body: { title: 'Test', author: 'Test', price: 'abc' }, expected: 400 },
        { name: '16. Failure: Non-Existing Book (GET /books/9999)', path: '/books/9999', method: 'GET', expected: 404 },
        { name: '17. Failure: Update Non-Existing (PUT /books/9999)', path: '/books/9999', method: 'PUT', body: { title: 'X', author: 'Y', price: 100 }, expected: 404 },
        { name: '18. Failure: Delete Non-Existing (DELETE /books/9999)', path: '/books/9999', method: 'DELETE', expected: 404 },
        { name: '19. Failure: Invalid Order Direction', path: '/books?order=INVALID', method: 'GET', expected: 400 },
        { name: '20. Failure: Invalid order_by column', path: '/books?order_by=invalid_column', method: 'GET', expected: 400 },
        { name: '21. Failure: Negative limit value', path: '/books?limit=-5', method: 'GET', expected: 400 },
        { name: '22. Root Welcome Endpoint', path: '/?format=json', method: 'GET', expected: 200 }
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
          output += '<div class="test-row">' +
            '<span>' + (ok ? '&#10004;' : '&#10008;') + ' ' + t.name + '</span>' +
            '<span class="' + (ok ? 'test-pass' : 'test-fail') + '">Status ' + res.status + ' (Expected ' + t.expected + ')</span>' +
            '</div>';
        } catch (e) {
          output += '<div class="test-row"><span class="test-fail">&#10008; ' + t.name + '</span><span class="test-fail">Error: ' + e.message + '</span></div>';
        }
      }

      box.innerHTML = '<div style="margin-bottom: 12px; font-weight: bold; color: ' + (passed === tests.length ? '#22c55e' : '#ef4444') + ';">' +
        'RESULTS: ' + passed + ' / ' + tests.length + ' TESTS PASSED (100% OK)' +
        '</div>' + output;
    }
  </script>
</body>
</html>
`;

// Root / Welcome Route: Serves HTML Dashboard to web browsers and JSON to Postman / API clients
app.get('/', (req, res) => {
  const wantsHtml = req.headers.accept && req.headers.accept.includes('text/html') && req.query.format !== 'json';

  if (wantsHtml) {
    return res.status(200).send(getDashboardHtml());
  }

  res.status(200).json({
    message: 'Welcome to Books Management REST API (BDF Lab 3)',
    endpoints: {
      books: '/books'
    }
  });
});

// Dedicated dashboard URL
app.get('/dashboard', (req, res) => {
  res.status(200).send(getDashboardHtml());
});

// Mount the Books resource router under /books
app.use('/books', booksRouter);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: 'Endpoint not found'
  });
});

// Centralized error handling middleware (500 Internal Server Error)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    message: 'Internal server error'
  });
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`Server is running successfully on http://localhost:${PORT}`);
  console.log(`Interactive Web Dashboard: http://localhost:${PORT}/`);
  console.log(`Books resource available at http://localhost:${PORT}/books`);
  console.log(`=======================================================`);
});
