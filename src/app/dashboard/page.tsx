
"use client";

import * as React from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { useTasks } from "@/contexts/task-context";
import type { PlannedTask, DailyTask, SubTask, TaskStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LayoutDashboard, ListTodo, Activity, CheckCircle2, CalendarDays, ExternalLink, Info } from "lucide-react";
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
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg">{task.taskName}</CardTitle>
          <Badge variant={getStatusBadgeVariant(task.status)} className="capitalize text-xs">
            {task.status}
          </Badge>
        </div>
        <CardDescription className="text-xs">Deadline: {task.deadline}</CardDescription>
      </CardHeader>
      <CardContent>
        {currentDailyTask ? (
          <div>
            <h4 className="font-semibold text-sm mb-2">Current Focus: {currentDailyTask.dayDescription}</h4>
            {currentDailyTask.subTasks.length > 0 ? (
              <ul className="space-y-1.5">
                {currentDailyTask.subTasks.map((subTask, subIndex) => (
                  <li key={subTask.id} className="flex items-center">
                    <Checkbox
                      id={`dashboard-subtask-${task.id}-${currentDailyTask?.id}-${subTask.id}`}
                      checked={subTask.status === "completed"}
                      onCheckedChange={() => onToggleSubTask(firstActiveDailyTaskIndex, subIndex)}
                      className="mr-2 h-4 w-4"
                    />
                    <Label
                      htmlFor={`dashboard-subtask-${task.id}-${currentDailyTask?.id}-${subTask.id}`}
                      className={cn(
                        "text-sm flex-grow cursor-pointer",
                        subTask.status === "completed" && "line-through text-muted-foreground"
                      )}
                    >
                      {subTask.description}
                    </Label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No sub-tasks for this focus.</p>
            )}
          </div>
        ) : task.status !== 'completed' ? (
          <p className="text-sm text-muted-foreground">
            {task.dailyTasks.length > 0 ? "All daily tasks completed, or no active daily tasks." : "No daily breakdown available."} Review in planner.
          </p>
        ) : (
           <p className="text-sm text-green-600 flex items-center"><CheckCircle2 className="mr-2 h-4 w-4"/>This task is completed!</p>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" asChild>
          <Link href="/planning">
            <CalendarDays className="mr-2 h-4 w-4" /> View Full Plan
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function DashboardPage() {
  const { plannedTasks, toggleSubTaskStatus, isLoading } = useTasks();

  const inProgressTasks = React.useMemo(
    () => plannedTasks.filter(task => task.status === "inprogress").sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [plannedTasks]
  );

  const todoTasks = React.useMemo(
    () => plannedTasks.filter(task => task.status === "todo").sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [plannedTasks]
  );
  
  const recentlyCompletedTasks = React.useMemo(
    () => plannedTasks.filter(task => task.status === "completed").sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0,3), // Show last 3 completed
    [plannedTasks]
  );

  const handleToggleSubTask = (taskId: string, dailyTaskIndex: number, subTaskIndex: number) => {
    toggleSubTaskStatus(taskId, dailyTaskIndex, subTaskIndex);
  };
  
  if (isLoading && plannedTasks.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <AppHeader title="Today's Dashboard" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 flex items-center justify-center">
           <p>Loading tasks...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Today's Dashboard" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {plannedTasks.length === 0 ? (
          <Alert className="max-w-lg mx-auto bg-primary/5">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold text-primary">Welcome to your Dashboard!</AlertTitle>
            <AlertDescription className="text-foreground/80">
              No tasks found. Get started by planning your tasks on the <Link href="/planning" className="font-medium underline hover:text-primary">AI Task Management page</Link>.
            </AlertDescription>
             <div className="mt-4">
                <Button asChild>
                  <Link href="/planning">
                    <ExternalLink className="mr-2 h-4 w-4" /> Go to Planner
                  </Link>
                </Button>
              </div>
          </Alert>
        ) : (
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <Activity className="mr-3 h-6 w-6 text-primary" /> In Progress ({inProgressTasks.length})
                </h2>
                {inProgressTasks.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {inProgressTasks.map(task => (
                      <DashboardTaskCard 
                        key={task.id} 
                        task={task} 
                        onToggleSubTask={(dti, sti) => handleToggleSubTask(task.id, dti, sti)} 
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No tasks currently in progress. Start one from your 'To Do' list!</p>
                )}
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <ListTodo className="mr-3 h-6 w-6 text-accent" /> Up Next (To Do - {todoTasks.length > 3 ? "Top 3" : todoTasks.length})
                </h2>
                {todoTasks.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {todoTasks.slice(0, 3).map(task => (
                       <DashboardTaskCard 
                        key={task.id} 
                        task={task} 
                        onToggleSubTask={(dti, sti) => handleToggleSubTask(task.id, dti, sti)} 
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Your 'To Do' list is empty. Great job or time to plan!</p>
                )}
                 {todoTasks.length > 3 && (
                    <div className="mt-4 text-center">
                        <Button variant="link" asChild>
                            <Link href="/planning">View all {todoTasks.length} To Do tasks...</Link>
                        </Button>
                    </div>
                )}
              </section>
              
              {recentlyCompletedTasks.length > 0 && (
                <section>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                        <CheckCircle2 className="mr-3 h-6 w-6 text-green-500" /> Recently Completed
                    </h2>
                     <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                        {recentlyCompletedTasks.map(task => (
                            <DashboardTaskCard 
                                key={task.id} 
                                task={task} 
                                onToggleSubTask={() => {}} // No action needed for completed
                            />
                        ))}
                    </div>
                </section>
              )}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
