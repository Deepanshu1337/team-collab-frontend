import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.tsx";
import { Button } from "../ui/button";
import { Plus, BarChart3, FolderOpen, Users, LayoutGrid } from "lucide-react";

interface DashboardTabsProps {
  role: "ADMIN" | "MANAGER" | "MEMBER";
  onCreateProject?: () => void;
  onCreateTask?: () => void;
  children: {
    dashboard: React.ReactNode;
    projects?: React.ReactNode;
    teams?: React.ReactNode;
    tasks?: React.ReactNode;
  };
}

export const DashboardTabs = ({
  role,
  onCreateProject,
  onCreateTask,
  children,
}: DashboardTabsProps) => {
  const getTabs = () => {
    switch (role) {
      case "ADMIN":
        return ["dashboard", "projects", "teams"];
      case "MANAGER":
        return ["dashboard", "projects", "teams", "tasks"];
      case "MEMBER":
        return ["dashboard", "teams", "tasks"];
      default:
        return ["dashboard"];
    }
  };

  const tabs = getTabs();

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "dashboard":
        return <BarChart3 className="w-4 h-4" />;
      case "projects":
        return <FolderOpen className="w-4 h-4" />;
      case "teams":
        return <Users className="w-4 h-4" />;
      case "tasks":
        return <LayoutGrid className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <div className="flex items-center justify-between mb-6 border-b border-neutral-700">
          <TabsList className="bg-transparent border-0 space-x-0 h-auto p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                {getTabIcon(tab)}
                <span className="capitalize">{tab}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex gap-2">
            {role !== "MEMBER" && (
              <>
                {(role === "ADMIN" || role === "MANAGER") && (
                  <Button onClick={onCreateProject} size="sm" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Project
                  </Button>
                )}
              </>
            )}
            {role !== "MEMBER" && role !== "ADMIN" && (
              <Button onClick={onCreateTask} size="sm" variant="outline" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Task
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="dashboard" className="space-y-4">
          {children.dashboard}
        </TabsContent>

        {tabs.includes("projects") && (
          <TabsContent value="projects" className="space-y-4">
            {children.projects}
          </TabsContent>
        )}

        {tabs.includes("teams") && (
          <TabsContent value="teams" className="space-y-4">
            {children.teams}
          </TabsContent>
        )}

        {tabs.includes("tasks") && (
          <TabsContent value="tasks" className="space-y-4">
            {children.tasks}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
