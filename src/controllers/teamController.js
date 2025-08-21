const { Team, User } = require("../models");

// GET all teams with users
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      include: [{ model: User, as: "users" }], // include associated users
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET team by ID with users
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      attributes: ['id', 'name', 'description', 'created_at'], // all fields
      include: [{ 
        model: User, 
        as: "users", 
        attributes: ['id','name','email','role','created_at'] 
      }]
    });

    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// CREATE a new team
exports.createTeam = async (req, res) => {
  try {
    const { name, description, users } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    // Create a new team
    const team = await Team.create({ name, description });

    // Assign users to this team if provided
    if (users && users.length > 0) {
      await User.update(
        { teamid: team.id },
        { where: { id: users } }
      );
    }

    // Fetch the team including users for full response
    const result = await Team.findByPk(team.id, {
      include: [{ model: User, as: "users" }]
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE team info
exports.updateTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Update team fields
    await team.update({ name, description });

    // Fetch updated team with users for full response
    const result = await Team.findByPk(team.id, {
      include: [{ model: User, as: "users" }]
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE team
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    await team.destroy();
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
