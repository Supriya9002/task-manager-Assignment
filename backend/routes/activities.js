import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getActivities,
  getActivityById,
  createActivity,
  deleteActivity, 
  getBoardActivities
} from '../controllers/activityController.js';

const router = express.Router();

// @route   GET /api/activities
// @desc    Get all activities (with pagination)
// @access  Private
router.get('/', protect, getActivities);

// @route   GET /api/activities/board/:boardId
// @desc    Get all activities for a specific board
// @access  Private
router.get('/board/:boardId', protect, getBoardActivities);

// @route   GET /api/activities/:id
// @desc    Get activity by ID
// @access  Private
router.get('/:id', protect, getActivityById);

// @route   POST /api/activities
// @desc    Create a new activity
// @access  Private
router.post('/', protect, createActivity);

// @route   DELETE /api/activities/:id
// @desc    Delete activity
// @access  Private
router.delete('/:id', protect, deleteActivity);

export default router; 
