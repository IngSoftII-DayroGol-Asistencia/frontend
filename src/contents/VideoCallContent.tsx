import { Video, Users, Mic, MicOff, VideoOff, PhoneOff, MessageSquare } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";

// --- Types & Interfaces ---

type SignalType = "offer" | "answer" | "ice-candidate" | "user-joined" | "user-left" | "chat";

interface SignalMessage {
  type: SignalType;
  target?: string;
  sender?: string;
  payload?: any;
  content?: string;
  clientId?: string;
}

// --- Meeting Service Logic (Internal) ---

class MeetingService {
  private ws: WebSocket | null = null;
  private localStream: MediaStream | null = null;
  private peers: Map<string, RTCPeerConnection> = new Map();
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();
  private config: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };
  myClientId: string = "";
  roomId: string = "";
  // Base URL for WebSocket
  private wsUrl: string = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

  generateClientId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  async connect(roomId: string, clientId?: string): Promise<void> {
    this.roomId = roomId;
    this.myClientId = clientId || this.generateClientId();

    const fullUrl = `${this.wsUrl}/ws/${this.roomId}/${this.myClientId}`;
    this.ws = new WebSocket(fullUrl);

    this.ws.onopen = () => {
      console.log("Connected to signal server");
      this.emit("connected", { clientId: this.myClientId });
    };

    this.ws.onmessage = async (event) => {
      const data = JSON.parse(event.data) as SignalMessage;
      this.handleSignal(data);
    };

    this.ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      this.emit("error", err);
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      this.emit("disconnected", {});
    };
  }

  async getLocalStream(video: boolean = true, audio: boolean = true): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
      this.localStream = stream;
      return stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      throw err;
    }
  }

  toggleMicrophone(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => track.enabled = enabled);
    }
  }

  toggleCamera(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => track.enabled = enabled);
    }
  }

  private async handleSignal(data: SignalMessage) {
    switch (data.type) {
      case "user-joined":
        if (data.clientId) {
          this.initiateConnection(data.clientId);
          this.emit("user-joined", data.clientId);
        }
        break;
      case "offer":
        if (data.sender && data.payload) {
          // If we receive an offer, notify UI that peer exists (even if no stream yet)
          if (!this.peers.has(data.sender)) {
            this.emit("user-joined", data.sender);
          }
          this.handleOffer(data.sender, data.payload);
        }
        break;
      case "answer":
        if (data.sender && data.payload) this.handleAnswer(data.sender, data.payload);
        break;
      case "ice-candidate":
        if (data.sender && data.payload) this.handleIceCandidate(data.sender, data.payload);
        break;
      case "user-left":
        this.removePeer(data.clientId);
        this.emit("user-left", data.clientId);
        break;
      case "chat":
        this.emit("chat", { sender: data.sender, content: data.content });
        break;
    }
  }

  private async initiateConnection(targetClientId: string) {
    if (this.peers.has(targetClientId)) return;

    const pc = this.createPeerConnection(targetClientId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    this.sendSignal({ type: "offer", target: targetClientId, payload: offer });
  }

  private async handleOffer(senderId: string, offer: RTCSessionDescriptionInit) {
    const pc = this.createPeerConnection(senderId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.sendSignal({ type: "answer", target: senderId, payload: answer });
  }

  private async handleAnswer(senderId: string, answer: RTCSessionDescriptionInit) {
    const pc = this.peers.get(senderId);
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  private async handleIceCandidate(senderId: string, candidate: RTCIceCandidateInit) {
    const pc = this.peers.get(senderId);
    if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  private createPeerConnection(peerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(this.config);
    this.peers.set(peerId, pc);

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => pc.addTrack(track, this.localStream!));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({ type: "ice-candidate", target: peerId, payload: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      this.emit("track", { peerId, stream: event.streams[0] });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.removePeer(peerId);
        this.emit("user-left", peerId);
      }
    }

    return pc;
  }

  private removePeer(peerId?: string) {
    if (!peerId) return;
    const pc = this.peers.get(peerId);
    if (pc) {
      pc.close();
      this.peers.delete(peerId);
    }
  }

  sendSignal(message: SignalMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  sendChat(content: string) {
    this.sendSignal({ type: "chat", content: content });
  }

  disconnect() {
    this.peers.forEach(pc => pc.close());
    this.peers.clear();
    if (this.ws) this.ws.close();
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) this.eventListeners.set(event, []);
    this.eventListeners.get(event)?.push(callback);
  }

  private emit(event: string, data: any) {
    this.eventListeners.get(event)?.forEach(cb => cb(data));
  }
}

// --- Main Component ---

export function VideoCallContent() {
  const [inCall, setInCall] = useState(false);
  const [meetingId, setMeetingId] = useState("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string, content: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const meetingServiceRef = useRef<MeetingService | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      leaveMeeting();
    };
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const startMeeting = async (id: string = "test-room") => {
    setMeetingId(id);
    setInCall(true);

    // Initialize Service
    meetingServiceRef.current = new MeetingService();
    const service = meetingServiceRef.current;

    try {
      try {
        const stream = await service.getLocalStream();
        setLocalStream(stream);
      } catch (err) {
        console.warn("Could not access camera/microphone, proceeding without media.", err);
      }

      service.on("track", (data: { peerId: string, stream: MediaStream }) => {
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.set(data.peerId, data.stream);
          return newMap;
        });
      });

      service.on("user-joined", (peerId: string) => {
        setConnectedPeers(prev => {
          if (prev.includes(peerId)) return prev;
          return [...prev, peerId];
        });
      });

      service.on("user-left", (peerId: string) => {
        setConnectedPeers(prev => prev.filter(p => p !== peerId));
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(peerId);
          return newMap;
        });
      });

      service.on("chat", (msg: { sender: string, content: string }) => {
        setChatMessages(prev => [...prev, msg]);
      });

      await service.connect(id);
    } catch (error) {
      console.error("Failed to connect to meeting server", error);
      alert("Failed to connect to the meeting server.");
      setInCall(false);
    }
  };

  const leaveMeeting = () => {
    if (meetingServiceRef.current) {
      meetingServiceRef.current.disconnect();
      meetingServiceRef.current = null;
    }
    setLocalStream(null);
    setRemoteStreams(new Map());
    setConnectedPeers([]);
    setInCall(false);
    setChatMessages([]);
  };

  const toggleMute = () => {
    if (meetingServiceRef.current) {
      meetingServiceRef.current.toggleMicrophone(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (meetingServiceRef.current) {
      meetingServiceRef.current.toggleCamera(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const sendChat = () => {
    if (!currentMessage.trim() || !meetingServiceRef.current) return;
    meetingServiceRef.current.sendChat(currentMessage);
    setChatMessages(prev => [...prev, { sender: "Me", content: currentMessage }]);
    setCurrentMessage("");
  };

  if (inCall) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b flex items-center justify-between px-6 bg-card">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Meeting: {meetingId}</h3>
          </div>
          <Button variant="destructive" onClick={leaveMeeting}>Leave Meeting</Button>
        </div>

        {/* Main Content: Video Grid & Chat */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video Grid */}
          <div className="flex-1 p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {/* Local Video */}
            <Card className="relative overflow-hidden bg-black/90 border-0 flex items-center justify-center">
              {localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <Users className="w-10 h-10 opacity-50" />
                  <span className="text-sm">You (No Media)</span>
                </div>
              )}
              <div className="absolute bottom-4 left-4 text-white font-medium bg-black/50 px-2 py-1 rounded">You</div>
            </Card>

            {/* Remote Videos */}
            {connectedPeers.map((peerId) => (
              <RemoteVideo
                key={peerId}
                peerId={peerId}
                stream={remoteStreams.get(peerId) || null}
              />
            ))}
          </div>

          {/* Chat Sidebar */}
          <div className="w-80 border-l bg-card flex flex-col">
            <div className="p-4 border-b font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.sender === 'Me' ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-muted-foreground mb-1">{msg.sender}</span>
                    <div className={`px-3 py-2 rounded-lg text-sm ${msg.sender === 'Me'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Type a message..."
              />
              <Button size="icon" onClick={sendChat}>
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="h-20 border-t bg-card flex items-center justify-center gap-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          <Button
            variant={isVideoOff ? "destructive" : "secondary"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleVideo}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </Button>
          <Button
            variant="destructive"
            className="h-12 px-8 rounded-full gap-2"
            onClick={leaveMeeting}
          >
            <PhoneOff className="w-5 h-5" />
            End Call
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[80vh] space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Team Meeting</h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Join the general video call to collaborate with your team in real-time.
        </p>
      </div>

      <Card className="w-full max-w-md border-2 shadow-xl backdrop-blur-xl bg-white/40 dark:bg-black/60 dark:border-white/10">
        <CardContent className="p-8 flex flex-col items-center gap-6">
          <div className="relative">
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <Badge variant="outline" className="px-4 py-1.5 text-sm uppercase tracking-wider bg-white/50 dark:bg-white/5">
              General Room
            </Badge>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">Ready to join?</h3>
            <p className="text-sm text-muted-foreground">Always available for team syncs</p>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg gap-3 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
            onClick={() => startMeeting("general")}
          >
            <Video className="w-6 h-6" />
            Join Call Now
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Make sure your camera and microphone are ready
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for remote video to handle ref lifecycle
function RemoteVideo({ peerId, stream }: { peerId: string, stream: MediaStream | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <Card className="relative overflow-hidden bg-black/90 border-0 flex items-center justify-center">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
          <Users className="w-10 h-10 opacity-50" />
          <span className="text-sm">No Video</span>
        </div>
      )}
      <div className="absolute bottom-4 left-4 text-white font-medium bg-black/50 px-2 py-1 rounded">
        Remote User {peerId.substring(0, 4)}
      </div>
    </Card>
  );
}
