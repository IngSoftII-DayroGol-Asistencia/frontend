import { Video, Phone, Users, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";

export function VideoCallContent() {
  const upcomingCalls = [
    {
      id: 1,
      title: "Team Standup",
      time: "10:00 AM",
      participants: 8,
      duration: "30 min",
    },
    {
      id: 2,
      title: "Client Presentation",
      time: "2:00 PM",
      participants: 4,
      duration: "1 hour",
    },
    {
      id: 3,
      title: "Design Review",
      time: "4:30 PM",
      participants: 5,
      duration: "45 min",
    },
  ];

  const recentContacts = [
    {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      status: "online",
    },
    {
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      status: "online",
    },
    {
      name: "Emily Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      status: "offline",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
        <div>
          <h2>Video Calls</h2>
          <p className="text-muted-foreground text-sm md:text-base">Start a call or join a scheduled meeting</p>
        </div>
        <Button className="gap-2 w-full md:w-auto">
          <Video className="w-4 h-4" />
          New Meeting
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Quick Actions */}
        <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-gray-700/50">
          <CardHeader>
            <h3>Quick Actions</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-left">
                <div>Start Instant Meeting</div>
                <div className="text-xs text-muted-foreground">Begin a video call right now</div>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-left">
                <div>Schedule Meeting</div>
                <div className="text-xs text-muted-foreground">Plan a call for later</div>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-left">
                <div>Join with Code</div>
                <div className="text-xs text-muted-foreground">Enter a meeting code</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Contacts */}
        <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-gray-700/50">
          <CardHeader>
            <h3>Recent Contacts</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentContacts.map((contact) => (
              <div key={contact.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>{contact.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                      contact.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div>
                    <div className="text-sm">{contact.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{contact.status}</div>
                  </div>
                </div>
                <Button size="icon" variant="ghost">
                  <Video className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Meetings */}
      <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-gray-700/50">
        <CardHeader>
          <h3>Upcoming Meetings</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingCalls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 rounded-lg border border-white/20 dark:border-gray-700/50 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4>{call.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{call.time}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {call.participants}
                      </span>
                      <span>•</span>
                      <span>{call.duration}</span>
                    </div>
                  </div>
                </div>
                <Button>Join</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
