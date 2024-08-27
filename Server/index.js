// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Your MySQL username
  password: '', // Your MySQL password
  database: 'universal_db', // Your database name
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1); // Exit process if unable to connect
  }
  console.log('Connected to MySQL database');
});

// Route to handle login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Login successful' });
  });
});

// Endpoint to handle signup
app.post('/signup', (req, res) => {
  const { name, surname, email, number, password, cpassword } = req.body;

  if (password !== cpassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const sql = 'INSERT INTO users (name, surname, email, number, password) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, surname, email, number, password], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json({ message: 'User registered successfully' });
  });
});

app.post('/api/cart', (req, res) => {
  const { items, totalAmount } = req.body;
  
  console.log('Received items:', items);
  console.log('Received totalAmount:', totalAmount);

  if (!items || !totalAmount) {
    return res.status(400).json({ message: 'Items and total amount are required' });
  }

  // Insert each item into the database
  const sql = 'INSERT INTO cart (item, price, total) VALUES (?, ?, ?)';
  
  items.forEach(item => {
    const values = [item.item, item.price, totalAmount];
    
    db.query(sql, values, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }
    });
  });

  res.status(200).json({ message: 'Cart items recorded successfully' });
});

//Remove item from cart 
app.post('/api/cart/remove', (req, res) => {
  const { item } = req.body;

  if (!item) {
    return res.status(400).json({ message: 'Item is required' });
  }

  const sql = 'DELETE FROM cart WHERE item = ? LIMIT 1';

  db.query(sql, [item.item], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item removed successfully' });
  });
});


app.post('/api/payment', (req, res) => {
  const { name, cardNumber, expiryDate, cvv } = req.body;

  if (!name || !cardNumber || !expiryDate || !cvv) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const sql = 'INSERT INTO payment (name, card_num, date, cvv) VALUES (?, ?, ?, ?)';
  const values = [name, cardNumber, expiryDate, cvv];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json({ message: 'Payment recorded successfully' });
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
