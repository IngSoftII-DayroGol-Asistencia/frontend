import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { forumService } from "../api/services/forum.service";
import { UserEnterpriseResponse } from "../interfaces/auth/userEnterprise.interface";

interface CreatePostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPostCreated: () => void;
}

export function CreatePostModal({ open, onOpenChange, onPostCreated }: CreatePostModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        try {
            setLoading(true);
            const userRelation: UserEnterpriseResponse | null = JSON.parse(localStorage.getItem('userRelationEnterprise') ?? 'null') as UserEnterpriseResponse;
            const currentUser = JSON.parse(localStorage.getItem('currentUser') ?? 'null');

            // Fallback safely if no enterprise or user
            const orgId = userRelation?.enterprises?.[0]?.enterpriseId;
            const userId = currentUser?.userId; // Or wherever user ID is stored. currentUser usually has id.

            if (!orgId || !userId) {
                console.error("Missing orgId or userId");
                return;
            }

            console.log("Creating post with orgId:", orgId, "userId:", userId);

            await forumService.createPost(orgId, {
                title,
                content,
                user_id: userId,
            });

            setTitle("");
            setContent("");
            onPostCreated();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to create post:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px] backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/20 dark:border-gray-700/50">
                <DialogHeader>
                    <DialogTitle>Create Post</DialogTitle>
                    <DialogDescription>
                        Share your thoughts with your team.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="What's this about?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            placeholder="Write your post content..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[100px]"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Posting..." : "Post"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
