
"use client";

import * as React from "react";
import { useHabits } from "@/contexts/habit-context";
import type { Habit } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import HabitIcon from "@/components/habits/habit-icon";
import { CheckCircle, Repeat, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";


interface MiniHabitCardProps {
  habit: Habit;
  onMarkDone: (habitId: string) => void;
  isProcessing?: boolean;
}

function MiniHabitCard({ habit, onMarkDone, isProcessing }: MiniHabitCardProps) {
  const progressPercentage = habit.goal > 0 ? (habit.completedToday / habit.goal) * 100 : 0;
  const isGoalMet = habit.completedToday >= habit.goal;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow p-3">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <HabitIcon iconName={habit.iconName} className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium truncate" title={habit.name}>{habit.name}</span>
        </div>
        <span className="text-xs text-muted-foreground">🔥 {habit.streak}</span>
      </div>
      <Progress value={progressPercentage} className="h-1.5 mb-2" />
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>{habit.completedToday}/{habit.goal}</span>
        {isGoalMet && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
      </div>
      <Button
        size="sm"
        variant={isGoalMet ? "outline" : "default"}
        className="w-full h-7 text-xs"
        onClick={() => onMarkDone(habit.id)}
        disabled={isGoalMet || isProcessing}
      >
        {isGoalMet ? "Done!" : "Mark Done"}
      </Button>
    </Card>
  );
}


export function HabitStreaksWidget() {
  const { habits, markHabitDone, isLoading, checkAndResetStreaks } = useHabits();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!isLoading) {
      checkAndResetStreaks();
    }
  }, [isLoading, checkAndResetStreaks]);

  const handleMarkDone = (habitId: string) => {
     markHabitDone(habitId);
     const habit = habits.find(h => h.id === habitId);
     if (habit && habit.completedToday +1 >= habit.goal && habit.completedToday < habit.goal) { // Toast only on the completion that meets the goal
        toast({ title: "Goal Achieved!", description: `You've met your goal for "${habit.name}" today!`});
     }
  };

  if (isLoading && habits.length === 0) {
     return <p className="text-muted-foreground text-sm p-4">Loading habits...</p>;
  }

  const activeHabits = habits.slice(0, 4); // Show max 4 habits on dashboard

  if (activeHabits.length === 0 && !isLoading) {
    return (
        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle className="text-lg flex items-center"><Zap className="mr-2 h-5 w-5 text-accent"/>No Habits Tracked</CardTitle>
                <CardDescription>Start tracking your daily habits to build streaks and achieve your goals.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button asChild>
                    <Link href="/habits"><Repeat className="mr-2 h-4 w-4" /> Go to Habit Tracker</Link>
                </Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center">
            <TrendingUp className="mr-3 h-5 w-5 text-accent" /> Daily Habits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {activeHabits.map(habit => (
                <MiniHabitCard 
                    key={habit.id} 
                    habit={habit} 
                    onMarkDone={handleMarkDone}
                />
            ))}
        </div>
        {habits.length > 4 && (
             <div className="mt-3 text-center">
                <Button variant="link" asChild size="sm">
                    <Link href="/habits">View all {habits.length} habits...</Link>
                </Button>
            </div>
        )}
    </div>
  );
}
