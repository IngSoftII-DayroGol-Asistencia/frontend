import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { CardResponse, CardPriority } from "../types/workboard.types";

interface DraggableCardProps {
  card: CardResponse;
  listId: string;
  onEdit: (listId: string, card: CardResponse) => void;
  onDelete: (listId: string, cardId: string) => void;
  getPriorityColor: (priority: string) => string;
}

export function DraggableCard({
  card,
  listId,
  onEdit,
  onDelete,
  getPriorityColor,
}: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
    >
      <Card
        className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-gray-700/50 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <h4 className="text-sm">{card.title}</h4>
            <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 -mt-1 -mr-2"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onEdit(listId, card);
                }}
              >
                <Pencil className="w-4 h-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDelete(listId, card.id);
                }}
              >
                  <Trash className="w-4 h-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{card.description}</p>

          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={`text-xs ${getPriorityColor(card.priority)}`}
            >
              {card.priority}
            </Badge>

            {card.assigned_to && (
              <div className="flex -space-x-2">
                <Avatar className="w-6 h-6 border-2 border-white dark:border-gray-900">
                  <AvatarImage src={`https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop`} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
