import List from '../models/List.js';
import Card from '../models/Card.js';
import Activity from '../models/Activity.js';

// @desc    Get all lists for a board
// @route   GET /api/boards/:boardId/lists
// @access  Private
export const getLists = async (req, res, next) => {
  try {
    const lists = await List.find({ 
      board: req.params.boardId, 
      isArchived: false 
    })
    .populate({
      path: 'cards',
      match: { isArchived: false },
      populate: {
        path: 'assignedUsers',
        select: 'name email avatar'
      },
      options: { sort: { position: 1 } }
    })
    .sort({ position: 1 });

    res.status(200).json({
      success: true,
      data: lists
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single list
// @route   GET /api/boards/:boardId/lists/:listId
// @access  Private
export const getList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.listId)
      .populate({
        path: 'cards',
        match: { isArchived: false },
        populate: {
          path: 'assignedUsers',
          select: 'name email avatar'
        },
        options: { sort: { position: 1 } }
      });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    res.status(200).json({
      success: true,
      data: list
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new list
// @route   POST /api/boards/:boardId/lists
// @access  Private
export const createList = async (req, res, next) => {
  try {
    const { title, position } = req.body;
    const boardId = req.params.boardId;

    // If no position specified, add to end
    let listPosition = position;
    if (listPosition === undefined) {
      const lastList = await List.findOne({ board: boardId })
        .sort({ position: -1 });
      listPosition = lastList ? lastList.position + 1 : 0;
    }

    const list = await List.create({
      title,
      board: boardId,
      position: listPosition
    });

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: boardId,
      list: list._id,
      type: 'list_created',
      description: `created list "${title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${boardId}`).emit('list-created', { list, userId: req.user._id });

    const populatedList = await List.findById(list._id)
      .populate({
        path: 'cards',
        match: { isArchived: false },
        options: { sort: { position: 1 } }
      });

    res.status(201).json({
      success: true,
      data: populatedList
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update list
// @route   PUT /api/boards/:boardId/lists/:listId
// @access  Private
export const updateList = async (req, res, next) => {
  try {
    const list = await List.findByIdAndUpdate(
      req.params.listId,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: list.board,
      list: list._id,
      type: 'list_updated',
      description: `updated list "${list.title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${list.board}`).emit('list-updated', { list, userId: req.user._id });

    res.status(200).json({
      success: true,
      data: list
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete list
// @route   DELETE /api/boards/:boardId/lists/:listId
// @access  Private
export const deleteList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Archive all cards in this list
    await Card.updateMany(
      { list: list._id },
      { isArchived: true }
    );

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: list.board,
      list: list._id,
      type: 'list_deleted',
      description: `deleted list "${list.title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${list.board}`).emit('list-deleted', { listId: list._id, userId: req.user._id });

    await list.deleteOne();

    res.status(200).json({
      success: true,
      message: 'List deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder lists
// @route   POST /api/boards/:boardId/lists/reorder
// @access  Private
export const reorderLists = async (req, res, next) => {
  try {
    const { listId, newPosition } = req.body;
    const boardId = req.params.boardId;

    const reorderedList = await List.reorderLists(boardId, listId, newPosition);

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: boardId,
      list: listId,
      type: 'list_moved',
      description: `moved list to position ${newPosition}`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${boardId}`).emit('lists-reordered', { listId, newPosition, userId: req.user._id });

    res.status(200).json({
      success: true,
      data: reorderedList
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive/Unarchive list
// @route   PATCH /api/boards/:boardId/lists/:listId/archive
// @access  Private
export const archiveList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    list.isArchived = !list.isArchived;
    await list.save();

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: list.board,
      list: list._id,
      type: 'list_archived',
      description: `archived list "${list.title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${list.board}`).emit('list-archived', { list, userId: req.user._id });

    res.status(200).json({
      success: true,
      data: { isArchived: list.isArchived }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Copy list
// @route   POST /api/boards/:boardId/lists/:listId/copy
// @access  Private
export const copyList = async (req, res, next) => {
  try {
    const originalList = await List.findById(req.params.listId)
      .populate('cards');

    if (!originalList) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Create new list
    const newList = await List.create({
      title: `${originalList.title} (Copy)`,
      board: originalList.board,
      position: originalList.position + 1
    });

    // Copy cards
    const cardsToCreate = originalList.cards.map(card => ({
      title: card.title,
      description: card.description,
      list: newList._id,
      board: newList.board,
      position: card.position,
      labels: card.labels,
      dueDate: card.dueDate,
      priority: card.priority
    }));

    await Card.create(cardsToCreate);

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: newList.board,
      list: newList._id,
      type: 'list_created',
      description: `copied list "${originalList.title}"`
    });

    const populatedList = await List.findById(newList._id)
      .populate({
        path: 'cards',
        match: { isArchived: false },
        options: { sort: { position: 1 } }
      });

    res.status(201).json({
      success: true,
      data: populatedList
    });
  } catch (error) {
    next(error);
  }
};
