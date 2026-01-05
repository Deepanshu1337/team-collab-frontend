import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { FolderOpen, Users } from "lucide-react";

interface Project {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  teamId?: string;
}

interface AdminProjectsProps {
  projects: Project[];
  onProjectClick?: (projectId: string) => void;
}

export const AdminProjects = ({ projects, onProjectClick }: AdminProjectsProps) => {
  if (!projects || projects.length === 0) {
    return (
      <Card className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700">
        <CardContent className="pt-6">
          <div className="text-center">
            <FolderOpen className="h-12 w-12 text-neutral-700 mx-auto mb-4 opacity-50" />
            <p className="text-neutral-400">No projects yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card
          key={project._id}
          className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700 hover:border-neutral-600 transition-colors cursor-pointer group"
          onClick={() => onProjectClick?.(project._id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg group-hover:text-neutral-200 transition-colors">
                  {project.name}
                </CardTitle>
                <CardDescription className="mt-2 text-neutral-400">
                  {project.description || "No description"}
                </CardDescription>
              </div>
              <FolderOpen className="h-5 w-5 text-neutral-500 group-hover:text-neutral-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between pt-4 border-t border-neutral-700">
              <span className="text-xs text-neutral-500">
                {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <Users className="w-3 h-3" />
                Manager
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
