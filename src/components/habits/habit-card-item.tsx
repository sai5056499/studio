
"use client";

import type { Habit } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import HabitIcon from "./habit-icon";
import { MoreVertical, Edit3, Trash2, CheckCircle, Repeat } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-primary/10 flex items-center justify-center rounded-lg">
                <HabitIcon iconName={habit.iconName} className="h-6 w-6 text-primary" />
            </Avatar>
            <div>
                <CardTitle className="text-base font-semibold">{habit.name}</CardTitle>
                 <p className="text-xs text-muted-foreground">
                    Streak: {habit.streak} day{habit.streak === 1 ? "" : "s"}
                 </p>
            </div>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(habit)}>
                    <Edit3 className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(habit.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow pt-2">
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

// Dummy Avatar for structure, can be replaced with ShadCN's if available
const Avatar = ({ className, children }: { className?: string, children: React.ReactNode }) => (
    <div className={className}>{children}</div>
);
