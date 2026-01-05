import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { UserCard } from '../../components/dashboard/UserCard';
import { MemberStatsCard } from '../../components/dashboard/MemberStatsCard';
import { ManagerTeamCards } from '../../components/dashboard/ManagerTeamCards';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent } from '../../components/ui/tabs';
import { Plus} from 'lucide-react';
import axios from '../../lib/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const role = useSelector((state: RootState) => state.auth.role);
  const teamId = useSelector((state: RootState) => state.auth.teamId);
  
  // Add loading state to track if auth data is loaded
  const [authDataLoaded, setAuthDataLoaded] = useState(false);
  
  // Check if auth data is loaded
  useEffect(() => {
    if (token && role !== null && teamId !== undefined) {
      setAuthDataLoaded(true);
    }
  }, [token, role, teamId]);

  // Dashboard stats state
  const [adminStats, setAdminStats] = useState<any>(null);
  const [managerStats, setManagerStats] = useState<any>(null);
  const [memberStats, setMemberStats] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Team creation state
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);

  // Pending invitations state
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [invitationsModalOpen, setInvitationsModalOpen] = useState(false);

  // Fetch pending invitations when component mounts
  useEffect(() => {
    const fetchPendingInvitations = async () => {
      try {
        const response = await axios.get('/api/invitations/pending');
        const invitations = response.data;
        
        if (invitations.length > 0) {
          setPendingInvitations(invitations);
          setInvitationsModalOpen(true); // Open modal if there are pending invitations
        }
      } catch (error) {
        console.error('Failed to fetch pending invitations:', error);
      }
    };

    if (token) {
      fetchPendingInvitations();
    }
  }, [token]);

  // Fetch dashboard stats based on role
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setDashboardLoading(true);
      try {
        if (role === 'ADMIN') {
          const response = await axios.get('/api/dashboard/admin');
          setAdminStats(response.data);
        } else if (role === 'MANAGER') {
          if (teamId) {
            const response = await axios.get(`/api/dashboard/${teamId}/manager`);
            setManagerStats(response.data);
          }
        } else if (role === 'MEMBER') {
          if (teamId) {
            const response = await axios.get(`/api/dashboard/${teamId}/member`);
            setMemberStats(response.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    if (token && role) {
      fetchDashboardStats();
    }
  }, [token, role, teamId]);

  // Handle team creation
  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setTeamError('Team name is required');
      return;
    }

    setCreatingTeam(true);
    setTeamError(null);

    try {
      const response = await axios.post('/api/teams', {
        name: teamName.trim(),
        description: teamDescription.trim()
      });

      // Update user's teamId in the store (this would typically be handled by dispatching an action)
      // For now, we'll just navigate to the dashboard to refresh the state
      setTeamDialogOpen(false);
      setTeamName('');
      setTeamDescription('');
      
      // Refresh the page to update the team context
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to create team:', error);
      setTeamError(error.response?.data?.message || 'Failed to create team');
    } finally {
      setCreatingTeam(false);
    }
  };

  // Handle accepting an invitation
  const handleAcceptInvitation = async (teamId: string) => {
    try {
      await axios.post('/api/invitations/accept', { teamId });
      
      // Remove the accepted invitation from the list
      setPendingInvitations(prev => prev.filter(inv => inv.teamId !== teamId));
      
      // If no more invitations, close the modal
      if (pendingInvitations.length <= 1) {
        setInvitationsModalOpen(false);
      }
      
      // Refresh the page to update the user's team context
      window.location.reload();
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    }
  };

  // Show loading while auth data is being loaded
  if (!authDataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-500 mb-4"></div>
          <p className="text-neutral-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neutral-50 mb-2">Dashboard</h1>
              <p className="text-neutral-400">Welcome to your Team Collaboration Hub</p>
            </div>
          </div>

          {/* If member without a team: Show message and create team option */}
          {role === "MEMBER" && !teamId && (
            <div className="mb-8">
              <div className="text-center mb-8 py-12 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-xl border border-neutral-700/50">
                <h2 className="text-2xl font-bold text-neutral-50 mb-2">Welcome to TeamCollab!</h2>
                <p className="text-neutral-400 max-w-md mx-auto mb-6">
                  Start by creating a team as an admin. You'll be able to invite members and manage projects.
                </p>
                <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="px-8 py-3">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Team</DialogTitle>
                      <DialogDescription>Start collaborating by creating your team</DialogDescription>
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
              </div>
            </div>
          )}

          {/* User Card */}
          <div className="mb-8">
            <UserCard name={user?.name || "User"} email={user?.email} role={role || "MEMBER"} />
          </div>

          {/* Dashboard Stats - Conditionally render by role */}
          <div className="mb-8">
            {role === "ADMIN" && adminStats && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-50 mb-4">Admin Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card onClick={() => navigate('/admin/teams')} className="cursor-pointer">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-neutral-400">Total Teams</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-neutral-50">{adminStats.totalTeams}</div>
                    </CardContent>
                  </Card>
                  <Card onClick={() => navigate('/admin/projects')} className="cursor-pointer">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-neutral-400">Total Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-neutral-50">{adminStats.totalProjects}</div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-default">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-neutral-400">Total Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-neutral-50">{adminStats.totalTasks}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {role === "MANAGER" && managerStats && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-50 mb-4">Manager Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card onClick={() => navigate('/manager/projects')} className="cursor-pointer">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-neutral-400">Managed Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-neutral-50">{managerStats.totalManagedProjects}</div>
                    </CardContent>
                  </Card>
                  <Card onClick={() => navigate('/manager/tasks')} className="cursor-pointer">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-neutral-400">Assigned Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-neutral-50">{managerStats.totalAssignedTasks}</div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Team Cards Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-neutral-50 mb-4">Team Overview</h3>
                  <ManagerTeamCards 
                    teams={
                      managerStats.team ? [
                        {
                          teamName: managerStats.team.name,
                          members: managerStats.team.members || [],
                          projects: managerStats.team.projects || [],
                          tasks: managerStats.team.tasks || [],
                        }
                      ] : []
                    } 
                  />
                </div>
              </div>
            )}

            {role === "MEMBER" && memberStats && (
              <div>
                
                <Tabs defaultValue="dashboard" className="space-y-6">              
                  <div className="space-y-6">
                    <TabsContent value="dashboard" className="space-y-6">                 
                      <MemberStatsCard
                        totalTasks={memberStats.totalTasks}
                        completedTasks={memberStats.completedTasks}
                        pendingTasks={memberStats.pendingTasks}
                        inProgressTasks={memberStats.inProgressTasks}
                        completionRate={memberStats.completionRate}
                        loading={dashboardLoading}
                      />
                      
                      {/* Assigned Projects Card */}
                      {/* <Card className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="w-5 h-5 text-blue-400" />
                            <CardTitle>Assigned Projects</CardTitle>
                          </div>
                          <CardDescription>Projects you are assigned to</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {memberStats.assignedProjects && memberStats.assignedProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {memberStats.assignedProjects.map((project: any) => (
                                <div 
                                  key={project._id} 
                                  className="p-4 rounded-lg bg-neutral-700/50 border border-neutral-600"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <FolderOpen className="w-4 h-4 text-blue-400" />
                                    <h3 className="font-medium text-neutral-50">{project.name}</h3>
                                  </div>
                                  {project.description && (
                                    <p className="text-sm text-neutral-400 line-clamp-2">{project.description}</p>
                                  )}
                                  {project.createdAt && (
                                    <p className="text-xs text-neutral-500 mt-2">
                                      Created: {new Date(project.createdAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <FolderOpen className="h-12 w-12 text-neutral-700 mx-auto mb-4 opacity-50" />
                              <p className="text-neutral-400">No projects assigned yet</p>
                            </div>
                          )}
                        </CardContent>
                      </Card> */}
                    </TabsContent>
                    
                    {/* <TabsContent value="project" className="space-y-6">
                      <Card className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FolderOpen className="w-5 h-5 text-blue-400" />
                              <CardTitle>My Projects</CardTitle>
                            </div>
                            <span className="text-sm text-neutral-400">
                              {memberStats.assignedProjects?.length || 0} projects
                            </span>
                          </div>
                          <CardDescription>Projects you are assigned to</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {memberStats.assignedProjects && memberStats.assignedProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {memberStats.assignedProjects.map((project: any) => (
                                <div 
                                  key={project._id} 
                                  className="p-4 rounded-lg bg-neutral-700/50 border border-neutral-600 hover:bg-neutral-700 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <FolderOpen className="w-4 h-4 text-blue-400" />
                                    <h3 className="font-medium text-neutral-50">{project.name}</h3>
                                  </div>
                                  {project.description && (
                                    <p className="text-sm text-neutral-400 line-clamp-2">{project.description}</p>
                                  )}
                                  {project.createdAt && (
                                    <p className="text-xs text-neutral-500 mt-2">
                                      Created: {new Date(project.createdAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <FolderOpen className="h-12 w-12 text-neutral-700 mx-auto mb-4 opacity-50" />
                              <p className="text-neutral-400">No projects assigned yet</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent> */}
                    
                    {/* <TabsContent value="task" className="space-y-6">
                      <MemberTasksList
                        tasks={memberStats.assignedTasks || []}
                        totalTasks={memberStats.totalTasks}
                        completedTasks={memberStats.completedTasks}
                        pendingTasks={memberStats.pendingTasks}
                        inProgressTasks={memberStats.inProgressTasks}
                        loading={dashboardLoading}
                      />
                    </TabsContent> */}
                    
                    {/* <TabsContent value="chat" className="space-y-6">
                      <Card className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            <CardTitle>Team Chat</CardTitle>
                          </div>
                          <CardDescription>Communicate with your team members</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-12">
                            <Users className="h-12 w-12 text-neutral-700 mx-auto mb-4 opacity-50" />
                            <p className="text-neutral-400">Team chat functionality coming soon</p>
                            <p className="text-sm text-neutral-500 mt-2">You can communicate with your team through the main chat</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent> */}
                  </div>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Invitations Modal */}
      {pendingInvitations.length > 0 && (
        <Dialog open={invitationsModalOpen} onOpenChange={setInvitationsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>You have pending invitations</DialogTitle>
              <DialogDescription>
                You have been invited to join the following teams
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {pendingInvitations.map((invitation) => (
                <div 
                  key={invitation.teamId} 
                  className="p-4 rounded-md border border-neutral-700 bg-neutral-800/30"
                >
                  <div className="font-medium text-neutral-50">{invitation.teamName}</div>
                  <div className="text-sm text-neutral-400 mt-1">Invited by: {invitation.adminName}</div>
                  <div className="text-xs text-neutral-500 mt-1">Role: {invitation.role}</div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={async () => {
                        try {
                          await axios.post('/api/invitations/reject', { teamId: invitation.teamId });
                          
                          // Remove the rejected invitation from the list
                          setPendingInvitations(prev => prev.filter(inv => inv.teamId !== invitation.teamId));
                          
                          // If no more invitations, close the modal
                          if (pendingInvitations.length <= 1) {
                            setInvitationsModalOpen(false);
                          }
                        } catch (error) {
                          console.error('Failed to reject invitation:', error);
                        }
                      }}
                    >
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleAcceptInvitation(invitation.teamId)}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Dashboard;