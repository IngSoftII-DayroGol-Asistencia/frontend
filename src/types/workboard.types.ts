// TypeScript types matching the backend API models

export enum CardPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}

export enum CardStatus {
    TODO = "todo",
    IN_PROGRESS = "in_progress",
    DONE = "done"
}

export enum ActivityType {
    BOARD_CREATED = "board_created",
    BOARD_UPDATED = "board_updated",
    BOARD_ARCHIVED = "board_archived",
    LIST_CREATED = "list_created",
    LIST_UPDATED = "list_updated",
    LIST_MOVED = "list_moved",
    LIST_ARCHIVED = "list_archived",
    CARD_CREATED = "card_created",
    CARD_UPDATED = "card_updated",
    CARD_MOVED = "card_moved",
    CARD_ASSIGNED = "card_assigned",
    COMMENT_ADDED = "comment_added"
}

// Board Types
export interface BoardBase {
    name: string;
    description?: string;
    color?: string;
}

export interface BoardCreate extends BoardBase {
    owner_id: string;
}

export interface BoardUpdate {
    name?: string;
    description?: string;
    color?: string;
    is_archived?: boolean;
}

export interface BoardResponse extends BoardBase {
    id: string;
    owner_id: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export interface BoardWithLists extends BoardResponse {
    lists: ListResponse[];
}

// List Types
export interface ListBase {
    name: string;
    position: number;
}

export interface ListCreate extends ListBase {
    board_id: string;
}

export interface ListUpdate {
    name?: string;
    position?: number;
    is_archived?: boolean;
}

export interface ListResponse extends ListBase {
    id: string;
    board_id: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export interface ListWithCards extends ListResponse {
    cards: CardResponse[];
}

// Card Types
export interface CardBase {
    title: string;
    description?: string;
    priority: CardPriority;
    status: CardStatus;
    position: number;
    due_date?: string;
}

export interface CardCreate extends CardBase {
    list_id: string;
    assigned_to?: string;
}

export interface CardUpdate {
    title?: string;
    description?: string;
    priority?: CardPriority;
    status?: CardStatus;
    position?: number;
    due_date?: string;
    assigned_to?: string;
    list_id?: string;
}

export interface CardResponse extends CardBase {
    id: string;
    list_id: string;
    assigned_to?: string;
    created_at: string;
    updated_at: string;
}

// Comment Types
export interface CommentBase {
    content: string;
}

export interface CommentCreate extends CommentBase {
    card_id: string;
    user_id: string;
}

export interface CommentResponse extends CommentBase {
    id: string;
    card_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

// Activity Log Types
export interface ActivityLogResponse {
    id: string;
    board_id: string;
    user_id: string;
    activity_type: ActivityType;
    description: string;
    created_at: string;
}

// Pagination
export interface PaginationParams {
    limit?: number;
    offset?: number;
}
