import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: false
  },
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: false
  },
  type: {
    type: String,
    required: true,
    enum: [
      // Board actions
      'board_created', 'board_updated', 'board_deleted', 'board_archived',
      'board_member_added', 'board_member_removed', 'board_member_role_changed',
      
      // List actions
      'list_created', 'list_updated', 'list_deleted', 'list_archived', 'list_moved',
      
      // Card actions
      'card_created', 'card_updated', 'card_deleted', 'card_archived',
      'card_moved', 'card_assigned', 'card_unassigned',
      'card_due_date_set', 'card_due_date_removed', 'card_due_date_completed',
      'card_label_added', 'card_label_removed',
      'card_attachment_added', 'card_attachment_removed',
      'card_comment_added', 'card_comment_updated', 'card_comment_deleted',
      'card_checklist_item_added', 'card_checklist_item_completed', 'card_checklist_item_removed'
    ]
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
activitySchema.index({ board: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1 });

// Virtual for human-readable action
activitySchema.virtual('actionText').get(function() {
  const actionMap = {
    // Board actions
    'board_created': 'created this board',
    'board_updated': 'updated board details',
    'board_deleted': 'deleted this board',
    'board_archived': 'archived this board',
    'board_member_added': 'added a member to this board',
    'board_member_removed': 'removed a member from this board',
    'board_member_role_changed': 'changed member role',
    
    // List actions
    'list_created': 'added list',
    'list_updated': 'updated list',
    'list_deleted': 'deleted list',
    'list_archived': 'archived list',
    'list_moved': 'moved list',
    
    // Card actions
    'card_created': 'added card',
    'card_updated': 'updated card',
    'card_deleted': 'deleted card',
    'card_archived': 'archived card',
    'card_moved': 'moved card',
    'card_assigned': 'assigned card to',
    'card_unassigned': 'unassigned card from',
    'card_due_date_set': 'set due date on card',
    'card_due_date_removed': 'removed due date from card',
    'card_due_date_completed': 'marked due date as complete',
    'card_label_added': 'added label to card',
    'card_label_removed': 'removed label from card',
    'card_attachment_added': 'added attachment to card',
    'card_attachment_removed': 'removed attachment from card',
    'card_comment_added': 'commented on card',
    'card_comment_updated': 'updated comment on card',
    'card_comment_deleted': 'deleted comment from card',
    'card_checklist_item_added': 'added checklist item',
    'card_checklist_item_completed': 'completed checklist item',
    'card_checklist_item_removed': 'removed checklist item'
  };
  
  return actionMap[this.type] || this.type;
});

// Static method to log activity
activitySchema.statics.logActivity = async function(data) {
  try {
    const activity = new this(data);
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to prevent breaking main functionality
    return null;
  }
};

// Static method to get board activities with pagination
activitySchema.statics.getBoardActivities = async function(boardId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const activities = await this.find({ board: boardId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
  const total = await this.countDocuments({ board: boardId });
  
  return {
    activities,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Auto-cleanup old activities (keep only last 1000 per board)
activitySchema.statics.cleanupOldActivities = async function() {
  try {
    const boards = await mongoose.model('Board').find({}, '_id');
    
    for (const board of boards) {
      const activities = await this.find({ board: board._id })
        .sort({ createdAt: -1 })
        .skip(1000)
        .select('_id');
        
      if (activities.length > 0) {
        const idsToDelete = activities.map(activity => activity._id);
        await this.deleteMany({ _id: { $in: idsToDelete } });
      }
    }
  } catch (error) {
    console.error('Error cleaning up old activities:', error);
  }
};

export default mongoose.model('Activity', activitySchema);