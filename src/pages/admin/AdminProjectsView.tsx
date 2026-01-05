import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import toast from 'react-hot-toast';

interface Project {
  _id: string;
  name: string;
  description?: string;
  manager?: {
    name: string;
    email: string;
  } | null;
  teamName?: string;
  teamDescription?: string;
}

interface Team {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  memberCount: number;
}

const AdminProjectsView = () => {
  const navigate = useNavigate();
  const role = useSelector((s: RootState) => s.auth.role);
  const [projects, setProjects] = useState<Project[]>([]);
  const teamId = useSelector((s: RootState) => s.auth.teamId);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [fetchingTeams, setFetchingTeams] = useState(false);

  useEffect(() => {
    if (!role) return;
    fetchProjects();
  }, [role]);

  useEffect(() => {
    if (isModalOpen && role === 'ADMIN') {
      fetchAdminTeams();
    }
  }, [isModalOpen, role]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let res;
      if (role === 'ADMIN') {
        // Admin gets all projects with team info
        res = await axios.get('/api/projects/admin/all');
      } else {
        // Other roles get projects for their team
        if (!teamId) {
          setProjects([]);
          return;
        }
        res = await axios.get(`/api/projects/${teamId}`);
      }
      setProjects(res.data || []);
    } catch (e) {
      console.error('Failed to fetch projects', e);
      toast.error('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminTeams = async () => {
    setFetchingTeams(true);
    try {
      const res = await axios.get('/api/teams');
      setTeams(res.data.teams || []);
      if (res.data.teams && res.data.teams.length > 0) {
        setSelectedTeamId(res.data.teams[0]._id);
      }
    } catch (e) {
      console.error('Failed to fetch teams', e);
      setTeams([]);
      toast.error('Failed to load teams. Please try again later.');
    } finally {
      setFetchingTeams(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || role !== 'ADMIN' || !selectedTeamId) return; // Only admins can create via this page
    setCreating(true);
    try {
      await axios.post(`/api/projects/${selectedTeamId}`, {
        name: name.trim(),
        description: description.trim() || undefined
      });
      setName('');
      setDescription('');
      setSelectedTeamId('');
      setIsModalOpen(false);
      await fetchProjects();
      toast.success('Project created successfully!');
    } catch (e) {
      console.error('Failed to create project', e);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (role !== 'ADMIN' || !teamId) return; // Only admins can delete
    if (!confirm('Delete project?')) return;
    try {
      await axios.delete(`/api/projects/${teamId}/${id}`);
      await fetchProjects();
      toast.success('Project deleted successfully!');
    } catch (e) {
      console.error('Failed to delete project', e);
      toast.error('Failed to delete project. Please try again.');
    }
  };

  const getPageTitle = () => {
    if (role === 'ADMIN') return 'All Projects';
    if (role === 'MANAGER') return 'My Projects';
    return 'Projects';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-neutral-50">{getPageTitle()}</h1>
          <div className="flex items-center gap-2">
            {role === 'ADMIN' && (
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button>Create Project</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Create a new project and assign it to a team
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Project Name *</Label>
                      <Input
                        id="project-name"
                        value={name}
                        onChange={(e: any) => setName((e.target as HTMLInputElement).value)}
                        placeholder="e.g., Website Redesign"
                        disabled={creating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-description">Description (Optional)</Label>
                      <Input
                        id="project-description"
                        value={description}
                        onChange={(e: any) => setDescription((e.target as HTMLInputElement).value)}
                        placeholder="Project description"
                        disabled={creating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assign-team">Assign to Team *</Label>
                      {fetchingTeams ? (
                        <div className="text-sm text-neutral-400">Loading teams...</div>
                      ) : teams.length === 0 ? (
                        <div className="text-sm text-neutral-400">No teams available</div>
                      ) : (
                        <select
                          id="assign-team"
                          value={selectedTeamId}
                          onChange={(e) => setSelectedTeamId(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                          disabled={creating}
                        >
                          {teams.map((team) => (
                            <option key={team._id} value={team._id}>
                              {team.name} ({team.memberCount} members)
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsModalOpen(false);
                        setName('');
                        setDescription('');
                        setSelectedTeamId('');
                      }}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreate}
                      disabled={!name.trim() || !selectedTeamId || creating}
                    >
                      {creating ? 'Creating...' : 'Create Project'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button onClick={() => navigate('/dashboard')}>Back</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{getPageTitle()}</CardTitle>
            <CardDescription>
              {role === 'ADMIN' ? 'View and manage all projects' : `Projects assigned to you`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-neutral-400">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-neutral-400">No projects found</div>
            ) : (
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p._id} className="p-4 rounded-md border border-neutral-800 hover:border-neutral-700 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-neutral-50">{p.name}</div>
                      {p.description && <div className="text-sm text-neutral-400">{p.description}</div>}
                      <div className="text-xs text-neutral-500 mt-1">Team: {p.teamName || 'Unassigned'}</div>
                      <div className="text-xs text-neutral-500 mt-1">Manager: {p.manager ? p.manager.name || p.manager.email : 'No Manager'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => navigate(`/projects/${p._id}`)}>Open</Button>
                      {role === 'ADMIN' && <Button size="sm" variant="outline" onClick={() => handleDelete(p._id)}>Delete</Button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProjectsView;
