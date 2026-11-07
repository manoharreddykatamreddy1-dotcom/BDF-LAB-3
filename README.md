# Backend Development Fundamentals

## Lab 3: REST API, Query Parameters, Validation and Debugging

---

### Student Information

- **Student Name:** K. Manohar Reddy
- **Registration Number:** 252U1R5069
- **Section:** AIDE 2A 106
- **Faculty Name:** Siva Sai Teja
- **Subject:** Backend Development Fundamentals
- **Year/Term:** Year II – Term II
- **Project Name:** `BDF_Lab_03_REST_API`

---

## 1. Objective

The objective of this laboratory assignment is to design and implement a production-grade, beginner-friendly **Books Management REST API** using Node.js, Express, and SQLite.

Key learning outcomes demonstrated:
- Adhering to RESTful endpoint architecture and HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).
- Query parameter handling for partial search (`LIKE`), multi-column sorting (`ASC`/`DESC`), pagination (`limit`, `offset`), and price range filtering (`min_price`, `max_price`).
- Whitelisting and input validation middleware to guard against invalid parameters and malformed request payloads.
- Parameterized SQL queries to prevent SQL Injection vulnerabilities.
- Consistent JSON responses for both success and error payloads.
- Correct usage of standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
- Practical backend debugging strategies for common Node.js and SQL issues.

---

## 2. Technologies Used

- **Node.js** (v18+ or v24+): JavaScript runtime environment.
- **Express.js** (v4/v5): Minimalist web application framework for handling routes, middleware, and HTTP requests.
- **SQLite3** (`sqlite3`): Lightweight, file-based relational database.
- **dotenv**: Environment variable management.
- **nodemon**: Development tool that automatically restarts the Node server upon code changes.

---

## 3. Project Structure

```text
BDF_Lab_03_REST_API/
│
├── server.js              # Application entry point, Express server & global middleware
├── database.js            # SQLite database initialization, table creation & seeding
├── package.json           # Project manifest, dependencies, and execution scripts
├── .env.example           # Example environment variables template
├── .gitignore             # Git ignore configuration
├── README.md              # Complete project documentation & lab report
├── books.db               # SQLite database file (created automatically at runtime)
│
├── routes/
│   └── books.js           # REST API route handlers for /books resource
│
└── middleware/
    └── validation.js      # Input validation middleware for query params and bodies
```

---

## 4. Installation Steps

Follow these steps in your VS Code terminal:

1. **Open the project folder:**
   ```bash
   cd "BDF_Lab_03_REST_API"
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Configure environment variables:**
   If you wish to customize the server port, create a `.env` file from `.env.example`:
   ```bash
   copy .env.example .env
   ```
   *(By default, if no `.env` is provided, the server runs on port 3000.)*

---

## 5. How to Run the Project

### Development Mode (Recommended for development and viva demonstration)
Uses `nodemon` to automatically restart whenever code is edited:
```bash
npm run dev
```

### Production / Standard Mode
Runs directly with standard Node.js:
```bash
npm start
```

When started, you will see output similar to:
```text
Server is running successfully on http://localhost:3000
Books resource available at http://localhost:3000/books
Connected to SQLite database: books.db
Database already initialized with 12 books. Skipping seed.
```

---

## 6. Database Details

- **Database Engine:** SQLite
- **Database File:** `books.db` (auto-created in the project root if it does not exist)
- **Table Name:** `books`

### Table Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier for each book |
| `title` | TEXT | NOT NULL | Title of the book |
| `author` | TEXT | NOT NULL | Author of the book |
| `price` | REAL | NOT NULL | Selling price of the book |

### Table Creation DDL
```sql
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price REAL NOT NULL
);
```

### Automatic Seeding & Duplicate Prevention
On server startup, `database.js` runs a count query:
```sql
SELECT COUNT(*) AS count FROM books;
```
If `count === 0`, it inserts **12 curated sample books**. If books already exist, seeding is safely skipped so that duplicate records are never created on server restarts.

---

## 7. API Endpoints

The API strictly adheres to REST principles using the `/books` resource:

| HTTP Method | Endpoint | Description | Success Status | Failure Status |
|---|---|---|---|---|
| `GET` | `/books` | Retrieve all books (with search, sort, filter, pagination) | `200 OK` | `400 Bad Request` |
| `GET` | `/books/:id` | Retrieve a single book by ID | `200 OK` | `400 Bad Request`, `404 Not Found` |
| `POST` | `/books` | Create a new book | `201 Created` | `400 Bad Request` |
| `PUT` | `/books/:id` | Update an existing book by ID | `200 OK` | `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/books/:id` | Delete a book by ID | `200 OK` | `400 Bad Request`, `404 Not Found` |

---

## 8. Query Parameters (for `GET /books`)

| Parameter | Type | Default | Description | Example |
|---|---|---|---|---|
| `search_q` | String | *None* | Case-insensitive partial title match using SQL `LIKE` | `GET /books?search_q=python` |
| `order_by` | String | `id` | Column to sort by. Whitelisted: `id`, `title`, `author`, `price` | `GET /books?order_by=price` |
| `order` | String | `ASC` | Sort direction. Allowed: `ASC`, `DESC` | `GET /books?order=DESC` |
| `limit` | Integer | `10` | Maximum number of records to return (must be positive integer > 0) | `GET /books?limit=5` |
| `offset` | Integer | `0` | Number of records to skip (must be integer >= 0) | `GET /books?offset=5` |
| `min_price` | Number | *None* | Minimum price boundary (price >= min_price) | `GET /books?min_price=200` |
| `max_price` | Number | *None* | Maximum price boundary (price <= max_price) | `GET /books?max_price=500` |

### Combined Example:
```text
GET /books?search_q=code&min_price=200&max_price=600&order_by=price&order=ASC&limit=5&offset=0
```

---

## 9. Validation Rules

All requests are validated by reusable middleware located in `middleware/validation.js`:

1. **Book Body Validation (`validateBookBody` for `POST` and `PUT`):**
   - `title`: Must be a non-empty string.
   - `author`: Must be a non-empty string.
   - `price`: Must be present, numeric, and non-negative (`price >= 0`).
   - Failure returns status `400 Bad Request` with:
     ```json
     {
       "message": "Title, author and a valid numeric price are required"
     }
     ```

2. **Route Parameter Validation (`validateBookId`):**
   - `:id` must parse into a positive integer (`id > 0`).
   - Invalid formats return `400 Bad Request` with:
     ```json
     {
       "message": "Book ID must be a valid positive integer"
     }
     ```

3. **Query Parameter Validation (`validateQueryParams`):**
   - `order_by`: Must match whitelist `['id', 'title', 'author', 'price']`. Returns `400` if invalid.
   - `order`: Must match `['ASC', 'DESC']`. Returns `400` if invalid.
   - `limit`: Must be integer > 0. Returns `400` if invalid.
   - `offset`: Must be integer >= 0. Returns `400` if invalid.
   - `min_price` / `max_price`: Must be valid non-negative numbers. Returns `400` if invalid.
   - If `min_price > max_price`, returns `400 Bad Request` (`"min_price cannot be greater than max_price"`).

4. **Database Security:**
   - All dynamic filtering and insertion values use parameterized queries (`?` placeholders in SQLite) to prevent SQL Injection.
   - Sorting columns (`order_by`) are strictly whitelist-checked before being placed into SQL query strings.

---

## 10. HTTP Status Codes

The API strictly implements standard HTTP status codes:

| Status Code | Reason Phrase | Used When |
|---|---|---|
| **200** | OK | Successful `GET` (single/list), successful `PUT` update, successful `DELETE` |
| **201** | Created | Successful `POST` creating a new book resource |
| **400** | Bad Request | Validation failure (missing fields, invalid price, bad query params) |
| **404** | Not Found | Requested book ID does not exist in the database, or invalid route |
| **500** | Internal Server Error | Unhandled server or database error |

### Uniform Response Format

**Success Format:**
```json
{
  "message": "Clear description of successful operation",
  "data": {} // or [] for collections
}
```

**Error Format:**
```json
{
  "message": "Clear description of the error"
}
```

---

## 11. Debugging Common Errors (Viva & Lab Practical Guide)

### A. EADDRINUSE – PORT CONFLICT

#### 1. What it means
`EADDRINUSE` stands for *"Error: Address Already In Use"*. It indicates that the network port (e.g., `3000`) that your Express server is attempting to bind to is already occupied by another running application or an orphaned Node.js background process.

#### 2. Why it happens
- You started `node server.js` in another terminal tab and forgot to stop it.
- A previous execution crashed without releasing the socket.
- Another software application (like Grafana, React dev server, or another service) is listening on port 3000.

#### 3. How to stop the process using the port
- **On Windows (PowerShell / Command Prompt):**
  1. Find the Process ID (PID) using the port:
     ```powershell
     netstat -ano | findstr :3000
     ```
  2. Kill the process by PID:
     ```powershell
     taskkill /PID <PID_NUMBER> /F
     ```
- **On Linux / macOS:**
  ```bash
  lsof -i :3000
  kill -9 <PID_NUMBER>
  ```

#### 4. How to change the port
Change the `PORT` variable in your `.env` file:
```env
PORT=4000
```
Or specify it inline when launching:
```powershell
$env:PORT=4000; npm run dev
```

---

### B. WRONG IMPORT PATH

#### 1. What happens
When Node.js encounters an invalid file path in a `require(...)` statement, it throws a fatal runtime exception:
```text
Error: Cannot find module '../routes/book'
code: 'MODULE_NOT_FOUND'
```
The application crashes immediately upon startup.

#### 2. How to check folder and file names
- File systems on Linux and production servers are case-sensitive (`books.js` is not the same as `Books.js`).
- Relative paths:
  - `./` refers to the current directory.
  - `../` navigates up one parent directory.
- Verify directory trees using:
  ```powershell
  tree /F
  ```

#### 3. How to correct the import statement
In `server.js`, import the books route as:
```javascript
const booksRouter = require('./routes/books'); // Correct relative path
```
In `routes/books.js`, import the database and middleware as:
```javascript
const { all, get, run } = require('../database');
const { validateBookBody, validateBookId, validateQueryParams } = require('../middleware/validation');
```

---

### C. NO SUCH TABLE

#### 1. What it means
SQLite throws:
```text
SQLITE_ERROR: no such table: books
```
This means an SQL query (`SELECT`, `INSERT`, etc.) was executed against a table name that does not exist inside the currently opened SQLite database file.

#### 2. How an incorrect table name causes the problem
- Typos in the SQL query (e.g., `SELECT * FROM tbl_books` or `SELECT * FROM book` instead of `books`).
- The database connection was opened to a new, empty file because of an incorrect relative file path (e.g., creating a second `books.db` inside a subfolder).

#### 3. How to ensure the database and table are created correctly
1. Always use `path.join(__dirname, 'books.db')` in `database.js` to ensure the exact absolute path to the database file is always resolved regardless of where the command was executed.
2. Execute the `CREATE TABLE IF NOT EXISTS` statement immediately when the database connection opens:
   ```javascript
   const createTableQuery = `
     CREATE TABLE IF NOT EXISTS books (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       title TEXT NOT NULL,
       author TEXT NOT NULL,
       price REAL NOT NULL
     )
   `;
   db.run(createTableQuery);
   ```

---

### D. MISSING AWAIT

#### 1. What `async` and `await` mean
- In JavaScript, asynchronous operations (like database queries, network requests, or file reading) do not finish instantaneously; they return a **Promise** that resolves in the future.
- An `async` function allows you to write asynchronous code that reads synchronously.
- The `await` keyword pauses execution inside the `async` function until the Promise resolves, unwrapping the returned value.

#### 2. What happens when `await` is missing
If you forget `await`:
```javascript
// BUG: Missing await
const book = get('SELECT * FROM books WHERE id = ?', [id]);
console.log(book); // Prints: Promise { <pending> }
```
- The variable `book` does NOT contain the database row; it contains an unresolved `Promise` object!
- In JavaScript, any object (including a pending Promise) is **truthy**. Therefore, checks like `if (!book)` will never trigger a `404`, and `res.json({ data: book })` will serialize an empty object `{}` to the client!

#### 3. Simple Viva Example:
```javascript
// INCORRECT (Missing await):
router.get('/:id', async (req, res) => {
  const book = dbHelper.get('SELECT * FROM books WHERE id = ?', [req.params.id]);
  // book is Promise { <pending> }, NOT the database record!
  res.json({ data: book }); // Sends empty {}
});

// CORRECT:
router.get('/:id', async (req, res) => {
  const book = await dbHelper.get('SELECT * FROM books WHERE id = ?', [req.params.id]);
  // Execution paused until database responds; book is now the actual row
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  res.json({ message: 'Book retrieved successfully', data: book });
});
```

---

## 12. Postman Testing Guide

Open Postman, create a new Collection named **"BDF Lab 3 - Books API"**, and test the following requests.

---

### A. SUCCESS TEST CASES

#### 1. Get all books
- **Method:** `GET`
- **URL:** `http://localhost:3000/books`
- **Expected Status:** `200 OK`
- **Expected Response:** List of all books.

#### 2. Get a single book
- **Method:** `GET`
- **URL:** `http://localhost:3000/books/1`
- **Expected Status:** `200 OK`
- **Expected Response:** Book with `id: 1`.

#### 3. Search books
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?search_q=python`
- **Expected Status:** `200 OK`
- **Expected Response:** Books with "python" in their title (e.g. *Learning Python*, *Python Crash Course*).

#### 4. Sort books (Ascending)
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?order_by=price&order=ASC`
- **Expected Status:** `200 OK`
- **Expected Response:** Books sorted from lowest price to highest price.

#### 5. Descending sort
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?order_by=price&order=DESC`
- **Expected Status:** `200 OK`
- **Expected Response:** Books sorted from highest price to lowest price.

#### 6. Limit records
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?limit=5`
- **Expected Status:** `200 OK`
- **Expected Response:** Exactly 5 book records.

#### 7. Offset records
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?limit=5&offset=5`
- **Expected Status:** `200 OK`
- **Expected Response:** 5 records skipping the first 5 (records 6 to 10).

#### 8. Minimum price filter
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?min_price=200`
- **Expected Status:** `200 OK`
- **Expected Response:** Only books where `price >= 200`.

#### 9. Maximum price filter
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?max_price=500`
- **Expected Status:** `200 OK`
- **Expected Response:** Only books where `price <= 500`.

#### 10. Price range
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?min_price=200&max_price=500`
- **Expected Status:** `200 OK`
- **Expected Response:** Books where `price >= 200 AND price <= 500`.

#### 11. Create a book
- **Method:** `POST`
- **URL:** `http://localhost:3000/books`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "title": "Node.js Basics",
    "author": "John Smith",
    "price": 450
  }
  ```
- **Expected Status:** `201 Created`
- **Expected Response:**
  ```json
  {
    "message": "Book created successfully",
    "data": {
      "id": 13,
      "title": "Node.js Basics",
      "author": "John Smith",
      "price": 450
    }
  }
  ```

#### 12. Update a book
- **Method:** `PUT`
- **URL:** `http://localhost:3000/books/1`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "title": "The Pragmatic Programmer (20th Anniversary Edition)",
    "author": "Andrew Hunt and David Thomas",
    "price": 599.99
  }
  ```
- **Expected Status:** `200 OK`
- **Expected Response:**
  ```json
  {
    "message": "Book updated successfully",
    "data": {
      "id": 1,
      "title": "The Pragmatic Programmer (20th Anniversary Edition)",
      "author": "Andrew Hunt and David Thomas",
      "price": 599.99
    }
  }
  ```

#### 13. Delete a book
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/books/1`
- **Expected Status:** `200 OK`
- **Expected Response:**
  ```json
  {
    "message": "Book deleted successfully"
  }
  ```

---

### B. FAILURE TEST CASES

#### 1. Missing Title
- **Method:** `POST`
- **URL:** `http://localhost:3000/books`
- **Body:**
  ```json
  {
    "author": "John Smith",
    "price": 450
  }
  ```
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
  ```json
  {
    "message": "Title, author and a valid numeric price are required"
  }
  ```

#### 2. Missing Author
- **Method:** `POST`
- **URL:** `http://localhost:3000/books`
- **Body:**
  ```json
  {
    "title": "Node.js Basics",
    "price": 450
  }
  ```
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
  ```json
  {
    "message": "Title, author and a valid numeric price are required"
  }
  ```

#### 3. Invalid Price
- **Method:** `POST`
- **URL:** `http://localhost:3000/books`
- **Body:**
  ```json
  {
    "title": "Test Book",
    "author": "Test Author",
    "price": "abc"
  }
  ```
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
  ```json
  {
    "message": "Title, author and a valid numeric price are required"
  }
  ```

#### 4. Non-Existing Book
- **Method:** `GET`
- **URL:** `http://localhost:3000/books/9999`
- **Expected Status:** `404 Not Found`
- **Expected Response:**
  ```json
  {
    "message": "Book not found"
  }
  ```

#### 5. Update Non-Existing Book
- **Method:** `PUT`
- **URL:** `http://localhost:3000/books/9999`
- **Body:**
  ```json
  {
    "title": "Ghost Book",
    "author": "Nobody",
    "price": 100
  }
  ```
- **Expected Status:** `404 Not Found`
- **Expected Response:**
  ```json
  {
    "message": "Book not found"
  }
  ```

#### 6. Delete Non-Existing Book
- **Method:** `DELETE`
- **URL:** `http://localhost:3000/books/9999`
- **Expected Status:** `404 Not Found`
- **Expected Response:**
  ```json
  {
    "message": "Book not found"
  }
  ```

#### 7. Invalid Order Direction
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?order=INVALID`
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
  ```json
  {
    "message": "Invalid order value. Allowed values: ASC, DESC"
  }
  ```

#### 8. Invalid Order By Column
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?order_by=invalid_column`
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
  ```json
  {
    "message": "Invalid order_by column. Allowed values: id, title, author, price"
  }
  ```

#### 9. Invalid Limit
- **Method:** `GET`
- **URL:** `http://localhost:3000/books?limit=-5`
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
  ```json
  {
    "message": "Limit must be a positive number"
  }
  ```

---

## 13. Expected Output

### Sample: `GET /books?limit=2`
```json
{
  "message": "Books retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "The Pragmatic Programmer",
      "author": "Andrew Hunt and David Thomas",
      "price": 550
    },
    {
      "id": 2,
      "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
      "author": "Robert C. Martin",
      "price": 480
    }
  ]
}
```

### Sample: `POST /books` (201 Created)
```json
{
  "message": "Book created successfully",
  "data": {
    "id": 13,
    "title": "Node.js Basics",
    "author": "John Smith",
    "price": 450
  }
}
```

### Sample: `GET /books/9999` (404 Not Found)
```json
{
  "message": "Book not found"
}
```

---

## 14. Conclusion

In this lab, a complete, robust, and clean Books Management REST API was developed from the ground up:
1. Applied standard RESTful resource modeling conventions using `/books`.
2. Implemented dynamic SQL queries using parameterized inputs to prevent SQL Injection vulnerabilities.
3. Added comprehensive input validation middleware for query parameters and JSON payloads.
4. Guaranteed uniform JSON responses and accurate HTTP status codes (`200`, `201`, `400`, `404`, `500`).
5. Successfully documented and tested 13 success scenarios and 9 edge/failure scenarios in Postman.
6. Analyzed critical backend debugging topics (`EADDRINUSE`, import paths, missing table, missing await) to prepare for viva evaluations.
