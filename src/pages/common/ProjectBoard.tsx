import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchTasks, moveTask, addTask, updateTask, deleteTask } from "../../store/task.slice";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import axios from "../../lib/axios";
import { connectSocket } from "../../lib/socket";
import toast from 'react-hot-toast';

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Plus, Trash2, Edit2 } from "lucide-react";

const columns = ["todo", "in-progress", "done"] as const;
const columnLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
} as const;

const ProjectBoard = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector((s: RootState) => (id ? s.tasks.byProject[id] || [] : []));
  const role = useSelector((s: RootState) => s.auth.role) as string | null;
  const user = useSelector((s: RootState) => s.auth.user);

  const [createOpen, setCreateOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [taskAssignedTo, setTaskAssignedTo] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [manager, setManager] = useState<any>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // State for editing tasks
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskAssignedTo, setEditTaskAssignedTo] = useState<string | null>(null);

  useEffect(() => {
    if (id && project?.teamId) {
      const teamId = typeof project.teamId === 'object' ? project.teamId._id : project.teamId;
      dispatch(fetchTasks({ teamId, projectId: id }));
    }
  }, [dispatch, id, project?.teamId]);

  // Fetch project information first to get teamId
  useEffect(() => {
    const fetchProject = async () => {
      if (id) {
        try {
          // Get the specific project by ID
          const res = await axios.get(`/api/projects/${id}`);
          const responseData = res.data;

          // Set the project, team, manager and members from the response
          setProject(responseData.project || null);
          setTeam(responseData.team || null);
          setTeamId(responseData.team ? responseData.team._id : null);
          setManager(responseData.manager || null);
          setTeamMembers(responseData.members || []);
        } catch (error) {
          console.error('Failed to fetch project', error);
        }
      }
    };

    fetchProject();
  }, [id]);

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    const onCreated = (payload: any) => {
      if (payload.task.projectId === id) {
        dispatch(addTask({ projectId: id!, task: payload.task }));
      }
    };
    const onUpdated = (payload: any) => {
      if (payload.task.projectId === id) {
        dispatch(updateTask(payload.task));
      }
    };
    const onMoved = (payload: any) => {
      if (payload.task.projectId === id) {
        dispatch(updateTask(payload.task));
      }
    };
    const onDeleted = (payload: any) => {
      if (id) dispatch(deleteTask({ projectId: id, taskId: payload.taskId }));
    };

    socket.on("task:created", onCreated);
    socket.on("task:updated", onUpdated);
    socket.on("task:moved", onMoved);
    socket.on("task:deleted", onDeleted);

    return () => {
      socket.off("task:created", onCreated);
      socket.off("task:updated", onUpdated);
      socket.off("task:moved", onMoved);
      socket.off("task:deleted", onDeleted);
    };
  }, [dispatch, id]);

  const filtered = role === "MEMBER" && user?.id
    ? tasks.filter((t: any) => {
        // Handle both string and object formats for assignedTo
        if (typeof t.assignedTo === 'string') {
          return t.assignedTo === user.id;
        } else if (t.assignedTo && typeof t.assignedTo === 'object') {
          return t.assignedTo._id === user.id;
        }
        return false;
      })
    : tasks;

  // Sort tasks to show user's assigned tasks first
  const sortedTasks = [...filtered].sort((a, b) => {
    const aIsAssignedToUser = a.assignedTo && (
      a.assignedTo._id === user?.id || 
      a.assignedTo.email === user?.email
    );
    const bIsAssignedToUser = b.assignedTo && (
      b.assignedTo._id === user?.id || 
      b.assignedTo.email === user?.email
    );
    
    // If a is assigned to user and b is not, a comes first
    if (aIsAssignedToUser && !bIsAssignedToUser) return -1;
    // If b is assigned to user and a is not, b comes first
    if (!aIsAssignedToUser && bIsAssignedToUser) return 1;
    // Otherwise, maintain original order
    return 0;
  });

  const grouped = {
    todo: sortedTasks.filter((t: any) => t.status === "todo"),
    "in-progress": sortedTasks.filter((t: any) => t.status === "in-progress"),
    done: sortedTasks.filter((t: any) => t.status === "done"),
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || !id) return;
    const srcCol = source.droppableId as (typeof columns)[number];
    const destCol = destination.droppableId as (typeof columns)[number];
    if (srcCol === destCol && destination.index === source.index) return;

    // Find the task being moved to check if it's assigned to the current user
    let taskAssignedToCurrentUser = false;
    for (const col of Object.values(grouped)) {
      const task = col.find((t: any) => t._id === draggableId);
      if (task) {
        taskAssignedToCurrentUser = task.assignedTo && (
          task.assignedTo._id === user?.id || 
          task.assignedTo.email === user?.email
        );
        break;
      }
    }
    
    // If the task is not assigned to the current user, show a warning
    if (!taskAssignedToCurrentUser) {
      toast.error("You can't update the status of a task assigned to another user");
      return;
    }

    if (!teamId) return;
    
    try {
      await dispatch(
        moveTask({
          teamId,
          taskId: draggableId,
          status: destCol,
        })
      ).unwrap();
      
      // Show success message
      const statusLabels = {
        'todo': 'To Do',
        'in-progress': 'In Progress',
        'done': 'Done'
      };
      toast.success(`Task moved to ${statusLabels[destCol]}`);
    } catch (e) { 
      console.error('Failed to move task', e);
      toast.error('Failed to move task. Please try again.');
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !id) return;
    setCreating(true);
    try {
      const res = await axios.post(`/api/tasks/${teamId}/projects/${id}/tasks`, {
        title: taskTitle,
        description: taskDescription,
        assignedTo: taskAssignedTo || null,
      });
      dispatch(addTask({ projectId: id, task: res.data }));
      setTaskTitle("");
      setTaskDescription("");
      setTaskAssignedTo(null);
      setCreateOpen(false);
      toast.success('Task created successfully!');
    } catch (e) {
      console.error("Failed to create task", e);
      toast.error('Failed to create task. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!id) return;
    try {
      await axios.delete(`/api/tasks/${teamId}/tasks/${taskId}`);
      dispatch(deleteTask({ projectId: id, taskId }));
      toast.success('Task deleted successfully!');
    } catch (e) {
      console.error("Failed to delete task", e);
      toast.error('Failed to delete task. Please try again.');
    }
  };

  const confirmDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await handleDeleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setTaskToDelete(null);
  };

  const handleEditTask = async () => {
    if (!editingTask || !editTaskTitle.trim()) return;

    // For edit task, we'll let Redux handle the update after API call
    // The optimistic update is handled by the Redux store updateTask action

    try {
      const res = await axios.put(`/api/tasks/${teamId}/tasks/${editingTask._id}`, {
        title: editTaskTitle,
        description: editTaskDescription,
        assignedTo: editTaskAssignedTo || null,
      });

      dispatch(updateTask(res.data));
      setEditingTask(null);
      toast.success('Task updated successfully!');
    } catch (e) {
      console.error("Failed to update task", e);
      toast.error('Failed to update task. Please try again.');
      // If API call fails, refetch tasks to revert the optimistic update
      if (id && project?.teamId) {
        const teamIdToUse = typeof project.teamId === 'object' ? project.teamId._id : project.teamId;
        dispatch(fetchTasks({ teamId: teamIdToUse, projectId: id }));
      }
    }
  };

  const openEditTaskDialog = (task: any) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description || "");
    setEditTaskAssignedTo(task.assignedTo?._id || task.assignedTo || null);
  };

  const canCreateTask = role === "ADMIN" || role === "MANAGER";
  const canAssignTask = role === "ADMIN" || role === "MEMBER";
  const canDeleteTask = role === "ADMIN";

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Kanban Board */}
          <div className="lg:col-span-3">
            {/* Project, Team, and Manager Info */}
            <div className="mb-6 p-4 rounded-lg bg-neutral-800/30 border border-neutral-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-400">Project</h3>
                  <p className="font-medium text-neutral-50">{project?.name || 'Loading...'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-400">Working Team</h3>
                  <p className="font-medium text-neutral-50">{team?.name || 'Loading...'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-400">Manager</h3>
                  <p className="font-medium text-neutral-50">{manager ? manager.name || manager.email : 'No Manager'}</p>
                </div>
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-neutral-50">Project Tasks</h2>
              {canCreateTask && (
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                      <DialogDescription>Add a task to your project board</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="task-title">Task Title</Label>
                        <Input
                          id="task-title"
                          value={taskTitle}
                          onChange={(e: any) => setTaskTitle((e.target as HTMLInputElement).value)}
                          placeholder="e.g., Implement login form"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-description">Description (Optional)</Label>
                        <Input
                          id="task-description"
                          value={taskDescription}
                          onChange={(e: any) => setTaskDescription((e.target as HTMLInputElement).value)}
                          placeholder="Task details"
                        />
                      </div>
                      {(['ADMIN', 'MANAGER', 'MEMBER'].includes(role || '')) && (
                        <div className="space-y-2">
                          <Label htmlFor="task-assignee">Assign To (Optional)</Label>
                          <select
                            id="task-assignee"
                            value={taskAssignedTo || ''}
                            onChange={(e) => setTaskAssignedTo(e.target.value || null)}
                            className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                          >
                            <option value="">Unassigned</option>
                            {teamMembers.map((member) => (
                              <option key={member._id} value={member._id}>
                                {member.name} ({member.email})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setCreateOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTask} disabled={!taskTitle.trim() || creating}>
                        {creating ? "Creating..." : "Create Task"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Edit Task Dialog */}
            {editingTask && (
              <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>Update your task details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-task-title">Task Title</Label>
                      <Input
                        id="edit-task-title"
                        value={editTaskTitle}
                        onChange={(e: any) => setEditTaskTitle((e.target as HTMLInputElement).value)}
                        placeholder="e.g., Implement login form"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-task-description">Description (Optional)</Label>
                      <Input
                        id="edit-task-description"
                        value={editTaskDescription}
                        onChange={(e: any) => setEditTaskDescription((e.target as HTMLInputElement).value)}
                        placeholder="Task details"
                      />
                    </div>
                    {(role === 'ADMIN' || role === 'MEMBER') && (
                      <div className="space-y-2">
                        <Label htmlFor="edit-task-assignee">Assign To (Optional)</Label>
                        <select
                          id="edit-task-assignee"
                          value={editTaskAssignedTo || ''}
                          onChange={(e) => setEditTaskAssignedTo(e.target.value || null)}
                          className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                        >
                          <option value="">Unassigned</option>
                          {teamMembers.map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.name} ({member.email})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditingTask(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEditTask} disabled={!editTaskTitle.trim()}>
                      Update Task
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Kanban Board */}
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {columns.map((col) => (
                  <Droppable droppableId={col} key={col}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`rounded-lg border-2 p-4 min-h-[500px] transition-colors ${snapshot.isDraggingOver
                            ? "border-blue-500 bg-neutral-800/50"
                            : "border-neutral-700 bg-neutral-900/50"
                          }`}
                      >
                        <h3 className="font-bold text-neutral-50 mb-4 text-lg">{columnLabels[col]}</h3>
                        <div className="space-y-3">
                          {grouped[col].length > 0 ? (
                            grouped[col].map((task: any, index: number) => (
                              <Draggable draggableId={task._id} index={index} key={task._id}>
                                {(dr, dsnapshot) => (
                                  <Card
                                    ref={dr.innerRef}
                                    {...dr.draggableProps}
                                    {...dr.dragHandleProps}
                                    className={`cursor-move transition-all ${dsnapshot.isDragging ? "shadow-lg ring-2 ring-blue-500" : "hover:border-neutral-600"
                                      }`}
                                  >
                                    <CardContent className="p-3">
                                      <p className="font-medium text-neutral-50">{task.title}</p>
                                      {task.description && (
                                        <p className="text-xs text-neutral-400 mt-2">{task.description}</p>
                                      )}
                                      {task.assignedTo && (task.assignedTo.name || task.assignedTo.email) && (
                                        <div className="mt-3 flex items-center gap-2">
                                          <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <span className="text-xs font-semibold text-blue-400">
                                              {(task.assignedTo.name || task.assignedTo.email || 'U').charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-xs text-neutral-400">
                                              {task.assignedTo.name || task.assignedTo.email || 'Unassigned'}
                                            </span>
                                            {role !== "MEMBER" && (task.assignedTo._id === user?.id || task.assignedTo.email === user?.email) ? (
                                              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                My Task
                                              </span>
                                            ) : null}
                                          </div>
                                        </div>
                                      )}
                                      {role !== "MEMBER" && (canAssignTask ||
                                        (role === "MANAGER" &&
                                          task.assignedTo &&
                                          (task.assignedTo.email === user?.email || task.assignedTo._id === user?.id))) && (
                                          <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-700">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-7 w-7 p-0"
                                              onClick={() => openEditTaskDialog(task)}
                                            >
                                              <Edit2 className="h-3 w-3" />
                                            </Button>
                                            {canDeleteTask && (
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                                                onClick={() => confirmDeleteTask(task._id)}
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            )}
                                          </div>
                                        )}
                                    </CardContent>
                                  </Card>
                                )}
                              </Draggable>
                            ))
                          ) : (
                            <div className="text-center py-8 text-neutral-500 text-sm">
                              No tasks in {columnLabels[col]}
                            </div>
                          )}
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* AI Assistant Panel removed */}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectBoard;
