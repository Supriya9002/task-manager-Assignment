import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { RootState, AppDispatch } from '../../store';
import { fetchBoard, fetchLists, reorderLists, moveCard, reorderCards } from '../../store/slices/boardSlice';
import { ListColumn } from './ListColumn';
import { AddListButton } from './AddListButton';
import { BoardHeader } from './BoardHeader';
import { CardItem } from './CardItem';
import { ArrowLeft } from 'lucide-react';

interface BoardViewProps {
  boardId: string;
  onBack: () => void;
}

export const BoardView: React.FC<BoardViewProps> = ({ boardId, onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentBoard, currentBoardLists, loading } = useSelector((state: RootState) => state.board);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoard(boardId));
    }
  }, [dispatch, boardId]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle list reordering
    if (active.data.current?.type === 'list') {
      const activeList = currentBoardLists.find(list => list._id === activeId);
      const overList = currentBoardLists.find(list => list._id === overId);
      
      if (activeList && overList && activeList._id !== overList._id) {
        const newPosition = overList.position;
        dispatch(reorderLists({ boardId, listId: activeId, newPosition }));
      }
      return;
    }

    // Handle card reordering within the same list
    if (active.data.current?.type === 'card' && over.data.current?.type === 'card') {
      const activeCard = currentBoardLists
        .flatMap(list => list.cards)
        .find(card => card._id === activeId);
      const overCard = currentBoardLists
        .flatMap(list => list.cards)
        .find(card => card._id === overId);

      if (activeCard && overCard && activeCard.list === overCard.list) {
        const newPosition = overCard.position;
        dispatch(reorderCards({ boardId, listId: activeCard.list, cardId: activeId, newPosition }));
      }
      return;
    }

    // Handle card moving between lists
    if (active.data.current?.type === 'card' && over.data.current?.type === 'list') {
      const activeCard = currentBoardLists
        .flatMap(list => list.cards)
        .find(card => card._id === activeId);
      
      if (activeCard && activeCard.list !== overId) {
        const targetList = currentBoardLists.find(list => list._id === overId);
        if (targetList) {
          const newPosition = targetList.cards.length;
          dispatch(moveCard({ boardId, cardId: activeId, listId: overId, position: newPosition }));
        }
      }
      return;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle card moving between lists during drag over
    if (active.data.current?.type === 'card' && over.data.current?.type === 'list') {
      const activeCard = currentBoardLists
        .flatMap(list => list.cards)
        .find(card => card._id === activeId);
      
      if (activeCard && activeCard.list !== overId) {
        // This will be handled in handleDragEnd
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Board not found</h2>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const activeCard = currentBoardLists
    .flatMap(list => list.cards)
    .find(card => card._id === activeId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BoardHeader board={currentBoard} onBack={onBack} />
      
      <div className="p-4 md:p-6">
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 min-h-[calc(100vh-200px)]">
            <SortableContext
              items={currentBoardLists.map(list => list._id)}
              strategy={horizontalListSortingStrategy}
            >
              {currentBoardLists.map(list => (
                <ListColumn
                  key={list._id}
                  list={list}
                  boardId={boardId}
                />
              ))}
            </SortableContext>
            
            <AddListButton
              boardId={boardId}
              position={currentBoardLists.length}
            />
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200 max-w-xs">
                <h3 className="font-medium text-gray-900 text-sm">{activeCard.title}</h3>
                {activeCard.description && (
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2">{activeCard.description}</p>
                )}
                {activeCard.labels.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {activeCard.labels.map((label, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-full text-white"
                        style={{ backgroundColor: label.color }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};