import { Home, Video, MessageSquare, LayoutDashboard, X } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./ui/sheet";

interface MobileSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ activeSection, onSectionChange, open, onOpenChange }: MobileSidebarProps) {
  const sections = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'video', icon: Video, label: 'Video Calls' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ];

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className="p-0 w-64 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-white/20 dark:border-gray-700/50"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Navigate between different sections of the application
        </SheetDescription>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white">N</span>
              </div>
              <span>Nexus</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-3 space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-500/20"
                      : ""
                  }`}
                  onClick={() => handleSectionChange(section.id)}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{section.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
