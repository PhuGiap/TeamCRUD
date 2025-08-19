const pool = require('../db');

// Thêm user vào team
exports.addUserToTeam = async (req, res) => {
  const { user_id, team_id } = req.body;

  try {
    // Kiểm tra user tồn tại
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Kiểm tra team tồn tại
    const teamCheck = await pool.query('SELECT * FROM teams WHERE id = $1', [team_id]);
    if (teamCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Kiểm tra trùng lặp
    const exists = await pool.query(
      'SELECT * FROM user_teams WHERE user_id = $1 AND team_id = $2',
      [user_id, team_id]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'User already in team' });
    }

    // Thêm vào user_teams
    const result = await pool.query(
      'INSERT INTO user_teams (user_id, team_id, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [user_id, team_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
