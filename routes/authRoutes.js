const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [full_name, email, hashedPassword]
    );

    res.json({ message: 'User registered successfully', user: result.rows[0] });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

   
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;