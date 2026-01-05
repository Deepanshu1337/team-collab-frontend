import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { setCredentials } from '../../store/auth.slice';
import axios from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Users, Mail, Crown, ShieldAlert, UserCheck, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  assignedTo?: string;
  projectId: string;
}

interface Team {
  _id: string;
  name: string;
  description?: string;
  adminId: string;
  createdAt: string;
  memberCount?: number;
}

const TeamOverview = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const role = useSelector((s: RootState) => s.auth.role);
  const { teamId } = useParams<{ teamId: string }>();
  const user = useSelector((s: RootState) => s.auth.user);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [memberTaskStats, setMemberTaskStats] = useState<Record<string, TaskStats>>({});
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviting, setInviting] = useState(false);
  
  // State for inviting existing users
  const [existingUsersOpen, setExistingUsersOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  
  // State for pending invitations
  const [pendingInvitesOpen, setPendingInvitesOpen] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [fetchingPending, setFetchingPending] = useState(false);

  // Team creation state
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamError, setTeamError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ _id: string; name: string; description?: string; createdAt?: string }>>([]);

  // Remove member dialog state
  const [removeMemberOpen, setRemoveMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [removingMember, setRemovingMember] = useState(false);


  useEffect(() => {
    if (teamId) {
      fetchMembers();
      fetchTeamInfo();
      fetchTaskStats();
    }
  }, [teamId]);

  const fetchMembers = async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/teams/${teamId}/members`);
      setMembers(res.data);
    } catch (e) {
      console.error('Failed to fetch members', e);
      toast.error('Failed to load team members. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamInfo = async () => {
    if (!teamId) return;
    try {
      const res = await axios.get(`/api/teams/${teamId}`);
      setTeam(res.data);
    } catch (e) {
      console.error('Failed to fetch team info', e);
      toast.error('Failed to load team information. Please try again later.');
    }
  };

  const fetchTaskStats = async () => {
    if (!teamId) return;
    try {
      // Get all projects for this team
      const projectsRes = await axios.get(`/api/teams/project/${teamId}`);
      const projects = projectsRes.data || [];

      // Create a map to store task stats for each member
      const statsMap: Record<string, TaskStats> = {};

      // For each project, get tasks and count them by assigned member
      for (const project of projects) {
        const tasksRes = await axios.get(`/api/tasks/${teamId}/projects/${project._id}/tasks`);
        const tasks = tasksRes.data || [];

        // Count tasks for each member
        tasks.forEach((task: Task) => {
          const memberId = task.assignedTo;
          if (!memberId) return; // Skip tasks not assigned to anyone

          if (!statsMap[memberId]) {
            statsMap[memberId] = { total: 0, completed: 0, pending: 0 };
          }

          statsMap[memberId].total += 1;

          if (task.status === 'done') {
            statsMap[memberId].completed += 1;
          } else {
            statsMap[memberId].pending += 1;
          }
        });
      }

      setMemberTaskStats(statsMap);
    } catch (e) {
      console.error('Failed to fetch task stats', e);
      toast.error('Failed to load task statistics. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      if (!teamId) return;
      try {
        const res = await axios.get(`/api/teams/project/${teamId}`);
        setProjects(res.data || []);
      } catch (e) {
        setProjects([]);
        toast.error('Failed to load assigned projects. Please try again later.');
      }
    };
    fetchProjects();
  }, [teamId]);
  
  useEffect(() => {
    if (existingUsersOpen && teamId) {
      fetchAvailableUsers();
    }
  }, [existingUsersOpen, teamId]);
  
  useEffect(() => {
    if (pendingInvitesOpen && teamId) {
      fetchPendingInvitations();
    }
  }, [pendingInvitesOpen, teamId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !teamId) return;
    setInviting(true);
    try {
      await axios.post(`/api/teams/${teamId}/invite`, {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail('');
      setInviteRole('MEMBER');
      setInviteOpen(false);
      await fetchMembers();
      toast.success('Member invited successfully!');
    } catch (e) {
      console.error('Failed to invite member', e);
      toast.error('Failed to invite member. Please try again.');
    } finally {
      setInviting(false);
    }
  };
  
  const fetchAvailableUsers = async () => {
    if (!teamId) return;
    setFetchingUsers(true);
    try {
      const res = await axios.get(`/api/teams/${teamId}/available-users`);
      setAvailableUsers(res.data || []);
    } catch (e) {
      console.error('Failed to fetch available users', e);
      setAvailableUsers([]);
      toast.error('Failed to load available users. Please try again later.');
    } finally {
      setFetchingUsers(false);
    }
  };
  
  const handleInviteExistingUsers = async () => {
    if (!teamId || Object.keys(selectedUsers).length === 0) return;
    
    setInviting(true);
    try {
      // Process each selected user
      for (const userId of Object.keys(selectedUsers)) {
        if (selectedUsers[userId]) {
          const user = availableUsers.find(u => u._id === userId);
          if (user) {
            // Determine role based on whether user was selected as manager
            const role = selectedManager === userId ? 'MANAGER' : 'MEMBER';
            
            // Invite the user to the team
            await axios.post(`/api/teams/${teamId}/invite`, {
              email: user.email,
              role: role,
            });
          }
        }
      }
      
      // Reset state
      setSelectedUsers({});
      setSelectedManager(null);
      setExistingUsersOpen(false);
      
      // Refresh members
      await fetchMembers();
      toast.success('Users invited successfully!');
    } catch (e) {
      console.error('Failed to invite existing users', e);
      toast.error('Failed to invite users. Please try again.');
    } finally {
      setInviting(false);
    }
  };
  
  const toggleUserSelection = (userId: string) => {
    // Toggle user selection
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
    
    // If this user was the selected manager and is now deselected, clear the manager selection
    if (selectedManager === userId && selectedUsers[userId]) {
      setSelectedManager(null);
    }
  };
  
  const toggleManagerSelection = (userId: string) => {
    // Only allow one manager to be selected
    if (selectedManager === userId) {
      // Deselect if clicking the same manager again
      setSelectedManager(null);
    } else {
      // Select this user as manager and deselect others
      setSelectedManager(userId);
      // Also ensure this user is selected
      setSelectedUsers(prev => ({
        ...prev,
        [userId]: true
      }));
    }
  };
  
  const fetchPendingInvitations = async () => {
    if (!teamId) return;
    setFetchingPending(true);
    try {
      const res = await axios.get(`/api/teams/${teamId}/pending-invitations`);
      setPendingInvites(res.data || []);
    } catch (e) {
      console.error('Failed to fetch pending invitations', e);
      setPendingInvites([]);
      toast.error('Failed to load pending invitations. Please try again later.');
    } finally {
      setFetchingPending(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setTeamError('Team name is required');
      return;
    }
    setTeamError(null);
    setCreatingTeam(true);
    try {
      await axios.post('/api/teams', {
        name: teamName.trim(),
        description: teamDescription.trim() || undefined,
      });

      // Refresh user data to get new teamId and role
      const res = await axios.get('/protected');
      const serverUser = res.data.user;
      if (serverUser) {
        dispatch(setCredentials({
          role: serverUser.role || null,
          teamId: serverUser.teamId || null
        }));
      }

      setTeamName('');
      setTeamDescription('');
      setTeamDialogOpen(false);

      // Members will be fetched automatically via useEffect when teamId updates
      toast.success('Team created successfully!');
    } catch (e: any) {
      console.error('Failed to create team', e);
      toast.error(e.response?.data?.message || 'Failed to create team. Please try again.');
      setTeamError(e.response?.data?.message || 'Failed to create team. Please try again.');
    } finally {
      setCreatingTeam(false);
    }
  };

  const canManageTeam = role === 'ADMIN';

  const roleIcon = (r: string) => {
    switch (r) {
      case 'ADMIN':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'MANAGER':
        return <ShieldAlert className="h-4 w-4 text-blue-500" />;
      default:
        return <UserCheck className="h-4 w-4 text-green-500" />;
    }
  };

  // Show team creation UI if user doesn't have a team
  if (!teamId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Create Your Team</CardTitle>
              <CardDescription className="mt-2">
                Get started by creating a team to collaborate on projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>
                      Create a team to start collaborating with others
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {teamError && (
                      <div className="bg-danger-500/10 border border-danger-500/30 rounded-lg px-4 py-3 text-danger-300 text-sm">
                        {teamError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Team Name *</Label>
                      <Input
                        id="team-name"
                        value={teamName}
                        onChange={(e: any) => {
                          setTeamName((e.target as HTMLInputElement).value);
                          setTeamError(null);
                        }}
                        placeholder="e.g., Engineering Team"
                        disabled={creatingTeam}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team-description">Description (Optional)</Label>
                      <Input
                        id="team-description"
                        value={teamDescription}
                        onChange={(e: any) => setTeamDescription((e.target as HTMLInputElement).value)}
                        placeholder="Team description"
                        disabled={creatingTeam}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTeamDialogOpen(false);
                        setTeamError(null);
                      }}
                      disabled={creatingTeam}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTeam}
                      disabled={!teamName.trim() || creatingTeam}
                    >
                      {creatingTeam ? 'Creating...' : 'Create Team'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>Team details and projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-neutral-50 mb-3">Projects</h3>
                  {projects.length === 0 ? (
                    <div className="text-neutral-400">No projects found</div>
                  ) : (
                    <div className="space-y-3">
                      {projects.map((p) => (
                        <div key={p._id} className="p-4 rounded-md border border-neutral-800 hover:border-neutral-700 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-neutral-50">{p.name}</div>
                            {p.description && <div className="text-sm text-neutral-400">{p.description}</div>}
                          </div>
                          <Button size="sm" onClick={() => navigate(`/projects/${p._id}`)}>Open</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-row items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-50 mb-2">Team Overview</h1>
            <p className="text-neutral-400">Manage team members and permissions</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Members Section */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({members.length})
              </CardTitle>
              <CardDescription>
                Members and their roles in your team
              </CardDescription>
            </div>
            {canManageTeam && (
              <div className="flex gap-2 flex-wrap">
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild>
                    <Button>+ Invite New Member</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to a new team member
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">Email Address</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          value={inviteEmail}
                          onChange={(e: any) => setInviteEmail((e.target as HTMLInputElement).value)}
                          placeholder="colleague@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-role">Role</Label>
                        <select
                          id="invite-role"
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                        >
                          <option value="MEMBER">Member</option>
                          {!members.some((m) => m.role === 'MANAGER') && <option value="MANAGER">Manager</option>}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setInviteOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleInvite}
                        disabled={!inviteEmail.trim() || inviting}
                      >
                        {inviting ? 'Sending...' : 'Send Invite'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Invite Existing Users Dialog */}
                <Dialog open={existingUsersOpen} onOpenChange={setExistingUsersOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">+ Invite Existing Users</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Invite Existing Users</DialogTitle>
                      <DialogDescription>
                        Select existing users to invite to this team
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs defaultValue="members" className="mt-4">
                      <TabsList className="grid w-full grid-cols-2 h-12 items-center justify-center rounded-md bg-neutral-800 p-1 text-neutral-500">
                        <TabsTrigger value="members" className="h-10 data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-50 data-[state=inactive]:text-neutral-400 data-[state=inactive]:hover:bg-neutral-700/50 rounded-md px-4 py-2 text-sm font-medium transition-all">
                          Members
                        </TabsTrigger>
                        <TabsTrigger value="managers" className="h-10 data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-50 data-[state=inactive]:text-neutral-400 data-[state=inactive]:hover:bg-neutral-700/50 rounded-md px-4 py-2 text-sm font-medium transition-all">
                          Managers
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="members" className="mt-4">
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                          {fetchingUsers ? (
                            <div className="text-center py-4 text-neutral-400">Loading users...</div>
                          ) : availableUsers.filter(user => user.role === 'MEMBER').length === 0 ? (
                            <div className="text-center py-4 text-neutral-400">No available members to invite</div>
                          ) : (
                            availableUsers
                              .filter(user => user.role === 'MEMBER') // Only show members
                              .map((user) => (
                                <div 
                                  key={user._id} 
                                  className="flex items-center gap-3 p-3 rounded-md border border-neutral-700 hover:bg-neutral-800/50"
                                >
                                  <input
                                    type="checkbox"
                                    id={`user-${user._id}`}
                                    checked={!!selectedUsers[user._id]}
                                    onChange={() => toggleUserSelection(user._id)}
                                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-blue-500 focus:ring-blue-500"
                                  />
                                  <div>
                                    <div className="font-medium text-neutral-50">{user.name}</div>
                                    <div className="text-sm text-neutral-400">{user.email}</div>
                                    <div className="text-xs text-neutral-500">Current Role: {user.role}</div>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="managers" className="mt-4">
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                          {fetchingUsers ? (
                            <div className="text-center py-4 text-neutral-400">Loading users...</div>
                          ) : availableUsers.filter(user => user.role === 'MANAGER').length === 0 ? (
                            <div className="text-center py-4 text-neutral-400">No available managers to invite</div>
                          ) : (
                            availableUsers
                              .filter(user => user.role === 'MANAGER') // Only show managers
                              .map((user) => (
                                <div 
                                  key={user._id} 
                                  className="flex items-center gap-3 p-3 rounded-md border border-neutral-700 hover:bg-neutral-800/50"
                                >
                                  <input
                                    type="checkbox"
                                    id={`manager-${user._id}`}
                                    checked={selectedManager === user._id}
                                    onChange={() => toggleManagerSelection(user._id)}
                                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-blue-500 focus:ring-blue-500"
                                  />
                                  <div>
                                    <div className="font-medium text-neutral-50">{user.name}</div>
                                    <div className="text-sm text-neutral-400">{user.email}</div>
                                    <div className="text-xs text-neutral-500">Current Role: {user.role}</div>
                                  </div>
                                </div>
                              ))
                          )}
                          {selectedManager && (
                            <div className="mt-3 text-sm text-neutral-400">
                              Selected Manager: {availableUsers.find(u => u._id === selectedManager)?.name}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setExistingUsersOpen(false);
                          setSelectedUsers({});
                          setSelectedManager(null);
                        }}
                        disabled={inviting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleInviteExistingUsers}
                        disabled={inviting || (Object.keys(selectedUsers).filter(id => selectedUsers[id]).length === 0 && !selectedManager)}
                      >
                        {inviting ? 'Inviting...' : 'Invite Selected Users'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Pending Invitations Dialog */}
                <Dialog open={pendingInvitesOpen} onOpenChange={setPendingInvitesOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Pending Invitations</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Pending Invitations</DialogTitle>
                      <DialogDescription>
                        Users who have pending invitations to this team
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mt-4">
                      {fetchingPending ? (
                        <div className="text-center py-4 text-neutral-400">Loading pending invitations...</div>
                      ) : pendingInvites.length === 0 ? (
                        <div className="text-center py-4 text-neutral-400">No pending invitations</div>
                      ) : (
                        pendingInvites.map((invite) => (
                          <div 
                            key={invite.userId} 
                            className="flex items-center justify-between p-3 rounded-md border border-neutral-700 bg-neutral-800/30"
                          >
                            <div>
                              <div className="font-medium text-neutral-50">{invite.name}</div>
                              <div className="text-sm text-neutral-400">{invite.email}</div>
                              <div className="text-xs text-neutral-500">Role: {invite.role}</div>
                            </div>
                            <div className="text-xs text-neutral-400">
                              Invited: {invite.invitedAt ? new Date(invite.invitedAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setPendingInvitesOpen(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-neutral-400">
                Loading members...
              </div>
            ) : members.length > 0 ? (
              <div className="space-y-3">
                {members
                  .filter(m => m.role !== 'ADMIN')
                  .sort((a, b) => {
                    // Sort: Manager first, then Members
                    if (a.role === 'MANAGER' && b.role !== 'MANAGER') return -1;
                    if (a.role !== 'MANAGER' && b.role === 'MANAGER') return 1;
                    return 0; // Keep original order for same role
                  })
                  .map((m) => {
                  const stats = memberTaskStats[m._id] || { total: 0, completed: 0, pending: 0 };
                  return (
                    <div
                      key={m._id}
                      className="flex items-center justify-between p-4 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center">
                            <span className="text-sm font-semibold text-neutral-400">
                              {m.name?.charAt(0).toUpperCase() || m.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-50">
                              {m.name || 'No name'}
                              {user?.email === m.email && (
                                <span className="ml-2 text-xs text-neutral-400">(You)</span>
                              )}
                            </p>
                            <p className="text-sm text-neutral-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {m.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Role Badge */}
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800">
                          {roleIcon(m.role)}
                          <span className="text-sm font-medium text-neutral-50">
                            {m.role}
                          </span>
                        </div>

                        {/* Task Stats */}
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex flex-col items-center">
                            <span className="text-neutral-50 font-medium">{stats.total}</span>
                            <span className="text-neutral-400">Total</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-green-500 font-medium">{stats.completed}</span>
                            <span className="text-neutral-400">Completed</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-yellow-500 font-medium">{stats.pending}</span>
                            <span className="text-neutral-400">Pending</span>
                          </div>
                        </div>

                        <span className="text-xs text-neutral-500">
                          {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'N/A'}
                        </span>

                        {canManageTeam && (
                          <div className="flex items-center gap-2">
                            {/* Remove button for all members except admin */}
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                setMemberToRemove(m);
                                setRemoveMemberOpen(true);
                              }}
                            >
                              Remove
                            </Button>
                            
                            {/* Manager promotion/demotion logic */}
                            {/* Only show promote/demote if the user is not the admin */}
                            {m.role !== 'ADMIN' && (
                              <>
                                {/* Only show promote if no manager exists and this user is not a manager */}
                                {!members.some(member => member.role === 'MANAGER') && m.role !== 'MANAGER' ? (
                                  <Button 
                                    size="sm" 
                                    onClick={async () => {
                                      try {
                                        await axios.patch(`/api/teams/${teamId}/members/${m._id}/assign-manager`, { role: 'MANAGER' });
                                        await fetchMembers();
                                      } catch (e: any) {
                                        console.error('Failed to promote member', e);
                                        toast.error('Failed to promote member: ' + (e.response?.data?.message || 'Unknown error'));
                                      }
                                    }}
                                  >
                                    Promote
                                  </Button>
                                ) : m.role === 'MANAGER' ? (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={async () => {
                                      try {
                                        await axios.patch(`/api/teams/${teamId}/members/${m._id}/assign-manager`, { role: 'MEMBER' });
                                        await fetchMembers();
                                      } catch (e: any) {
                                        console.error('Failed to demote manager', e);
                                        toast.error('Failed to demote manager: ' + (e.response?.data?.message || 'Unknown error'));
                                      }
                                    }}
                                  >
                                    Demote
                                  </Button>
                                ) : null} {/* Don't show promote option if a manager already exists */}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-400">
                No members in this team yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Projects Section */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Assigned Projects ({projects.length})
              </CardTitle>
              <CardDescription>
                Projects assigned to your team
              </CardDescription>
            </div>
           
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between p-4 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-neutral-50">{project.name}</div>
                      <div className="text-sm text-neutral-400 mt-1">
                        {project.description || 'No description'}
                      </div>
                    </div>
                    <div className="text-xs text-neutral-500">
                      {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-400">
                No projects assigned to this team yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Info */}
        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-400 mb-1">Team Name</p>
                  <p className="font-medium text-neutral-50">{team?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-400 mb-1">Your Role</p>
                  <div className="flex items-center gap-2">
                    {roleIcon(role || '')}
                    <span className="font-medium text-neutral-50">{role || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-neutral-400 mb-1">Description</p>
                <p className="text-neutral-50">{team?.description || 'No description provided'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm text-neutral-400 mb-1">Members</p>
                  <p className="text-neutral-50">{team?.memberCount !== undefined ? team.memberCount : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-400 mb-1">Created</p>
                  <p className="text-neutral-50">{team?.createdAt ? new Date(team.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={removeMemberOpen} onOpenChange={setRemoveMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <span className="font-semibold text-neutral-50">{memberToRemove?.name}</span> from the team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setRemoveMemberOpen(false);
                setMemberToRemove(null);
              }}
              disabled={removingMember}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!memberToRemove) return;
                setRemovingMember(true);
                try {
                  await axios.delete(`/api/teams/${teamId}/members/${memberToRemove._id}`);
                  toast.success(`${memberToRemove.name} has been removed from the team.`);
                  await fetchMembers();
                  setRemoveMemberOpen(false);
                  setMemberToRemove(null);
                } catch (e: any) {
                  console.error('Failed to remove member', e);
                  toast.error('Failed to remove member: ' + (e.response?.data?.message || 'Unknown error'));
                } finally {
                  setRemovingMember(false);
                }
              }}
              disabled={removingMember}
              className="bg-red-600 hover:bg-red-700"
            >
              {removingMember ? 'Removing...' : 'Remove Member'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamOverview;
