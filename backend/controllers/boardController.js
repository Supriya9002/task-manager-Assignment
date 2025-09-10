import Board from '../models/Board.js';
import List from '../models/List.js';
import Card from '../models/Card.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

// @desc    Get all boards for user
// @route   GET /api/boards
// @access  Private
export const getBoards = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, favorite, archived } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    };

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    if (favorite !== undefined) {
      query.isFavorite = favorite === 'true';
    }

    if (archived !== undefined) {
      query.isArchived = archived === 'true';
    }

    const boards = await Board.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Board.countDocuments(query);

    // Add user role to each board
    const boardsWithRole = boards.map(board => ({
      ...board,
      userRole: board.owner._id.toString() === req.user._id.toString() 
        ? 'admin' 
        : board.members.find(m => m.user._id.toString() === req.user._id.toString())?.role || 'viewer'
    }));

    res.status(200).json({
      success: true,
      data: boardsWithRole,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single board
// @route   GET /api/boards/:id
// @access  Private
export const getBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate({
        path: 'lists',
        populate: {
          path: 'cards',
          populate: {
            path: 'assignedUsers',
            select: 'name email avatar'
          }
        }
      });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...board.toObject(),
        userRole: req.userRole
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new board
// @route   POST /api/boards
// @access  Private
export const createBoard = async (req, res, next) => {
  try {
    const boardData = {
      ...req.body,
      owner: req.user._id
    };

    const board = await Board.create(boardData);

    // Create default lists
    const defaultLists = [
      { title: 'To Do', board: board._id, position: 0 },
      { title: 'In Progress', board: board._id, position: 1 },
      { title: 'Done', board: board._id, position: 2 }
    ];

    await List.create(defaultLists);

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: board._id,
      type: 'board_created',
      description: `created board "${board.title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('board-created', { board, userId: req.user._id });

    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('lists');

    res.status(201).json({
      success: true,
      data: populatedBoard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update board
// @route   PUT /api/boards/:id
// @access  Private
export const updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('owner', 'name email avatar')
     .populate('members.user', 'name email avatar');

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Update last activity
    await board.updateActivity();

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: board._id,
      type: 'board_updated',
      description: `updated board "${board.title}"`
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${board._id}`).emit('board-updated', { board, userId: req.user._id });

    res.status(200).json({
      success: true,
      data: board
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete board
// @route   DELETE /api/boards/:id
// @access  Private
export const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Delete all associated lists and cards
    const lists = await List.find({ board: board._id });
    const listIds = lists.map(list => list._id);
    
    await Card.deleteMany({ list: { $in: listIds } });
    await List.deleteMany({ board: board._id });
    await Activity.deleteMany({ board: board._id });
    
    await board.deleteOne();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`board-${board._id}`).emit('board-deleted', { boardId: board._id, userId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Board deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to board
// @route   POST /api/boards/:id/members
// @access  Private
export const addMember = async (req, res, next) => {
  try {
    const { email, role = 'editor' } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Check if user is already a member
    if (board.isMember(user._id)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this board'
      });
    }

    await board.addMember(user._id, role);

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: board._id,
      type: 'board_member_added',
      description: `added ${email} as ${role} to board`
    });

    const updatedBoard = await Board.findById(board._id)
      .populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      data: updatedBoard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from board
// @route   DELETE /api/boards/:id/members/:userId
// @access  Private
export const removeMember = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    await board.removeMember(req.params.userId);

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: board._id,
      type: 'board_member_removed',
      description: `removed member from board`
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update member role
// @route   PATCH /api/boards/:id/members/:userId
// @access  Private
export const updateMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    const member = board.members.find(m => m.user.toString() === req.params.userId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    member.role = role;
    await board.save();

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: board._id,
      type: 'board_member_role_changed',
      description: `changed member role to ${role}`
    });

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get board members
// @route   GET /api/boards/:id/members
// @access  Private
export const getBoardMembers = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    const members = [
      {
        user: board.owner,
        role: 'admin',
        joinedAt: board.createdAt
      },
      ...board.members
    ];

    res.status(200).json({
      success: true,
      data: members
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get board activities
// @route   GET /api/boards/:id/activities
// @access  Private
export const getBoardActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const result = await Activity.getBoardActivities(
      req.params.id,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: result.activities,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle board favorite
// @route   PATCH /api/boards/:id/favorite
// @access  Private
export const toggleFavorite = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    board.isFavorite = !board.isFavorite;
    await board.save();

    res.status(200).json({
      success: true,
      data: { isFavorite: board.isFavorite }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive/Unarchive board
// @route   PATCH /api/boards/:id/archive
// @access  Private
export const archiveBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    board.isArchived = !board.isArchived;
    await board.save();

    // Log activity
    await Activity.logActivity({
      user: req.user._id,
      board: board._id,
      type: 'board_archived',
      description: `archived board "${board.title}"`
    });

    res.status(200).json({
      success: true,
      data: { isArchived: board.isArchived }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate board
// @route   POST /api/boards/:id/duplicate
// @access  Private
export const duplicateBoard = async (req, res, next) => {
  try {
    const originalBoard = await Board.findById(req.params.id)
      .populate('lists');

    if (!originalBoard) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Create new board
    const newBoard = await Board.create({
      title: `${originalBoard.title} (Copy)`,
      description: originalBoard.description,
      owner: req.user._id,
      backgroundColor: originalBoard.backgroundColor,
      labels: originalBoard.labels
    });

    // Duplicate lists and cards
    const lists = await List.find({ board: originalBoard._id });
    
    for (const list of lists) {
      const newList = await List.create({
        title: list.title,
        board: newBoard._id,
        position: list.position
      });

      const cards = await Card.find({ list: list._id });
      
      for (const card of cards) {
        await Card.create({
          title: card.title,
          description: card.description,
          list: newList._id,
          board: newBoard._id,
          position: card.position,
          labels: card.labels,
          dueDate: card.dueDate,
          priority: card.priority
        });
      }
    }

    const populatedBoard = await Board.findById(newBoard._id)
      .populate('owner', 'name email avatar')
      .populate('lists');

    res.status(201).json({
      success: true,
      data: populatedBoard
    });
  } catch (error) {
    next(error);
  }
};