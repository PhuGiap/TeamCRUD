const pool = require('../db');

const UserModel = {
  async getAll() {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id ASC');
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create({ name, email, password, role }) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at`,
      [name, email, password, role]
    );
    return result.rows[0];
  },

  async update(id, { name, email, password, role }) {
    const result = await pool.query(
      `UPDATE users 
       SET name = $1, email = $2, password = $3, role = $4 
       WHERE id = $5 
       RETURNING id, name, email, role, created_at`,
      [name, email, password, role, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email, role, created_at',
      [id]
    );
    return result.rows[0];
  },

  async getByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }
};

module.exports = UserModel;
