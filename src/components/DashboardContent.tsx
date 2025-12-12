import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import workboardService from "../services/workboardService";
import {
	BoardWithLists,
	ListResponse,
	CardResponse,
	CardPriority,
	CardCreate,
} from "../types/workboard.types";
import { CreateCardModal } from "./CreateCardModal";
import { CreateListModal } from "./CreateListModal";
import { DroppableList } from "./DroppableList";
import {
	DndContext,
	closestCorners,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export function DashboardContent() {
	// Workboard state
	const [board, setBoard] = useState<BoardWithLists | null>(null);
	const [lists, setLists] = useState<ListResponse[]>([]);
	const [cardsByList, setCardsByList] = useState<Record<string, CardResponse[]>>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isCardModalOpen, setIsCardModalOpen] = useState(false);
	const [isListModalOpen, setIsListModalOpen] = useState(false);
	const [selectedListId, setSelectedListId] = useState<string | null>(null);
	const [editingCard, setEditingCard] = useState<CardResponse | null>(null);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

	const DEFAULT_USER_ID = "user123";

	const sensors = useSensors(
		useSensor(PointerSensor, {
			// Keep drag responsive while preventing menu clicks from triggering drag
			activationConstraint: {
				delay: 80,
				tolerance: 4,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Initialize board and fetch data
	useEffect(() => {
		initializeBoard();
	}, []);

	const initializeBoard = async () => {
		try {
			setLoading(true);
			setError(null);

			const boards = await workboardService.getBoardsByOwner(DEFAULT_USER_ID);
			let currentBoard: BoardWithLists;

			if (boards.length === 0) {
				const newBoard = await workboardService.createBoard({
					name: "Project Dashboard",
					description: "Manage your tasks and projects",
					color: "#3b82f6",
					owner_id: DEFAULT_USER_ID,
				});

				await createDefaultLists(newBoard.id);
				currentBoard = await workboardService.getBoardWithLists(newBoard.id);
			} else {
				currentBoard = await workboardService.getBoardWithLists(boards[0].id);
			}

			setBoard(currentBoard);
			setLists(currentBoard.lists || []);
			await fetchCardsForLists(currentBoard.lists || []);
		} catch (err) {
			console.error("Failed to initialize board:", err);
			setError(err instanceof Error ? err.message : "Failed to load board");
		} finally {
			setLoading(false);
		}
	};

	const createDefaultLists = async (boardId: string) => {
		const defaultLists = [
			{ name: "To Do", position: 0 },
			{ name: "In Progress", position: 1 },
			{ name: "Review", position: 2 },
			{ name: "Done", position: 3 },
		];

		for (const list of defaultLists) {
			await workboardService.createList({ ...list, board_id: boardId }, DEFAULT_USER_ID);
		}
	};

	const fetchCardsForLists = async (listsToFetch: ListResponse[]) => {
		const cardsMap: Record<string, CardResponse[]> = {};

		for (const list of listsToFetch) {
			try {
				const cards = await workboardService.getCardsByList(list.id);
				cardsMap[list.id] = cards;
			} catch (err) {
				console.error(`Failed to fetch cards for list ${list.id}:`, err);
				cardsMap[list.id] = [];
			}
		}

		setCardsByList(cardsMap);
	};

	const openCardModal = (listId: string) => {
		setSelectedListId(listId);
		setModalMode("create");
		setEditingCard(null);
		setIsCardModalOpen(true);
	};

	const openEditCardModal = (listId: string, card: CardResponse) => {
		setSelectedListId(listId);
		setEditingCard(card);
		setModalMode("edit");
		setIsCardModalOpen(true);
	};

	const handleSubmitCard = async (data: {
		title: string;
		description: string;
		priority: CardPriority;
	}) => {
		if (!board || !selectedListId) return;

		try {
			if (modalMode === "create") {
				const newCard: CardCreate = {
					title: data.title,
					description: data.description,
					priority: data.priority,
					status: "todo" as any,
					position: cardsByList[selectedListId]?.length || 0,
					list_id: selectedListId,
				};

				const createdCard = await workboardService.createCard(newCard, DEFAULT_USER_ID);

				setCardsByList(prev => ({
					...prev,
					[selectedListId]: [...(prev[selectedListId] || []), createdCard],
				}));
			} else if (editingCard) {
				const updated = await workboardService.updateCard(
					editingCard.id,
					{
						title: data.title,
						description: data.description,
						priority: data.priority,
					},
					DEFAULT_USER_ID,
				);

				setCardsByList(prev => ({
					...prev,
					[selectedListId]: (prev[selectedListId] || []).map(card =>
						card.id === updated.id ? { ...card, ...updated } : card
					),
				}));
			}
		} catch (err) {
			console.error("Failed to submit card:", err);
		}
	};

	const handleDeleteCard = async (listId: string, cardId: string) => {
		try {
			await workboardService.deleteCard(cardId);
			setCardsByList(prev => ({
				...prev,
				[listId]: (prev[listId] || []).filter(card => card.id !== cardId),
			}));
		} catch (err) {
			console.error("Failed to delete card:", err);
		}
	};

	const handleCreateList = async (name: string) => {
		if (!board) return;

		try {
			const newList = await workboardService.createList(
				{
					name,
					position: lists.length,
					board_id: board.id,
				},
				DEFAULT_USER_ID
			);

			setLists(prev => [...prev, newList]);
			setCardsByList(prev => ({ ...prev, [newList.id]: [] }));
		} catch (err) {
			console.error("Failed to create list:", err);
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
			case "urgent":
				return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
			case "medium":
				return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
			case "low":
				return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
			default:
				return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
		}
	};

	const getColumnColor = (index: number) => {
		const colors = ["bg-gray-500", "bg-blue-500", "bg-yellow-500", "bg-green-500"];
		return colors[index % colors.length];
	};

	const handleDragStart = (event: DragStartEvent) => {
		setDraggedCardId(event.active.id as string);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setDraggedCardId(null);

		if (!over) return;

		let sourceListId: string | null = null;
		let destListId: string | null = null;

		for (const [listId, cards] of Object.entries(cardsByList)) {
			if (cards.find(c => c.id === active.id)) {
				sourceListId = listId;
				break;
			}
		}

		if (cardsByList[over.id as string]) {
			destListId = over.id as string;
		} else {
			for (const [listId, cards] of Object.entries(cardsByList)) {
				if (cards.find(c => c.id === over.id)) {
					destListId = listId;
					break;
				}
			}
		}

		if (!sourceListId || !destListId) return;

		setCardsByList(prev => {
			const newCardsByList = { ...prev };
			const sourceCards = [...(newCardsByList[sourceListId] || [])];
			const destCards = sourceListId === destListId ? sourceCards : [...(newCardsByList[destListId] || [])];

			const activeIndex = sourceCards.findIndex(c => c.id === active.id);
			const overIndex = destCards.findIndex(c => c.id === over.id);

			if (activeIndex === -1) return prev;

			let newSourceCards = sourceCards;
			let newDestCards = destCards;

			if (sourceListId === destListId) {
				newSourceCards = arrayMove(sourceCards, activeIndex, overIndex === -1 ? sourceCards.length - 1 : overIndex);
				newDestCards = newSourceCards;
			} else {
				const [movedCard] = sourceCards.splice(activeIndex, 1);
				newSourceCards = sourceCards;
				newDestCards = overIndex === -1
					? [...destCards, movedCard]
					: [...destCards.slice(0, overIndex), movedCard, ...destCards.slice(overIndex)];
			}

			return {
				...newCardsByList,
				[sourceListId]: newSourceCards,
				...(sourceListId !== destListId && { [destListId]: newDestCards }),
			};
		});

		const card = cardsByList[sourceListId]?.find(c => c.id === active.id);
		if (card) {
			workboardService
				.updateCard(
					card.id,
					{
						list_id: destListId,
						position: cardsByList[destListId]?.length || 0,
					},
					DEFAULT_USER_ID
				)
				.catch(err => console.error("Failed to update card position:", err));
		}
	};

	return (
		<div className="p-4 md:p-6 space-y-4 md:space-y-6">
			{loading && (
				<div className="flex items-center justify-center h-64">
					<p className="text-muted-foreground">Loading dashboard...</p>
				</div>
			)}

			{error && (
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<p className="text-red-600 dark:text-red-400 mb-2">Error loading dashboard</p>
						<p className="text-sm text-muted-foreground">{error}</p>
						<Button onClick={initializeBoard} className="mt-4">Retry</Button>
					</div>
				</div>
			)}

			{!loading && !error && !board && (
				<div className="flex items-center justify-center h-64">
					<p className="text-muted-foreground">No board data available.</p>
				</div>
			)}

			{!loading && !error && board && (
				<>
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
						<div>
							<h2>{board.name}</h2>
							<p className="text-muted-foreground text-sm md:text-base">
								{board.description || "Manage your tasks and projects"}
							</p>
						</div>
						<Button
							className="gap-2 w-full md:w-auto"
							onClick={() => lists.length > 0 && openCardModal(lists[0].id)}
						>
							<Plus className="w-4 h-4" />
							New Task
						</Button>
					</div>

					<DndContext
						sensors={sensors}
						collisionDetection={closestCorners}
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
					>
						<SortableContext items={lists.map(l => l.id)} strategy={verticalListSortingStrategy}>
							<div className="flex gap-4 overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-4">
								{lists.map((list, index) => (
									<DroppableList
										key={list.id}
										list={list}
										cards={cardsByList[list.id] || []}
										columnColor={getColumnColor(index)}
										onAddCard={openCardModal}
										onEditCard={openEditCardModal}
										onDeleteCard={handleDeleteCard}
										getPriorityColor={getPriorityColor}
									/>
								))}
							</div>
						</SortableContext>
						<DragOverlay>
							{draggedCardId && (() => {
								for (const cards of Object.values(cardsByList)) {
									const draggedCard = cards.find(c => c.id === draggedCardId);
									if (draggedCard) {
										return (
											<Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-gray-700/50 shadow-2xl w-[280px] opacity-100">
												<CardHeader className="pb-3">
													<h4 className="text-sm font-semibold">{draggedCard.title}</h4>
												</CardHeader>
												<CardContent className="space-y-3">
													<p className="text-sm text-muted-foreground">{draggedCard.description}</p>
													<div className="flex items-center justify-between">
														<Badge
															variant="outline"
															className={`text-xs ${getPriorityColor(draggedCard.priority)}`}
														>
															{draggedCard.priority}
														</Badge>
													</div>
												</CardContent>
											</Card>
										);
									}
								}
								return null;
							})()}
						</DragOverlay>
					</DndContext>

					<CreateCardModal
						isOpen={isCardModalOpen}
						onClose={() => {
							setIsCardModalOpen(false);
							setSelectedListId(null);
							setEditingCard(null);
						}}
						onSubmit={handleSubmitCard}
						listName={lists.find(l => l.id === selectedListId)?.name}
						mode={modalMode}
						initialData={editingCard ? {
							title: editingCard.title,
							description: editingCard.description,
							priority: editingCard.priority,
						} : undefined}
					/>

					<CreateListModal
						isOpen={isListModalOpen}
						onClose={() => setIsListModalOpen(false)}
						onSubmit={handleCreateList}
					/>
				</>
			)}
		</div>
	);
}

