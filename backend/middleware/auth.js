import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No user found with this token'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

export const boardAccess = (requiredRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      const boardId = req.params.boardId || req.params.id;
      
      if (!boardId) {
        return res.status(400).json({
          success: false,
          message: 'Board ID is required'
        });
      }

      const Board = (await import('../models/Board.js')).default;
      const board = await Board.findById(boardId);

      if (!board) {
        return res.status(404).json({
          success: false,
          message: 'Board not found'
        });
      }

      const userRole = board.getUserRole(req.user._id);
      
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this board'
        });
      }

      // Role hierarchy: admin > editor > viewer
      const roleHierarchy = { viewer: 1, editor: 2, admin: 3 };
      
      if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
        return res.status(403).json({
          success: false,
          message: `${requiredRole} access required`
        });
      }

      req.board = board;
      req.userRole = userRole;
      next();
    } catch (error) {
      next(error);
    }
  };
};