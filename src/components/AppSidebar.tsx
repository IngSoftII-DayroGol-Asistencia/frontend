import { Home, Video, MessageSquare, LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({ activeSection, onSectionChange, collapsed, onToggleCollapse }: AppSidebarProps) {
  const sections = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'video', icon: Video, label: 'Video Calls' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ];

  return (
    <aside className={`min-h-0 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'
      } md:sticky md:top-[var(--navbar-height,4rem)] md:self-start md:h-[calc(100vh-var(--navbar-height,4rem))] md:overflow-auto`}>
      <div className="flex-1 p-3 space-y-2 pt-6 flex flex-col">
        <TooltipProvider delayDuration={0}>
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            const button = (
              <Button
                key={section.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full gap-3 ${collapsed ? 'justify-center px-0' : 'justify-start'
                  } ${isActive
                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-500/20"
                    : ""
                  }`}
                onClick={() => onSectionChange(section.id)}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{section.label}</span>}
              </Button>
            );

            if (collapsed) {
              return (
                <Tooltip key={section.id}>
                  <TooltipTrigger asChild>
                    {button}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {section.label}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return button;
          })}

          {/* Collapse button next to the top buttons */}
          <div className="pt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full gap-3 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-colors ${collapsed ? 'justify-center px-0' : 'justify-start'}`}
                  onClick={onToggleCollapse}
                >
                  {collapsed ? (
                    <ChevronRight className="w-5 h-5 shrink-0" />
                  ) : (
                    <>
                      <ChevronLeft className="w-5 h-5 shrink-0" />
                      <span>Collapse</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">{collapsed ? 'Expand' : 'Collapse'}</TooltipContent>
              )}
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      {/* removed bottom collapse area - collapse is now with top buttons */}
    </aside>
  );
}
