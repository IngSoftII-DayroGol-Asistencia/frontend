
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, MonitorUp } from "lucide-react";

interface Peer {
    id: string;
    stream: MediaStream;
}

interface ChatMessage {
    sender: string;
    content: string;
}

const WS_URL = "ws://localhost:8000/ws"; // Base WS URL

const CONFIG = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, // Public STUN server
    ],
};

export default function Meeting() {
    const { id: roomId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [clientId] = useState(() => Math.random().toString(36).substring(7));

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [peers, setPeers] = useState<Peer[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const pcsRef = useRef<{ [key: string]: RTCPeerConnection }>({});
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                connectSignal(stream);
            } catch (err) {
                console.error("Failed to access media devices:", err);
            }
        };

        init();

        return () => {
            cleanup();
        };
    }, [roomId]);

    const cleanup = () => {
        localStream?.getTracks().forEach(track => track.stop());
        Object.values(pcsRef.current).forEach(pc => pc.close());
        wsRef.current?.close();
    };

    const connectSignal = (stream: MediaStream) => {
        const ws = new WebSocket(`${WS_URL}/${roomId}/${clientId}`);
        wsRef.current = ws;

        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            handleSignalMessage(data, stream);
        };

        ws.onopen = () => {
            console.log("Connected to signal server");
        };
    };

    const handleSignalMessage = async (data: any, stream: MediaStream) => {
        const { type, sender, payload } = data;

        if (type === "user-joined") {
            createPeerConnection(data.clientId, stream, true);
        } else if (type === "user-left") {
            removePeer(data.clientId);
        } else if (type === "offer") {
            await createPeerConnection(sender, stream, false);
            const pc = pcsRef.current[sender];
            await pc.setRemoteDescription(new RTCSessionDescription(payload));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSignal("answer", sender, answer);
        } else if (type === "answer") {
            const pc = pcsRef.current[sender];
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(payload));
            }
        } else if (type === "ice-candidate") {
            const pc = pcsRef.current[sender];
            if (pc && payload) {
                await pc.addIceCandidate(new RTCIceCandidate(payload));
            }
        } else if (type === "chat") {
            setChatMessages(prev => [...prev, { sender: data.sender, content: data.content }]);
        }
    };

    const createPeerConnection = async (targetId: string, stream: MediaStream, isInitiator: boolean) => {
        if (pcsRef.current[targetId]) return;

        const pc = new RTCPeerConnection(CONFIG);
        pcsRef.current[targetId] = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal("ice-candidate", targetId, event.candidate);
            }
        };

        pc.ontrack = (event) => {
            setPeers(prev => {
                if (prev.find(p => p.id === targetId)) return prev;
                return [...prev, { id: targetId, stream: event.streams[0] }];
            });
        };

        if (isInitiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignal("offer", targetId, offer);
        }
    };

    const sendSignal = (type: string, target: string, payload: any = null) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, target, payload }));
        }
    };

    const removePeer = (id: string) => {
        if (pcsRef.current[id]) {
            pcsRef.current[id].close();
            delete pcsRef.current[id];
        }
        setPeers(prev => prev.filter(p => p.id !== id));
    };

    const sendChat = () => {
        if (!chatInput.trim()) return;

        const msg = { type: "chat", content: chatInput }; // target defaults to broadcast if omitted in backend logic or we set "all"
        // Backend expects: {"type": "chat", "content": "..."}

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg));
            // Add locally
            setChatMessages(prev => [...prev, { sender: "Me", content: chatInput }]);
            setChatInput("");
        }
    };

    const toggleMute = () => {
        localStream?.getAudioTracks().forEach(track => track.enabled = !track.enabled);
        setIsMuted(!isMuted);
    };

    const toggleVideo = () => {
        localStream?.getVideoTracks().forEach(track => track.enabled = !track.enabled);
        setIsVideoOff(!isVideoOff);
    };

    const startRecording = () => {
        if (!localStream) return;

        // Attempt to mix streams if possible, or just record local for MVP
        // For proper multi-user recording client-side, we'd need to mix audio contexts and canvas drawing for video.
        // MVP: Record the tab logic or just the local stream? 
        // Let's try to just record the local stream for now to ensure it works, 
        // as tab capture requires user interaction (getDisplayMedia).

        // Better MVP: Record "Screen Share" (Tab) to capture everything?
        // Let's stick to local stream for simplicity and stability unless requested otherwise.
        // User requested "Optional meeting recording functionality".

        // Let's try getDisplayMedia as it captures the whole meeting UI (useful for meetings)
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
                mediaRecorderRef.current = mediaRecorder;
                recordedChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `meeting-recording-${roomId}.webm`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    stream.getTracks().forEach(track => track.stop()); // Stop sharing
                    setIsRecording(false);
                };

                mediaRecorder.start();
                setIsRecording(true);
            })
            .catch(err => console.error("Error starting screen record:", err));

    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Main Video Area */}
            <div className="flex-1 flex flex-col p-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                    {/* Local User */}
                    <div className="relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                        <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">You</div>
                    </div>

                    {/* Remote Peers */}
                    {peers.map(peer => (
                        <VideoPlayer key={peer.id} stream={peer.stream} id={peer.id} />
                    ))}
                </div>

                {/* Controls */}
                <div className="h-16 mt-4 bg-gray-800 rounded-lg flex items-center justify-center gap-4">
                    <Button variant={isMuted ? "destructive" : "secondary"} size="icon" onClick={toggleMute}>
                        {isMuted ? <MicOff /> : <Mic />}
                    </Button>
                    <Button variant={isVideoOff ? "destructive" : "secondary"} size="icon" onClick={toggleVideo}>
                        {isVideoOff ? <VideoOff /> : <Video />}
                    </Button>
                    <Button variant={isRecording ? "destructive" : "secondary"} size="icon" onClick={isRecording ? stopRecording : startRecording}>
                        <MonitorUp className={isRecording ? "animate-pulse" : ""} />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => { cleanup(); navigate('/schedule'); }}>
                        <PhoneOff />
                    </Button>
                </div>
            </div>

            {/* Chat Sidebar */}
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700 font-bold flex items-center gap-2">
                    <MessageSquare size={18} /> Chat
                </div>
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {chatMessages.map((msg, i) => (
                            <div key={i} className={`p-2 rounded ${msg.sender === 'Me' ? 'bg-blue-600 ml-auto' : 'bg-gray-700'} max-w-[80%]`}>
                                <div className="text-xs opacity-50 mb-1">{msg.sender}</div>
                                <div className="text-sm">{msg.content}</div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t border-gray-700 flex gap-2">
                    <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                        placeholder="Type a message..."
                        className="bg-gray-900 border-gray-700"
                    />
                    <Button size="icon" onClick={sendChat}>
                        <MessageSquare size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function VideoPlayer({ stream, id }: { stream: MediaStream, id: string }) {
    const ref = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (ref.current) ref.current.srcObject = stream;
    }, [stream]);

    return (
        <div className="relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">User {id}</div>
        </div>
    );
}
