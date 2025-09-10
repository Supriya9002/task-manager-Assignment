import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../../store/slices/boardSlice';
import { Calendar, MessageCircle, Paperclip, User } from 'lucide-react';

interface CardItemProps {
  card: Card;
  boardId: string;
}

export const CardItem: React.FC<CardItemProps> = ({ card, boardId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card._id,
    data: {
      type: 'card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
  const isDueSoon = card.dueDate && 
    new Date(card.dueDate) > new Date() && 
    new Date(card.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg p-2 md:p-3 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <h4 className="font-medium text-gray-900 mb-1 md:mb-2 group-hover:text-blue-600 transition-colors text-sm md:text-base">
        {card.title}
      </h4>
      
      {card.description && (
        <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 line-clamp-2">
          {card.description}
        </p>
      )}
      
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 md:mb-3">
          {card.labels.map((label, index) => (
            <span
              key={index}
              className="px-1 md:px-2 py-0.5 md:py-1 text-xs font-medium text-white rounded-full"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
        <div className="flex items-center gap-2 md:gap-3">
          {card.dueDate && (
            <div className={`flex items-center gap-1 ${
              isOverdue 
                ? 'text-red-600' 
                : isDueSoon 
                  ? 'text-amber-600' 
                  : 'text-gray-500'
            }`}>
              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-xs">
                {new Date(card.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-xs">{card.comments.length}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Paperclip className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-xs">{card.attachments.length}</span>
          </div>
        </div>
        
        {card.assignedUsers.length > 0 && (
          <div className="flex -space-x-1">
            {card.assignedUsers.slice(0, 3).map((user, index) => (
              <div
                key={user._id}
                className="w-5 h-5 md:w-6 md:h-6 bg-gray-300 rounded-full flex items-center justify-center border-2 border-white"
                title={user.name}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-2 h-2 md:w-3 md:h-3 text-gray-600" />
                )}
              </div>
            ))}
            {card.assignedUsers.length > 3 && (
              <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-xs text-white">+{card.assignedUsers.length - 3}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};