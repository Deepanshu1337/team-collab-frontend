import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Badge } from "../ui/badge";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  createdAt?: string;
}

interface MemberTasksProps {
  tasks: Task[];
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  loading?: boolean;
  onTaskClick?: (taskId: string) => void;
}

export const MemberTasks = ({
  tasks = [],
  totalTasks = 0,
  completedTasks = 0,
  pendingTasks = 0,
  inProgressTasks = 0,
  loading = false,
  onTaskClick,
}: MemberTasksProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "todo":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "done":
        return <Badge className="bg-green-500/20 text-green-300 border-green-700">Done</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-700">In Progress</Badge>;
      case "todo":
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-700">Pending</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700">
        <CardContent className="pt-6 text-center text-neutral-400">
          Loading tasks...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-purple-900/20 to-purple-800/20 border-purple-700/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-300">Total Assigned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-900/20 to-green-800/20 border-green-700/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-green-300">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{completedTasks}</div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-700/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-yellow-300">
              <AlertCircle className="w-4 h-4" />
              Pending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">{pendingTasks}</div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-blue-900/20 to-blue-800/20 border-blue-700/50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-blue-300">
              <Clock className="w-4 h-4" />
              In Progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{inProgressTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      {tasks && tasks.length > 0 ? (
        <Card className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle>Your Tasks</CardTitle>
            <CardDescription>View and manage your assigned tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => onTaskClick?.(task._id)}
                  className="p-4 rounded-lg bg-neutral-700/50 hover:bg-neutral-700 transition-colors cursor-pointer border border-neutral-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {getStatusIcon(task.status)}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-neutral-400 line-clamp-2">{task.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(task.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-neutral-700 mx-auto mb-4 opacity-50" />
              <p className="text-neutral-400">No tasks assigned yet</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
