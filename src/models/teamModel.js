// src/models/teamModel.js
const pool = require('../db');

const TeamModel = {
  // Lấy tất cả teams kèm users
  async getAll() {
    const sql = `
      SELECT
        t.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', u.id,
              'name', u.name,
              'email', u.email,
              'role', u.role,
              'created_at', u.created_at
            )
            ORDER BY u.id
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'::json
        ) AS users
      FROM teams t
      LEFT JOIN user_teams ut ON t.id = ut.team_id
      LEFT JOIN users u ON ut.user_id = u.id
      GROUP BY t.id
      ORDER BY t.id;
    `;
    const { rows } = await pool.query(sql);
    return rows;
  },

  // Lấy 1 team theo id kèm users
  async getById(id) {
    const sql = `
      SELECT
        t.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', u.id,
              'name', u.name,
              'email', u.email,
              'role', u.role,
              'created_at', u.created_at
            )
            ORDER BY u.id
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'::json
        ) AS users
      FROM teams t
      LEFT JOIN user_teams ut ON t.id = ut.team_id
      LEFT JOIN users u ON ut.user_id = u.id
      WHERE t.id = $1
      GROUP BY t.id;
    `;
    const { rows } = await pool.query(sql, [id]);
    return rows[0] || null;
  },

  // Tạo team mới + gán users
  async create({ name, description, users = [] }) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Invalid team name');
    }
    if (!Array.isArray(users)) {
      throw new Error('users must be an array of user IDs');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        'INSERT INTO teams (name, description) VALUES ($1, $2) RETURNING *',
        [name.trim(), description ?? null]
      );
      const team = rows[0];

      // Gán users (nếu có)
      const uniq = [...new Set(users.map(Number))].filter(Number.isInteger);
      if (uniq.length > 0) {
        await client.query(
          'INSERT INTO user_teams (team_id, user_id) SELECT $1, unnest($2::int[])',
          [team.id, uniq]
        );
      }

      await client.query('COMMIT');
      return await TeamModel.getById(team.id); // trả về đúng mẫu kèm users
    } catch (err) {
      await client.query('ROLLBACK');
      if (err.code === '23505') err.message = 'Team name already exists'; // unique_violation
      throw err;
    } finally {
      client.release();
    }
  },

  // Cập nhật team + cập nhật lại users
  async update(id, { name, description, users }) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid team id');
    }
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Invalid team name');
    }
    if (!Array.isArray(users) || users.length < 1) {
      throw new Error('users must be a non-empty array of user IDs');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        'UPDATE teams SET name = $1, description = $2 WHERE id = $3 RETURNING *',
        [name.trim(), description ?? null, id]
      );
      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      // Xóa users cũ và gán lại danh sách mới
      await client.query('DELETE FROM user_teams WHERE team_id = $1', [id]);

      const uniq = [...new Set(users.map(Number))].filter(Number.isInteger);
      if (uniq.length > 0) {
        await client.query(
          'INSERT INTO user_teams (team_id, user_id) SELECT $1, unnest($2::int[])',
          [id, uniq]
        );
      }

      await client.query('COMMIT');
      return await TeamModel.getById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      if (err.code === '23505') err.message = 'Team name already exists';
      throw err;
    } finally {
      client.release();
    }
  },

  // Xóa team (kèm mapping)
  async delete(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM user_teams WHERE team_id = $1', [id]);
      const { rows } = await client.query('DELETE FROM teams WHERE id = $1 RETURNING *', [id]);
      await client.query('COMMIT');
      return rows[0] || null;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};

module.exports = TeamModel;
