import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import axios from "../../lib/axios";
import { MemberTasks as MemberTasksList } from "../../components/dashboard/MemberTasks";
import toast from 'react-hot-toast';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  projectId: string;
  assignedTo?: string;
}



const MemberTasks = () => {
  const userId = useSelector((s: RootState) => s.auth.user?.id);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        // Get tasks assigned to the user directly
        const response = await axios.get('/api/tasks/assigned');
        setTasks(response.data.assignedTasks || []);
      } catch (error) {
        console.error('Error fetching member tasks:', error);
        setTasks([]);
        toast.error('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [userId]);

  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const pendingTasks = tasks.filter((t) => t.status === "todo").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-neutral-50 mb-4">My Tasks</h2>
      <MemberTasksList
        tasks={tasks}
        totalTasks={tasks.length}
        completedTasks={completedTasks}
        pendingTasks={pendingTasks}
        inProgressTasks={inProgressTasks}
        loading={loading}
      />
    </div>
  );
};

export default MemberTasks;
