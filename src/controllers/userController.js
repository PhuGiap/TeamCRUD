const { User, Team } = require("../models");

// GET all users with team info
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "created_at"], // only required fields
      include: [
        {
          model: Team,
          as: "teams", // alias must match your association in User model
          attributes: ["id", "name", "description", "created_at"],
        },
      ],
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET user by ID with team info
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "role", "created_at"],
      include: [
        {
          model: Team,
          as: "teams",
          attributes: ["id", "name", "description", "created_at"],
        },
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE a new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, role, teamid } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ message: "Name, email, and role are required" });
    }

    const user = await User.create({ name, email, role, teamid });

    const result = await User.findByPk(user.id, {
      attributes: ["id", "name", "email", "role", "created_at"],
      include: [
        {
          model: Team,
          as: "teams",
          attributes: ["id", "name", "description", "created_at"],
        },
      ],
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, teamid } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({ name, email, role, teamid });

    const result = await User.findByPk(user.id, {
      attributes: ["id", "name", "email", "role", "created_at"],
      include: [
        {
          model: Team,
          as: "teams",
          attributes: ["id", "name", "description", "created_at"],
        },
      ],
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // check if user is the last in team
    if (user.teamid) {
      const userCount = await User.count({ where: { teamid: user.teamid } });
      if (userCount <= 1) {
        return res.status(400).json({
          message: "Cannot delete user: team must have at least 1 user",
        });
      }
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
