# Lab 3 - REST API, Query Parameters, Validation and Debugging

## Project Details

- **Name:** K. Manohar Reddy
- **Registration Number:** 252U1R5069
- **Section:** S-10 (Room 106, S-10 / AIDE 2A 106)
- **Department:** Artificial Intelligence and Data Engineering
- **University:** Aurora Higher Education and Research Academy
- **Course:** Backend Development Fundamentals (BDF) / ADBMS
- **Lab:** Lab 3 - REST API, Query Parameters, Validation and Debugging
- **Faculty:** Sai Shiva Teja Sir
- **Date:** 08/11/2026

## Deployment URL

**Render URL:** https://bdf-lab-3-opt5.onrender.com/books

- **Live Render API:** [https://bdf-lab-3-opt5.onrender.com/books](https://bdf-lab-3-opt5.onrender.com/books)
- **Live Render Dashboard:** [https://bdf-lab-3-opt5.onrender.com/](https://bdf-lab-3-opt5.onrender.com/)
- **Localhost Testing Dashboard:** [http://localhost:3000/](http://localhost:3000/)
- **Localhost API Endpoint:** [http://localhost:3000/books](http://localhost:3000/books)

## Project Description

This project implements RESTful API operations using Node.js, Express.js, and SQLite. It provides endpoints to create, retrieve, update, and delete book records.

It also supports searching, sorting, pagination, price filtering, input validation, and proper HTTP status codes.

The database contains curated book records with details such as book ID, title, author, price, and number of pages.

## Technologies Used

- Node.js
- Express.js
- SQLite
- SQLite3
- JavaScript
- Postman
- Visual Studio Code
- Render

## Project Structure

```text
BDF_Lab_03_REST_API/
│
├── server.js                        # Express server entry point, CORS, Web Dashboard & routing
├── database.js                      # SQLite database initialization, table creation & seeding
├── package.json                     # Project manifest, dependencies, and execution scripts
├── render.yaml                      # Render Blueprint Cloud deployment configuration
├── test-api.js                      # Automated CLI test suite (npm test)
├── .env.example                     # Example environment variables template
├── .gitignore                       # Git ignore configuration
├── README.md                        # Complete project documentation & lab report
├── books.db                         # SQLite database file (created automatically at runtime)
├── BDF_Lab_3_Postman_Collection.json# Complete Postman test collection file
│
├── routes/
│   └── books.js                     # REST API route handlers for /books resource
│
├── middleware/
│   └── validation.js                # Input validation middleware for query params and bodies
│
└── screenshots/                     # 14 Proof screenshots for lab report evidence
    ├── render deployment.png
    ├── GET All Books.png
    ├── GET Book by ID.png
    ├── Search Books.png
    ├── Sorting Ascending.png
    ├── Sorting Descending.png
    ├── Pagination.png
    ├── Price Filtering.png
    ├── Combined Query.png
    ├── POST Successful Request.png
    ├── POST Validation Error.png
    ├── PUT Update Request.png
    ├── DELETE Request.png
    └── Test Invalid ID.png
```

## Installation and Setup

### 1. Clone or Open the Repository

```bash
git clone https://github.com/manoharreddy/Backend-lab-3.git
cd "Backend-lab-3"
```

Or open directly in VS Code:
```bash
cd "BDF_Lab_03_REST_API"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The server runs at:
```text
http://localhost:3000
```
And the interactive Web Dashboard is live at:
```text
http://localhost:3000/
```

### 4. Run Automated Test Suite

```bash
npm test
```

---

## API Endpoints

| HTTP Method | Endpoint | Direct Localhost Link | Description |
|---|---|---|---|
| GET | `/books` | [View /books](http://localhost:3000/books) | Retrieve all books (with search, sort, filter, pagination) |
| GET | `/books/:bookId` | [View /books/1](http://localhost:3000/books/1) | Retrieve a specific book by ID |
| POST | `/books` | *Postman / Dashboard* | Add a new book |
| PUT | `/books/:bookId` | *Postman / Dashboard* | Update an existing book |
| DELETE | `/books/:bookId` | *Postman / Dashboard* | Delete a book |

---

## Query Parameters

### 1. Search Books
```text
GET /books?search_q=The
```
👉 [Test in Browser](http://localhost:3000/books?search_q=The)  
Searches for books using a partial title match (`LIKE '%The%'`).

### 2. Sorting

**Ascending order (Lowest price first):**
```text
GET /books?order_by=price&order=ASC
```
👉 [Test in Browser](http://localhost:3000/books?order_by=price&order=ASC)

**Descending order (Highest price first):**
```text
GET /books?order_by=price&order=DESC
```
👉 [Test in Browser](http://localhost:3000/books?order_by=price&order=DESC)

### 3. Pagination

**First five books (Offset 0):**
```text
GET /books?limit=5&offset=0
```
👉 [Test in Browser](http://localhost:3000/books?limit=5&offset=0)

**Next five books (Offset 5):**
```text
GET /books?limit=5&offset=5
```
👉 [Test in Browser](http://localhost:3000/books?limit=5&offset=5)

### 4. Price Filtering
```text
GET /books?min_price=200&max_price=350
```
👉 [Test in Browser](http://localhost:3000/books?min_price=200&max_price=350)

### 5. Combined Query (Search + Filter + Sort + Pagination)
```text
GET /books?search_q=The&min_price=200&max_price=500&order_by=price&order=ASC&limit=3&offset=0
```
👉 [Test in Browser](http://localhost:3000/books?search_q=The&min_price=200&max_price=500&order_by=price&order=ASC&limit=3&offset=0)

---

## Database Records

The initial database contains 10 primary book records matching the curriculum requirements:

| ID | Title | Author | Price (₹) | Pages |
|---:|---|---|---:|---:|
| 1 | The Alchemist | Paulo Coelho | 250 | 208 |
| 2 | Atomic Habits | James Clear | 450 | 320 |
| 3 | Rich Dad Poor Dad | Robert Kiyosaki | 300 | 336 |
| 4 | Wings of Fire | A.P.J. Abdul Kalam | 200 | 180 |
| 5 | Ikigai | Hector Garcia | 350 | 194 |
| 6 | Think Like a Monk | Jay Shetty | 400 | 288 |
| 7 | Deep Work | Cal Newport | 500 | 304 |
| 8 | The Power of Now | Eckhart Tolle | 280 | 236 |
| 9 | Zero to One | Peter Thiel | 320 | 210 |
| 10 | The 5 AM Club | Robin Sharma | 380 | 336 |

---

## Request Body for POST and PUT

Select **Body → raw → JSON** in Postman:

### POST - Add a New Book
- **Endpoint:** `POST /books`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "title": "C++ Programming",
  "author": "Bjarne Stroustrup",
  "price": 600,
  "pages": 450
}
```
- **Expected Status Code:** `201 Created`

### PUT - Update an Existing Book
- **Endpoint:** `PUT /books/1`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "title": "The Alchemist Updated",
  "author": "Paulo Coelho",
  "price": 350,
  "pages": 220
}
```
- **Expected Status Code:** `200 OK`

---

## HTTP Status Codes

| Status Code | Reason Phrase | Description |
|---|---|---|
| **200** | OK | Request successful (GET, PUT, DELETE) |
| **201** | Created | Book created successfully via POST |
| **400** | Bad Request | Invalid input, missing required fields, or illegal query parameters |
| **404** | Not Found | Book ID or route not found |
| **500** | Internal Server Error | Unhandled server or database error |

---

## 📸 Screenshots Evidence

### 1. Render Cloud Deployment
![Render Deployment](https://raw.githubusercontent.com/anchettivignan551-dotcom/Backend-lab-3/main/screenshots/render%20deployment.png)

### 2. GET All Books (`GET /books`)
![GET All Books](https://raw.githubusercontent.com/anchettivignan551-dotcom/Backend-lab-3/main/screenshots/GET%20All%20Books.png)

### 3. GET Book by ID (`GET /books/1`)
![GET Book by ID](https://raw.githubusercontent.com/anchettivignan551-dotcom/Backend-lab-3/main/screenshots/GET%20Book%20by%20ID.png)

### 4. Search Books (`GET /books?search_q=The`)
![Search Books](https://raw.githubusercontent.com/anchettivignan551-dotcom/Backend-lab-3/main/screenshots/Search%20Books.png)

### 5. Sorting Ascending (`GET /books?order_by=price&order=ASC`)
![Sorting Ascending](https://raw.githubusercontent.com/anchettivignan551-dotcom/Backend-lab-3/main/screenshots/Sorting%20Ascending.png)

### 6. Sorting Descending (`GET /books?order_by=price&order=DESC`)
![Sorting Descending](https://raw.githubusercontent.com/anchettivignan551-dotcom/Backend-lab-3/main/screenshots/Sorting%20Descending.png)

### 7. Pagination (`GET /books?limit=5&offset=0`)
![Pagination](https://raw.githubusercontent.com/anchettivignan551-dotcom/Backend-lab-3/main/screenshots/Pagination.png)

### 8. Price Filtering (`GET /books?min_price=200&max_price=350`)
![Price Filtering](https://raw.githubusercontent.com/anchettivignan551-dotcom/Backend-lab-3/main/screenshots/Price%20Filtering.png)

### 9. Combined Query (`Search + Filter + Sort + Pagination`)
![Combined Query](https://raw.githubusercontent.com/anchettivignan551-dotcom/Backend-lab-3/main/screenshots/Combined%20Query.png)

### 10. POST Successful Request (`201 Created`)
![POST Successful Request](https://raw.githubusercontent.com/anchettivignan551-dotcom/Backend-lab-3/main/screenshots/POST%20Successful%20Request.png)

### 11. POST Validation Error (`400 Bad Request`)
![POST Validation Error](https://raw.githubusercontent.com/anchettivignan551-dotcom/Backend-lab-3/main/screenshots/POST%20Validation%20Error.png)

### 12. PUT Update Request (`200 OK`)
![PUT Update Request](https://raw.githubusercontent.com/anchettivignan551-dotcom/Backend-lab-3/main/screenshots/PUT%20Update%20Request.png)

### 13. DELETE Request (`200 OK`)
![DELETE Request](https://raw.githubusercontent.com/anchettivignan551-dotcom/Backend-lab-3/main/screenshots/DELETE%20Request.png)

### 14. Test Invalid ID and Missing Records (`404 Not Found`)
![Test Invalid ID](https://raw.githubusercontent.com/anchettivignan551-dotcom/Backend-lab-3/main/screenshots/Test%20Invalid%20ID.png)

---

## Debugging Exercise

During development and deployment, the following 5 critical backend errors were identified and resolved:

### 1. Port Already in Use (EADDRINUSE)
- **Error:** `Error: listen EADDRINUSE: address already in use :::3000`
- **Reason:** Another Node process or previous execution did not release port 3000.
- **Solution:** Terminate the process holding the port using `taskkill /PID <PID> /F` on Windows, or configure `PORT=10000` via `.env`.

### 2. Wrong Import Path
- **Error:** `Error: Cannot find module '../database'`
- **Reason:** Incorrect relative directory path or misspelled filename.
- **Solution:** Correct the relative import path (e.g. `const { all } = require('../database')`).

### 3. SQLite Table Not Found
- **Error:** `SQLITE_ERROR: no such table: books`
- **Reason:** Table name typo or querying before initialization DDL completes.
- **Solution:** Execute `CREATE TABLE IF NOT EXISTS` upon connection and ensure exact table name matching across queries.

### 4. Missing Await in Asynchronous Operations
- **Problem:** Database calls return Promises. Without `await`, the code receives a pending `Promise` object rather than data rows.
- **Incorrect Code:**
  ```javascript
  const books = db.all("SELECT * FROM book");
  res.json(books);
  ```
- **Correct Code:**
  ```javascript
  const books = await db.all("SELECT * FROM book");
  res.json(books);
  ```

### 5. Render Deployment Error (SQLite GLIBC Compatibility)
- **Error:** `GLIBC_2.38 not found`
- **Reason:** Precompiled SQLite native binary requires a newer C standard library than Render's Linux runtime image.
- **Solution:** Added a `postinstall` script to `package.json` to compile `sqlite3` from source on Render:
  ```json
  "postinstall": "npm rebuild sqlite3 --build-from-source"
  ```

---

## Viva Questions & Model Answers

### 1. Query parameter vs Path parameter?
- **Path parameters** (e.g. `/books/:bookId`) identify a *specific resource*.
- **Query parameters** (e.g. `/books?order_by=price&limit=5`) *filter, sort, or paginate* without altering the base resource URI.

### 2. What does stateless mean in REST APIs?
The server does not store client session state between requests. Every individual HTTP request contains all necessary data for the server to process it.

### 3. Which status code is returned for bad input versus a missing record?
- **`400 Bad Request`** for bad syntax or validation failure.
- **`404 Not Found`** when the request is valid but the record does not exist.

### 4. Why await the database call?
Database queries are asynchronous. Without `await`, JavaScript continues execution and receives an unresolved `Promise` rather than data.

### 5. What is SQL injection and how do placeholders prevent it?
SQL injection is when attacker input modifies the SQL syntax. Placeholders (`?`) ensure that user inputs are treated strictly as data literals, never executable SQL commands.

---

## Conclusion

This lab helped me understand REST API development using Node.js, Express.js, and SQLite. I implemented CRUD operations and learned how to use query parameters for searching, sorting, pagination, and price filtering. I also understood input validation, HTTP status codes, and debugging techniques. Finally, I deployed the REST API using Render.

---

**End of Lab 3 — K. Manohar Reddy (252U1R5069)**
