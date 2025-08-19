const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");

// Lấy tất cả team
router.get("/", teamController.getAllTeams);

// Lấy team theo id
router.get("/:id", teamController.getTeamById);

// Tạo team mới
router.post("/", teamController.createTeam);

// Cập nhật team theo id
router.put("/:id", teamController.updateTeam);

// Xóa team theo id
router.delete("/:id", teamController.deleteTeam);

module.exports = router;
