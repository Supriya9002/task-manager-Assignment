import express from 'express';
import { body } from 'express-validator';
import {
  getLists,
  getList,
  createList,
  updateList,
  deleteList,
  reorderLists,
  archiveList,
  copyList
} from '../controllers/listController.js';
import { protect, boardAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router({ mergeParams: true });

// Validation rules
const createListValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('List title must be between 1 and 100 characters'),
  body('position')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Position must be a non-negative integer')
];

const updateListValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('List title must be between 1 and 100 characters'),
  body('position')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Position must be a non-negative integer')
];

const reorderValidation = [
  body('listId')
    .isMongoId()
    .withMessage('Valid list ID is required'),
  body('newPosition')
    .isInt({ min: 0 })
    .withMessage('New position must be a non-negative integer')
];

// Apply authentication to all routes
router.use(protect);

// List routes
router.route('/')
  .get(boardAccess('viewer'), getLists)
  .post(boardAccess('editor'), createListValidation, validate, createList);

router.route('/:listId')
  .get(boardAccess('viewer'), getList)
  .put(boardAccess('editor'), updateListValidation, validate, updateList)
  .delete(boardAccess('editor'), deleteList);

// List management routes
router.post('/reorder', boardAccess('editor'), reorderValidation, validate, reorderLists);
router.patch('/:listId/archive', boardAccess('editor'), archiveList);
router.post('/:listId/copy', boardAccess('editor'), copyList);

export default router;