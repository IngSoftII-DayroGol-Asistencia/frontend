import { useEffect, useState } from "react";
import { MessageSquare, MoreHorizontal, ThumbsUp, ThumbsDown, TrendingUp, EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card";
import { FeedPostDetail } from "../components/FeedPostDetail";
import { forumService } from "../api/services/forum.service";
import { authService } from "../api/services/auth.service";
import { Post as ApiPost, ReactionStats } from "../interfaces/forum.types";
import { CreatePostModal } from "../components/CreatePostModal";
import { UserEnterpriseResponse } from "../interfaces/auth/userEnterprise.interface";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";


// Extended Post type for UI (merging API data with UI needs)
export interface Post extends ApiPost {
  authorName?: string;
  authorAvatar?: string;
  authorRole?: string;
  // UI specific fields not in API yet, providing defaults
  trending?: boolean;
  stats?: ReactionStats;
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

export function FeedContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postDetailOpen, setPostDetailOpen] = useState(false);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('hiddenPosts');
    return saved ? JSON.parse(saved) as string[] : [];
  });
  const [currentUser, setCurrentUser] = useState<any>(null);


  const fetchPosts = async () => {
    try {
      setLoading(true);
      const userRelation: UserEnterpriseResponse | null = JSON.parse(localStorage.getItem('userRelationEnterprise') ?? 'null') as UserEnterpriseResponse;
      const orgId = userRelation?.enterprises?.[0]?.enterpriseId;

      const storedUser = JSON.parse(localStorage.getItem('currentUser') ?? 'null');
      setCurrentUser(storedUser);

      if (!orgId) return;

      if (!orgId) return;

      // Fetch Posts
      const fetchedPosts = await forumService.getPosts(orgId);

      // Get unique user IDs
      const uniqueUserIds = Array.from(new Set(fetchedPosts.map(p => p.user_id)));

      // Fetch profiles in parallel
      const profiles = await Promise.all(
        uniqueUserIds.map(id => authService.getUserProfile(id).catch(() => null))
      );

      // Create User Map
      const newUserMap: Record<string, { name: string; avatar?: string; role?: string }> = {};
      profiles.forEach(profile => {
        if (profile) {
          newUserMap[profile.userId] = {
            name: `${profile.firstName} ${profile.lastName}`.trim(),
            avatar: profile.profilePhotoUrl || getRandomAvatar(profile.userId),
            role: profile.jobTitle || "Member"
          };
        }
      });

      // Fetch Reaction Stats
      const currentUser = JSON.parse(localStorage.getItem('currentUser') ?? 'null');
      const currentUserId = currentUser?.userId;

      const statsPromises = fetchedPosts.map(p =>
        forumService.getReactionStats(orgId, p.id, currentUserId).catch(() => null)
      );
      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<string, ReactionStats> = {};
      fetchedPosts.forEach((p, index) => {
        if (statsResults[index]) {
          statsMap[p.id] = statsResults[index]!;
        }
      });

      // Filter hidden posts
      const visiblePosts = fetchedPosts.filter(p => !hiddenPostIds.includes(p.id));

      // Map API posts to UI posts
      const mappedPosts: Post[] = visiblePosts.map(p => ({
        ...p,
        authorName: newUserMap[p.user_id]?.name || "Unknown User",
        authorAvatar: newUserMap[p.user_id]?.avatar,
        authorRole: newUserMap[p.user_id]?.role || "Member",
        trending: false, // Placeholder
        stats: statsMap[p.id]
      }));

      // Sort by newer first
      mappedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPosts(mappedPosts);
    } catch (error) {
      console.error("Failed to load feed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPosts();
  }, []);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setPostDetailOpen(true);
  };

  const handleReaction = async (post: Post, type: 'like' | 'dislike') => {
    try {
      const userRelation: UserEnterpriseResponse | null = JSON.parse(localStorage.getItem('userRelationEnterprise') ?? 'null') as UserEnterpriseResponse;
      const orgId = userRelation?.enterprises?.[0]?.enterpriseId;
      const currentUser = JSON.parse(localStorage.getItem('currentUser') ?? 'null');
      const userId = currentUser?.userId;

      if (!orgId || !userId) return;

      let newStats: ReactionStats;

      // If clicking same reaction, remove it (toggle off)
      if (post.stats?.user_reaction === type) {
        await forumService.removeReaction(orgId, post.id, userId);
        newStats = await forumService.getReactionStats(orgId, post.id, userId);

      } else {
        const response = await forumService.addReaction(orgId, post.id, {
          user_id: userId,
          reaction_type: type
        });
        newStats = response;
      }

      setPosts(prev => prev.map(p => {
        if (p.id === post.id) {
          return { ...p, stats: newStats };
        }
        return p;
      }));

    } catch (error) {
      console.error("Failed to react", error);
    }
  };

  const handleProfileClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    localStorage.setItem('userIdSearch', userId);
    window.location.href = '/user-profile';
  };

  const handleHidePost = (postId: string) => {
    const newHidden = [...hiddenPostIds, postId];
    setHiddenPostIds(newHidden);
    localStorage.setItem('hiddenPosts', JSON.stringify(newHidden));

    setPosts(prev => prev.filter(p => p.id !== postId));

    if (selectedPost?.id === postId) {
      setPostDetailOpen(false);
      setSelectedPost(null);
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-gray-700/50">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex gap-2 md:gap-3" onClick={() => setCreateModalOpen(true)}>
              <Avatar className="w-8 h-8 md:w-10 md:h-10 cursor-pointer">
                <AvatarImage src={currentUser?.profilePhotoUrl || (currentUser?.userId ? getRandomAvatar(currentUser.userId) : undefined)} />
                <AvatarFallback>{currentUser?.firstName?.[0] || "ME"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 px-3 md:px-4 py-2 rounded-lg backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-700/50 text-muted-foreground cursor-pointer hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                Share your thoughts...
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading updates...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No posts yet. Be the first to share!</div>
        ) : (
          posts.map((post) => {
            return (
              <Card key={post.id} className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-gray-700/50 hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-2 md:gap-3 min-w-0 flex-1">
                      <Avatar
                        className="w-10 h-10 md:w-12 md:h-12 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e: React.MouseEvent) => handleProfileClick(e, post.user_id)}
                      >
                        <AvatarImage src={post.authorAvatar} />
                        <AvatarFallback>{post.authorName?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className="truncate font-medium cursor-pointer hover:underline hover:text-blue-500 transition-colors"
                            onClick={(e) => handleProfileClick(e, post.user_id)}
                          >
                            {post.authorName}
                          </h4>
                          {post.trending && (
                            <Badge variant="secondary" className="gap-1 shrink-0">
                              <TrendingUp className="w-3 h-3" />
                              <span className="hidden sm:inline">Trending</span>
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
                        <DropdownMenuItem onClick={() => handleHidePost(post.id)}>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Stop seeing this post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="px-4 md:px-6">
                  <h5 className="font-semibold mb-2">{post.title}</h5>
                  <p className="whitespace-pre-line mb-3 text-sm md:text-base">{post.content}</p>

                  {post.attachments && post.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.attachments.map(att => (
                        <div key={att.id} className="relative group overflow-hidden rounded-lg border bg-muted/50">
                          <a href={att.url} target="_blank" rel="noreferrer" className="block p-2 text-sm text-blue-500 hover:underline">
                            {att.file_name}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="border-t border-white/20 dark:border-gray-700/50 pt-3 md:pt-4 px-4 md:px-6">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex gap-0.5 md:gap-1">
                      <Button
                        variant={post.stats?.user_reaction === 'like' ? "secondary" : "ghost"}
                        size="sm"
                        className="gap-1.5 md:gap-2 px-2 md:px-3"
                        onClick={() => handleReaction(post, 'like')}
                      >
                        <ThumbsUp className={`w-4 h-4 ${post.stats?.user_reaction === 'like' ? 'fill-current' : ''}`} />
                        <span className="text-xs">{post.stats?.likes_count || 0}</span>
                      </Button>
                      <Button
                        variant={post.stats?.user_reaction === 'dislike' ? "secondary" : "ghost"}
                        size="sm"
                        className="gap-1.5 md:gap-2 px-2 md:px-3"
                        onClick={() => handleReaction(post, 'dislike')}
                      >
                        <ThumbsDown className={`w-4 h-4 ${post.stats?.user_reaction === 'dislike' ? 'fill-current' : ''}`} />
                        <span className="text-xs">{post.stats?.dislikes_count || 0}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 md:gap-2 px-2 md:px-3"
                        onClick={() => handlePostClick(post)}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs md:text-sm">Comments</span>
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>

      <CreatePostModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onPostCreated={fetchPosts}
      />

      {selectedPost && (
        <FeedPostDetail
          post={selectedPost as any}
          open={postDetailOpen}
          onOpenChange={setPostDetailOpen}
          onHide={handleHidePost}
        />
      )}
    </>
  );
}
