import React, { useState } from 'react';
import { Board } from '../../types';
import { ArrowLeft, Star, Users, MoreHorizontal, Share2 } from 'lucide-react';

interface BoardHeaderProps {
  board: Board;
  onBack: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({ board, onBack }) => {
  const [isStarred, setIsStarred] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{board.title}</h1>
            {board.description && (
              <p className="text-sm text-gray-600 mt-1">{board.description}</p>
            )}
          </div>
          
          <button
            onClick={() => setIsStarred(!isStarred)}
            className={`p-2 rounded-lg transition-colors ${
              isStarred 
                ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                : 'text-gray-400 hover:bg-gray-100 hover:text-yellow-500'
            }`}
          >
            <Star className={`w-5 h-5 ${isStarred ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-sm font-medium">AS</span>
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Users className="w-4 h-4" />
            Members
          </button>
          
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};