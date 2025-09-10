import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Board } from '../../store/slices/boardSlice';
import { AppDispatch } from '../../store';
import { deleteBoard } from '../../store/slices/boardSlice';
import { MoreHorizontal, Users, Calendar, Trash2, Edit3 } from 'lucide-react';

interface BoardCardProps {
  board: Board;
  viewMode: 'grid' | 'list';
}

export const BoardCard: React.FC<BoardCardProps> = ({ board, viewMode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await dispatch(deleteBoard(board._id)).unwrap();
    } catch (error) {
      console.error('Error deleting board:', error);
      alert('Failed to delete board');
    } finally {
      setLoading(false);
    }
  };

  const handleBoardClick = () => {
    window.location.hash = `/board/${board._id}`;
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div 
            className="flex-1 cursor-pointer"
            onClick={handleBoardClick}
          >
            <h3 className="font-semibold text-gray-900 mb-1">{board.title}</h3>
            {board.description && (
              <p className="text-gray-600 text-sm">{board.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(board.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {board.members.length + 1} member{board.members.length + 1 !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => {/* TODO: Edit board */}}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Board
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                  {loading ? 'Deleting...' : 'Delete Board'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={handleBoardClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div 
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: board.backgroundColor }}
        >
          <span className="text-white font-bold text-sm md:text-lg">
            {board.title.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            disabled={loading}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Edit board
                }}
              >
                <Edit3 className="w-4 h-4" />
                Edit Board
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4" />
                {loading ? 'Deleting...' : 'Delete Board'}
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-sm md:text-base">
        {board.title}
      </h3>
      
      {board.description && (
        <p className="text-gray-600 text-xs md:text-sm mb-4 line-clamp-2">
          {board.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {board.members.length + 1} member{board.members.length + 1 !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {new Date(board.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};