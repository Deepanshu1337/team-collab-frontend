import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import toast from 'react-hot-toast';

interface Team {
  _id: string;
  name: string;
  description?: string;
  memberCount?: number;
}

const AdminTeamsView = () => {
  const navigate = useNavigate();
  const role = useSelector((s: RootState) => s.auth.role);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamDescription, setEditTeamDescription] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  useEffect(() => {
    if (!role) return;
    fetchTeams();
  }, [role]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/teams`);
      const list = (res.data?.teams || []).map((t: any) => ({
        _id: t._id,
        name: t.name,
        description: t.description,
        memberCount: t.memberCount, 
      }));

      setTeams(list);
    } catch (e) {
      console.error('Failed to fetch teams', e);
      toast.error('Failed to load teams. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    setCreating(true);
    try {
      await axios.post('/api/teams', {
        name: teamName.trim(),
        description: teamDescription.trim() || undefined,
      });
      setTeamName('');
      setTeamDescription('');
      await fetchTeams();
      toast.success('Team created successfully!');
    } catch (e) {
      console.error('Failed to create team', e);
      toast.error('Failed to create team. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!editTeamName.trim() || !editingTeam) return;
    setUpdating(true);
    try {
      await axios.put(`/api/teams/${editingTeam._id}`, {
        name: editTeamName.trim(),
        description: editTeamDescription.trim() || undefined,
      });
      setEditTeamName('');
      setEditTeamDescription('');
      setEditingTeam(null);
      setIsEditModalOpen(false);
      await fetchTeams();
      toast.success('Team updated successfully!');
    } catch (e) {
      console.error('Failed to update team', e);
      toast.error('Failed to update team. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/teams/${teamToDelete._id}`);
      setTeamToDelete(null);
      setIsDeleteModalOpen(false);
      await fetchTeams();
      toast.success('Team deleted successfully!');
    } catch (e) {
      console.error('Failed to delete team', e);
      toast.error('Failed to delete team. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setEditTeamName(team.name);
    setEditTeamDescription(team.description || '');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteModalOpen(true);
  };

  const getPageTitle = () => {
    if (role === 'ADMIN') return 'All Teams';
    if (role === 'MANAGER') return 'My Teams';
    return 'My Teams';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-neutral-50">{getPageTitle()}</h1>
          <Button onClick={() => navigate('/dashboard')}>Back</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{getPageTitle()}</CardTitle>
            <CardDescription>
              {role === 'ADMIN' ? 'View and manage all teams in your organization' : 'Teams you are a member of'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {role === 'ADMIN' && (
              <div className="flex items-center gap-2 mb-4">
                <Input value={teamName} onChange={(e: any) => setTeamName((e.target as HTMLInputElement).value)} placeholder="New team name" className="max-w-xs" />
                <Input value={teamDescription} onChange={(e: any) => setTeamDescription((e.target as HTMLInputElement).value)} placeholder="Description (optional)" className="max-w-sm" />
                <Button onClick={handleCreateTeam} disabled={creating || !teamName.trim()}>{creating ? 'Creating...' : 'Create Team'}</Button>
              </div>
            )}
            {loading ? (
              <div className="text-neutral-400">Loading teams...</div>
            ) : teams.length === 0 ? (
              <div className="text-neutral-400">No teams found</div>
            ) : (
              <div className="space-y-3">
                {teams.map((t) => (
                  <div key={t._id} className="p-4 rounded-md border border-neutral-800 hover:border-neutral-700 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-neutral-50">{t.name}</div>
                      {t.description && <div className="text-sm text-neutral-400">{t.description}</div>}
                      <div className="text-xs text-neutral-500 mt-1">Members: {Number(t.memberCount) || 0}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => navigate(`/team/${t._id}`)}>View Details</Button>
                      <Button size="sm" variant="outline" onClick={() => openEditModal(t)}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => openDeleteModal(t)} className="text-red-500 hover:text-red-400 border-red-500 hover:border-red-400">Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Team Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update team information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-team-name">Team Name *</Label>
              <Input
                id="edit-team-name"
                value={editTeamName}
                onChange={(e: any) => setEditTeamName((e.target as HTMLInputElement).value)}
                placeholder="Team name"
                disabled={updating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-team-description">Description (Optional)</Label>
              <Input
                id="edit-team-description"
                value={editTeamDescription}
                onChange={(e: any) => setEditTeamDescription((e.target as HTMLInputElement).value)}
                placeholder="Team description"
                disabled={updating}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingTeam(null);
                setEditTeamName('');
                setEditTeamDescription('');
              }}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTeam}
              disabled={!editTeamName.trim() || updating}
            >
              {updating ? 'Updating...' : 'Update Team'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Team Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the team "{teamToDelete?.name}"? This will remove all team members' team association and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setTeamToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTeam}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete Team'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTeamsView;
