// const express = require('express');
// const router = express.Router();
// const pool = require('../db');
// const bcrypt = require('bcrypt');

// // Signup
// router.post('/signup', async (req, res) => {
//   try {
//     const { full_name, email, password } = req.body;

    
//     const existingUser = await pool.query(
//       'SELECT * FROM users WHERE email = $1',
//       [email]
//     );

//     if (existingUser.rows.length > 0) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

    
//     const hashedPassword = await bcrypt.hash(password, 10);

    
//     const result = await pool.query(
//       'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
//       [full_name, email, hashedPassword]
//     );

//     res.json({ message: 'User registered successfully', user: result.rows[0] });

//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // LOGIN
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const result = await pool.query(
//       'SELECT * FROM users WHERE email = $1',
//       [email]
//     );

//     if (result.rows.length === 0) {
//       return res.status(400).json({ message: 'Invalid email or password' });
//     }

//     const user = result.rows[0];

   
//     const isMatch = await bcrypt.compare(password, user.password_hash);

//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid email or password' });
//     }

//     res.json({
//       message: 'Login successful',
//       user: {
//         id: user.id,
//         full_name: user.full_name,
//         email: user.email,
//         role: user.role
//       }
//     });

//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;


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
      'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email, role',
      [full_name, email, hashedPassword]
    );

    res.json({
      message: 'User registered successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
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

// Update profile
router.put('/profile/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { user_id, full_name, email } = req.body;

    if (userId !== user_id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND id != $2',
      [email, userId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use by another account' });
    }

    const result = await pool.query(
      'UPDATE users SET full_name = $1, email = $2 WHERE id = $3 RETURNING id, full_name, email, role',
      [full_name, email, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const { user_id, current_password, new_password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(current_password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, user_id]
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account
router.delete('/delete-account', async (req, res) => {
  try {
    const { user_id, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [user_id]);

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;