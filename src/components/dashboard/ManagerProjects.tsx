import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { FolderOpen, Lock, Eye } from "lucide-react";

interface Project {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  managerName?: string;
  memberCount?: number;
}

interface ManagerProjectsProps {
  projectsAsManager: Project[];
  projectsAsMember: Project[];
  onProjectClick?: (projectId: string) => void;
}

export const ManagerProjects = ({
  projectsAsManager = [],
  projectsAsMember = [],
  onProjectClick,
}: ManagerProjectsProps) => {
  
  const renderProjectCard = (project: Project, isManager: boolean) => (
    <Card
      key={project._id}
      className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700 hover:border-neutral-600 transition-colors cursor-pointer group"
      onClick={() => onProjectClick?.(project._id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg group-hover:text-neutral-200 transition-colors">
                {project.name}
              </CardTitle>
              
            </div>
            <CardDescription className="mt-2">
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
          <span className="text-xs text-neutral-400">
            {isManager ? "Manager" : "Member"}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  console.log("projectsAsMember", projectsAsMember)
  console.log("projectsAsManager", projectsAsManager)
  return (
    <div className="space-y-8">
      {/** Pre-calculate today fallback to avoid impure Date.now calls */}
      {/** This is safe and stable during render */}
      {/** Using a local variable ensures purity */}
      {/** */}
      {/** */}
      {/** */}
      {/* Projects where manager is the manager */}
      {projectsAsManager && projectsAsManager.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-neutral-200 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-400" />
            Projects (You are Manager)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsAsManager.map((project) => renderProjectCard(project, true))}
          </div>
        </div>
      )}

      {/* Projects where manager is a member */}
      {projectsAsMember && projectsAsMember.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-neutral-200 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-yellow-400" />
            Projects (You are Member)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsAsMember.map((project) => renderProjectCard(project, false))}
          </div>
        </div>
      )}

      {/* No projects */}
      {(!projectsAsManager || projectsAsManager.length === 0) &&
        (!projectsAsMember || projectsAsMember.length === 0) && (
          <Card className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <FolderOpen className="h-12 w-12 text-neutral-700 mx-auto mb-4 opacity-50" />
                <p className="text-neutral-400">No projects yet</p>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
};
