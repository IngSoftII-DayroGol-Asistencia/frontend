import { useState } from "react";
import { Search, Send, MoreHorizontal, Hash, Lock, Users, Plus, Phone, Video, Pin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface Channel {
  id: number;
  name: string;
  type: "public" | "private" | "dm";
  unread?: number;
  lastMessage?: string;
  avatar?: string;
  members?: number;
  online?: boolean;
}

interface Message {
  id: number;
  author: string;
  avatar: string;
  content: string;
  time: string;
  reactions?: { emoji: string; count: number }[];
}

export function MessagesContent() {
  const [selectedChannel, setSelectedChannel] = useState<number>(1);
  const [messageText, setMessageText] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const channels: Channel[] = [
    { id: 1, name: "general", type: "public", unread: 3, lastMessage: "Hey team! Meeting at 3pm", members: 24 },
    { id: 2, name: "design-system", type: "public", lastMessage: "Updated the color palette", members: 12 },
    { id: 3, name: "development", type: "public", unread: 7, lastMessage: "PR is ready for review", members: 18 },
    { id: 4, name: "product-planning", type: "private", lastMessage: "Q1 roadmap discussion", members: 8 },
    { id: 5, name: "Sarah Johnson", type: "dm", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", online: true, lastMessage: "Thanks for the update!" },
    { id: 6, name: "Michael Chen", type: "dm", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", unread: 2, lastMessage: "Can we discuss the API changes?", online: true },
    { id: 7, name: "Emily Rodriguez", type: "dm", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", lastMessage: "Great work on the presentation!" },
  ];

  const messages: Message[] = [
    {
      id: 1,
      author: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      content: "Hey team! Just wanted to remind everyone about our meeting at 3pm today. We'll be discussing the new feature roadmap.",
      time: "10:30 AM",
      reactions: [{ emoji: "👍", count: 5 }, { emoji: "✅", count: 3 }],
    },
    {
      id: 2,
      author: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      content: "Sounds good! I'll prepare the tech requirements document beforehand.",
      time: "10:35 AM",
    },
    {
      id: 3,
      author: "Emily Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      content: "Perfect timing! I've just finished the user research analysis. Will share in the meeting.",
      time: "10:42 AM",
      reactions: [{ emoji: "🎉", count: 4 }],
    },
    {
      id: 4,
      author: "John Doe",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      content: "I'll join from the client site. Looking forward to it!",
      time: "11:15 AM",
    },
  ];

  const currentChannel = channels.find(c => c.id === selectedChannel);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Handle message sending
      setMessageText("");
    }
  };

  const handleChannelSelect = (id: number) => {
    setSelectedChannel(id);
    setMobileShowChat(true);
  };

  return (
    <div className="flex h-full w-full">
      {/* Channel List Sidebar */}
      <div className={`${mobileShowChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-white/20 dark:border-gray-700/50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/20 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h2>Messages</h2>
            <Button size="icon" variant="ghost">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search channels..."
              className="pl-9 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/50"
            />
          </div>
        </div>

        {/* Channels List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {/* Channels Section */}
            <div className="px-3 py-2 text-xs text-muted-foreground">Channels</div>
            {channels.filter(c => c.type !== "dm").map((channel) => (
              <button
                key={channel.id}
                onClick={() => handleChannelSelect(channel.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${selectedChannel === channel.id
                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20"
                    : "hover:bg-white/50 dark:hover:bg-gray-800/50"
                  }`}
              >
                {channel.type === "public" ? (
                  <Hash className="w-4 h-4 shrink-0 text-muted-foreground" />
                ) : (
                  <Lock className="w-4 h-4 shrink-0 text-muted-foreground" />
                )}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm truncate">{channel.name}</span>
                    {channel.unread && (
                      <Badge className="h-5 min-w-5 px-1.5 bg-blue-500 text-white">
                        {channel.unread}
                      </Badge>
                    )}
                  </div>
                  {channel.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate">{channel.lastMessage}</p>
                  )}
                </div>
              </button>
            ))}

            {/* Direct Messages Section */}
            <div className="px-3 py-2 text-xs text-muted-foreground mt-4">Direct Messages</div>
            {channels.filter(c => c.type === "dm").map((channel) => (
              <button
                key={channel.id}
                onClick={() => handleChannelSelect(channel.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${selectedChannel === channel.id
                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20"
                    : "hover:bg-white/50 dark:hover:bg-gray-800/50"
                  }`}
              >
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={channel.avatar} />
                    <AvatarFallback>{channel.name[0]}</AvatarFallback>
                  </Avatar>
                  {channel.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm truncate">{channel.name}</span>
                    {channel.unread && (
                      <Badge className="h-5 min-w-5 px-1.5 bg-blue-500 text-white">
                        {channel.unread}
                      </Badge>
                    )}
                  </div>
                  {channel.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate">{channel.lastMessage}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={`${mobileShowChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {/* Chat Header */}
        <div className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-white/20 dark:border-gray-700/50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileShowChat(false)}
            >
              <Hash className="w-5 h-5" />
            </Button>
            {currentChannel?.type === "dm" ? (
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentChannel.avatar} />
                  <AvatarFallback>{currentChannel.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm">{currentChannel.name}</h3>
                  {currentChannel.online && (
                    <p className="text-xs text-green-500">Active now</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {currentChannel?.type === "public" ? (
                  <Hash className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <h3 className="text-sm">{currentChannel?.name}</h3>
                  {currentChannel?.members && (
                    <p className="text-xs text-muted-foreground">
                      {currentChannel.members} members
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Phone className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Start voice call</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Video className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Start video call</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Pin className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Pinned items</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message, index) => {
              const showAvatar = index === 0 || messages[index - 1].author !== message.author;

              return (
                <div key={message.id} className={`flex gap-3 ${showAvatar ? 'mt-4' : 'mt-1'}`}>
                  <div className="w-10 shrink-0">
                    {showAvatar && (
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback>{message.author[0]}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm">{message.author}</span>
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                      </div>
                    )}
                    <div className="group relative">
                      <p className="text-sm">{message.content}</p>
                      {message.reactions && (
                        <div className="flex gap-1 mt-2">
                          {message.reactions.map((reaction, i) => (
                            <button
                              key={i}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-700/50 hover:border-blue-500/50 transition-colors"
                            >
                              <span>{reaction.emoji}</span>
                              <span>{reaction.count}</span>
                            </button>
                          ))}
                          <button className="opacity-0 group-hover:opacity-100 flex items-center px-2 py-0.5 rounded-full text-xs backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-700/50 hover:border-blue-500/50 transition-all">
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 md:p-6 border-t border-white/20 dark:border-gray-700/50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Input
              placeholder={`Message ${currentChannel?.type === 'dm' ? currentChannel.name : '#' + currentChannel?.name}`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              className="flex-1 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/50"
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
