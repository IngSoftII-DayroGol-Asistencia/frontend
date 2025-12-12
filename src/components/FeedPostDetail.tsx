import { useEffect, useState } from "react";
import { MessageSquare, MoreHorizontal, ThumbsUp, ThumbsDown, TrendingUp, Send, EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Post } from "./FeedContent"; // Import shared Post type
import { forumService } from "../api/services/forum.service";
import { authService } from "../api/services/auth.service";
import { Comment as ApiComment, ReactionStats } from "../interfaces/forum.types";
import { UserEnterpriseResponse } from "../interfaces/auth/userEnterprise.interface";

interface FeedPostDetailProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHide?: (postId: string) => void;
}

interface CommentWithUser extends ApiComment {
  user_name: string;
  authorName?: string;
  authorAvatar?: string;
}

const DEFAULT_AVATARS = [
  "https://i.pinimg.com/736x/74/2e/4a/742e4acbf5e92e4277bac0d970a17bff.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjKk1sIk5fNTDxkGpdEBYYluDkNyLuTz9jiA&s",
  "https://i.ytimg.com/vi/6B7-PRf9UU4/maxresdefault.jpg",
  "https://i.pinimg.com/736x/d7/7a/13/d77a136e75b7b4754b2bed954437301f.jpg",
  "https://hicuespeakers.com/sites/default/files/styles/cuadrada_737x737/public/2022-05/perfiles/Sergio-Fajardo.jpg.webp?h=fbf7a813&itok=os2Cn587",
  "https://media.licdn.com/dms/image/v2/D4E0BAQH8s2XWdpmsxw/company-logo_400_400/B4EZhCO0bsHgAY-/0/1753457838404/abelardo_de_la_espriella_logo?e=2147483647&v=beta&t=PRN9onuINtTJ3KPaB4ZhKLVcmJuvyPInmFFTaubzEHo",
  "https://i.ytimg.com/vi/lfQ0XDINOSQ/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAbnbMZT3JDvNxm_Piz4OqaltGb7w",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Perfil_Iv%C3%A1n_Cepeda_%28cropped%29.jpg/250px-Perfil_Iv%C3%A1n_Cepeda_%28cropped%29.jpg"
];

const getRandomAvatar = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[index];
};

export function FeedPostDetail({ post, open, onOpenChange, onHide }: FeedPostDetailProps) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchComments = async () => {
    if (!post) return;
    try {
      setLoadingComments(true);
      const userRelation: UserEnterpriseResponse | null = JSON.parse(localStorage.getItem('userRelationEnterprise') ?? 'null') as UserEnterpriseResponse;
      const orgId = userRelation?.enterprises?.[0]?.enterpriseId;

      const storedUser = JSON.parse(localStorage.getItem('currentUser') ?? 'null');
      setCurrentUser(storedUser);

      if (!orgId) return;

      const apiComments = await forumService.getComments(orgId, String(post.id));

      // Fetch profiles for comment authors (API returns userId in user_name field per instruction)
      const uniqueUserIds = Array.from(new Set(apiComments.map(c => c.user_name)));
      const profiles = await Promise.all(
        uniqueUserIds.map(id => authService.getUserProfile(id).catch(() => null))
      );

      const userMap: Record<string, { name: string; avatar?: string }> = {};
      profiles.forEach(p => {
        if (p) {
          userMap[p.userId] = {
            name: `${p.firstName} ${p.lastName}`.trim(),
            avatar: p.profilePhotoUrl || getRandomAvatar(p.userId)
          };
        }
      });

      const mappedComments: CommentWithUser[] = apiComments.map(c => ({
        ...c,
        user_name: c.user_name,
        authorName: userMap[c.user_name]?.name || "Unknown User",
        authorAvatar: userMap[c.user_name]?.avatar
      }));

      // Sort by oldest first? Or newest? Usually comments are chronological.
      // API response doesn't guarantee order, checking created_at
      mappedComments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      setComments(mappedComments);

    } catch (e) {
      console.error("Failed to fetch comments", e);
    } finally {
      setLoadingComments(false);
    }
  };

  // Local state for stats, initialized from post prop but refreshed
  const [localStats, setLocalStats] = useState<ReactionStats | undefined>(post?.stats);

  const fetchStats = async () => {
    if (!post) return;
    try {
      const userRelation: UserEnterpriseResponse | null = JSON.parse(localStorage.getItem('userRelationEnterprise') ?? 'null') as UserEnterpriseResponse;
      const orgId = userRelation?.enterprises?.[0]?.enterpriseId;
      const currentUser = JSON.parse(localStorage.getItem('currentUser') ?? 'null');
      const userId = currentUser?.userId;

      if (orgId) {
        const stats = await forumService.getReactionStats(orgId, post.id, userId);
        setLocalStats(stats);
      }
    } catch (e) {
      console.error("Failed to fetch detail stats", e);
    }
  };

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!post) return;
    try {
      const userRelation: UserEnterpriseResponse | null = JSON.parse(localStorage.getItem('userRelationEnterprise') ?? 'null') as UserEnterpriseResponse;
      const orgId = userRelation?.enterprises?.[0]?.enterpriseId;
      const currentUser = JSON.parse(localStorage.getItem('currentUser') ?? 'null');
      const userId = currentUser?.userId;

      if (!orgId || !userId) return;

      let newStats: ReactionStats;

      if (localStats?.user_reaction === type) {
        await forumService.removeReaction(orgId, post.id, userId);
        newStats = await forumService.getReactionStats(orgId, post.id, userId);
      } else {
        const response = await forumService.addReaction(orgId, post.id, {
          user_id: userId,
          reaction_type: type
        });
        newStats = response;
      }

      setLocalStats(newStats);
    } catch (error) {
      console.error("Failed to react in detail", error);
    }
  };

  useEffect(() => {
    if (open && post) {
      setLocalStats(post.stats); // Reset to prop first
      void fetchComments();
      void fetchStats();
    } else {
      setComments([]);
    }
  }, [open, post]);

  const handlePostComment = async () => {
    if (!commentText.trim() || !post) return;

    try {
      const userRelation: UserEnterpriseResponse | null = JSON.parse(localStorage.getItem('userRelationEnterprise') ?? 'null') as UserEnterpriseResponse;
      const orgId = userRelation?.enterprises?.[0]?.enterpriseId;
      const currentUser = JSON.parse(localStorage.getItem('currentUser') ?? 'null');
      const userId = currentUser?.userId; // Needed for creation payload

      if (!orgId || !userId) return;

      await forumService.createComment(orgId, String(post.id), {
        content: commentText,
        user_name: userId, // Using userId as user_name per instruction
      });

      setCommentText("");
      void fetchComments(); // Refresh list
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  const handleProfileClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    localStorage.setItem('userIdSearch', userId);
    window.location.href = '/user-profile';
  };

  if (!post) return null;

  // Safe access for optional properties if they don't exist in Post type (handled via casting or optional chaining)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/20 dark:border-gray-700/50">
        <DialogTitle className="sr-only">Post by {post.authorName}</DialogTitle>
        <DialogDescription className="sr-only">
          View full post details and comments
        </DialogDescription>

        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-4">
            {/* Post Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-3 min-w-0 flex-1">
                <Avatar
                  className="w-12 h-12 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => handleProfileClick(e, post.user_id)}
                >
                  <AvatarImage src={post.authorAvatar} />
                  <AvatarFallback>{post.authorName?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4
                      className="truncate cursor-pointer hover:underline hover:text-blue-500 transition-colors"
                      onClick={(e: React.MouseEvent) => handleProfileClick(e, post.user_id)}
                    >
                      {post.authorName}
                    </h4>
                    {post.trending && (
                      <Badge variant="secondary" className="gap-1 shrink-0">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{post.authorRole}</p>
                  <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleString()}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    if (post && onHide) onHide(post.id);
                    onOpenChange(false);
                  }}>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Stop seeing this post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post Content */}
            <div className="space-y-3">
              <p className="whitespace-pre-line text-lg font-semibold">{post.title}</p>
              <p className="whitespace-pre-line">{post.content}</p>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between border-y border-white/20 dark:border-gray-700/50 py-3">
              <div className="flex gap-1">
                <Button
                  variant={localStats?.user_reaction === 'like' ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                  onClick={() => handleReaction('like')}
                >
                  <ThumbsUp className={`w-4 h-4 ${localStats?.user_reaction === 'like' ? 'fill-current' : ''}`} />
                  <span className="text-xs">{localStats?.likes_count || 0}</span>
                </Button>
                <Button
                  variant={localStats?.user_reaction === 'dislike' ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                  onClick={() => handleReaction('dislike')}
                >
                  <ThumbsDown className={`w-4 h-4 ${localStats?.user_reaction === 'dislike' ? 'fill-current' : ''}`} />
                  <span className="text-xs">{localStats?.dislikes_count || 0}</span>
                </Button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <h3 className="text-sm">Comments ({comments.length})</h3>

              {/* Comment Input */}
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={currentUser?.profilePhotoUrl || (currentUser?.userId ? getRandomAvatar(currentUser.userId) : undefined)} />
                  <AvatarFallback>{currentUser?.firstName?.[0] || "ME"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                    className="flex-1 px-4 py-2 rounded-lg backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <Button size="icon" className="shrink-0" onClick={handlePostComment}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator className="bg-white/20 dark:bg-gray-700/50" />

              {/* Comments List */}
              <div className="space-y-4">
                {loadingComments ? (
                  <div className="text-center text-sm text-muted-foreground">Loading comments...</div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar
                        className="w-8 h-8 shrink-0 cursor-pointer hover:opacity-80"
                        onClick={(e: React.MouseEvent) => handleProfileClick(e, comment.user_name)}
                      >
                        <AvatarImage src={comment.authorAvatar} />
                        <AvatarFallback>{comment.authorName?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-medium cursor-pointer hover:underline hover:text-blue-500"
                            onClick={(e: React.MouseEvent) => handleProfileClick(e, comment.user_name)}
                          >
                            {comment.authorName}
                          </span>
                          <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
