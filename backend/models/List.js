import mongoose from 'mongoose';

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'List title is required'],
    trim: true,
    maxlength: [100, 'List title cannot be more than 100 characters']
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  position: {
    type: Number,
    required: true,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  cardLimit: {
    type: Number,
    default: null,
    min: [1, 'Card limit must be at least 1']
  },
  settings: {
    autoArchiveCards: { type: Boolean, default: false },
    sortBy: { 
      type: String, 
      enum: ['position', 'created', 'updated', 'dueDate', 'alphabetical'],
      default: 'position' 
    },
    sortOrder: {
      type: String,
      enum: ['asc', 'desc'],
      default: 'asc'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
listSchema.index({ board: 1, position: 1 });
listSchema.index({ board: 1, isArchived: 1 });

// Virtual for cards
listSchema.virtual('cards', {
  ref: 'Card',
  localField: '_id',
  foreignField: 'list',
  options: { sort: { position: 1 } }
});

// Virtual for cards count
listSchema.virtual('cardsCount', {
  ref: 'Card',
  localField: '_id',
  foreignField: 'list',
  count: true
});

// Pre-remove middleware to handle cards
listSchema.pre('deleteOne', { document: true, query: false }, async function() {
  // Archive all cards in this list instead of deleting them
  await mongoose.model('Card').updateMany(
    { list: this._id },
    { isArchived: true }
  );
});

// Method to reorder lists
listSchema.statics.reorderLists = async function(boardId, listId, newPosition) {
  const lists = await this.find({ board: boardId, isArchived: false }).sort({ position: 1 });
  const listToMove = lists.find(list => list._id.toString() === listId.toString());
  
  if (!listToMove) {
    throw new Error('List not found');
  }

  const oldPosition = listToMove.position;
  
  // Update positions
  if (newPosition > oldPosition) {
    // Moving right
    await this.updateMany(
      { 
        board: boardId, 
        position: { $gt: oldPosition, $lte: newPosition },
        _id: { $ne: listId }
      },
      { $inc: { position: -1 } }
    );
  } else {
    // Moving left
    await this.updateMany(
      { 
        board: boardId, 
        position: { $gte: newPosition, $lt: oldPosition },
        _id: { $ne: listId }
      },
      { $inc: { position: 1 } }
    );
  }

  // Update the moved list
  listToMove.position = newPosition;
  await listToMove.save();
  
  return listToMove;
};

export default mongoose.model('List', listSchema);