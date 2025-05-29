
"use client";

import { useState, useTransition, useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { aiPoweredTaskPlanning, type AiPoweredTaskPlanningInput, type AiPoweredTaskPlanningOutput } from "@/ai/flows/ai-powered-task-planning";
import type { PlannedTask, TaskStatus } from "@/lib/types";
import { TaskCardItem } from "@/components/planning/task-card-item";
import { EditTaskModal } from "@/components/planning/edit-task-modal";
import { ListChecks, Loader2, PackagePlus, FilePenLine, Trash2, Columns } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const taskPlanningSchema = z.object({
  taskDescription: z.string().min(10, "Task description must be at least 10 characters."),
  deadline: z.string().min(3, "Deadline is required."),
});

type TaskPlanningFormValues = z.infer<typeof taskPlanningSchema>;

export default function TaskPlanningPage() {
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>([]);
  const [isAiPending, startAiTransition] = useTransition();
  const { toast } = useToast();

  const [editingTask, setEditingTask] = useState<PlannedTask | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskPlanningFormValues>({
    resolver: zodResolver(taskPlanningSchema),
  });

  const onSubmitAiTask: SubmitHandler<TaskPlanningFormValues> = (data) => {
    startAiTransition(async () => {
      try {
        const result = await aiPoweredTaskPlanning(data as AiPoweredTaskPlanningInput);
        const newTask: PlannedTask = {
          ...(result as AiPoweredTaskPlanningOutput),
          id: Date.now().toString(),
          originalDescription: data.taskDescription,
          deadline: data.deadline,
          createdAt: new Date(),
          isDailyReminderSet: false,
          status: "todo", // Default status
        };
        setPlannedTasks((prevTasks) => [newTask, ...prevTasks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        toast({
          title: "Task Planned Successfully!",
          description: `"${result.taskName}" has been added to your tasks.`,
        });
        reset();
      } catch (error) {
        console.error("Error planning task:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during task planning.";
        toast({
          title: "Task Planning Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    });
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setPlannedTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    const task = plannedTasks.find(t => t.id === taskId);
    if (task) {
         toast({
            title: "Task Status Updated",
            description: `"${task.taskName}" moved to ${newStatus}.`
        });
    }
  };

  const handleDeleteRequest = (taskId: string) => {
    setDeletingTaskId(taskId);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteTask = () => {
    if (!deletingTaskId) return;
    const taskToDelete = plannedTasks.find(task => task.id === deletingTaskId);
    setPlannedTasks(prevTasks => prevTasks.filter(task => task.id !== deletingTaskId));
    setIsDeleteAlertOpen(false);
    if (taskToDelete) {
      toast({
        title: "Task Deleted",
        description: `"${taskToDelete.taskName}" has been removed.`,
      });
    }
    setDeletingTaskId(null);
  };

  const handleEditRequest = (task: PlannedTask) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedTask = (updatedTask: PlannedTask) => {
    setIsSavingEdit(true);
    setPlannedTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    setIsEditModalOpen(false);
    setEditingTask(null);
    setIsSavingEdit(false);
    toast({
      title: "Task Updated",
      description: `Changes to "${updatedTask.taskName}" have been saved.`,
    });
  };
  
  const toggleDailyReminder = (taskId: string) => {
    setPlannedTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, isDailyReminderSet: !task.isDailyReminderSet }
          : task
      )
    );
    const task = plannedTasks.find(t => t.id === taskId);
    if (task) {
      toast({
        title: `Daily Reminder ${task.isDailyReminderSet ? "Disabled" : "Enabled"}`,
        description: `Daily reminder for "${task.taskName}" is now ${task.isDailyReminderSet ? "off" : "on"}. (This is a simulation)`,
      });
    }
  };

  const categorizedTasks = useMemo(() => {
    const todo: PlannedTask[] = [];
    const inprogress: PlannedTask[] = [];
    const completed: PlannedTask[] = [];

    plannedTasks.forEach(task => {
      if (task.status === "todo") todo.push(task);
      else if (task.status === "inprogress") inprogress.push(task);
      else completed.push(task);
    });
    return { todo, inprogress, completed };
  }, [plannedTasks]);

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="AI Task Management" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-1 h-fit sticky top-20"> {/* Made form sticky */}
            <CardHeader>
              <CardTitle>Plan a New Task</CardTitle>
              <CardDescription>Describe your task and set a deadline. AI will help you break it down.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitAiTask)} className="space-y-4">
                <div>
                  <Label htmlFor="taskDescription">Task Description</Label>
                  <Textarea
                    id="taskDescription"
                    placeholder="e.g., Write a blog post about AI in content creation"
                    {...register("taskDescription")}
                    className={errors.taskDescription ? "border-destructive" : ""}
                  />
                  {errors.taskDescription && (
                    <p className="text-sm text-destructive mt-1">{errors.taskDescription.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    placeholder="e.g., End of next week, Tomorrow evening"
                    {...register("deadline")}
                    className={errors.deadline ? "border-destructive" : ""}
                  />
                  {errors.deadline && (
                    <p className="text-sm text-destructive mt-1">{errors.deadline.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isAiPending}>
                  {isAiPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}
                  Plan Task with AI
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
             {plannedTasks.length === 0 ? (
               <Alert className="bg-primary/5 col-span-full">
                <ListChecks className="h-4 w-4 text-primary" />
                <AlertTitle className="font-semibold text-primary">No tasks planned yet.</AlertTitle>
                <AlertDescription className="text-foreground/80">
                  Use the form to create your first AI-assisted task plan. Tasks will appear here in "Todo", "In Progress", and "Completed" columns.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[calc(100vh-12rem)]"> {/* Adjust height as needed */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 @container">
                  {(["todo", "inprogress", "completed"] as TaskStatus[]).map((status) => (
                    <div key={status} className="space-y-4 p-2 rounded-lg bg-muted/30 min-h-[200px]">
                      <h3 className="text-lg font-semibold capitalize sticky top-0 bg-muted/30 py-2 z-10 px-1">{status} ({categorizedTasks[status].length})</h3>
                       {categorizedTasks[status].length === 0 ? (
                         <p className="text-sm text-muted-foreground p-2">No tasks in {status}.</p>
                       ) : (
                        <div className="space-y-4">
                          {categorizedTasks[status].map((task) => (
                            <TaskCardItem
                              key={task.id}
                              task={task}
                              onUpdateStatus={handleUpdateTaskStatus}
                              onDelete={handleDeleteRequest}
                              onEdit={handleEditRequest}
                              onToggleReminder={toggleDailyReminder}
                            />
                          ))}
                        </div>
                       )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </main>

      <EditTaskModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        task={editingTask}
        onSave={handleSaveEditedTask}
        isSaving={isSavingEdit}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              "{plannedTasks.find(task => task.id === deletingTaskId)?.taskName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingTaskId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="bg-destructive hover:bg-destructive/90">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
