const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get reviews by product id with user name
router.get('/:productId', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        reviews.id,
        reviews.user_id,
        reviews.product_id,
        reviews.comment,
        reviews.rating,
        reviews.likes_count,
        reviews.created_at,
        users.full_name
      FROM reviews
      JOIN users ON reviews.user_id = users.id
      WHERE reviews.product_id = $1
      ORDER BY reviews.created_at DESC
      `,
      [req.params.productId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review
router.post('/', async (req, res) => {
  try {
    const { user_id, product_id, comment, rating } = req.body;

    if (!user_id || !product_id || !comment || !rating) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingReview = await pool.query(
      'SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        message: 'You already reviewed this product. You can edit only your comment.'
      });
    }

    const result = await pool.query(
      `
      INSERT INTO reviews (user_id, product_id, comment, rating)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
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

// Edit only review comment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, comment } = req.body;

    if (!user_id || !comment) {
      return res.status(400).json({ message: 'User id and comment are required' });
    }

    const existingReview = await pool.query(
      'SELECT * FROM reviews WHERE id = $1',
      [id]
    );

    if (existingReview.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (existingReview.rows[0].user_id !== Number(user_id)) {
      return res.status(403).json({ message: 'You can edit only your own review' });
    }

    const updatedReview = await pool.query(
      'UPDATE reviews SET comment = $1 WHERE id = $2 RETURNING *',
      [comment, id]
    );

    res.json({
      message: 'Review updated successfully',
      review: updatedReview.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a review only once per user
router.put('/like/:id', async (req, res) => {
  try {
    const { user_id } = req.body;
    const reviewId = req.params.id;

    if (!user_id) {
      return res.status(400).json({ message: 'Login required to like a review' });
    }

    const reviewCheck = await pool.query(
      'SELECT * FROM reviews WHERE id = $1',
      [reviewId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const existingLike = await pool.query(
      'SELECT * FROM review_likes WHERE review_id = $1 AND user_id = $2',
      [reviewId, user_id]
    );

    if (existingLike.rows.length > 0) {
      return res.status(400).json({ message: 'You already liked this review' });
    }

    await pool.query(
      'INSERT INTO review_likes (review_id, user_id) VALUES ($1, $2)',
      [reviewId, user_id]
    );

    const updatedReview = await pool.query(
      'UPDATE reviews SET likes_count = likes_count + 1 WHERE id = $1 RETURNING *',
      [reviewId]
    );

    res.json({
      message: 'Review liked successfully',
      review: updatedReview.rows[0]
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;