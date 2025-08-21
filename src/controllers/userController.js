// src/controllers/userController.js
const User = require('../models/userModel');

const UserController = {
  // GET ALL USERS
  async getAllUsers(req, res) {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET USER BY ID
  async getUserById(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid user ID" });

      const user = await User.getById(id);
      if (!user) return res.status(404).json({ error: "User not found" });

      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // CREATE USER
  async createUser(req, res) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check email uniqueness
      const existing = await User.getByEmail(email);
      if (existing) return res.status(400).json({ error: "Email already exists" });

      const newUser = await User.create({ name, email, password, role });
      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // UPDATE USER
  async updateUser(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid user ID" });

      const { name, email, role } = req.body;
      if (!name && !email && !role) return res.status(400).json({ error: "At least one field is required" });

      const updatedUser = await User.update(id, { name, email, role });
      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE USER
  async deleteUser(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid user ID" });

      const deletedUser = await User.delete(id);
      if (!deletedUser) return res.status(404).json({ error: "User not found" });

      res.json({ message: "User deleted successfully", user: deletedUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = UserController;
