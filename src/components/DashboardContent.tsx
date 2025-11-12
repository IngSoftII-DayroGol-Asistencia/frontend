import { Plus, MoreVertical } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function DashboardContent() {
  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      color: 'bg-gray-500',
      tasks: [
        {
          id: 1,
          title: 'Design new landing page',
          description: 'Create mockups for the new landing page design',
          priority: 'high',
          assignees: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'],
        },
        {
          id: 2,
          title: 'Update documentation',
          description: 'Add new API endpoints to the docs',
          priority: 'medium',
          assignees: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'],
        },
      ],
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      color: 'bg-blue-500',
      tasks: [
        {
          id: 3,
          title: 'Implement dark mode',
          description: 'Add dark mode support across the application',
          priority: 'high',
          assignees: [
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
          ],
        },
      ],
    },
    {
      id: 'review',
      title: 'Review',
      color: 'bg-yellow-500',
      tasks: [
        {
          id: 4,
          title: 'Code review PR #234',
          description: 'Review authentication refactor pull request',
          priority: 'medium',
          assignees: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'],
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      color: 'bg-green-500',
      tasks: [
        {
          id: 5,
          title: 'Fix navigation bug',
          description: 'Resolved issue with mobile navigation',
          priority: 'high',
          assignees: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'],
        },
        {
          id: 6,
          title: 'Setup CI/CD pipeline',
          description: 'Automated testing and deployment',
          priority: 'low',
          assignees: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'],
        },
      ],
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
        <div>
          <h2>Project Dashboard</h2>
          <p className="text-muted-foreground text-sm md:text-base">Manage your tasks and projects</p>
        </div>
        <Button className="gap-2 w-full md:w-auto">
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <div key={column.id} className="min-w-[280px] md:min-w-0 w-[280px] md:w-auto">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3>{column.title}</h3>
                <Badge variant="secondary">{column.tasks.length}</Badge>
              </div>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {column.tasks.map((task) => (
                <Card key={task.id} className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-gray-700/50 hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm">{task.title}</h4>
                      <Button variant="ghost" size="icon" className="w-6 h-6 -mt-1 -mr-2">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                      
                      <div className="flex -space-x-2">
                        {task.assignees.map((avatar, idx) => (
                          <Avatar key={idx} className="w-6 h-6 border-2 border-white dark:border-gray-900">
                            <AvatarImage src={avatar} />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
