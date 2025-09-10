import express from 'express';
import { body } from 'express-validator';
import {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  addMember,
  removeMember,
  updateMemberRole,
  getBoardMembers,
  getBoardActivities,
  toggleFavorite,
  archiveBoard,
  duplicateBoard
} from '../controllers/boardController.js';
import { protect, boardAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Validation rules
const createBoardValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Board title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Board description cannot exceed 500 characters')
];

const updateBoardValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Board title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Board description cannot exceed 500 characters')
];

const addMemberValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('role')
    .optional()
    .isIn(['admin', 'editor', 'viewer'])
    .withMessage('Role must be admin, editor, or viewer')
];

// Apply authentication to all routes
router.use(protect);

// Board routes
router.route('/')
  .get(getBoards)
  .post(createBoardValidation, validate, createBoard);

router.route('/:id')
  .get(boardAccess('viewer'), getBoard)
  .put(boardAccess('admin'), updateBoardValidation, validate, updateBoard)
  .delete(boardAccess('admin'), deleteBoard);

// Board management routes
router.post('/:id/duplicate', boardAccess('admin'), duplicateBoard);
router.patch('/:id/favorite', boardAccess('viewer'), toggleFavorite);
router.patch('/:id/archive', boardAccess('admin'), archiveBoard);

// Member management routes
router.route('/:id/members')
  .get(boardAccess('viewer'), getBoardMembers)
  .post(boardAccess('admin'), addMemberValidation, validate, addMember);

router.route('/:id/members/:userId')
  .delete(boardAccess('admin'), removeMember)
  .patch(boardAccess('admin'), updateMemberRole);

// Activity routes
router.get('/:id/activities', boardAccess('viewer'), getBoardActivities);

export default router;