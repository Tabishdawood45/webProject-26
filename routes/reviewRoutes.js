const express = require('express');
const router = express.Router();
const pool = require('../db');

// get reviews by product id
router.get('/:productId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC',
      [req.params.productId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// add review
router.post('/', async (req, res) => {
  try {
    const { user_id, product_id, comment, rating } = req.body;

    if (!user_id || !product_id || !comment || !rating) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await pool.query(
      'INSERT INTO reviews (user_id, product_id, comment, rating) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, product_id, comment, rating]
    );

    res.json({
      message: 'Review added successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// like a review
router.put('/like/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE reviews SET likes_count = likes_count + 1 WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({
      message: 'Review liked',
      review: result.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;