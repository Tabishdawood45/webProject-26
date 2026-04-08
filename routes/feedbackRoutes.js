const express = require('express');
const router = express.Router();
const pool = require('../db');

// submit feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await pool.query(
      'INSERT INTO feedback (name, email, message) VALUES ($1, $2, $3) RETURNING *',
      [name, email, message]
    );

    res.json({
      message: 'Feedback submitted successfully',
      feedback: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// get all feedback (simple version)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM feedback ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;