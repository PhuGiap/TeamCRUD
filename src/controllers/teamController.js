
const pool = require('../config/db');
const Team = require('../models/teamModel');

const TeamController = {
  // CREATE
  async create(req, res) {
    try {
      const { name, description, users } = req.body;

      // Must have at least one user
      if (!name || !Array.isArray(users) || users.length < 1) {
        return res.status(400).json({ error: "Name and at least one user are required" });
      }

      // Check unique team name
      const nameCheck = await pool.query('SELECT id FROM teams WHERE name = $1', [name]);
      if (nameCheck.rows.length > 0) {
        return res.status(400).json({ error: "Team name already exists" });
      }

      // Check all users exist
      const userCheck = await pool.query('SELECT id FROM users WHERE id = ANY($1)', [users]);
      if (userCheck.rows.length !== users.length) {
        return res.status(400).json({ error: "One or more users do not exist" });
      }

      // Create team
      const team = await Team.create({ name, description });

      // Add users
      await team.addUsers(users);

      // Fetch users for response
      await team.fetchUsers();

      res.status(201).json(team);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET ALL
  async getAll(req, res) {
    try {
      const teams = await Team.getAll();

      // Optionally fetch users for each team
      for (const team of teams) {
        await team.fetchUsers();
      }

      res.json(teams);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET BY ID
  async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const team = await Team.getById(id);
      if (!team) return res.status(404).json({ error: "Team not found" });

      await team.fetchUsers();
      res.json(team);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // UPDATE
  async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      const { name, description, users } = req.body;

      if (!name || !Array.isArray(users) || users.length < 1) {
        return res.status(400).json({ error: "Name and at least one user are required" });
      }

      // Check users exist
      const userCheck = await pool.query('SELECT id FROM users WHERE id = ANY($1)', [users]);
      if (userCheck.rows.length !== users.length) {
        return res.status(400).json({ error: "One or more users do not exist" });
      }

      // Update team info
      const team = await Team.update(id, { name, description });
      if (!team) return res.status(404).json({ error: "Team not found" });

      // Replace users
      await team.removeUsers(users); // remove any old ones (if needed)
      await team.addUsers(users);

      // Fetch users for response
      await team.fetchUsers();

      res.json(team);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE
  async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      const team = await Team.getById(id);
      if (!team) return res.status(404).json({ error: "Team not found" });

      // Remove all users mapping
      await team.removeUsers(team.users.map(u => u.id));

      // Delete team
      await Team.delete(id);

      res.json({ message: 'Team deleted successfully', team });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = TeamController;
