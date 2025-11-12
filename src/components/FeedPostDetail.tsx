import { useState } from "react";
import { MessageSquare, Bookmark, MoreHorizontal, ThumbsUp, ThumbsDown, TrendingUp, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  role: string;
  time: string;
  content: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  comments: number;
  trending: boolean;
}

interface FeedPostDetailProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedPostDetail({ post, open, onOpenChange }: FeedPostDetailProps) {
  const [commentText, setCommentText] = useState("");
  
  if (!post) return null;

  const mockComments: Comment[] = [
    {
      id: 1,
      author: "Alex Thompson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      content: "This is amazing! Congratulations on the launch!",
      time: "1h ago",
      likes: 12,
    },
    {
      id: 2,
      author: "Jessica Lee",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
      content: "Would love to see a case study on this. What were the biggest challenges?",
      time: "45m ago",
      likes: 8,
    },
    {
      id: 3,
      author: "David Kumar",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
      content: "Great work! We're working on something similar. Any tips on component documentation?",
      time: "30m ago",
      likes: 5,
    },
  ];

  const totalInteractions = post.upvotes - post.downvotes;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/20 dark:border-gray-700/50">
        <DialogTitle className="sr-only">Post by {post.author}</DialogTitle>
        <DialogDescription className="sr-only">
          View full post details and comments
        </DialogDescription>
        
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-4">
            {/* Post Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-3 min-w-0 flex-1">
                <Avatar className="w-12 h-12 shrink-0">
                  <AvatarImage src={post.avatar} />
                  <AvatarFallback>{post.author[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate">{post.author}</h4>
                    {post.trending && (
                      <Badge variant="secondary" className="gap-1 shrink-0">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{post.role}</p>
                  <p className="text-xs text-muted-foreground">{post.time}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            {/* Post Content */}
            <div className="space-y-3">
              <p className="whitespace-pre-line">{post.content}</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="backdrop-blur-sm bg-blue-500/10 border-blue-500/20">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between border-y border-white/20 dark:border-gray-700/50 py-3">
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ThumbsDown className="w-4 h-4" />
                </Button>
                <span className="flex items-center px-2 text-sm text-muted-foreground">
                  {totalInteractions}
                </span>
              </div>
              <Button variant="ghost" size="icon">
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <h3 className="text-sm">Comments ({mockComments.length})</h3>
              
              {/* Comment Input */}
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <Button size="icon" className="shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator className="bg-white/20 dark:bg-gray-700/50" />

              {/* Comments List */}
              <div className="space-y-4">
                {mockComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback>{comment.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">{comment.time}</span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span className="text-xs">{comment.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <span className="text-xs">Reply</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
