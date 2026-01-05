import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { User } from "lucide-react";

interface UserCardProps {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

export const UserCard = ({ name = "User", email = "user@example.com", role = "MEMBER" }: UserCardProps) => {
  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-800",
    MANAGER: "bg-blue-100 text-blue-800",
    MEMBER: "bg-green-100 text-green-800",
  };

  const roleColor = roleColors[role as string] || "bg-gray-100 text-gray-800";

  return (
    <Card className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{name || "User"}</CardTitle>
              <CardDescription className="text-sm text-neutral-400">{email || "user@example.com"}</CardDescription>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${roleColor}`}>
            {role || "MEMBER"}
          </span>
        </div>
      </CardHeader>
    </Card>
  );
};
