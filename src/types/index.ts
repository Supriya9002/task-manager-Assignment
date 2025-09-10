export interface User {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  createdAt?: string;
  preferences?: any;
}

export interface Board {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  owner: string | User;
  createdAt?: string;
  updatedAt?: string;
  backgroundColor?: string;
  members?: BoardMember[];
  isPrivate?: boolean;
  isArchived?: boolean;
  isFavorite?: boolean;
  lists?: List[];
}

export interface List {
  _id?: string;
  id?: string;
  title: string;
  board: string;
  position: number;
  createdAt?: string;
  updatedAt?: string;
  cards?: Card[];
}

export interface Card {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  list: string;
  list_id?: string; // For compatibility
  board: string;
  position: number;
  dueDate?: string;
  due_date?: string; // For compatibility
  labels: Array<{ name: string; color: string }>;
  createdAt?: string;
  updatedAt?: string;
  assignedUsers?: string[];
  assigned_user_id?: string; // For compatibility
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: any[];
  comments?: any[];
  checklist?: any[];
}

export interface BoardMember {
  _id?: string;
  id?: string;
  board: string;
  user: string | User;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt?: string;
}

export interface Activity {
  _id?: string;
  id?: string;
  board: string;
  user: string | User;
  action: string;
  entityType: 'board' | 'list' | 'card';
  entityId: string;
  details?: Record<string, any>;
  createdAt?: string;
}

export interface Comment {
  _id?: string;
  id?: string;
  card: string;
  author: string | User;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  isEdited?: boolean;
}