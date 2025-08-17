
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, Target, MoreHorizontal, Edit, Trash2, Calendar, AlertTriangle, PlayCircle, CheckCircle2, Undo2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PlannedTask, TaskStatus } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  MoreVertical,
  RefreshCcw,
  ListChecks,
  BellRing,
  BellOff,
} from "lucide-react";
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

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow w-full break-inside-avoid-column">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-grow min-w-0">
            <CardTitle className="text-lg mb-1 break-words">{task.taskName}</CardTitle>
            <div className="flex items-center text-xs text-muted-foreground mb-1">
              <Clock className="inline-block mr-1 h-3 w-3" />
              <span>Deadline: {task.deadline}</span>
            </div>
            <Badge variant={getStatusBadgeVariant(task.status)} className="capitalize text-xs">
              {task.status}
            </Badge>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant={task.isDailyReminderSet ? "outline" : "ghost"}
              size="icon"
              onClick={() => onToggleReminder(task.id)}
              className="h-7 w-7"
              aria-label={task.isDailyReminderSet ? "Turn off daily reminder" : "Set daily reminder"}
            >
              {task.isDailyReminderSet ? <BellOff className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
            </Button>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Task options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                                 {task.status !== 'inprogress' && (
                   <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "inprogress")}>
                     <PlayCircle className="mr-2 h-4 w-4" />
                     Move to In Progress
                   </DropdownMenuItem>
                 )}
                 {task.status !== 'completed' && (
                   <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "completed")}>
                     <CheckCircle2 className="mr-2 h-4 w-4" />
                     Mark as Completed
                   </DropdownMenuItem>
                 )}
                 {task.status !== 'todo' && (
                   <DropdownMenuItem onClick={() => onUpdateStatus(task.id, "todo")}>
                     <Undo2 className="mr-2 h-4 w-4" />
                     Move to Todo
                   </DropdownMenuItem>
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
        <CardFooter className="bg-muted/30 p-3 rounded-b-lg">
          <p className="text-xs text-muted-foreground italic">Reminder: {task.overallReminder}</p>
        </CardFooter>
      )}
    </Card>
  );
}
