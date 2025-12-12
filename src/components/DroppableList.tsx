import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { ListResponse, CardResponse } from "../types/workboard.types";
import { DraggableCard } from "./DraggableCard";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Badge } from "./ui/badge";

interface DroppableListProps {
  list: ListResponse;
  cards: CardResponse[];
  columnColor: string;
  onAddCard: (listId: string) => void;
  onEditCard: (listId: string, card: CardResponse) => void;
  onDeleteCard: (listId: string, cardId: string) => void;
  getPriorityColor: (priority: string) => string;
}

export function DroppableList({
  list,
  cards,
  columnColor,
  onAddCard,
  onEditCard,
  onDeleteCard,
  getPriorityColor,
}: DroppableListProps) {
  const { setNodeRef } = useDroppable({
    id: list.id,
  });

  return (
    <div className="min-w-[280px] md:min-w-0 w-[280px] md:w-auto">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${columnColor}`} />
          <h3>{list.name}</h3>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs font-medium">
            {cards.length}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          onClick={() => onAddCard(list.id)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className="space-y-3 min-h-[400px] rounded-lg p-2 bg-gray-100/50 dark:bg-gray-800/30 border-2 border-dashed border-gray-300 dark:border-gray-700"
      >
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <DraggableCard
              key={card.id}
              card={card}
              listId={list.id}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              getPriorityColor={getPriorityColor}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
