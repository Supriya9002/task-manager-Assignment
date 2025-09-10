import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isEdited: { type: Boolean, default: false }
});

const checklistItemSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  position: { type: Number, required: true },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: Date
});

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Card title is required'],
    trim: true,
    maxlength: [200, 'Card title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Card description cannot be more than 2000 characters']
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true
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
  assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  labels: [{
    name: { type: String, required: true },
    color: { type: String, required: true }
  }],
  dueDate: {
    type: Date,
    default: null
  },
  dueDateCompleted: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  attachments: [attachmentSchema],
  comments: [commentSchema],
  checklist: [checklistItemSchema],
  cover: {
    type: String,
    default: null
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: null
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: null
  },
  actualHours: {
    type: Number,
    min: 0,
    default: null
  },
  customFields: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'checkbox', 'dropdown']
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
cardSchema.index({ list: 1, position: 1 });
cardSchema.index({ board: 1, isArchived: 1 });
cardSchema.index({ assignedUsers: 1 });
cardSchema.index({ dueDate: 1 });
cardSchema.index({ title: 'text', description: 'text' });
cardSchema.index({ createdAt: -1 });

// Virtual for overdue status
cardSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && !this.dueDateCompleted;
});

// Virtual for due soon status (within 24 hours)
cardSchema.virtual('isDueSoon').get(function() {
  if (!this.dueDate || this.dueDateCompleted) return false;
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return this.dueDate > now && this.dueDate <= tomorrow;
});

// Virtual for checklist completion percentage
cardSchema.virtual('checklistProgress').get(function() {
  if (!this.checklist || this.checklist.length === 0) return 0;
  const completed = this.checklist.filter(item => item.completed).length;
  return Math.round((completed / this.checklist.length) * 100);
});

// Method to add comment
cardSchema.methods.addComment = function(content, authorId) {
  this.comments.push({
    content,
    author: authorId
  });
  return this.save();
};

// Method to move card to different list
cardSchema.methods.moveToList = async function(newListId, newPosition) {
  const oldListId = this.list;
  const oldPosition = this.position;

  // Update positions in old list
  await mongoose.model('Card').updateMany(
    { list: oldListId, position: { $gt: oldPosition } },
    { $inc: { position: -1 } }
  );

  // Update positions in new list
  await mongoose.model('Card').updateMany(
    { list: newListId, position: { $gte: newPosition } },
    { $inc: { position: 1 } }
  );

  // Update this card
  this.list = newListId;
  this.position = newPosition;
  
  return this.save();
};

// Static method to reorder cards within a list
cardSchema.statics.reorderCards = async function(listId, cardId, newPosition) {
  const cards = await this.find({ list: listId, isArchived: false }).sort({ position: 1 });
  const cardToMove = cards.find(card => card._id.toString() === cardId.toString());
  
  if (!cardToMove) {
    throw new Error('Card not found');
  }

  const oldPosition = cardToMove.position;
  
  // Update positions
  if (newPosition > oldPosition) {
    // Moving down
    await this.updateMany(
      { 
        list: listId, 
        position: { $gt: oldPosition, $lte: newPosition },
        _id: { $ne: cardId }
      },
      { $inc: { position: -1 } }
    );
  } else {
    // Moving up
    await this.updateMany(
      { 
        list: listId, 
        position: { $gte: newPosition, $lt: oldPosition },
        _id: { $ne: cardId }
      },
      { $inc: { position: 1 } }
    );
  }

  // Update the moved card
  cardToMove.position = newPosition;
  await cardToMove.save();
  
  return cardToMove;
};

export default mongoose.model('Card', cardSchema);