# Lab 3 - REST API, Query Parameters, Validation and Debugging

## Project Details

- **Student Name:** K. Manohar Reddy
- **Registration Number:** 252U1R5069
- **Section:** S-10 (Room 106, S-10 / AIDE 2A 106)
- **Department:** Artificial Intelligence and Data Engineering
- **University:** Aurora Higher Education and Research Academy
- **Course:** Backend Development Fundamentals (BDF) / ADBMS
- **Lab:** Lab 3 - REST API, Query Parameters, Validation and Debugging
- **Faculty:** Sai Shiva Teja Sir
- **Date:** 08/11/2026

---

## Live Deployment Links

Your application is deployed and live on Render Cloud:

- **Live Public REST API Endpoint:** [https://bdf-lab-3-opt5.onrender.com/books](https://bdf-lab-3-opt5.onrender.com/books)
- **Live Interactive Web Dashboard & Tester:** [https://bdf-lab-3-opt5.onrender.com/](https://bdf-lab-3-opt5.onrender.com/)
- **Live Health Check:** [https://bdf-lab-3-opt5.onrender.com/healthz](https://bdf-lab-3-opt5.onrender.com/healthz)

---

## 1-Click Live Test Table (Click Any Link to Test in Real-Time)

Every single link below connects directly to your live Render Cloud server:

| # | Test Scenario | HTTP Method | Live Render Cloud Link | Expected Status |
|---|---|---|---|---|
| 1 | **Get All Books** | `GET` | [https://bdf-lab-3-opt5.onrender.com/books](https://bdf-lab-3-opt5.onrender.com/books) | `200 OK` |
| 2 | **Get Book by ID (#1)** | `GET` | [https://bdf-lab-3-opt5.onrender.com/books/1](https://bdf-lab-3-opt5.onrender.com/books/1) | `200 OK` |
| 3 | **Search Partial Title ("The")** | `GET` | [https://bdf-lab-3-opt5.onrender.com/books?search_q=The](https://bdf-lab-3-opt5.onrender.com/books?search_q=The) | `200 OK` |
| 4 | **Sort by Price Ascending** | `GET` | [https://bdf-lab-3-opt5.onrender.com/books?order_by=price&order=ASC](https://bdf-lab-3-opt5.onrender.com/books?order_by=price&order=ASC) | `200 OK` |
| 5 | **Sort by Price Descending** | `GET` | [https://bdf-lab-3-opt5.onrender.com/books?order_by=price&order=DESC](https://bdf-lab-3-opt5.onrender.com/books?order_by=price&order=DESC) | `200 OK` |
| 6 | **Pagination (Limit 5, Offset 0)** | `GET` | [https://bdf-lab-3-opt5.onrender.com/books?limit=5&offset=0](https://bdf-lab-3-opt5.onrender.com/books?limit=5&offset=0) | `200 OK` |
| 7 | **Pagination (Limit 5, Offset 5)** | `GET` | [https://bdf-lab-3-opt5.onrender.com/books?limit=5&offset=5](https://bdf-lab-3-opt5.onrender.com/books?limit=5&offset=5) | `200 OK` |
| 8 | **Filter: Price Range (200 to 350)** | `GET` | [https://bdf-lab-3-opt5.onrender.com/books?min_price=200&max_price=350](https://bdf-lab-3-opt5.onrender.com/books?min_price=200&max_price=350) | `200 OK` |
| 9 | **Combined Query (Search + Filter + Sort + Limit)** | `GET` | [https://bdf-lab-3-opt5.onrender.com/books?search_q=The&min_price=200&max_price=500&order_by=price&order=ASC&limit=3&offset=0](https://bdf-lab-3-opt5.onrender.com/books?search_q=The&min_price=200&max_price=500&order_by=price&order=ASC&limit=3&offset=0) | `200 OK` |
| 10 | **Error Test: Non-Existent Book ID** | `GET` | [https://bdf-lab-3-opt5.onrender.com/books/9999](https://bdf-lab-3-opt5.onrender.com/books/9999) | `404 Not Found` |
| 11 | **Error Test: Invalid Order Direction** | `GET` | [https://bdf-lab-3-opt5.onrender.com/books?order=INVALID](https://bdf-lab-3-opt5.onrender.com/books?order=INVALID) | `400 Bad Request` |
| 12 | **Error Test: Invalid Order By Column** | `GET` | [https://bdf-lab-3-opt5.onrender.com/books?order_by=invalid_col](https://bdf-lab-3-opt5.onrender.com/books?order_by=invalid_col) | `400 Bad Request` |
| 13 | **Error Test: Negative Limit** | `GET` | [https://bdf-lab-3-opt5.onrender.com/books?limit=-5](https://bdf-lab-3-opt5.onrender.com/books?limit=-5) | `400 Bad Request` |
| 14 | **Error Test: Inverted Price Range** | `GET` | [https://bdf-lab-3-opt5.onrender.com/books?min_price=500&max_price=200](https://bdf-lab-3-opt5.onrender.com/books?min_price=500&max_price=200) | `400 Bad Request` |

> **Note on Testing POST, PUT, and DELETE:** You can test all create, update, and delete operations live directly from your web browser using the built-in interactive tester at [https://bdf-lab-3-opt5.onrender.com/](https://bdf-lab-3-opt5.onrender.com/) by clicking the **"Run All 18 Tests"** button!

---

## Project Description

This project implements a complete, robust RESTful API using Node.js, Express.js, and SQLite. It provides full CRUD operations (Create, Retrieve, Update, and Delete) on book records.

Key capabilities:
- **Search:** Case-insensitive partial matching on book titles using SQL `LIKE`.
- **Sorting:** Multi-column sorting (`id`, `title`, `author`, `price`, `pages`) with configurable direction (`ASC` / `DESC`).
- **Pagination:** Controlled data slicing using `limit` and `offset`.
- **Price Range Filtering:** Strict numeric boundary filtering using `min_price` and `max_price`.
- **Validation:** Strict payload and query parameter whitelisting returning proper HTTP status codes.
- **Resilient Cloud Architecture:** Zero-dependency single-file server designed to deploy seamlessly to cloud platforms without native compilation errors.

---

## Technologies Used

- **Node.js** (v18+ / v24+): Server-side JavaScript runtime.
- **Express.js** (v4.21): Minimalist web framework for routing, CORS, and request parsing.
- **SQLite / SQLite3**: Relational database storage.
- **Render Cloud**: Production cloud hosting platform.
- **Postman**: API testing and validation suite.
- **VS Code**: Development environment.

---

## Project Structure

```text
Backend-lab-3/
│
├── server.js                        # Complete self-contained REST API server with DB & routes
├── database.js                      # Standalone SQLite helper module
├── package.json                     # Project manifest and scripts
├── render.yaml                      # Render deployment blueprint configuration
├── test-api.js                      # Automated CLI test suite (npm test)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore configuration
├── README.md                        # Complete lab documentation with live links
├── books.db                         # SQLite database file
│
├── routes/
│   └── books.js                     # Modular router
│
└── middleware/
    └── validation.js                # Input validation middleware
```

---

## Installation and Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/manoharreddy/Backend-lab-3.git
cd "Backend-lab-3"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```
The server runs at `http://localhost:3000` with the interactive dashboard at `http://localhost:3000/`.

### 4. Run automated tests
```bash
npm test
```
Result: **18 Passed, 0 Failed (100% Passing)**.

---

## Database Records

The initial database contains 10 core book records matching the curriculum requirements:

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

## API Endpoints & Request Specifications

### 1. GET All Books (`GET /books`)
- **Live Link:** [https://bdf-lab-3-opt5.onrender.com/books](https://bdf-lab-3-opt5.onrender.com/books)
- **Status:** `200 OK`
- **Response Format:**
  ```json
  {
    "message": "Books retrieved successfully",
    "count": 10,
    "data": [
      {
        "id": 1,
        "title": "The Alchemist",
        "author": "Paulo Coelho",
        "price": 250,
        "pages": 208
      }
    ]
  }
  ```

---

### 2. GET Book by ID (`GET /books/:id`)
- **Live Link:** [https://bdf-lab-3-opt5.onrender.com/books/1](https://bdf-lab-3-opt5.onrender.com/books/1)
- **Status:** `200 OK`
- **Response:**
  ```json
  {
    "message": "Book retrieved successfully",
    "data": {
      "id": 1,
      "title": "The Alchemist",
      "author": "Paulo Coelho",
      "price": 250,
      "pages": 208
    }
  }
  ```

---

### 3. POST - Create a New Book (`POST /books`)
- **Live URL:** `https://bdf-lab-3-opt5.onrender.com/books`
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
- **Status:** `201 Created`
- **Response:**
  ```json
  {
    "message": "Book created successfully",
    "data": {
      "id": 13,
      "title": "C++ Programming",
      "author": "Bjarne Stroustrup",
      "price": 600,
      "pages": 450
    }
  }
  ```

---

### 4. POST Validation Error (`POST /books`)
- **Live URL:** `https://bdf-lab-3-opt5.onrender.com/books`
- **Headers:** `Content-Type: application/json`
- **Request Body (Missing title):**
  ```json
  {
    "author": "Bjarne Stroustrup",
    "price": 600,
    "pages": 450
  }
  ```
- **Status:** `400 Bad Request`
- **Response:**
  ```json
  {
    "message": "Title, author and a valid numeric price are required"
  }
  ```

---

### 5. PUT - Update an Existing Book (`PUT /books/:id`)
- **Live URL:** `https://bdf-lab-3-opt5.onrender.com/books/1`
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
- **Status:** `200 OK`
- **Response:**
  ```json
  {
    "message": "Book updated successfully",
    "data": {
      "id": 1,
      "title": "The Alchemist Updated",
      "author": "Paulo Coelho",
      "price": 350,
      "pages": 220
    }
  }
  ```

---

### 6. DELETE - Remove a Book (`DELETE /books/:id`)
- **Live URL:** `https://bdf-lab-3-opt5.onrender.com/books/1`
- **Status:** `200 OK`
- **Response:**
  ```json
  {
    "message": "Book deleted successfully"
  }
  ```

---

### 7. GET Non-Existent Book (`GET /books/9999`)
- **Live Link:** [https://bdf-lab-3-opt5.onrender.com/books/9999](https://bdf-lab-3-opt5.onrender.com/books/9999)
- **Status:** `404 Not Found`
- **Response:**
  ```json
  {
    "message": "Book not found"
  }
  ```

---

## HTTP Status Codes Reference

| Status Code | Reason Phrase | Usage |
|---|---|---|
| **200** | OK | Successful GET, PUT, or DELETE request |
| **201** | Created | Successful POST creating a new resource |
| **400** | Bad Request | Validation error (missing fields, non-numeric price, illegal query param) |
| **404** | Not Found | Book ID or route does not exist |
| **500** | Internal Server Error | Unhandled server or database failure |

---

## Debugging Exercise

During lab development and cloud deployment, the following 5 critical backend errors were identified and resolved:

### 1. Port Already in Use (`EADDRINUSE`)
- **Error:** `Error: listen EADDRINUSE: address already in use :::3000`
- **Reason:** Another running Node process did not release port 3000.
- **Solution:** Terminated the blocking process with `taskkill /PID <PID> /F` on Windows, or used dynamic port binding via `process.env.PORT`.

### 2. Wrong Import Path (`MODULE_NOT_FOUND`)
- **Error:** `Cannot find module './routes/books'`
- **Reason:** Subfolders were not included during GitHub file upload.
- **Solution:** Built a self-contained server architecture that integrates routes and database logic into `server.js` with zero subfolder dependencies.

### 3. SQLite Table Not Found
- **Error:** `SQLITE_ERROR: no such table: books`
- **Reason:** Queries executed before table initialization completed, or table name typo.
- **Solution:** Initialized tables with `CREATE TABLE IF NOT EXISTS books` and synchronized with an alias table `book`.

### 4. Missing `await` in Asynchronous Operations
- **Problem:** Database calls return Promises. Without `await`, the code receives a pending `Promise` object rather than data rows.
- **Solution:** Always awaited database helper functions inside `async` route handlers.

### 5. Render Deployment Network Binding
- **Error:** Render timed out waiting for the service to respond on the network.
- **Solution:** Explicitly bound the Express server to `0.0.0.0` (`app.listen(PORT, '0.0.0.0', ...)`), enabling the Render cloud reverse proxy to detect the open port immediately.

---

## Viva Questions & Model Answers

### 1. Query parameter vs Path parameter?
- **Path parameters** (e.g. `/books/:id`) identify a *specific, individual resource*.
- **Query parameters** (e.g. `/books?order_by=price&limit=5`) *filter, sort, or paginate* without altering the base resource URI.

### 2. What does stateless mean in REST APIs?
The server does not store client session state between requests. Every individual HTTP request contains all necessary data for the server to process it.

### 3. Which status code is returned for bad input versus a missing record?
- **`400 Bad Request`** for bad syntax, missing required fields, or validation failure.
- **`404 Not Found`** when the request is valid but the record does not exist in the database.

### 4. Why await the database call?
Database queries are asynchronous. Without `await`, JavaScript continues execution and receives an unresolved `Promise` rather than data.

### 5. What is SQL injection and how do placeholders prevent it?
SQL injection occurs when attacker input modifies SQL query syntax. Placeholders (`?`) ensure that user inputs are treated strictly as literal data strings, never executable SQL commands.

---

## Conclusion

In this lab, a complete Books Management REST API was developed and deployed. I implemented CRUD operations, query parameter search, sorting, price filtering, pagination, and input validation with consistent HTTP status codes. Finally, the application was deployed to Render Cloud and verified live.

---

**End of Lab 3 — K. Manohar Reddy (252U1R5069)**
