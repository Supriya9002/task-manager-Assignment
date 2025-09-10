import Card from '../models/Card.js';
import List from '../models/List.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

// @desc    Get all cards for a board
// @route   GET /api/boards/:boardId/cards
// @access  Private
export const getCards = async (req, res, next) => {
  try {
    const { listId, assignedTo, dueDate, priority, labels } = req.query;
    const query = { board: req.params.boardId, isArchived: false };

    if (listId) query.list = listId;
    if (assignedTo) query.assignedUsers = assignedTo;
    if (dueDate) {
      const date = new Date(dueDate);
      query.dueDate = { $gte: date, $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) };
    }
    if (priority) query.priority = priority;
    if (labels) query['labels.name'] = { $in: labels.split(',') };

    const cards = await Card.find(query)
      .populate('assignedUsers', 'name email avatar')
      .populate('list', 'title')
      .sort({ position: 1 });

    res.status(200).json({
      success: true,
      data: cards
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search cards
// @route   GET /api/boards/:boardId/cards/search
// @access  Private
export const searchCards = async (req, res, next) => {
  try {
    const { q, listId, assignedTo, dueDate, priority, labels } = req.query;
    const query = { board: req.params.boardId, isArchived: false };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    if (listId) query.list = listId;
    if (assignedTo) query.assignedUsers = assignedTo;
    if (dueDate) {
      const date = new Date(dueDate);
      query.dueDate = { $gte: date, $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) };
    }
    if (priority) query.priority = priority;
    if (labels) query['labels.name'] = { $in: labels.split(',') };

    const cards = await Card.find(query)
      .populate('assignedUsers', 'name email avatar')
      .populate('list', 'title')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: cards
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single card
// @route   GET /api/boards/:boardId/cards/:cardId
// @access  Private
export const getCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId)
      .populate('assignedUsers', 'name email avatar')
      .populate('list', 'title')
      .populate('comments.author', 'name email avatar');

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    res.status(200).json({
      success: true,
      data: card
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new card
// @route   POST /api/boards/:boardId/cards
// @access  Private
export const createCard = async (req, res, next) => {
  try {
    const { title, description, listId, position, labels, dueDate, priority } = req.body;
    const boardId = req.params.boardId;

    // If no position specified, add to end of list
    let cardPosition = position;
    if (cardPosition === undefined) {
      const lastCard = await Card.findOne({ list: listId })
        .sort({ position: -1 });
      cardPosition = lastCard ? lastCard.position + 1 : 0;
    }

    const card = await Card.create({
      title,
      description,
      list: listId,
      board: boardId,
      position: cardPosition,
      labels: labels || [],
      dueDate: dueDate || null,
      priority: priority || 'medium'
    });

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: boardId,
      list: listId,
      card: card._id,
      type: 'card_created',
      description: `created card "${title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${boardId}`).emit('card-created', { card, userId: req.user._id });

    const populatedCard = await Card.findById(card._id)
      .populate('assignedUsers', 'name email avatar')
      .populate('list', 'title');

    res.status(201).json({
      success: true,
      data: populatedCard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update card
// @route   PUT /api/boards/:boardId/cards/:cardId
// @access  Private
export const updateCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
    .populate('assignedUsers', 'name email avatar')
    .populate('list', 'title');

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: card.board,
      list: card.list,
      card: card._id,
      type: 'card_updated',
      description: `updated card "${card.title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${card.board}`).emit('card-updated', { card, userId: req.user._id });

    res.status(200).json({
      success: true,
      data: card
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete card
// @route   DELETE /api/boards/:boardId/cards/:cardId
// @access  Private
export const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: card.board,
      list: card.list,
      card: card._id,
      type: 'card_deleted',
      description: `deleted card "${card.title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${card.board}`).emit('card-deleted', { cardId: card._id, userId: req.user._id });

    await card.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Card deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move card to different list
// @route   POST /api/boards/:boardId/cards/:cardId/move
// @access  Private
export const moveCard = async (req, res, next) => {
  try {
    const { listId, position } = req.body;
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    await card.moveToList(listId, position);

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: card.board,
      list: listId,
      card: card._id,
      type: 'card_moved',
      description: `moved card "${card.title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${card.board}`).emit('card-moved', { card, userId: req.user._id });

    const updatedCard = await Card.findById(card._id)
      .populate('assignedUsers', 'name email avatar')
      .populate('list', 'title');

    res.status(200).json({
      success: true,
      data: updatedCard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder cards within a list
// @route   POST /api/boards/:boardId/cards/reorder
// @access  Private
export const reorderCards = async (req, res, next) => {
  try {
    const { listId, cardId, newPosition } = req.body;

    const reorderedCard = await Card.reorderCards(listId, cardId, newPosition);

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: req.params.boardId,
      list: listId,
      card: cardId,
      type: 'card_moved',
      description: `reordered card`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${req.params.boardId}`).emit('cards-reordered', { listId, cardId, newPosition, userId: req.user._id });

    res.status(200).json({
      success: true,
      data: reorderedCard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to card
// @route   POST /api/boards/:boardId/cards/:cardId/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    await card.addComment(content, req.user._id);

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: card.board,
      list: card.list,
      card: card._id,
      type: 'card_comment_added',
      description: `commented on card "${card.title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${card.board}`).emit('comment-added', { card, userId: req.user._id });

    const updatedCard = await Card.findById(card._id)
      .populate('comments.author', 'name email avatar');

    res.status(201).json({
      success: true,
      data: updatedCard.comments[updatedCard.comments.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PUT /api/boards/:boardId/cards/:cardId/comments/:commentId
// @access  Private
export const updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    const comment = card.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this comment'
      });
    }

    comment.content = content;
    comment.updatedAt = new Date();
    comment.isEdited = true;
    await card.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${card.board}`).emit('comment-updated', { card, userId: req.user._id });

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/boards/:boardId/cards/:cardId/comments/:commentId
// @access  Private
export const deleteComment = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    const comment = card.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    comment.deleteOne();
    await card.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${card.board}`).emit('comment-deleted', { card, commentId: req.params.commentId, userId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign user to card
// @route   POST /api/boards/:boardId/cards/:cardId/assign/:userId
// @access  Private
export const assignUser = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    if (!card.assignedUsers.includes(req.params.userId)) {
      card.assignedUsers.push(req.params.userId);
      await card.save();

      // Log activity
      await Activity.logActivity({
        user: req.user._id,
        board: card.board,
        list: card.list,
        card: card._id,
        type: 'card_assigned',
        description: `assigned user to card "${card.title}"`
      });

      // Emit real-time update
      const io = req.app.get('io');
      io.to(`board-${card.board}`).emit('card-updated', { card, userId: req.user._id });
    }

    const updatedCard = await Card.findById(card._id)
      .populate('assignedUsers', 'name email avatar');

    res.status(200).json({
      success: true,
      data: updatedCard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unassign user from card
// @route   DELETE /api/boards/:boardId/cards/:cardId/assign/:userId
// @access  Private
export const unassignUser = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    card.assignedUsers = card.assignedUsers.filter(
      userId => userId.toString() !== req.params.userId
    );
    await card.save();

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: card.board,
      list: card.list,
      card: card._id,
      type: 'card_unassigned',
      description: `unassigned user from card "${card.title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${card.board}`).emit('card-updated', { card, userId: req.user._id });

    const updatedCard = await Card.findById(card._id)
      .populate('assignedUsers', 'name email avatar');

    res.status(200).json({
      success: true,
      data: updatedCard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add label to card
// @route   POST /api/boards/:boardId/cards/:cardId/labels
// @access  Private
export const addLabel = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Check if label already exists
    const existingLabel = card.labels.find(label => label.name === name);
    if (!existingLabel) {
      card.labels.push({ name, color });
      await card.save();

      // Log activity
      await Activity.logActivity({
        user: req.user._id,
        board: card.board,
        list: card.list,
        card: card._id,
        type: 'card_label_added',
        description: `added label "${name}" to card "${card.title}"`
      });

      // Emit real-time update
      const io = req.app.get('io');
      io.to(`board-${card.board}`).emit('card-updated', { card, userId: req.user._id });
    }

    res.status(200).json({
      success: true,
      data: card.labels
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove label from card
// @route   DELETE /api/boards/:boardId/cards/:cardId/labels/:labelId
// @access  Private
export const removeLabel = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    const labelIndex = card.labels.findIndex(label => label._id.toString() === req.params.labelId);
    if (labelIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Label not found'
      });
    }

    const removedLabel = card.labels[labelIndex];
    card.labels.splice(labelIndex, 1);
    await card.save();

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: card.board,
      list: card.list,
      card: card._id,
      type: 'card_label_removed',
      description: `removed label "${removedLabel.name}" from card "${card.title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${card.board}`).emit('card-updated', { card, userId: req.user._id });

    res.status(200).json({
      success: true,
      data: card.labels
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive card
// @route   PATCH /api/boards/:boardId/cards/:cardId/archive
// @access  Private
export const archiveCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    card.isArchived = !card.isArchived;
    await card.save();

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: card.board,
      list: card.list,
      card: card._id,
      type: 'card_archived',
      description: `archived card "${card.title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${card.board}`).emit('card-archived', { card, userId: req.user._id });

    res.status(200).json({
      success: true,
      data: { isArchived: card.isArchived }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Copy card
// @route   POST /api/boards/:boardId/cards/:cardId/copy
// @access  Private
export const copyCard = async (req, res, next) => {
  try {
    const originalCard = await Card.findById(req.params.cardId);

    if (!originalCard) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Create new card
    const newCard = await Card.create({
      title: `${originalCard.title} (Copy)`,
      description: originalCard.description,
      list: originalCard.list,
      board: originalCard.board,
      position: originalCard.position + 1,
      labels: originalCard.labels,
      dueDate: originalCard.dueDate,
      priority: originalCard.priority
    });

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: newCard.board,
      list: newCard.list,
      card: newCard._id,
      type: 'card_created',
      description: `copied card "${originalCard.title}"`
    });

    const populatedCard = await Card.findById(newCard._id)
      .populate('assignedUsers', 'name email avatar')
      .populate('list', 'title');

    res.status(201).json({
      success: true,
      data: populatedCard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add attachment to card
// @route   POST /api/boards/:boardId/cards/:cardId/attachments
// @access  Private
export const addAttachment = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id
    };

    card.attachments.push(attachment);
    await card.save();

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: card.board,
      list: card.list,
      card: card._id,
      type: 'card_attachment_added',
      description: `added attachment to card "${card.title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${card.board}`).emit('card-updated', { card, userId: req.user._id });

    res.status(201).json({
      success: true,
      data: attachment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attachment from card
// @route   DELETE /api/boards/:boardId/cards/:cardId/attachments/:attachmentId
// @access  Private
export const deleteAttachment = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    const attachmentIndex = card.attachments.findIndex(
      attachment => attachment._id.toString() === req.params.attachmentId
    );

    if (attachmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    const removedAttachment = card.attachments[attachmentIndex];
    card.attachments.splice(attachmentIndex, 1);
    await card.save();

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: card.board,
      list: card.list,
      card: card._id,
      type: 'card_attachment_removed',
      description: `removed attachment from card "${card.title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${card.board}`).emit('card-updated', { card, userId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update checklist
// @route   PUT /api/boards/:boardId/cards/:cardId/checklist
// @access  Private
export const updateChecklist = async (req, res, next) => {
  try {
    const { checklist } = req.body;
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    card.checklist = checklist;
    await card.save();

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: card.board,
      list: card.list,
      card: card._id,
      type: 'card_updated',
      description: `updated checklist on card "${card.title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${card.board}`).emit('card-updated', { card, userId: req.user._id });

    res.status(200).json({
      success: true,
      data: card.checklist
    });
  } catch (error) {
    next(error);
  }
};
