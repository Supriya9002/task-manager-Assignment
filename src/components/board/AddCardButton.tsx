import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createCard } from '../../store/slices/boardSlice';
import { X, Plus } from 'lucide-react';

interface AddCardButtonProps {
  listId: string;
  boardId: string;
  position: number;
  onCardCreated: () => void;
  onCancel: () => void;
}

export const AddCardButton: React.FC<AddCardButtonProps> = ({
  listId,
  boardId,
  position,
  onCardCreated,
  onCancel,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await dispatch(createCard({
        boardId,
        cardData: {
          title: title.trim(),
          listId,
          position,
        }
      })).unwrap();
      
      setTitle('');
      onCardCreated();
    } catch (error) {
      console.error('Error creating card:', error);
      alert('Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit}>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for this card..."
          className="w-full p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          autoFocus
        />
        
        <div className="flex items-center gap-2 mt-2">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {loading ? 'Adding...' : 'Add card'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};