
"use client";

import type { PlannedTask } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListTodo, Activity, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";

interface DashboardSummaryProps {
  tasks: PlannedTask[];
}

interface SummaryCardItemProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  className?: string;
}

function SummaryCardItem({ icon, title, count, className }: SummaryCardItemProps) {
  return (
    <Card className={`p-4 flex flex-col items-center justify-center text-center bg-card hover:shadow-lg transition-shadow ${className}`}>
      <div className="mb-2">{icon}</div>
      <p className="text-2xl font-bold text-foreground">{count}</p>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
    </Card>
  );
}

export function DashboardSummary({ tasks }: DashboardSummaryProps) {
  const summary = useMemo(() => {
    return {
      todo: tasks.filter(task => task.status === 'todo').length,
      inprogress: tasks.filter(task => task.status === 'inprogress').length,
      completed: tasks.filter(task => task.status === 'completed').length,
      total: tasks.length,
    };
  }, [tasks]);

  return (
    <Card className="mb-6 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Tasks At a Glance</CardTitle>
        {summary.total > 0 ? (
          <CardDescription>
            You have {summary.total} task{summary.total === 1 ? '' : 's'} in total.
          </CardDescription>
        ) : (
          <CardDescription>No tasks planned yet. Start by creating one!</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCardItem 
            icon={<ListTodo className="h-5 w-5 text-primary" />} 
            title="To Do" 
            count={summary.todo} 
          />
          <SummaryCardItem 
            icon={<Activity className="h-5 w-5 text-accent" />} 
            title="In Progress" 
            count={summary.inprogress} 
          />
          <SummaryCardItem 
            icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} // Using a direct color for completed state
            title="Completed" 
            count={summary.completed}
          />
        </div>
      </CardContent>
    </Card>
  );
}
