import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { List } from '../../store/slices/boardSlice';
import { CardItem } from './CardItem';
import { AddCardButton } from './AddCardButton';
import { MoreHorizontal, Plus } from 'lucide-react';

interface ListColumnProps {
  list: List;
  boardId: string;
}

export const ListColumn: React.FC<ListColumnProps> = ({ list, boardId }) => {
  const [showAddCard, setShowAddCard] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list._id,
    data: {
      type: 'list',
      list,
    },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `list-${list._id}`,
    data: {
      type: 'list',
      list,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sortedCards = [...list.cards].sort((a, b) => a.position - b.position);

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDroppableRef(node);
      }}
      style={style}
      className={`bg-gray-100 rounded-lg p-3 md:p-4 w-72 md:w-80 flex-shrink-0 ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{list.title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{sortedCards.length}</span>
          <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <SortableContext
        items={sortedCards.map(card => card._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 md:space-y-3 mb-4 min-h-[100px]">
          {sortedCards.map(card => (
            <CardItem key={card._id} card={card} boardId={boardId} />
          ))}
        </div>
      </SortableContext>
      
      {showAddCard ? (
        <AddCardButton
          listId={list._id}
          boardId={boardId}
          position={sortedCards.length}
          onCardCreated={() => setShowAddCard(false)}
          onCancel={() => setShowAddCard(false)}
        />
      ) : (
        <button
          onClick={() => setShowAddCard(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add a card
        </button>
      )}
    </div>
  );
};