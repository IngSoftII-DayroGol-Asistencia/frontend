import { Post, CreatePostData, UpdatePostData, Comment, CreateCommentData, ReactionCreate, ReactionStats, ReactionResponse } from '../../interfaces/forum.types';

const API_URL = import.meta.env.VITE_FORUM_API_URL || 'http://localhost:8001';

class ForumService {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
            ...options.headers,
        };

        if (token) {
            (headers as Record<string, string>).Authorization = `Bearer ${token}`;
        }

        // Only set Content-Type to json if body is NOT FormData and not already set
        if (
            !(options.body instanceof FormData) &&
            !(headers as Record<string, string>)['Content-Type']
        ) {
            (headers as Record<string, string>)['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const errorMessage = (errorBody as any).detail || `Error ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage as string);
        }

        if (response.status === 204) return {} as T;
        return response.json() as Promise<T>;
    }

    async createPost(orgId: string, data: CreatePostData): Promise<Post> {
        const body = {
            title: data.title,
            content: data.content,
            user_id: data.user_id,
        };

        return this.request<Post>(`/orgs/${orgId}/forum/`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async getPosts(orgId: string): Promise<Post[]> {
        return this.request<Post[]>(`/orgs/${orgId}/forum/`);
    }

    async getPostById(orgId: string, postId: string): Promise<Post> {
        return this.request<Post>(`/orgs/${orgId}/forum/${postId}`);
    }

    async updatePost(orgId: string, postId: string, data: UpdatePostData): Promise<Post> {
        return this.request<Post>(`/orgs/${orgId}/forum/${postId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }


    async deletePost(orgId: string, postId: string): Promise<void> {
        return this.request<void>(`/orgs/${orgId}/forum/${postId}`, {
            method: 'DELETE',
        });
    }

    // Comments
    async createComment(orgId: string, postId: string, data: CreateCommentData): Promise<Comment> {
        return this.request<Comment>(`/orgs/${orgId}/forum/posts/${postId}/comments/`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getComments(orgId: string, postId: string): Promise<Comment[]> {
        return this.request<Comment[]>(`/orgs/${orgId}/forum/posts/${postId}/comments/`);
    }


    async deleteComment(orgId: string, postId: string, commentId: string): Promise<void> {
        return this.request<void>(`/orgs/${orgId}/forum/posts/${postId}/comments/${commentId}`, {
            method: 'DELETE',
        });
    }

    // Reactions
    async addReaction(orgId: string, postId: string, data: ReactionCreate): Promise<ReactionResponse> {
        return this.request<ReactionResponse>(`/orgs/${orgId}/forum/posts/${postId}/reactions/`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async removeReaction(orgId: string, postId: string, userId: string): Promise<void> {
        const params = new URLSearchParams({ user_id: userId });
        return this.request<void>(`/orgs/${orgId}/forum/posts/${postId}/reactions/?${params}`, {
            method: 'DELETE',
        });
    }

    async getReactionStats(orgId: string, postId: string, userId?: string): Promise<ReactionStats> {
        let endpoint = `/orgs/${orgId}/forum/posts/${postId}/reactions/stats`;
        if (userId) {
            endpoint += `?user_id=${userId}`;
        }
        return this.request<ReactionStats>(endpoint);
    }
}

export const forumService = new ForumService();
