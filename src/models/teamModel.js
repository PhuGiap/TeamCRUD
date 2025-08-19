const pool = require('../db');

const TeamModel = {
  async getAll() {
    const result = await pool.query(`
      SELECT 
        t.id AS team_id,
        t.name AS team_name,
        t.description,
        t.created_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email,
        u.role,
        u.created_at AS user_created_at
      FROM teams t
      LEFT JOIN user_teams ut ON t.id = ut.team_id
      LEFT JOIN users u ON ut.user_id = u.id
      ORDER BY t.id, u.id
    `);

    // Gom nhóm users theo team
    const teams = {};
    result.rows.forEach(row => {
      if (!teams[row.team_id]) {
        teams[row.team_id] = {
          id: row.team_id,
          name: row.team_name,
          description: row.description,
          created_at: row.created_at,
          users: []
        };
      }
      if (row.user_id) {
        teams[row.team_id].users.push({
          id: row.user_id,
          name: row.user_name,
          email: row.email,
          role: row.role,
          created_at: row.user_created_at
        });
      }
    });

    return Object.values(teams);
  },

  async getById(id) {
    const result = await pool.query(`
      SELECT 
        t.id AS team_id,
        t.name AS team_name,
        t.description,
        t.created_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email,
        u.role,
        u.created_at AS user_created_at
      FROM teams t
      LEFT JOIN user_teams ut ON t.id = ut.team_id
      LEFT JOIN users u ON ut.user_id = u.id
      WHERE t.id = $1
      ORDER BY u.id
    `, [id]);

    if (result.rows.length === 0) return null;

    const team = {
      id: result.rows[0].team_id,
      name: result.rows[0].team_name,
      description: result.rows[0].description,
      created_at: result.rows[0].created_at,
      users: []
    };

    result.rows.forEach(row => {
      if (row.user_id) {
        team.users.push({
          id: row.user_id,
          name: row.user_name,
          email: row.email,
          role: row.role,
          created_at: row.user_created_at
        });
      }
    });

    return team;
  },

  async create(name, description) {
    const result = await pool.query(
      'INSERT INTO teams (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return result.rows[0];
  }
};

module.exports = TeamModel;
