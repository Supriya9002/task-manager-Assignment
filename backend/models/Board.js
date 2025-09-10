import mongoose from 'mongoose';

const boardMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'editor'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Board title is required'],
    trim: true,
    maxlength: [100, 'Board title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Board description cannot be more than 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [boardMemberSchema],
  backgroundColor: {
    type: String,
    default: '#3B82F6',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
  },
  backgroundImage: {
    type: String,
    default: null
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  settings: {
    allowComments: { type: Boolean, default: true },
    allowVoting: { type: Boolean, default: false },
    cardCover: { type: Boolean, default: true },
    selfJoin: { type: Boolean, default: false }
  },
  labels: [{
    name: { type: String, required: true },
    color: { type: String, required: true }
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
boardSchema.index({ owner: 1, createdAt: -1 });
boardSchema.index({ 'members.user': 1 });
boardSchema.index({ title: 'text', description: 'text' });
boardSchema.index({ lastActivity: -1 });

// Virtual for lists
boardSchema.virtual('lists', {
  ref: 'List',
  localField: '_id',
  foreignField: 'board',
  options: { sort: { position: 1 } }
});

// Virtual for total cards count
boardSchema.virtual('totalCards', {
  ref: 'Card',
  localField: '_id',
  foreignField: 'board',
  count: true
});

// Check if user is member of board
boardSchema.methods.isMember = function(userId) {
  return this.owner.toString() === userId.toString() || 
         this.members.some(member => member.user.toString() === userId.toString());
};

// Get user role in board
boardSchema.methods.getUserRole = function(userId) {
  if (this.owner.toString() === userId.toString()) {
    return 'admin';
  }
  
  const member = this.members.find(member => member.user.toString() === userId.toString());
  return member ? member.role : null;
};

// Add member to board
boardSchema.methods.addMember = function(userId, role = 'editor') {
  if (!this.isMember(userId)) {
    this.members.push({ user: userId, role });
  }
  return this.save();
};

// Remove member from board
boardSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => member.user.toString() !== userId.toString());
  return this.save();
};

// Update last activity
boardSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save({ validateBeforeSave: false });
};

export default mongoose.model('Board', boardSchema);