import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserBoards,
  searchUsers
} from '../controllers/userController.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (for admin or search purposes)
// @access  Private
router.get('/', protect, getUsers);

// @route   GET /api/users/search
// @desc    Search users by name or email
// @access  Private
router.get('/search', protect, searchUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', protect, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private
router.delete('/:id', protect, deleteUser);

// @route   GET /api/users/:id/boards
// @desc    Get all boards for a specific user
// @access  Private
router.get('/:id/boards', protect, getUserBoards);

export default router;
