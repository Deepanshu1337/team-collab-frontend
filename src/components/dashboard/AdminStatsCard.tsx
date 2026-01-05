import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Users, FolderOpen, BarChart3 } from "lucide-react";

interface AdminStatsProps {
  totalTeams: number;
  totalProjects: number;
  totalMembers: number;
  loading?: boolean;
}

export const AdminStatsCard = ({
  totalTeams = 0,
  totalProjects = 0,
  totalMembers = 0,
  loading = false,
}: AdminStatsProps) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Teams */}
        <Card className="bg-linear-to-br from-blue-900/20 to-blue-800/20 border-blue-700/50 hover:border-blue-600 transition">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-blue-300">
              <BarChart3 className="w-4 h-4" />
              Total Teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalTeams}</div>
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
              Total Members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalMembers}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
