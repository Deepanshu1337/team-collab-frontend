import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle2, Clock, AlertCircle, ListTodo } from "lucide-react";

interface MemberStatsProps {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number | string;
  loading?: boolean;
}

export const MemberStatsCard = ({
  totalTasks = 0,
  completedTasks = 0,
  pendingTasks = 0,
  inProgressTasks = 0,
  completionRate = 0,
  loading = false,
}: MemberStatsProps) => {
  if (loading) {
    return (
      <Card className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle>Dashboard Loading...</CardTitle>
        </CardHeader>
        <CardContent className="text-neutral-400">Loading statistics...</CardContent>
      </Card>
    );
  }

  const taskStatuses = [
    {
      label: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      color: "from-green-900/20 to-green-800/20",
      textColor: "text-green-400",
      borderColor: "border-green-700/50",
      iconColor: "text-green-400",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      color: "from-blue-900/20 to-blue-800/20",
      textColor: "text-blue-400",
      borderColor: "border-blue-700/50",
      iconColor: "text-blue-400",
    },
    {
      label: "Pending",
      value: pendingTasks,
      icon: AlertCircle,
      color: "from-yellow-900/20 to-yellow-800/20",
      textColor: "text-yellow-400",
      borderColor: "border-yellow-700/50",
      iconColor: "text-yellow-400",
    },
    {
      label: "Total Assigned",
      value: totalTasks,
      icon: ListTodo,
      color: "from-purple-900/20 to-purple-800/20",
      textColor: "text-purple-400",
      borderColor: "border-purple-700/50",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {taskStatuses.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className={`bg-linear-to-br ${stat.color} border ${stat.borderColor} hover:border-opacity-100 transition`}
            >
              <CardHeader className="pb-2">
                <CardDescription className={`flex items-center gap-2 ${stat.textColor}`}>
                  <Icon className="w-4 h-4" />
                  {stat.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Rate Overview */}
      <Card className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Overall Progress
          </CardTitle>
          <CardDescription>Your task completion rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-neutral-400 mb-2">Completion Rate</p>
                <div className="text-4xl font-bold text-green-400">{typeof completionRate === 'number' ? completionRate.toFixed(1) : parseFloat(completionRate || '0').toFixed(1)}%</div>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-400 mb-2">Tasks Done</p>
                <div className="text-3xl font-bold text-white">
                  {completedTasks} / {totalTasks}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-3 bg-neutral-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-green-500 to-green-400 transition-all duration-500"
                  style={{ width: `${typeof completionRate === 'number' ? completionRate : parseFloat(completionRate || '0')}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-neutral-400">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

