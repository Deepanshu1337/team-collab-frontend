import type { ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth as firebaseAuth } from "../../firebase/firebase";
import { logout } from "../../store/auth.slice";
import type { RootState } from "../../store";
import { Button } from "../ui/button";
import { LogOut, Home, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);
  const role = useSelector((s: RootState) => s.auth.role);

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  // Determine tabs based on role
  const getTabs = () => {
    if (role === "ADMIN") {
      return [
        { value: "dashboard", label: "Dashboard", path: "/dashboard" },
        { value: "teams", label: "Teams", path: "/admin/teams" },
        { value: "projects", label: "Projects", path: "/admin/projects" },
        { value: "chat", label: "Chat", path: "/chat" },
      ];
    } else if (role === "MANAGER") {
      return [
        { value: "dashboard", label: "Dashboard", path: "/dashboard" },
        { value: "projects", label: "My Projects", path: "/projects" },
        { value: "tasks", label: "Tasks", path: "/manager/tasks" },
        { value: "chat", label: "Chat", path: "/chat" },
      ];
    } else {
      // MEMBER
      return [
        { value: "dashboard", label: "Dashboard", path: "/dashboard" },
        { value: "projects", label: "My Projects", path: "/projects" },
        { value: "tasks", label: "My Tasks", path: "/member/tasks" },
        { value: "chat", label: "Chat", path: "/chat" },
      ];
    }
  };

  const tabs = getTabs();
  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div onClick={() => navigate("/dashboard")} className="cursor-pointer">
              <h1 className="text-2xl font-bold text-neutral-50 hover:text-neutral-200 transition-colors">
                TeamCollab
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-4">
              <Tabs
                defaultValue="dashboard"
                onValueChange={(v) => {
                  const tab = tabs.find(t => t.value === v);
                  if (tab) navigate(tab.path);
                }}
              >
                <TabsList>
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 cursor-pointer">
                      {tab.value === "dashboard" && <Home className="h-4 w-4" />}
                      {(tab.value === "teams" || tab.value === "projects") && <Users className="h-4 w-4" />}
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </nav>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-neutral-50">{user?.name || "User"}</p>
              <p className="text-xs text-neutral-500">{user?.email || "Loading..."}</p>
            </div>

            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">
                {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
              </span>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-neutral-950">{children}</main>
    </div>
  );
};

export default AppLayout;
