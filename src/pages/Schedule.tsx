
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface Meeting {
    id: string;
    title: string;
    start_time: string;
    created_by: string;
}

const API_URL = "http://localhost:8000"; // Assuming backend runs here

export default function Schedule() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [newMeetingTitle, setNewMeetingTitle] = useState("");

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const res = await fetch(`${API_URL}/meetings/`);
            if (res.ok) {
                const data = await res.json();
                setMeetings(data);
            }
        } catch (error) {
            console.error("Failed to fetch meetings:", error);
        }
    };

    const handleCreateMeeting = async () => {
        if (!newMeetingTitle.trim()) return;
        try {
            const res = await fetch(`${API_URL}/meetings/?title=${encodeURIComponent(newMeetingTitle)}`, {
                method: "POST",
            });
            if (res.ok) {
                setNewMeetingTitle("");
                fetchMeetings();
            }
        } catch (error) {
            console.error("Failed to create meeting:", error);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Meeting Schedule</h1>

            <div className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Schedule a New Meeting</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <Input
                            placeholder="Meeting Title (e.g., Daily Standup)"
                            value={newMeetingTitle}
                            onChange={(e) => setNewMeetingTitle(e.target.value)}
                        />
                        <Button onClick={handleCreateMeeting}>Schedule</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Meetings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {meetings.map((meeting) => (
                                    <TableRow key={meeting.id}>
                                        <TableCell className="font-medium">{meeting.title}</TableCell>
                                        <TableCell>{new Date(meeting.start_time).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Link to={`/meeting/${meeting.id}`}>
                                                <Button variant="outline" size="sm">Join</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {meetings.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                            No meetings scheduled.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
