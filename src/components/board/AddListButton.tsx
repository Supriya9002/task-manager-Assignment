import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createList } from '../../store/slices/boardSlice';
import { Plus, X } from 'lucide-react';

interface AddListButtonProps {
  boardId: string;
  position: number;
}

export const AddListButton: React.FC<AddListButtonProps> = ({
  boardId,
  position,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await dispatch(createList({
        boardId,
        listData: {
          title: title.trim(),
          position,
        }
      })).unwrap();
      
      setTitle('');
      setShowForm(false);
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="bg-gray-100 rounded-lg p-3 md:p-4 w-72 md:w-80 flex-shrink-0">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter list title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          
          <div className="flex items-center gap-2 mt-3">
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              {loading ? 'Adding...' : 'Add list'}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="bg-gray-200 hover:bg-gray-300 rounded-lg p-3 md:p-4 w-72 md:w-80 flex-shrink-0 flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
    >
      <Plus className="w-5 h-5" />
      Add another list
    </button>
  );
};