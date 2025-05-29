
"use client";

import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { PlannedTask, DailyTask, SubTask } from "@/lib/types"; // Import SubTask
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

// Updated schema for editing a task to reflect new DailyTask and SubTask structure
const editSubTaskSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Sub-task description cannot be empty."),
  status: z.enum(["todo", "inprogress", "completed"]),
});

const editDailyTaskSchema = z.object({
  id: z.string(),
  dayDescription: z.string().min(1, "Daily task description cannot be empty."),
  subTasks: z.array(editSubTaskSchema),
  status: z.enum(["todo", "inprogress", "completed"]),
});

const editTaskSchema = z.object({
  taskName: z.string().min(3, "Task name must be at least 3 characters."),
  originalDescription: z.string().min(10, "Original description must be at least 10 characters."),
  deadline: z.string().min(3, "Deadline is required."),
  overallReminder: z.string().optional(),
  dailyTasksString: z.string().optional().describe("JSON string of daily tasks including sub-tasks and statuses."),
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
      setValue("overallReminder", task.overallReminder || "");
      try {
        setValue("dailyTasksString", JSON.stringify(task.dailyTasks, null, 2));
      } catch (e) {
        setValue("dailyTasksString", "Error parsing daily tasks. Please check console.");
        console.error("Error serializing daily tasks for modal:", e);
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

    let parsedDailyTasks: DailyTask[] = task.dailyTasks; // Keep original if parsing fails or string is empty

    if (data.dailyTasksString && data.dailyTasksString.trim() !== "") {
      try {
        const newDailyTasksRaw = JSON.parse(data.dailyTasksString);
        // Validate and map to ensure structure and default values
        if (Array.isArray(newDailyTasksRaw)) {
          parsedDailyTasks = newDailyTasksRaw.map((dt: any, dtIndex: number) => ({
            id: dt.id || `daily-${task.id}-${Date.now()}-${dtIndex}`,
            dayDescription: dt.dayDescription || "Untitled Day",
            status: dt.status && ["todo", "inprogress", "completed"].includes(dt.status) ? dt.status : "todo",
            subTasks: Array.isArray(dt.subTasks) ? dt.subTasks.map((st: any, stIndex: number) => ({
              id: st.id || `sub-${task.id}-${dt.id || dtIndex}-${Date.now()}-${stIndex}`,
              description: st.description || "Untitled Sub-task",
              status: st.status && ["todo", "inprogress", "completed"].includes(st.status) ? st.status : "todo",
            } as SubTask)) : [],
          } as DailyTask));
        } else {
            throw new Error("Daily tasks JSON is not an array.");
        }
      } catch (e) {
        console.error("Failed to parse or validate daily tasks JSON string during edit:", e);
        // Optionally, add a toast message here to inform the user about the parsing error
        // For now, we'll proceed with the original dailyTasks if parsing fails.
      }
    }


    onSave({
      ...task, // Spread existing task properties (like id, createdAt, etc.)
      taskName: data.taskName,
      originalDescription: data.originalDescription,
      deadline: data.deadline,
      overallReminder: data.overallReminder || task.overallReminder, // Keep original if new is empty
      dailyTasks: parsedDailyTasks,
      // status will be recalculated based on children by the parent component if necessary
    });
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Task: {task.taskName}</DialogTitle>
          <DialogDescription>Make changes to your task details below. Editing daily tasks via JSON requires care.</DialogDescription>
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
                rows={10}
                placeholder='[{"id": "daily-1", "dayDescription": "Day 1", "status": "todo", "subTasks": [{"id": "sub-1-1", "description": "Subtask 1", "status": "todo"}]}]'
                className="font-mono text-xs"
              />
              {errors.dailyTasksString && <p className="text-sm text-destructive mt-1">{errors.dailyTasksString.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Edit daily tasks as a JSON array. Ensure each daily task and sub-task has an `id`, `description`, and `status`.
                Incorrect formatting may lead to errors or data loss for daily tasks.
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

