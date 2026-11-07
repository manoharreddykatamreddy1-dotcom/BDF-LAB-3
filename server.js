require('dotenv').config();
const express = require('express');
const booksRouter = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3000;

// Built-in middleware to parse incoming JSON request bodies
app.use(express.json());

// Welcome/health route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Books Management REST API (BDF Lab 3)',
    endpoints: {
      books: '/books'
    }
  });
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
  console.log(`Server is running successfully on http://localhost:${PORT}`);
  console.log(`Books resource available at http://localhost:${PORT}/books`);
});
