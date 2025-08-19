const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Lấy tất cả user
router.get('/', userController.getAllUsers);

// Lấy user theo id
router.get('/:id', userController.getUserById);

// Tạo mới user
router.post('/', userController.createUser);

// Cập nhật user
router.put('/:id', userController.updateUser);

// Xóa user
router.delete('/:id', userController.deleteUser);

module.exports = router;
