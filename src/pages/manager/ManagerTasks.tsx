import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import axios from "../../lib/axios";
import { ManagerTasks as ManagerTasksList } from "../../components/dashboard/ManagerTasks";
import toast from 'react-hot-toast';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  projectId: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
}

interface TaskCounts {
  todo: number;
  'in-progress': number;
  done: number;
  total: number;
}

interface TeamTasksResponse {
  tasks: Task[];
  counts: TaskCounts;
}

const ManagerTasks = () => {
  const teamId = useSelector((s: RootState) => s.auth.teamId);
  const userId = useSelector((s: RootState) => s.auth.user?.id);
  const role = useSelector((s: RootState) => s.auth.role);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [counts, setCounts] = useState<TaskCounts | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!teamId) return;
      setLoading(true);
      try {
        // For managers, get all tasks for their team using the new endpoint
        if (role === 'MANAGER') {
          const response = await axios.get<TeamTasksResponse>(`/api/tasks/${teamId}/tasks`);
          setTasks(response.data.tasks);
          setCounts(response.data.counts);
        } else {
          // For other roles, only get tasks assigned to the user
          const projectsRes = await axios.get(`/api/projects/${teamId}`);
          const projects = projectsRes.data || [];
          const allTasks: Task[] = [];
          for (const p of projects) {
            const tRes = await axios.get(`/api/tasks/${teamId}/projects/${p._id}/tasks`);
            const list: Task[] = tRes.data || [];
            allTasks.push(...list.filter((t) => String(t.assignedTo?._id || t.assignedTo) === String(userId)));
          }
          setTasks(allTasks);
          // Calculate counts for member tasks
          const todoCount = allTasks.filter(task => task.status === 'todo').length;
          const inProgressCount = allTasks.filter(task => task.status === 'in-progress').length;
          const doneCount = allTasks.filter(task => task.status === 'done').length;
          setCounts({
            todo: todoCount,
            'in-progress': inProgressCount,
            done: doneCount,
            total: allTasks.length
          });
        }
      } catch (error) {
        console.error('Failed to fetch tasks', error);
        toast.error('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [teamId, userId, role]);
console.log(tasks)
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-neutral-50 mb-4">Team Tasks</h2>
      {/* {counts && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border border-yellow-700/50">
            <div className="text-2xl font-bold text-yellow-400">{counts.todo}</div>
            <div className="text-sm text-yellow-300">To Do</div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/50">
            <div className="text-2xl font-bold text-blue-400">{counts['in-progress']}</div>
            <div className="text-sm text-blue-300">In Progress</div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-700/50">
            <div className="text-2xl font-bold text-green-400">{counts.done}</div>
            <div className="text-sm text-green-300">Done</div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-700/50">
            <div className="text-2xl font-bold text-purple-400">{counts.total}</div>
            <div className="text-sm text-purple-300">Total</div>
          </div>
        </div>
      )} */}
      <ManagerTasksList tasks={tasks} totalTasksAssigned={tasks.length} loading={loading} />
    </div>
  );
};

export default ManagerTasks;
