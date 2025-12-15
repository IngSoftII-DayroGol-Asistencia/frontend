import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "./ui/utils";
import { CardPriority } from "../types/workboard.types";
import { useEffect, useState } from "react";

interface CreateCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        title: string;
        description: string;
        priority: CardPriority;
        due_date: string;
    }) => void;
    listName?: string;
    mode?: "create" | "edit";
    initialData?: {
        title: string;
        description?: string;
        priority: CardPriority;
        due_date: string;
    };
}

export function CreateCardModal({
    isOpen,
    onClose,
    onSubmit,
    listName,
    mode = "create",
    initialData,
}: CreateCardModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<CardPriority>(CardPriority.MEDIUM);
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

    // Sync form values when opening in edit mode
    useEffect(() => {
        if (isOpen && initialData) {
            setTitle(initialData.title ?? "");
            setDescription(initialData.description ?? "");
            setPriority(initialData.priority ?? CardPriority.MEDIUM);
            setDueDate(initialData.due_date ? new Date(initialData.due_date) : undefined);
        } else if (isOpen && !initialData) {
            setTitle("");
            setDescription("");
            setPriority(CardPriority.MEDIUM);
            setDueDate(undefined);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        if (!dueDate) return; // Prevent submission if no date

        onSubmit({
            title: title.trim(),
            description: description.trim(),
            priority,
            due_date: dueDate.toISOString(),
        });

        // Reset form
        setTitle("");
        setDescription("");
        setPriority(CardPriority.MEDIUM);
        setDueDate(undefined);
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const surfaceStyle = {
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
    } as const;

    const sectionStyle = {
        backgroundColor: "var(--card)",
    } as const;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md px-6"
            onClick={handleBackdropClick}
        >
            <div
                className="relative w-full max-w-md rounded-xl shadow-2xl border"
                style={surfaceStyle}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between p-6 border-b"
                    style={sectionStyle}
                >
                    <div>
                        <h3 className="text-lg font-semibold">
                            {mode === "edit" ? "Update Task" : "Create New Task"}
                        </h3>
                        {listName && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Adding to: {listName}
                            </p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-4"
                    style={sectionStyle}
                >
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="Enter task title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Add a more detailed description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    {/* Priority & Due Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={priority}
                                onValueChange={(value: string) => setPriority(value as CardPriority)}
                            >
                                <SelectTrigger id="priority">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={CardPriority.LOW}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            Low
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={CardPriority.MEDIUM}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                            Medium
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={CardPriority.HIGH}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                                            High
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={CardPriority.URGENT}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            Urgent
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Due Date <span className="text-red-500">*</span></Label>
                            <DatePicker
                                selected={dueDate}
                                onChange={(date) => setDueDate(date ?? undefined)}
                                dateFormat="MMM d, yyyy"
                                minDate={new Date()}
                                className={cn(
                                    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                    !dueDate && "text-muted-foreground"
                                )}
                                placeholderText="Select due date"
                                required
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">{mode === "edit" ? "Update Task" : "Create Task"}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
