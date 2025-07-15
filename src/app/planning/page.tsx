
"use client";

import { useState, useTransition, useMemo, useCallback, useEffect } from "react";
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
import type { PlannedTask, TaskStatus, DailyTask, SubTask } from "@/lib/types";
import { TaskCardItem } from "@/components/planning/task-card-item";
import { EditTaskModal } from "@/components/planning/edit-task-modal";
import { ListChecks, Loader2, PackagePlus, Trash2 } from "lucide-react";
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
import { MiniCalendar } from "@/components/planning/mini-calendar";
import { DashboardSummary } from "@/components/planning/dashboard-summary";
import { useTasks } from "@/contexts/task-context";

const taskPlanningSchema = z.object({
  taskDescription: z.string().min(10, "Task description must be at least 10 characters."),
  deadline: z.string().min(3, "Deadline is required."),
});

type TaskPlanningFormValues = z.infer<typeof taskPlanningSchema>;

export default function TaskPlanningPage() {
  const { 
    plannedTasks, 
    addPlannedTask, 
    updatePlannedTask, 
    deletePlannedTask,
    toggleSubTaskStatus,
    updateTaskStatus,
    toggleDailyReminder,
    isLoading: isContextLoading,
    setIsLoading: setIsContextLoading 
  } = useTasks();
  
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

  useEffect(() => {
    setIsContextLoading(isAiPending);
  }, [isAiPending, setIsContextLoading]);

  const onSubmitAiTask: SubmitHandler<TaskPlanningFormValues> = (data) => {
    startAiTransition(async () => {
      setIsContextLoading(true);
      try {
        const result = await aiPoweredTaskPlanning(data as AiPoweredTaskPlanningInput);
        const newTask: PlannedTask = {
          ...result,
          id: `task-${Date.now()}`, 
          originalDescription: data.taskDescription,
          deadline: data.deadline,
          createdAt: new Date(),
          isDailyReminderSet: false,
          status: "todo", 
          dailyTasks: result.dailyTasks.map((dt, dtIndex) => ({
            ...dt,
            id: dt.id || `daily-${Date.now()}-${dtIndex}`, 
            status: "todo", 
            subTasks: dt.subTasks.map((st, stIndex) => ({
              ...st,
              id: st.id || `sub-${Date.now()}-${dtIndex}-${stIndex}`, 
              status: "todo", 
            })),
          })),
        };
        addPlannedTask(newTask);
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
      } finally {
        setIsContextLoading(false);
      }
    });
  };

  const handleUpdateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
    const taskName = plannedTasks.find(t => t.id === taskId)?.taskName || "Task";
    toast({
      title: "Task Status Updated",
      description: `"${taskName}" moved to ${newStatus}.`,
    });
  }, [updateTaskStatus, plannedTasks, toast]);

  const handleToggleSubTaskStatus = useCallback((taskId: string, dailyTaskIndex: number, subTaskIndex: number) => {
    toggleSubTaskStatus(taskId, dailyTaskIndex, subTaskIndex);
  }, [toggleSubTaskStatus]);

  const handleDeleteRequest = (taskId: string) => {
    setDeletingTaskId(taskId);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteTask = () => {
    if (!deletingTaskId) return;
    const taskToDelete = plannedTasks.find(task => task.id === deletingTaskId);
    deletePlannedTask(deletingTaskId);
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

  const handleSaveEditedTask = (updatedTaskData: PlannedTask) => {
    setIsSavingEdit(true);
     const taskWithProperSubItems = {
      ...updatedTaskData,
      dailyTasks: updatedTaskData.dailyTasks.map((dt, dtIdx) => ({
        ...dt,
        id: dt.id || `daily-${updatedTaskData.id}-${Date.now()}-${dtIdx}`,
        status: dt.status || 'todo',
        subTasks: dt.subTasks.map((st, stIdx) => ({
          ...st,
          id: st.id || `sub-${updatedTaskData.id}-${dt.id || dtIdx}-${Date.now()}-${stIdx}`,
          status: st.status || 'todo',
        })),
      })),
    };
    updatePlannedTask(taskWithProperSubItems);
    setIsEditModalOpen(false);
    setEditingTask(null);
    setIsSavingEdit(false);
    toast({
      title: "Task Updated",
      description: `Changes to "${updatedTaskData.taskName}" have been saved.`,
    });
  };
  
  const handleToggleDailyReminder = (taskId: string) => {
    toggleDailyReminder(taskId);
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
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 @container">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Card className="h-fit sticky top-6 shadow-lg">
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
                  <Button type="submit" className="w-full" disabled={isAiPending || isContextLoading}>
                    {isAiPending || isContextLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}
                    Plan Task with AI
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex-col items-start p-4 border-t">
                <h3 className="text-sm font-medium mb-2 text-card-foreground/80">Calendar</h3>
                 <MiniCalendar />
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <DashboardSummary tasks={plannedTasks} />
             {plannedTasks.length === 0 && !isAiPending && !isContextLoading ? (
               <Alert className="bg-primary/5 col-span-full mt-6 lg:mt-0">
                <ListChecks className="h-4 w-4 text-primary" />
                <AlertTitle className="font-semibold text-primary">No tasks planned yet.</AlertTitle>
                <AlertDescription className="text-foreground/80">
                  Use the form to create your first AI-assisted task plan. Tasks will appear here.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[calc(100vh-18rem)] @lg:h-[calc(100vh-12rem)]">
                 <div className="grid grid-cols-1 @[30rem]:grid-cols-2 @[60rem]:grid-cols-3 gap-4">
                  {(["todo", "inprogress", "completed"] as TaskStatus[]).map((status) => (
                    <div key={status} className="space-y-4 p-2 rounded-lg bg-muted/30 min-h-[200px]">
                      <h3 className="text-lg font-semibold capitalize sticky top-0 bg-muted/50 py-2 z-10 px-1 rounded">{status} ({categorizedTasks[status].length})</h3>
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
                              onToggleReminder={handleToggleDailyReminder}
                              onToggleSubTaskStatus={handleToggleSubTaskStatus}
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
