
"use client";

import type { PlannedTask, TaskStatus, DailyTask, SubTask } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  CalendarClock,
  Edit2,
  Trash2,
  PlayCircle,
  CheckCircle2,
  Undo2,
  ListChecks,
  BellRing,
  BellOff,
  MoreVertical,
  RefreshCcw,
  ChevronDown,
  ChevronRight,
  Circle, // For todo sub-task
  MinusCircle, // For in-progress sub-task (optional)
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TaskCardItemProps {
  task: PlannedTask;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: PlannedTask) => void;
  onToggleReminder: (taskId: string) => void;
  onToggleSubTaskStatus: (taskId: string, dailyTaskIndex: number, subTaskIndex: number) => void;
}

export function TaskCardItem({ 
  task, 
  onUpdateStatus, 
  onDelete, 
  onEdit, 
  onToggleReminder,
  onToggleSubTaskStatus
}: TaskCardItemProps) {
  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return "secondary";
      case "inprogress":
        return "default";
      case "completed":
        return "outline"; 
      default:
        return "secondary";
    }
  };

  const getSubTaskIcon = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "inprogress": // Optional: if sub-tasks can be in-progress
        return <MinusCircle className="h-4 w-4 text-blue-500" />;
      case "todo":
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="shadow-lg w-full break-inside-avoid-column">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-grow">
            <CardTitle className="text-lg mb-1">{task.taskName}</CardTitle>
            <div className="flex items-center text-xs text-muted-foreground mb-1">
              <CalendarClock className="inline-block mr-1 h-3 w-3" />
              <span>Deadline: {task.deadline}</span>
            </div>
            <Badge variant={getStatusBadgeVariant(task.status)} className="capitalize text-xs">
              {task.status}
            </Badge>
          </div>
          <div className="flex flex-col items-end space-y-1 shrink-0">
            <Button
              variant={task.isDailyReminderSet ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleReminder(task.id)}
              className="text-xs px-2 py-1 h-auto"
            >
              {task.isDailyReminderSet ? <BellOff className="mr-1 h-3 w-3" /> : <BellRing className="mr-1 h-3 w-3" />}
              <span className="group-data-[collapsible=icon]:hidden">{task.isDailyReminderSet ? "Reminder On" : "Set Reminder"}</span>
            </Button>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Task options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                {task.status === "todo" && (
                  <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "inprogress")}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Start Task
                  </DropdownMenuItem>
                )}
                {task.status === "inprogress" && (
                  <>
                    <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "completed")}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "todo")}>
                      <Undo2 className="mr-2 h-4 w-4" />
                      Move to Todo
                    </DropdownMenuItem>
                  </>
                )}
                {task.status === "completed" && (
                  <>
                    <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "inprogress")}>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Move to In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "todo")}>
                      <Undo2 className="mr-2 h-4 w-4" />
                      Reopen (Move to Todo)
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-2 italic">
          Original: {task.originalDescription}
        </p>
        <h4 className="font-semibold mb-1 text-sm flex items-center">
          <ListChecks className="mr-2 h-4 w-4" />Daily Breakdown:
        </h4>
        {task.dailyTasks && task.dailyTasks.length > 0 ? (
          <Accordion type="single" collapsible className="w-full" defaultValue={`day-${task.id}-0`}>
            {task.dailyTasks.map((dailyTask, dailyIndex) => (
              <AccordionItem value={`day-${task.id}-${dailyIndex}`} key={dailyTask.id || dailyIndex} className="border-b-muted/50">
                <AccordionTrigger className="text-xs font-medium hover:no-underline py-1.5 px-1 text-left">
                  <div className="flex items-center justify-between w-full">
                    <span>{dailyTask.dayDescription}</span>
                    <Badge variant={getStatusBadgeVariant(dailyTask.status)} size="sm" className="capitalize ml-2 text-xs px-1.5 py-0.5 h-auto">
                      {dailyTask.status}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-3 pt-1 pb-1 text-xs">
                  {dailyTask.subTasks && dailyTask.subTasks.length > 0 ? (
                    <ul className="list-none space-y-1.5">
                      {dailyTask.subTasks.map((subTask, subIndex) => (
                        <li key={subTask.id || subIndex} className="flex items-center">
                          <Checkbox
                            id={`subtask-${task.id}-${dailyTask.id}-${subTask.id}`}
                            checked={subTask.status === "completed"}
                            onCheckedChange={() => onToggleSubTaskStatus(task.id, dailyIndex, subIndex)}
                            className="mr-2 h-3.5 w-3.5"
                          />
                          <Label 
                            htmlFor={`subtask-${task.id}-${dailyTask.id}-${subTask.id}`}
                            className={cn(
                              "text-xs flex-grow cursor-pointer",
                              subTask.status === "completed" && "line-through text-muted-foreground"
                            )}
                          >
                            {subTask.description}
                          </Label>
                        </li>
                      ))}
                    </ul>
                  ) : (
                     <p className="text-xs text-muted-foreground italic">No sub-tasks for this day.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-xs text-muted-foreground">No daily steps provided for this task.</p>
        )}
      </CardContent>
      {task.overallReminder && (
        <CardFooter>
          <p className="text-xs text-muted-foreground italic">Reminder: {task.overallReminder}</p>
        </CardFooter>
      )}
    </Card>
  );
}
