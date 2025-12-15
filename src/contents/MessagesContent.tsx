import { useEffect, useRef, useState } from "react";
import { Hash, Lock, MoreHorizontal, Phone, Pin, Plus, Search, Send, Users, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { authService } from "../api/services/auth.service";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";

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
}

export function MessagesContent() {
  interface DMUser {
    id: string;
    userId: number;
    name: string;
    avatar?: string | null;
    isMe?: boolean;
  }

  const [selectedChannel, setSelectedChannel] = useState<number | string>(1);
  const [dmUsers, setDmUsers] = useState<DMUser[]>([]);
  const [messageText, setMessageText] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const channels: Channel[] = [];
  interface ChatMessage {
    id: string;
    content: string;
    author_id: string;
    receiver_id: string;
    createdAt: string;
  }

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentChannel: any =
    typeof selectedChannel === "string"
      ? dmUsers.find((u) => u.id === selectedChannel)
      : channels.find((c) => c.id === selectedChannel);

  const isDmSelected = typeof selectedChannel === "string";

  useEffect(() => {
    const load = async () => {
      try {
        const stored = localStorage.getItem("myEnterprise") || localStorage.getItem("currentEnterprise");
        const currentUserStr = localStorage.getItem("currentUser");
        const currentUserObj = currentUserStr ? JSON.parse(currentUserStr) : null;
        const myUserId = currentUserObj?.userId ?? currentUserObj?.id ?? null;

        if (stored) {
          const ent = JSON.parse(stored);
          let users: any[] = [];
          if (ent.enterprise && Array.isArray(ent.enterprise.users)) {
            users = ent.enterprise.users;
          } else if (Array.isArray(ent.users)) {
            users = ent.users;
          }
          const mapped = await Promise.all(
            users.map(async (m: any) => {
              const userId = m.userId ?? m.user?.id ?? m.userId;
              // prefer profile firstName/lastName, then username, then email local-part
              let name = null;
              const userObj = m.user || {};
              if (userObj.profile && (userObj.profile.firstName || userObj.profile.lastName)) {
                name = `${userObj.profile.firstName || ''} ${userObj.profile.lastName || ''}`.trim();
              }
              if (!name && userObj.username) {
                name = userObj.username;
              }
              if (!name && userObj.email) {
                name = userObj.email.split('@')[0];
              }
              let avatar = userObj.profile?.profilePhotoUrl || userObj.profilePhotoUrl || userObj.avatar || null;
              try {
                const profile = await authService.getUserProfile(String(userId));
                if (profile?.data) {
                  const pd = profile.data as any;
                  if (!name) {
                    if (pd.firstName || pd.lastName) {
                      name = `${pd.firstName || ''} ${pd.lastName || ''}`.trim();
                    } else if (pd.userName || pd.username) {
                      name = pd.userName || pd.username;
                    } else if ((pd).email) {
                      name = (pd).email.split('@')[0];
                    }
                  }
                  avatar = avatar || pd.profilePhotoUrl || (pd).profilePhotoUrl || null;
                }
              } catch (e) {}
              if (!name) {name = `user${userId}`;}
              return { id: `dm-${userId}`, userId, name, avatar, isMe: String(myUserId) === String(userId) } as DMUser;
            })
          );
          setDmUsers(mapped);
          return;
        }

        // fallback: call API
        const res = await authService.getMyEnterprise();
        const ent = res?.data;
        if (ent?.users) {
          const mapped = ent.users.map((m: any) => ({ id: `dm-${m.userId}`, userId: m.userId, name: m.user?.name || m.user?.email || `User ${m.userId}`, avatar: m.user?.avatar || null, isMe: myUserId === m.userId } as DMUser));
          setDmUsers(mapped);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  // load conversation when a DM is selected
  useEffect(() => {
    const loadConversation = async () => {
      if (!isDmSelected || !currentChannel) {
        setMessages([]);
        return;
      }

      try {
        const currentUserStr = localStorage.getItem('currentUser');
        const currentUserObj = currentUserStr ? JSON.parse(currentUserStr) : null;
        const myId = currentUserObj?.userId ?? currentUserObj?.id ?? null;
        const otherId = (currentChannel).userId ?? null;
        if (!myId || !otherId) {return;}

        const base = (import.meta.env.VITE_MS_CHAT).replace(/\/$/, '');
        const url = `${base}/messages/conversation/${myId}/${otherId}`;
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
          },
        });
        if (!res.ok) {
          console.error('Failed to fetch conversation', await res.text());
          return;
        }
        const data = await res.json();
        // expect array of {id, content, author_id, receiver_id, createdAt}
        setMessages(data || []);
        // scroll to bottom
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
      } catch (e) {
        console.error('Error loading conversation', e);
      }
    };

    void loadConversation();
  }, [selectedChannel, isDmSelected, currentChannel]);

  // Socket.IO connection: register chat_<myId> listener
  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    const currentUserObj = currentUserStr ? JSON.parse(currentUserStr) : null;
    const myId = currentUserObj?.userId ?? currentUserObj?.id ?? null;
    if (!myId) {
      console.warn('No currentUser found in localStorage for socket subscription');
      return;
    }

    const WS_URL = import.meta.env.VITE_MS_CHAT;
    const socket = io(WS_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') },
      autoConnect: true,
    });
    socketRef.current = socket;

    const eventName = `chat_${myId}`;

    socket.on('connect', () => {
      console.log('WS connected', socket.id);
    });

    socket.on(eventName, (msg: any) => {
      console.log('Received WS message on', eventName, msg);
      try {
        if (Array.isArray(msg)) {
          setMessages(msg);
        } else if (msg && typeof msg === 'object') {
          // append single message
          setMessages((prev) => [...prev, msg]);
        }
        // scroll to bottom after state update
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
      } catch (e) {
        console.error('Error handling WS message', e);
      }
    });

    socket.on('connect_error', (err: any) => {
      console.error('WS connect_error', err);
    });

    return () => {
      try {
        socket.off(eventName);
        socket.disconnect();
      } catch (e) {}
      socketRef.current = null;
    };
  }, []);

  const handleSendMessage = () => {
    if (!messageText.trim()) {return;}

    try {
      const currentUserStr = localStorage.getItem('currentUser');
      const currentUserObj = currentUserStr ? JSON.parse(currentUserStr) : null;
      const myId = currentUserObj?.userId ?? currentUserObj?.id ?? null;

      // if DM selected, extract receiver id
      let receiverId: string | null = null;
      if (isDmSelected && currentChannel?.userId) {
        receiverId = String((currentChannel).userId);
      }

      const payload: any = {
        content: messageText,
        author_id: String(myId ?? ''),
        receiver_id: receiverId ?? '',
      };

      // emit via socket if available
      const socket = socketRef.current;
      if (socket && socket.connected) {
        socket.emit('message', payload, (ack: any) => {
          console.log('message ack', ack);
        });
      } else {
        console.warn('Socket not connected, message not sent via WS:', payload);
      }

      setMessageText("");
    } catch (e) {
      console.error('Error sending message:', e);
      setMessageText("");
    }
  };

  const handleChannelSelect = (id: number) => {
    setSelectedChannel(id);
    setMobileShowChat(true);
  };

  return (
    <div className="flex h-full w-full">
      <div className={`${mobileShowChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-white/20 dark:border-gray-700/50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70`}>
        <div className="p-4 border-b border-white/20 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h2>Messages</h2>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <div className="px-3 py-2 text-xs text-muted-foreground mt-4">Direct Messages</div>
            {dmUsers.map((user) => (
              <button
                key={user.id}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${selectedChannel === user.id
                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20"
                    : "hover:bg-white/50 dark:hover:bg-gray-800/50"
                  }`}
                onClick={() => {
                  setSelectedChannel(user.id);
                  setMobileShowChat(true);
                }}
              >
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm truncate flex items-center gap-2">
                      {user.name}
                      {user.isMe && (
                        <span className="inline-flex items-center text-xs text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-0.5 rounded-full">tú</span>
                      )}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className={`${mobileShowChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        <div className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-white/20 dark:border-gray-700/50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70">
          <div className="flex items-center gap-3">
            <Button
              className="md:hidden"
              size="icon"
              variant="ghost"
              onClick={() => setMobileShowChat(false)}
            >
              <Hash className="w-5 h-5" />
            </Button>
            {isDmSelected && currentChannel ? (
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentChannel.avatar || undefined} />
                  <AvatarFallback>{currentChannel.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm">{currentChannel.name} {currentChannel.isMe && <Badge className="ml-2 text-[10px]">tú</Badge>}</h3>
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
        </div>

        <ScrollArea className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((m, index) => {
              const currentUserStr = localStorage.getItem('currentUser');
              const currentUserObj = currentUserStr ? JSON.parse(currentUserStr) : null;
              const myId = currentUserObj?.userId ?? currentUserObj?.id ?? null;
              const isMine = String(m.author_id) === String(myId);
              const dt = new Date(m.createdAt);
              const time = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const date = dt.toLocaleDateString();

              // Use Tailwind classes with `dark:` variants so colors update automatically
              // Do NOT add background colors (user requested no background change).
              const baseBubble = 'max-w-[70%] p-3 rounded-lg break-words';
              const mineText = 'text-gray-900 dark:text-gray-100';
              const otherText = 'text-gray-900 dark:text-gray-100';

              const bubbleClass = `${baseBubble} ${isMine ? `${mineText} rounded-br-none text-right` : `${otherText} rounded-bl-none text-left`}`;

              // find sender info from dmUsers (if available)
              const sender = dmUsers.find(
                (u) => String(u.userId) === String(m.author_id) || u.id === `dm-${m.author_id}`
              );
              const senderAvatar = sender?.avatar || null;
              const senderName = sender?.name || '';

              return (
                <div key={m.id} className={`flex ${isMine ? 'justify-content-right' : 'justify-content-left'}`}>
                  <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={senderAvatar || undefined} />
                      <AvatarFallback>{senderName ? senderName[0] : '?'}</AvatarFallback>
                    </Avatar>

                    <div className={bubbleClass}>
                      <p className="text-sm break-words">{m.content}</p>
                      <div className="text-xs text-muted-foreground mt-1">{time} · {date}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 md:p-6 border-t border-white/20 dark:border-gray-700/50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Input
              className="flex-1 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/50"
              placeholder={`Message ${isDmSelected && currentChannel ? currentChannel.name : `#${  currentChannel?.name}`}`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            />
            <Button size="icon" onClick={handleSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
