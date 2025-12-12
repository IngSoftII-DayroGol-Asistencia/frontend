
export interface Attachment {
    id: string;
    file_name: string;
    url: string;
    content_type: string;
    size_bytes: number;
}

export interface Post {
    id: string;
    organization_id: string;
    user_id: string;
    title: string;
    content: string;
    created_at: string;
    attachments: Attachment[];
}

export interface CreatePostData {
    title: string;
    content: string;
    user_id: string;
}


export interface UpdatePostData {
    title?: string;
    content?: string;
}

export interface CreateCommentData {
    user_name: string;
    content: string;
}

export interface Comment {
    id: string;
    post_id: string;
    content: string;
    created_at: string;
}

export interface ReactionCreate {
    user_id: string;
    reaction_type: 'like' | 'dislike';
}

export interface ReactionStats {
    likes_count: number;
    dislikes_count: number;
    user_reaction: 'like' | 'dislike' | null;
}

export interface ReactionResponse extends ReactionStats {
    message: string;
}
