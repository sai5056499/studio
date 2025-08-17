
"use client";

import * as React from "react";
import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { ListChecks, CheckSquare, TrendingUp, Target, Loader2 } from "lucide-react";


import type { Habit } from "@/lib/types";
import type { PlannedTask, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const HABITS_STORAGE_KEY = "contentAllyHabits";
const TASKS_STORAGE_KEY = "contentAllyTasks";

interface KeyMetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  className?: string;
}

function KeyMetricCard({ title, value, subtext, icon: Icon, className }: KeyMetricCardProps) {
  return (
    <Card className={cn("shadow-md hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  );
}

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  overallProductivity: number;
  longestStreak: { name: string; streak: number } | null;
  taskStatusDistribution: { name: string; value: number; fill: string }[];
  habitStreakData: { name: string; streak: number; fill: string }[];
  taskCompletionData: { name: string; completed: number; pending: number }[];
}

const initialAnalyticsData: AnalyticsData = {
  totalTasks: 0,
  completedTasks: 0,
  overallProductivity: 0,
  longestStreak: null,
  taskStatusDistribution: [],
  habitStreakData: [],
  taskCompletionData: [
    { name: "Mon", completed: 3, pending: 2 },
    { name: "Tue", completed: 5, pending: 1 },
    { name: "Wed", completed: 4, pending: 3 },
    { name: "Thu", completed: 6, pending: 1 },
    { name: "Fri", completed: 7, pending: 0 },
    { name: "Sat", completed: 2, pending: 1 },
    { name: "Sun", completed: 1, pending: 0 },
  ],
};

const taskStatusColors: Record<TaskStatus | string, string> = {
  todo: "hsl(var(--chart-3))",
  inprogress: "hsl(var(--chart-2))",
  completed: "hsl(var(--chart-1))",
  default: "hsl(var(--chart-4))",
};

const habitChartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = React.useState<AnalyticsData>(initialAnalyticsData);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    let loadedHabits: Habit[] = [];
    let loadedTasks: PlannedTask[] = [];

    if (typeof window !== "undefined") {
      try {
        const habitsJson = localStorage.getItem(HABITS_STORAGE_KEY);
        if (habitsJson) {
          loadedHabits = JSON.parse(habitsJson);
        }
      } catch (e) {
        console.error("Error parsing habits from localStorage:", e);
      }

      try {
        const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
        if (tasksJson) {
          loadedTasks = JSON.parse(tasksJson);
        }
      } catch (e) {
        console.error("Error parsing tasks from localStorage:", e);
      }
    }

    // Process Habit Data
    let longestStreak: { name: string; streak: number } | null = null;
    if (loadedHabits.length > 0) {
      longestStreak = loadedHabits.reduce(
        (max, habit) => (habit.streak > max.streak ? { name: habit.name, streak: habit.streak } : max),
        { name: loadedHabits[0].name, streak: loadedHabits[0].streak || 0 }
      );
      if (longestStreak && longestStreak.streak === 0 && loadedHabits.every(h => h.streak === 0)) {
        longestStreak = { name: "No active streaks", streak: 0};
      }
    } else {
        longestStreak = { name: "No habits tracked", streak: 0};
    }


    const habitStreakData = loadedHabits
      .filter(h => h.streak > 0)
      .sort((a,b) => b.streak - a.streak)
      .slice(0, 5) // Top 5 habits by streak
      .map((habit, index) => ({
        name: habit.name,
        streak: habit.streak,
        fill: habitChartColors[index % habitChartColors.length],
      }));

    // Process Task Data
    const totalTasks = loadedTasks.length;
    const completedTasks = loadedTasks.filter(task => task.status === "completed").length;
    const overallProductivity = totalTasks > 0 ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(1)) : 0;

    const statusCounts: Record<TaskStatus, number> = {
      todo: 0,
      inprogress: 0,
      completed: 0,
    };
    loadedTasks.forEach(task => {
      if (task.status) {
        statusCounts[task.status]++;
      }
    });

    const taskStatusDistribution = (Object.keys(statusCounts) as TaskStatus[])
      .filter(status => statusCounts[status] > 0)
      .map(status => ({
        name: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize
        value: statusCounts[status],
        fill: taskStatusColors[status] || taskStatusColors.default,
      }));

    setAnalyticsData(prev => ({
      ...prev,
      totalTasks,
      completedTasks,
      overallProductivity,
      longestStreak,
      taskStatusDistribution,
      habitStreakData,
    }));
    setIsLoading(false);
  }, []);

  const taskCompletionChartConfig = {
    completed: { label: "Completed", color: "hsl(var(--chart-1))" },
    pending: { label: "Pending", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  const taskStatusChartConfig = React.useMemo(() => {
    return analyticsData.taskStatusDistribution.reduce((acc, cur) => {
        acc[cur.name] = {label: cur.name, color: cur.fill};
        return acc;
    }, {} as ChartConfig);
  }, [analyticsData.taskStatusDistribution]);
  
  const habitPerformanceChartConfig = React.useMemo(() => {
     return analyticsData.habitStreakData.reduce((acc, cur) => {
        acc[cur.name] = {label: cur.name, color: cur.fill};
        return acc;
    }, {} as ChartConfig);
  }, [analyticsData.habitStreakData]);


  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <AppHeader title="Analytics Dashboard" />
        <main className="flex-1 flex items-center justify-center p-4 md:p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading analytics data...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Analytics Dashboard" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* Key Metrics Section */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KeyMetricCard
            title="Total AI Planned Tasks"
            value={analyticsData.totalTasks}
            subtext="All tasks in system"
            icon={ListChecks}
          />
          <KeyMetricCard
            title="Completed Tasks"
            value={analyticsData.completedTasks}
            subtext={`Out of ${analyticsData.totalTasks} total`}
            icon={CheckSquare}
          />
          <KeyMetricCard
            title="Longest Habit Streak"
            value={`${analyticsData.longestStreak?.streak || 0} days`}
            subtext={analyticsData.longestStreak?.name || "N/A"}
            icon={TrendingUp}
          />
          <KeyMetricCard
            title="Overall Task Productivity"
            value={`${analyticsData.overallProductivity}%`}
            subtext="Ratio of completed tasks"
            icon={Target}
          />
        </section>

        {/* Charts Section */}
        <section className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Task Completion Rate (Mock Weekly Trend)</CardTitle>
              <CardDescription>Overview of tasks completed vs. pending (mock data).</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={taskCompletionChartConfig} className="h-[350px] w-full">
                <BarChart data={analyticsData.taskCompletionData} accessibilityLayer>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="var(--color-pending)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
              <CardDescription>Current breakdown of all AI planned tasks by status.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[350px]">
              {analyticsData.taskStatusDistribution.length > 0 ? (
                <ChartContainer config={taskStatusChartConfig} className="w-full h-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={analyticsData.taskStatusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={50}
                    >
                      {analyticsData.taskStatusDistribution.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                      ))}
                    </Pie>
                     <ChartLegend content={<ChartLegendContent nameKey="name"/>} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <p className="text-muted-foreground">No task data available to display distribution.</p>
              )}
            </CardContent>
          </Card>
        </section>
        
        <section>
           <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Top Habit Streaks</CardTitle>
              <CardDescription>Current streaks for your most consistent habits.</CardDescription>
            </CardHeader>
            <CardContent>
                {analyticsData.habitStreakData.length > 0 ? (
                    <ChartContainer config={habitPerformanceChartConfig} className="h-[350px] w-full">
                        <BarChart data={analyticsData.habitStreakData} layout="vertical" accessibilityLayer>
                        <CartesianGrid horizontal={false} strokeDasharray="3 3"/>
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={10}
                            width={100} 
                            className="text-xs"
                        />
                        <XAxis dataKey="streak" type="number" tickLine={false} axisLine={false} tickMargin={10}/>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" nameKey="name" />}
                        />
                        <Bar dataKey="streak" radius={[0, 4, 4, 0]} barSize={30}>
                             {analyticsData.habitStreakData.map((entry, index) => (
                                <Cell key={`cell-habit-${index}`} fill={entry.fill} name={entry.name} />
                            ))}
                        </Bar>
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <p className="text-muted-foreground text-center py-10">No active habit streaks to display.</p>
                )}
            </CardContent>
          </Card>
        </section>

      </main>
    </div>
  );
}
