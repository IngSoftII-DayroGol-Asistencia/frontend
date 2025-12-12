import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { authService } from "../api/services/auth.service";
import { EnterpriseUserMembership } from "../interfaces/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<EnterpriseUserMembership[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      // Fetch members when modal opens
      const fetchMembers = async () => {
        try {
          const response = await authService.getMyEnterprise();
          if (response && response.enterprise && response.enterprise.users) {
            setMembers(response.enterprise.users);
          }
        } catch (error) {
          console.error("Failed to fetch members for search", error);
        }
      };
      void fetchMembers();
    }
  }, [open]);

  const filteredMembers = members.filter(member => {
    const q = searchQuery.toLowerCase();
    const fullName = `${member.user.profile?.firstName || ''} ${member.user.profile?.lastName || ''}`.toLowerCase();
    const email = member.user.email.toLowerCase();
    return fullName.includes(q) || email.includes(q);
  });

  const handleMemberClick = (userId: string) => {
    localStorage.setItem('userIdSearch', userId);
    navigate('/user-profile');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-white/20 dark:border-gray-700/50">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search for enterprise members
        </DialogDescription>

        <div className="p-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search people in your enterprise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/50"
              autoFocus
            />
          </div>

          {/* Search Results */}
          <ScrollArea className="max-h-[60vh]">
            {searchQuery === "" && filteredMembers.length > 0 ? (
              <div className="p-2 text-sm text-gray-500 text-center">Start typing to search members...</div>
            ) : filteredMembers.length === 0 && searchQuery !== "" ? (
              <div className="p-4 text-center text-gray-500">No matching members found.</div>
            ) : (
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <button
                    key={member.userId}
                    onClick={() => handleMemberClick(member.userId)}
                    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left group"
                  >
                    <Avatar className="h-10 w-10 border border-gray-200">
                      <AvatarImage src={member.user.profile?.profilePhotoUrl || "https://www.infobae.com/resizer/v2/A4KLCKGDBFAURDESJICP7N5QUY.png?auth=54a69cfdb3d043e177ff4f81fadbc0f671c4a49592826ed657a4162c06a741fe&smart=true&width=1200&height=900&quality=85"} className="object-cover" />
                      <AvatarFallback>{member.user.email[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                        {member.user.profile?.firstName} {member.user.profile?.lastName}
                      </h4>
                      <p className="text-xs text-gray-500">{member.user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
