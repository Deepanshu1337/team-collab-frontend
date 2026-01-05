import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FolderOpen, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/axios';
import toast from 'react-hot-toast';

const MemberProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);
  const role = useSelector((state: RootState) => state.auth.role);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Get projects assigned to the member (projects with tasks assigned to the user)
        const response = await axios.get('/api/projects/member');
        setProjects(response.data || []);
      } catch (error) {
        console.error('Error fetching member projects:', error);
        setProjects([]);
        toast.error('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-50 mb-6">My Projects</h1>
          <p className="text-neutral-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-50">My Projects</h1>
          <p className="text-neutral-400">Projects you are assigned to</p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-neutral-700 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-neutral-50 mb-2">No Projects Assigned</h3>
            <p className="text-neutral-400">You don't have any projects assigned to you yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card 
                key={project._id} 
                className="bg-linear-to-br from-neutral-800 to-neutral-900 border-neutral-700 hover:border-neutral-600 transition cursor-pointer"
                onClick={() => navigate(`/team/${project.teamId}/project/${project._id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-neutral-50">
                      <FolderOpen className="w-5 h-5 text-blue-400" />
                      {project.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.description && (
                      <p className="text-neutral-400 text-sm line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center text-sm text-neutral-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        Created: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-neutral-500">
                      <User className="w-4 h-4 mr-2" />
                      <span>Team: {project.teamName || 'Unknown'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberProjects;