import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users } from "lucide-react";

interface Team {
  id: string;
  name: string;
  memberCount?: number;
  projectCount?: number;
  createdAt?: string;
}

interface TeamsListProps {
  teams: Team[];
  loading?: boolean;
  onTeamClick?: (teamId: string) => void;
}

export const TeamsList = ({ teams, loading, onTeamClick }: TeamsListProps) => {
  if (loading) {
    return (
      <Card className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700">
        <CardContent className="pt-6 text-center text-neutral-400">
          Loading teams...
        </CardContent>
      </Card>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <Card className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700">
        <CardContent className="pt-6">
          <div className="text-center">
            <Users className="h-12 w-12 text-neutral-700 mx-auto mb-4 opacity-50" />
            <p className="text-neutral-400">No teams yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <Card
          key={team.id}
          className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700 hover:border-neutral-600 transition-colors cursor-pointer group"
          onClick={() => onTeamClick?.(team.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="group-hover:text-neutral-200 transition-colors">
                {team.name}
              </CardTitle>
              <Users className="h-5 w-5 text-neutral-500 group-hover:text-neutral-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-700">
              {team.memberCount !== undefined && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Members</p>
                  <p className="text-2xl font-bold text-cyan-400">{team.memberCount}</p>
                </div>
              )}
              {team.projectCount !== undefined && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Projects</p>
                  <p className="text-2xl font-bold text-blue-400">{team.projectCount}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
