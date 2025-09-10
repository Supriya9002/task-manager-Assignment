import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      preferences: user.preferences
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Create demo data for new user
    await createDemoDataForUser(user._id);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      avatar: req.body.avatar,
      preferences: req.body.preferences
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    // This would typically send an email with reset link
    // For demo purposes, we'll just return a success message
    res.status(200).json({
      success: true,
      message: 'Password reset email sent (demo mode)'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    // This would typically verify the reset token
    // For demo purposes, we'll just return a success message
    res.status(200).json({
      success: true,
      message: 'Password reset successful (demo mode)'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to create demo data for new users
const createDemoDataForUser = async (userId) => {
  try {
    const Board = (await import('../models/Board.js')).default;
    const List = (await import('../models/List.js')).default;
    const Card = (await import('../models/Card.js')).default;

    // Create demo boards
    const boards = await Board.create([
      {
        title: 'Project Alpha',
        description: 'Main software development project with key features and milestones',
        owner: userId,
        backgroundColor: '#3B82F6'
      },
      {
        title: 'Marketing Campaign',
        description: 'Q1 marketing campaign planning and execution',
        owner: userId,
        backgroundColor: '#10B981'
      },
      {
        title: 'Launch Prep',
        description: 'Product launch preparation and coordination',
        owner: userId,
        backgroundColor: '#F59E0B'
      }
    ]);

    // Create lists for each board
    for (const board of boards) {
      const lists = await List.create([
        { title: 'To Do', board: board._id, position: 0 },
        { title: 'In Progress', board: board._id, position: 1 },
        { title: 'Review', board: board._id, position: 2 },
        { title: 'Done', board: board._id, position: 3 }
      ]);

      // Create sample cards
      const sampleCards = [
        {
          title: 'User Authentication System',
          description: 'Implement JWT-based authentication with login, register, and logout functionality',
          list: lists[0]._id,
          board: board._id,
          position: 0,
          labels: [{ name: 'Backend', color: '#3B82F6' }, { name: 'High Priority', color: '#EF4444' }],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Dashboard UI Design',
          description: 'Create modern dashboard interface with responsive design',
          list: lists[0]._id,
          board: board._id,
          position: 1,
          labels: [{ name: 'Frontend', color: '#10B981' }, { name: 'Design', color: '#8B5CF6' }],
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'API Development',
          description: 'Build RESTful API endpoints for CRUD operations',
          list: lists[1]._id,
          board: board._id,
          position: 0,
          labels: [{ name: 'Backend', color: '#3B82F6' }, { name: 'API', color: '#F59E0B' }],
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'User Testing',
          description: 'Conduct user testing sessions and gather feedback',
          list: lists[3]._id,
          board: board._id,
          position: 0,
          labels: [{ name: 'Testing', color: '#06B6D4' }, { name: 'UX', color: '#EC4899' }],
          dueDateCompleted: true
        }
      ];

      await Card.create(sampleCards);
    }

    console.log(`Demo data created for user ${userId}`);
  } catch (error) {
    console.error('Error creating demo data:', error);
  }
};