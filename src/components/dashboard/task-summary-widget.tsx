
"use client";

import * as React from "react";
import Link from "next/link";
import { useTasks } from "@/contexts/task-context";
import type { PlannedTask, TaskStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ListTodo, Activity, CalendarDays, ExternalLink, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const getStatusBadgeVariant = (status: TaskStatus) => {
  switch (status) {
    case "todo": return "secondary";
    case "inprogress": return "default";
    case "completed": return "outline";
    default: return "secondary";
  }
};

interface DashboardTaskCardProps {
  task: PlannedTask;
  onToggleSubTask: (dailyTaskIndex: number, subTaskIndex: number) => void;
}

function DashboardTaskCard({ task, onToggleSubTask }: DashboardTaskCardProps) {
  const firstActiveDailyTaskIndex = task.dailyTasks.findIndex(dt => dt.status !== "completed");
  const currentDailyTask = firstActiveDailyTaskIndex !== -1 ? task.dailyTasks[firstActiveDailyTaskIndex] : null;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 pt-4">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-base">{task.taskName}</CardTitle>
          <Badge variant={getStatusBadgeVariant(task.status)} className="capitalize text-xs px-1.5 py-0.5 h-fit">
            {task.status}
          </Badge>
        </div>
        <CardDescription className="text-xs">Deadline: {task.deadline}</CardDescription>
      </CardHeader>
      <CardContent className="py-3">
        {currentDailyTask ? (
          <div>
            <h4 className="font-semibold text-xs mb-1.5">Focus: {currentDailyTask.dayDescription}</h4>
            {currentDailyTask.subTasks.length > 0 ? (
              <ul className="space-y-1">
                {currentDailyTask.subTasks.slice(0,3).map((subTask, subIndex) => (
                  <li key={subTask.id} className="flex items-center">
                    <Checkbox
                      id={`dashboard-subtask-${task.id}-${currentDailyTask?.id}-${subTask.id}`}
                      checked={subTask.status === "completed"}
                      onCheckedChange={() => onToggleSubTask(firstActiveDailyTaskIndex, subIndex)}
                      className="mr-2 h-3.5 w-3.5"
                    />
                    <Label
                      htmlFor={`dashboard-subtask-${task.id}-${currentDailyTask?.id}-${subTask.id}`}
                      className={cn(
                        "text-xs flex-grow cursor-pointer",
                        subTask.status === "completed" && "line-through text-muted-foreground"
                      )}
                    >
                      {subTask.description}
                    </Label>
                  </li>
                ))}
                {currentDailyTask.subTasks.length > 3 && (
                    <p className="text-xs text-muted-foreground mt-1 italic">...and {currentDailyTask.subTasks.length - 3} more.</p>
                )}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground italic">No sub-tasks for this focus.</p>
            )}
          </div>
        ) : task.status !== 'completed' ? (
          <p className="text-xs text-muted-foreground">
            {task.dailyTasks.length > 0 ? "All daily tasks completed." : "No daily breakdown."}
          </p>
        ) : (
           <p className="text-xs text-green-600 flex items-center"><CheckCircle2 className="mr-1 h-3.5 w-3.5"/>Completed!</p>
        )}
      </CardContent>
      <CardFooter className="pt-3 pb-4">
        <Button variant="outline" size="sm" asChild className="text-xs h-7 px-2">
          <Link href="/planning">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View Full Plan
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export function TaskSummaryWidget() {
  const { plannedTasks, toggleSubTaskStatus, isLoading } = useTasks();

  const inProgressTasks = React.useMemo(
    () => plannedTasks.filter(task => task.status === "inprogress").sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [plannedTasks]
  );

  const todoTasks = React.useMemo(
    () => plannedTasks.filter(task => task.status === "todo").sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [plannedTasks]
  );
  
  const handleToggleSubTask = (taskId: string, dailyTaskIndex: number, subTaskIndex: number) => {
    toggleSubTaskStatus(taskId, dailyTaskIndex, subTaskIndex);
  };
  
  if (isLoading && plannedTasks.length === 0) {
    return <p className="text-muted-foreground text-sm p-4">Loading tasks...</p>;
  }

  const tasksToShow = [...inProgressTasks, ...todoTasks.slice(0, Math.max(0, 3 - inProgressTasks.length))];


  if (tasksToShow.length === 0 && !isLoading) {
    return (
        <Card className="bg-primary/5">
            <CardHeader>
                <CardTitle className="text-lg flex items-center"><ListTodo className="mr-2 h-5 w-5 text-primary"/>No Active Tasks</CardTitle>
                <CardDescription>Your active and upcoming tasks will appear here. Create a new plan to get started!</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/planning"><CalendarDays className="mr-2 h-4 w-4" /> Go to Planner</Link>
                </Button>
            </CardContent>
        </Card>
    );
  }


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Activity className="mr-3 h-5 w-5 text-primary" /> Task Focus
        </CardTitle>
        <CardDescription>
          {inProgressTasks.length > 0 || todoTasks.length > 0 
            ? `You have ${inProgressTasks.length} task(s) in progress and ${todoTasks.length} pending.`
            : "All tasks are complete. Well done!"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tasksToShow.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2">
            {tasksToShow.map(task => (
                <DashboardTaskCard 
                key={task.id} 
                task={task} 
                onToggleSubTask={(dti, sti) => handleToggleSubTask(task.id, dti, sti)} 
                />
            ))}
            </div>
        ) : (
             <div className="text-center py-4">
                <p className="text-green-600 flex items-center justify-center"><CheckCircle2 className="mr-2 h-5 w-5"/>All tasks completed!</p>
             </div>
        )}
         {todoTasks.length > Math.max(0, 3 - inProgressTasks.length) && (
            <div className="mt-4 text-center">
                <Button variant="link" asChild size="sm">
                    <Link href="/planning">View all {todoTasks.length} 'To Do' tasks &rarr;</Link>
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
