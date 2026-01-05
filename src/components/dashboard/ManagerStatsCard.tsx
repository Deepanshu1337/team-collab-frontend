import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Users, FolderOpen, BarChart3, Award } from "lucide-react";

interface TopMember {
  id: string;
  name: string;
  email: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

interface ManagerStatsProps {
  totalAssignedTeams: number;
  totalProjects: number;
  totalMembers: number;
  topMember: TopMember | null;
  loading?: boolean;
}

export const ManagerStatsCard = ({
  totalAssignedTeams = 0,
  totalProjects = 0,
  totalMembers = 0,
  topMember = null,
  loading = false,
}: ManagerStatsProps) => {
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Assigned Teams */}
        <Card className="bg-linear-to-br from-blue-900/20 to-blue-800/20 border-blue-700/50 hover:border-blue-600 transition">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-blue-300">
              <BarChart3 className="w-4 h-4" />
              Assigned Teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalAssignedTeams}</div>
          </CardContent>
        </Card>

        {/* Total Projects */}
        <Card className="bg-linear-to-br from-purple-900/20 to-purple-800/20 border-purple-700/50 hover:border-purple-600 transition">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-purple-300">
              <FolderOpen className="w-4 h-4" />
              Total Projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalProjects}</div>
          </CardContent>
        </Card>

        {/* Total Members */}
        <Card className="bg-linear-to-br from-cyan-900/20 to-cyan-800/20 border-cyan-700/50 hover:border-cyan-600 transition">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-cyan-300">
              <Users className="w-4 h-4" />
              Team Members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalMembers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Member */}
      <Card className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Top Performer
          </CardTitle>
          <CardDescription>Member with highest task completion rate</CardDescription>
        </CardHeader>
        <CardContent>
          {topMember ? (
            <div className="p-4 rounded-lg bg-linear-to-br from-yellow-900/20 to-yellow-800/20 border border-yellow-700/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-white text-lg">{topMember.name}</p>
                  <p className="text-sm text-neutral-400">{topMember.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-400">{topMember.completionRate}%</div>
                  <p className="text-xs text-neutral-400">completion rate</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-300">Completed Tasks</span>
                  <span className="text-white font-medium">
                    {topMember.completedTasks} / {topMember.totalTasks}
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-yellow-500 to-yellow-400 transition-all duration-300"
                    style={{ width: `${topMember.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-neutral-400 text-center py-8">No team members yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

