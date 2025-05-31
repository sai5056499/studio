
"use client";

import * as React from "react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHabits } from "@/contexts/habit-context";
import type { Habit, HabitFormData } from "@/lib/types";
import { HabitCardItem } from "@/components/habits/habit-card-item";
import { EditHabitModal } from "@/components/habits/edit-habit-modal";
import { PlusCircle, Repeat, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function HabitsPage() {
  const { habits, addHabit, updateHabit, deleteHabit, markHabitDone, isLoading, checkAndResetStreaks } = useHabits();
  const { toast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [habitToEdit, setHabitToEdit] = React.useState<Habit | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const [deletingHabitId, setDeletingHabitId] = React.useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);

  React.useEffect(() => {
    // Check and reset streaks when the component mounts and habits are loaded
    if (!isLoading) {
      checkAndResetStreaks();
    }
  }, [isLoading, checkAndResetStreaks]);


  const handleOpenAddModal = () => {
    setHabitToEdit(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsEditModalOpen(true);
  };

  const handleSaveHabit = async (data: HabitFormData, habitId?: string) => {
    setIsSaving(true);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    if (habitId) {
      const fullHabitToUpdate = habits.find(h => h.id === habitId);
      if (fullHabitToUpdate) {
        updateHabit({ ...fullHabitToUpdate, ...data });
        toast({ title: "Habit Updated", description: `"${data.name}" has been updated.` });
      }
    } else {
      addHabit(data);
      toast({ title: "Habit Added", description: `"${data.name}" has been added to your tracker.` });
    }
    setIsSaving(false);
    setIsEditModalOpen(false);
  };

  const handleDeleteRequest = (habitId: string) => {
    setDeletingHabitId(habitId);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteHabit = async () => {
    if (!deletingHabitId) return;
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 300));
    const habitName = habits.find(h => h.id === deletingHabitId)?.name || "The habit";
    deleteHabit(deletingHabitId);
    toast({ title: "Habit Deleted", description: `"${habitName}" has been removed.`, variant: "destructive" });
    setIsDeleteAlertOpen(false);
    setDeletingHabitId(null);
  };

  const handleMarkDone = async (habitId: string) => {
     markHabitDone(habitId);
     const habit = habits.find(h => h.id === habitId);
     if (habit && habit.completedToday + 1 >= habit.goal) {
        toast({ title: "Goal Achieved!", description: `You've met your goal for "${habit.name}" today!`});
     }
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <AppHeader title="Habit Tracker" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading habits...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Habit Tracker" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Card className="shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Your Daily Habits</CardTitle>
              <CardDescription>Track your progress and build positive routines.</CardDescription>
            </div>
            <Button onClick={handleOpenAddModal}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Habit
            </Button>
          </CardHeader>
          <CardContent>
            {habits.length === 0 ? (
              <Alert className="bg-primary/5">
                <Repeat className="h-5 w-5 text-primary" />
                <AlertTitle className="font-semibold text-primary">No Habits Yet!</AlertTitle>
                <AlertDescription className="text-foreground/80">
                  Click "Add New Habit" to start tracking your goals and building streaks.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {habits.map((habit) => (
                  <HabitCardItem
                    key={habit.id}
                    habit={habit}
                    onMarkDone={handleMarkDone}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteRequest}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <EditHabitModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        habitToEdit={habitToEdit}
        onSave={handleSaveHabit}
        isSaving={isSaving}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the habit
              "{habits.find(h => h.id === deletingHabitId)?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingHabitId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteHabit} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
