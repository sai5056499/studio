
"use client";

import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { PlannedTask } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

// Schema for editing a task. Daily tasks and overall reminder are strings for simplicity.
// For complex editing of daily tasks, a more involved UI would be needed.
const editTaskSchema = z.object({
  taskName: z.string().min(3, "Task name must be at least 3 characters."),
  originalDescription: z.string().min(10, "Original description must be at least 10 characters."),
  deadline: z.string().min(3, "Deadline is required."),
  overallReminder: z.string().optional(),
  // dailyTasks editing is simplified to a textarea for this version
  dailyTasksString: z.string().optional().describe("JSON string of daily tasks. For advanced users or simple text edits."),
});

type EditTaskFormValues = z.infer<typeof editTaskSchema>;

interface EditTaskModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: PlannedTask | null;
  onSave: (updatedTask: PlannedTask) => void;
  isSaving: boolean;
}

export function EditTaskModal({ isOpen, onOpenChange, task, onSave, isSaving }: EditTaskModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
  });

  useEffect(() => {
    if (task) {
      setValue("taskName", task.taskName);
      setValue("originalDescription", task.originalDescription);
      setValue("deadline", task.deadline);
      setValue("overallReminder", task.overallReminder);
      // Serialize dailyTasks for the textarea. If parsing fails, provide a fallback.
      try {
        setValue("dailyTasksString", JSON.stringify(task.dailyTasks, null, 2));
      } catch (e) {
        setValue("dailyTasksString", "Error parsing daily tasks. Edit manually or re-plan.");
      }
    } else {
      reset({ 
        taskName: "", 
        originalDescription: "", 
        deadline: "", 
        overallReminder: "",
        dailyTasksString: "[]"
      });
    }
  }, [task, setValue, reset]);

  const onSubmit: SubmitHandler<EditTaskFormValues> = (data) => {
    if (!task) return;

    let parsedDailyTasks = task.dailyTasks; // Keep original if parsing fails
    if (data.dailyTasksString) {
      try {
        const newDailyTasks = JSON.parse(data.dailyTasksString);
        // Basic validation for array structure
        if (Array.isArray(newDailyTasks)) {
            parsedDailyTasks = newDailyTasks.map(dt => ({
                dayDescription: dt.dayDescription || "Untitled Day",
                subTasks: Array.isArray(dt.subTasks) ? dt.subTasks.map(String) : [],
            }));
        }
      } catch (e) {
        // If parsing fails, we could alert the user or just keep the old tasks
        console.warn("Failed to parse daily tasks JSON string during edit:", e);
        // Optionally, you can add a toast message here to inform the user
      }
    }

    onSave({
      ...task,
      taskName: data.taskName,
      originalDescription: data.originalDescription,
      deadline: data.deadline,
      overallReminder: data.overallReminder || task.overallReminder,
      dailyTasks: parsedDailyTasks,
    });
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Task: {task.taskName}</DialogTitle>
          <DialogDescription>Make changes to your task details below.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-taskName">Task Name</Label>
              <Input
                id="edit-taskName"
                {...register("taskName")}
                className={errors.taskName ? "border-destructive" : ""}
              />
              {errors.taskName && <p className="text-sm text-destructive mt-1">{errors.taskName.message}</p>}
            </div>
            <div>
              <Label htmlFor="edit-originalDescription">Original Description</Label>
              <Textarea
                id="edit-originalDescription"
                {...register("originalDescription")}
                className={errors.originalDescription ? "border-destructive" : ""}
              />
              {errors.originalDescription && <p className="text-sm text-destructive mt-1">{errors.originalDescription.message}</p>}
            </div>
            <div>
              <Label htmlFor="edit-deadline">Deadline</Label>
              <Input
                id="edit-deadline"
                {...register("deadline")}
                className={errors.deadline ? "border-destructive" : ""}
              />
              {errors.deadline && <p className="text-sm text-destructive mt-1">{errors.deadline.message}</p>}
            </div>
            <div>
              <Label htmlFor="edit-overallReminder">Overall Reminder (Optional)</Label>
              <Textarea
                id="edit-overallReminder"
                {...register("overallReminder")}
              />
            </div>
            <div>
              <Label htmlFor="edit-dailyTasksString">Daily Tasks (JSON Format)</Label>
              <Textarea
                id="edit-dailyTasksString"
                {...register("dailyTasksString")}
                rows={8}
                placeholder='[{"dayDescription": "Day 1", "subTasks": ["Subtask 1"]}]'
              />
              <p className="text-xs text-muted-foreground mt-1">
                Edit the daily tasks as a JSON array. Be careful with the formatting.
                A simpler way to re-plan daily tasks with AI might be added in the future.
              </p>
            </div>
          </form>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
