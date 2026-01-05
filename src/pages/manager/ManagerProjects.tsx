import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import axios from "../../lib/axios";
import { ManagerProjects as ManagerProjectsList } from "../../components/dashboard/ManagerProjects";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import toast from 'react-hot-toast';

interface Project {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

const ManagerProjects = () => {
  const teamId = useSelector((s: RootState) => s.auth.teamId);
  const role = useSelector((s: RootState) => s.auth.role);
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        // Get projects for the user's team
        const res = await axios.get('/api/projects/team');
        setProjects(res.data || []);
      } catch (error) {
        console.error('Failed to load projects', error);
        toast.error('Failed to load projects. Please try again later.');
        setProjects([]);
      }
    };
    run();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || role !== 'MANAGER' || !teamId) return;
    setCreating(true);
    try {
      await axios.post(`/api/projects/${teamId}`, { name: name.trim() });
      setName('');
      const res = await axios.get('/api/projects/team');
      setProjects(res.data || []);
      toast.success('Project created successfully!');
    } catch (e) {
      console.error('Failed to create project', e);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-neutral-50 mb-4">My Projects</h2>
      {role === 'MANAGER' && (
        <div className="flex items-center gap-2 mb-4">
          <Input value={name} onChange={(e: any) => setName((e.target as HTMLInputElement).value)} placeholder="New project name" className="max-w-xs" />
          <Button onClick={handleCreate} disabled={creating || !name.trim()}>{creating ? 'Creating...' : 'Create'}</Button>
        </div>
      )}
      <ManagerProjectsList
        projectsAsManager={projects}
        projectsAsMember={[]}
        onProjectClick={(id) => navigate(`/projects/${id}`)}
      />
    </div>
  );
};

export default ManagerProjects;
