const TeamModel = require('../models/teamModel');
const pool = require('../db');

const TeamController = {
  async create(req, res) {
    try {
      const { name, description, users } = req.body;

      if (!name || !users || users.length < 1) {
        return res.status(400).json({ error: "Name and at least one user are required" });
      }

      // Check unique name
      const nameCheck = await pool.query('SELECT id FROM teams WHERE name = $1', [name]);
      if (nameCheck.rows.length > 0) {
        return res.status(400).json({ error: "Team name already exists" });
      }

      // Check all users exist
      const userCheck = await pool.query('SELECT id FROM users WHERE id = ANY($1)', [users]);
      if (userCheck.rows.length !== users.length) {
        return res.status(400).json({ error: "One or more users do not exist" });
      }

      const team = await TeamModel.create({ name, description, users });
      res.status(201).json(team);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const teams = await TeamModel.getAll();
      res.json(teams);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const team = await TeamModel.getById(id);
      if (!team) return res.status(404).json({ error: "Team not found" });
      res.json(team);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      const { name, description, users } = req.body;

      if (!name || !users || users.length < 1) {
        return res.status(400).json({ error: "Name and at least one user are required" });
      }

      // Check all users exist
      const userCheck = await pool.query('SELECT id FROM users WHERE id = ANY($1)', [users]);
      if (userCheck.rows.length !== users.length) {
        return res.status(400).json({ error: "One or more users do not exist" });
      }

      const team = await TeamModel.update(id, { name, description, users });
      if (!team) return res.status(404).json({ error: "Team not found" });
      res.json(team);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = TeamController;
