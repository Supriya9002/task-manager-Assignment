import Activity from '../models/Activity.js';
import { validationResult } from 'express-validator';

// @desc    Get all activities with pagination
// @route   GET /api/activities
// @access  Private
export const getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, userId } = req.query;
    const query = {};

    if (type) {
      query.type = type;
    }

    if (userId) {
      query.user = userId;
    }

    const activities = await Activity.find(query)
      .populate('user', 'name email avatar')
      .populate('board', 'title')
      .populate('list', 'title')
      .populate('card', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments(query);

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all activities for a specific board
// @route   GET /api/activities/board/:boardId
// @access  Private
export const getBoardActivities = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const activities = await Activity.find({ board: boardId })
      .populate('user', 'name email avatar')
      .populate('list', 'title')
      .populate('card', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments({ board: boardId });

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get board activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get activity by ID
// @route   GET /api/activities/:id
// @access  Private
export const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('board', 'title')
      .populate('list', 'title')
      .populate('card', 'title');

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    console.error('Get activity by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new activity
// @route   POST /api/activities
// @access  Private
export const createActivity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, description, board, list, card, metadata } = req.body;

    const activity = new Activity({
      type,
      description,
      user: req.user.id,
      board,
      list,
      card,
      metadata
    });

    await activity.save();

    const populatedActivity = await Activity.findById(activity._id)
      .populate('user', 'name email avatar')
      .populate('board', 'title')
      .populate('list', 'title')
      .populate('card', 'title');

    // Emit real-time update
    const io = req.app.get('io');
    if (io && board) {
      io.to(`board-${board}`).emit('activity-created', populatedActivity);
    }

    res.status(201).json(populatedActivity);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if user is the creator of the activity or is admin
    if (activity.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this activity' });
    }

    await Activity.findByIdAndDelete(req.params.id);

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
