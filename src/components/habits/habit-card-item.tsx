
"use client";

import type { Habit } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import HabitIcon from "./habit-icon";
import { Edit3, Trash2, CheckCircle, Repeat } from "lucide-react";

interface HabitCardItemProps {
  habit: Habit;
  onMarkDone: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  isProcessing?: boolean; // For disabling buttons during async operations
}

export function HabitCardItem({ habit, onMarkDone, onEdit, onDelete, isProcessing }: HabitCardItemProps) {
  const progressPercentage = habit.goal > 0 ? (habit.completedToday / habit.goal) * 100 : 0;
  const isGoalMet = habit.completedToday >= habit.goal;

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <HabitIcon iconName={habit.iconName} className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{habit.name}</CardTitle>
              <CardDescription className="text-xs">
                Streak: {habit.streak} day{habit.streak === 1 ? "" : "s"}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(habit)} disabled={isProcessing}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(habit.id)} disabled={isProcessing}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground mb-1">
          Today's Goal: {habit.completedToday} / {habit.goal}
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onMarkDone(habit.id)}
          disabled={isGoalMet || isProcessing}
          className="w-full"
          variant={isGoalMet ? "outline" : "default"}
        >
          {isGoalMet ? <CheckCircle className="mr-2 h-4 w-4" /> : <Repeat className="mr-2 h-4 w-4" />}
          {isGoalMet ? "Goal Met!" : "Mark as Done"}
        </Button>
      </CardFooter>
    </Card>
  );
}
