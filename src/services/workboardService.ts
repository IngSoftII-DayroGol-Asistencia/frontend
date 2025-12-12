import {
    BoardCreate,
    BoardUpdate,
    BoardResponse,
    BoardWithLists,
    ListCreate,
    ListUpdate,
    ListResponse,
    ListWithCards,
    CardCreate,
    CardUpdate,
    CardResponse,
    CommentCreate,
    CommentResponse,
    ActivityLogResponse,
    PaginationParams
} from '../types/workboard.types';

const API_BASE_URL = import.meta.env.VITE_WORKBOARD_API_URL || 'http://localhost:8000';

class WorkboardService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            // Handle 204 No Content responses
            if (response.status === 204) {
                return null as T;
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // ============================================
    // Board Endpoints
    // ============================================

    async createBoard(board: BoardCreate): Promise<BoardResponse> {
        return this.request<BoardResponse>('/boards', {
            method: 'POST',
            body: JSON.stringify(board),
        });
    }

    async getBoard(boardId: string): Promise<BoardResponse> {
        return this.request<BoardResponse>(`/boards/${boardId}`);
    }

    async getBoardWithLists(boardId: string): Promise<BoardWithLists> {
        return this.request<BoardWithLists>(`/boards/${boardId}/full`);
    }

    async getBoardsByOwner(
        ownerId: string,
        includeArchived: boolean = false
    ): Promise<BoardResponse[]> {
        const params = new URLSearchParams({
            owner_id: ownerId,
            include_archived: includeArchived.toString(),
        });
        return this.request<BoardResponse[]>(`/boards?${params}`);
    }

    async updateBoard(
        boardId: string,
        boardUpdate: BoardUpdate,
        userId: string
    ): Promise<BoardResponse> {
        const params = new URLSearchParams({ user_id: userId });
        return this.request<BoardResponse>(`/boards/${boardId}?${params}`, {
            method: 'PATCH',
            body: JSON.stringify(boardUpdate),
        });
    }

    async deleteBoard(boardId: string): Promise<void> {
        return this.request<void>(`/boards/${boardId}`, {
            method: 'DELETE',
        });
    }

    // ============================================
    // List Endpoints
    // ============================================

    async createList(listData: ListCreate, userId: string): Promise<ListResponse> {
        const params = new URLSearchParams({ user_id: userId });
        return this.request<ListResponse>(`/lists?${params}`, {
            method: 'POST',
            body: JSON.stringify(listData),
        });
    }

    async getList(listId: string): Promise<ListResponse> {
        return this.request<ListResponse>(`/lists/${listId}`);
    }

    async getListWithCards(listId: string): Promise<ListWithCards> {
        return this.request<ListWithCards>(`/lists/${listId}/full`);
    }

    async getListsByBoard(
        boardId: string,
        includeArchived: boolean = false
    ): Promise<ListResponse[]> {
        const params = new URLSearchParams({
            include_archived: includeArchived.toString(),
        });
        return this.request<ListResponse[]>(`/boards/${boardId}/lists?${params}`);
    }

    async updateList(
        listId: string,
        listUpdate: ListUpdate,
        userId: string
    ): Promise<ListResponse> {
        const params = new URLSearchParams({ user_id: userId });
        return this.request<ListResponse>(`/lists/${listId}?${params}`, {
            method: 'PATCH',
            body: JSON.stringify(listUpdate),
        });
    }

    async deleteList(listId: string): Promise<void> {
        return this.request<void>(`/lists/${listId}`, {
            method: 'DELETE',
        });
    }

    // ============================================
    // Card Endpoints
    // ============================================

    async createCard(cardData: CardCreate, userId: string): Promise<CardResponse> {
        const params = new URLSearchParams({ user_id: userId });
        return this.request<CardResponse>(`/cards?${params}`, {
            method: 'POST',
            body: JSON.stringify(cardData),
        });
    }

    async getCard(cardId: string): Promise<CardResponse> {
        return this.request<CardResponse>(`/cards/${cardId}`);
    }

    async getCardsByList(listId: string): Promise<CardResponse[]> {
        return this.request<CardResponse[]>(`/lists/${listId}/cards`);
    }

    async getCardsByUser(userId: string): Promise<CardResponse[]> {
        const params = new URLSearchParams({ user_id: userId });
        return this.request<CardResponse[]>(`/cards?${params}`);
    }

    async updateCard(
        cardId: string,
        cardUpdate: CardUpdate,
        userId: string
    ): Promise<CardResponse> {
        const params = new URLSearchParams({ user_id: userId });
        return this.request<CardResponse>(`/cards/${cardId}?${params}`, {
            method: 'PATCH',
            body: JSON.stringify(cardUpdate),
        });
    }

    async deleteCard(cardId: string): Promise<void> {
        return this.request<void>(`/cards/${cardId}`, {
            method: 'DELETE',
        });
    }

    // ============================================
    // Comment Endpoints
    // ============================================

    async createComment(commentData: CommentCreate): Promise<CommentResponse> {
        return this.request<CommentResponse>('/comments', {
            method: 'POST',
            body: JSON.stringify(commentData),
        });
    }

    async getCommentsByCard(cardId: string): Promise<CommentResponse[]> {
        return this.request<CommentResponse[]>(`/cards/${cardId}/comments`);
    }

    async deleteComment(commentId: string): Promise<void> {
        return this.request<void>(`/comments/${commentId}`, {
            method: 'DELETE',
        });
    }

    // ============================================
    // Activity Log Endpoints
    // ============================================

    async getBoardActivities(
        boardId: string,
        params: PaginationParams = {}
    ): Promise<ActivityLogResponse[]> {
        const queryParams = new URLSearchParams({
            limit: (params.limit || 50).toString(),
            offset: (params.offset || 0).toString(),
        });
        return this.request<ActivityLogResponse[]>(
            `/boards/${boardId}/activities?${queryParams}`
        );
    }

    // ============================================
    // Health Check
    // ============================================

    async healthCheck(): Promise<{ status: string; database: string }> {
        return this.request<{ status: string; database: string }>('/health');
    }
}

// Export singleton instance
export const workboardService = new WorkboardService();
export default workboardService;
