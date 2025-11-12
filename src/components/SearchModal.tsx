import { useState } from "react";
import { Search, TrendingUp, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const trendingSearches = [
    "React best practices",
    "Design systems",
    "Remote work tips",
    "Product management",
  ];

  const recentSearches = [
    "Figma plugins",
    "TypeScript tutorials",
    "UX research methods",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/20 dark:border-gray-700/50">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search for posts, people, and topics
        </DialogDescription>
        
        <div className="p-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for posts, people, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/50"
              autoFocus
            />
          </div>

          {/* Search Results / Suggestions */}
          <ScrollArea className="max-h-[60vh]">
            {searchQuery === "" ? (
              <div className="space-y-6">
                {/* Trending Searches */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span>Trending</span>
                  </div>
                  <div className="space-y-1">
                    {trendingSearches.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(item)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <p className="text-sm">{item}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Recent</span>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(item)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <p className="text-sm">{item}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground px-3">
                  Searching for "{searchQuery}"...
                </p>
                {/* Search results would go here */}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
