import express from 'express';
import { body } from 'express-validator';
import {
  getCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  moveCard,
  reorderCards,
  addComment,
  updateComment,
  deleteComment,
  addAttachment,
  deleteAttachment,
  assignUser,
  unassignUser,
  addLabel,
  removeLabel,
  updateChecklist,
  searchCards,
  archiveCard,
  copyCard
} from '../controllers/cardController.js';
import { protect, boardAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';

const router = express.Router({ mergeParams: true });

// Validation rules
const createCardValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Card title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Card description cannot exceed 2000 characters'),
  body('listId')
    .isMongoId()
    .withMessage('Valid list ID is required')
];

const updateCardValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Card title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Card description cannot exceed 2000 characters')
];

const moveCardValidation = [
  body('listId')
    .isMongoId()
    .withMessage('Valid list ID is required'),
  body('position')
    .isInt({ min: 0 })
    .withMessage('Position must be a non-negative integer')
];

const commentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
];

// Apply authentication to all routes
router.use(protect);

// Card routes
router.route('/')
  .get(boardAccess('viewer'), getCards)
  .post(boardAccess('editor'), createCardValidation, validate, createCard);

router.get('/search', boardAccess('viewer'), searchCards);

router.route('/:cardId')
  .get(boardAccess('viewer'), getCard)
  .put(boardAccess('editor'), updateCardValidation, validate, updateCard)
  .delete(boardAccess('editor'), deleteCard);

// Card management routes
router.post('/:cardId/move', boardAccess('editor'), moveCardValidation, validate, moveCard);
router.post('/reorder', boardAccess('editor'), reorderCards);
router.patch('/:cardId/archive', boardAccess('editor'), archiveCard);
router.post('/:cardId/copy', boardAccess('editor'), copyCard);

// User assignment routes
router.post('/:cardId/assign/:userId', boardAccess('editor'), assignUser);
router.delete('/:cardId/assign/:userId', boardAccess('editor'), unassignUser);

// Label routes
router.post('/:cardId/labels', boardAccess('editor'), addLabel);
router.delete('/:cardId/labels/:labelId', boardAccess('editor'), removeLabel);

// Comment routes
router.route('/:cardId/comments')
  .post(boardAccess('viewer'), commentValidation, validate, addComment);

router.route('/:cardId/comments/:commentId')
  .put(boardAccess('viewer'), commentValidation, validate, updateComment)
  .delete(boardAccess('viewer'), deleteComment);

// Attachment routes
router.post('/:cardId/attachments', boardAccess('editor'), upload.single('file'), addAttachment);
router.delete('/:cardId/attachments/:attachmentId', boardAccess('editor'), deleteAttachment);

// Checklist routes
router.put('/:cardId/checklist', boardAccess('editor'), updateChecklist);

export default router;