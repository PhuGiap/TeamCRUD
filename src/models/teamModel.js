const pool = require('../db');

const TeamModel = {
  async getAll() {
    const result = await pool.query('SELECT * FROM teams ORDER BY id ASC');
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM teams WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create({ name, country }) {
    const result = await pool.query(
      'INSERT INTO teams (name, country) VALUES ($1, $2) RETURNING *',
      [name, country]
    );
    return result.rows[0];
  },

  async update(id, { name, country }) {
    const result = await pool.query(
      'UPDATE teams SET name=$1, country=$2 WHERE id=$3 RETURNING *',
      [name, country, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM teams WHERE id=$1', [id]);
    return { message: 'Team deleted successfully' };
  }
};

module.exports = TeamModel;
