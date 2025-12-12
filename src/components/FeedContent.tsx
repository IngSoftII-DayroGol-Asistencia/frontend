import { useState } from "react";
import { MessageSquare, Bookmark, MoreHorizontal, ThumbsUp, ThumbsDown, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { FeedPostDetail } from "./FeedPostDetail";

export interface Post {
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

export function FeedContent() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postDetailOpen, setPostDetailOpen] = useState(false);

  const posts: Post[] = [
    {
      id: 1,
      author: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      role: "Senior Product Designer",
      time: "2h ago",
      content: "Just launched our new design system! 🎉 It's been a 6-month journey of collaboration and iteration. Excited to see how it transforms our product experience.",
      tags: ["Design", "UI/UX", "Product"],
      upvotes: 234,
      downvotes: 12,
      comments: 45,
      trending: true,
    },
    {
      id: 2,
      author: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      role: "Full Stack Developer",
      time: "4h ago",
      content: "What's your favorite state management solution for React in 2025? I've been exploring different options and would love to hear your experiences.",
      tags: ["React", "JavaScript", "Development"],
      upvotes: 156,
      downvotes: 8,
      comments: 89,
      trending: false,
    },
    {
      id: 3,
      author: "Emily Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      role: "Marketing Director",
      time: "6h ago",
      content: "5 lessons learned from scaling our startup to 100k users:\n\n1. User feedback is gold\n2. Build in public\n3. Focus on retention\n4. Automate early\n5. Community > Everything",
      tags: ["Startup", "Growth", "Marketing"],
      upvotes: 892,
      downvotes: 45,
      comments: 124,
      trending: true,
    },
  ];

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setPostDetailOpen(true);
  };

  return (
    <>
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Create Post Card */}
        <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-gray-700/50">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex gap-2 md:gap-3">
              <Avatar className="w-8 h-8 md:w-10 md:h-10">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <input
                type="text"
                placeholder="Share your thoughts..."
                className="flex-1 px-3 md:px-4 py-2 rounded-lg backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        {posts.map((post) => {
          const totalInteractions = post.upvotes - post.downvotes;
          return (
            <Card key={post.id} className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-gray-700/50 hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-2 md:gap-3 min-w-0 flex-1">
                    <Avatar className="w-10 h-10 md:w-12 md:h-12 shrink-0">
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback>{post.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="truncate">{post.author}</h4>
                        {post.trending && (
                          <Badge variant="secondary" className="gap-1 shrink-0">
                            <TrendingUp className="w-3 h-3" />
                            <span className="hidden sm:inline">Trending</span>
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
              </CardHeader>

              <CardContent className="px-4 md:px-6">
                <p className="whitespace-pre-line mb-3 text-sm md:text-base">{post.content}</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="backdrop-blur-sm bg-blue-500/10 border-blue-500/20 text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="border-t border-white/20 dark:border-gray-700/50 pt-3 md:pt-4 px-4 md:px-6">
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-0.5 md:gap-1">
                    <Button variant="ghost" size="sm" className="gap-1.5 md:gap-2 px-2 md:px-3">
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5 md:gap-2 px-2 md:px-3">
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                    <span className="flex items-center px-2 text-xs md:text-sm text-muted-foreground">
                      {totalInteractions}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 md:gap-2 px-2 md:px-3"
                      onClick={() => handlePostClick(post)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs md:text-sm">{post.comments}</span>
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Post Detail Modal */}
      <FeedPostDetail
        post={selectedPost}
        open={postDetailOpen}
        onOpenChange={setPostDetailOpen}
      />
    </>
  );
}
