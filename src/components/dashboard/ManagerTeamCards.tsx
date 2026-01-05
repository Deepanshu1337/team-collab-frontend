import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, FolderOpen } from "lucide-react";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  _id: string;
  name: string;
}

interface Task {
  _id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
}

interface TeamCardProps {
  teamName: string;
  members: TeamMember[];
  projects: Project[];
  tasks: Task[];
}

interface ManagerTeamCardsProps {
  teams: TeamCardProps[];
}

export const ManagerTeamCards = ({ teams }: ManagerTeamCardsProps) => {
  if (!teams || teams.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-400">No teams assigned</h3>
        <p className="text-neutral-500">You are not managing any teams yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team, index) => {
        const totalTasks = team.tasks.length;
        const completedTasks = team.tasks.filter(task => task.status === 'done').length;
        const inProgressTasks = team.tasks.filter(task => task.status === 'in-progress').length;
        const todoTasks = team.tasks.filter(task => task.status === 'todo').length;
        
        return (
          <Card 
            key={index} 
            className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700 hover:border-neutral-600 transition-colors"
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-lg text-neutral-50">{team.teamName}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Team Members */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-400 mb-2 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Members ({team.members.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {team.members.map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-300 truncate">{member.name || member.email}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          member.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                          member.role === 'MANAGER' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-400 mb-2 flex items-center gap-1">
                    <FolderOpen className="w-4 h-4" />
                    Projects ({team.projects.length})
                  </h4>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {team.projects.map((project, idx) => (
                      <div key={idx} className="text-sm text-neutral-300 truncate">
                        {project.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks Summary */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-400 mb-2">Tasks Summary</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-neutral-800/50 rounded">
                      <div className="text-neutral-300 font-medium">{todoTasks}</div>
                      <div className="text-neutral-500">To Do</div>
                    </div>
                    <div className="text-center p-2 bg-neutral-800/50 rounded">
                      <div className="text-neutral-300 font-medium">{inProgressTasks}</div>
                      <div className="text-neutral-500">In Progress</div>
                    </div>
                    <div className="text-center p-2 bg-neutral-800/50 rounded">
                      <div className="text-neutral-300 font-medium">{completedTasks}</div>
                      <div className="text-neutral-500">Done</div>
                    </div>
                  </div>
                  {totalTasks > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-neutral-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-neutral-400 text-center mt-1">
                        {Math.round((completedTasks / totalTasks) * 100)}% completed
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};