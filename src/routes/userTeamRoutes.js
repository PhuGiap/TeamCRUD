const express = require('express');
const router = express.Router();
const pool = require('../db');

// Thêm user vào team
router.post('/', async (req, res) => {
  try {
    const { user_id, team_id } = req.body;

    if (!user_id || !team_id) {
      return res.status(400).json({ error: 'user_id và team_id là bắt buộc' });
    }

    const result = await pool.query(
      `INSERT INTO user_teams (user_id, team_id) 
       VALUES ($1, $2) 
       RETURNING *`,
      [user_id, team_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding user to team:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Lấy tất cả user-team
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM user_teams ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user_teams:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Xóa user khỏi team
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM user_teams WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User-team not found' });
    }

    res.json({ message: 'User removed from team', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting user-team:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
