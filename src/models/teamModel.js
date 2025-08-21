// src/models/teamModel.js
const pool = require('../config/db');

class Team {
  constructor({ id, name, description, created_at }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.created_at = created_at ? created_at.toISOString().split('T')[0] : null;
    this.users = []; // users sẽ add riêng
  }

  // Get all teams (basic info)
  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM teams ORDER BY id');
    return rows.map(r => new Team(r));
  }

  // Get team by id (basic info)
  static async getById(id) {
    const { rows } = await pool.query('SELECT * FROM teams WHERE id=$1', [id]);
    if (!rows[0]) return null;
    return new Team(rows[0]);
  }

  // Create new team
  static async create({ name, description }) {
    const { rows } = await pool.query(
      'INSERT INTO teams (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return new Team(rows[0]);
  }

  // Update team
  static async update(id, { name, description }) {
    const { rows } = await pool.query(
      'UPDATE teams SET name=$1, description=$2 WHERE id=$3 RETURNING *',
      [name, description, id]
    );
    return rows[0] ? new Team(rows[0]) : null;
  }

  // Delete team
  static async delete(id) {
    const { rows } = await pool.query('DELETE FROM teams WHERE id=$1 RETURNING *', [id]);
    return rows[0] ? new Team(rows[0]) : null;
  }

  // Add users (separate method)
  async addUsers(userIds) {
    const uniq = [...new Set(userIds.map(Number))].filter(Number.isInteger);
    if (uniq.length > 0) {
      await pool.query(
        'INSERT INTO user_teams (team_id, user_id) SELECT $1, unnest($2::int[])',
        [this.id, uniq]
      );
    }
  }

  // Remove users (separate method)
  async removeUsers(userIds) {
    const uniq = [...new Set(userIds.map(Number))].filter(Number.isInteger);
    if (uniq.length > 0) {
      await pool.query(
        'DELETE FROM user_teams WHERE team_id=$1 AND user_id = ANY($2::int[])',
        [this.id, uniq]
      );
    }
  }

  // Fetch users for a team (optional helper)
  async fetchUsers() {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE id IN (SELECT user_id FROM user_teams WHERE team_id=$1)',
      [this.id]
    );
    this.users = rows.map(u => ({
      ...u,
      created_at: u.created_at ? u.created_at.toISOString().split('T')[0] : null
    }));
  }
}

module.exports = Team;
