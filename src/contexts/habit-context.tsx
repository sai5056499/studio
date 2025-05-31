
"use client";

import type { Habit, HabitFormData } from "@/lib/types";
import type { ReactNode } from "react";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { format, isToday, isYesterday, subDays } from "date-fns";

interface HabitContextType {
  habits: Habit[];
  addHabit: (habitData: HabitFormData) => void;
  updateHabit: (updatedHabit: Habit) => void;
  deleteHabit: (habitId: string) => void;
  markHabitDone: (habitId: string) => void;
  isLoading: boolean;
  checkAndResetStreaks: () => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

const HABITS_STORAGE_KEY = "contentAllyHabits";

const initialHabits: Habit[] = [
  { id: `habit-${Date.now()}-1`, name: "Drink Water", iconName: "GlassWater", goal: 8, completedToday: 0, streak: 0, lastCompletedDate: null, createdAt: new Date() },
  { id: `habit-${Date.now()}-2`, name: "Read", iconName: "BookOpen", goal: 1, completedToday: 0, streak: 0, lastCompletedDate: null, createdAt: new Date() },
  { id: `habit-${Date.now()}-3`, name: "Exercise", iconName: "Dumbbell", goal: 1, completedToday: 0, streak: 0, lastCompletedDate: null, createdAt: new Date() },
  { id: `habit-${Date.now()}-4`, name: "Meditate", iconName: "Brain", goal: 1, completedToday: 0, streak: 0, lastCompletedDate: null, createdAt: new Date() },
  { id: `habit-${Date.now()}-5`, name: "Write Journal", iconName: "PenSquare", goal: 1, completedToday: 0, streak: 0, lastCompletedDate: null, createdAt: new Date() },
];

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start true until loaded

  useEffect(() => {
    setIsLoading(true);
    if (typeof window !== "undefined") {
      const savedHabitsJson = localStorage.getItem(HABITS_STORAGE_KEY);
      if (savedHabitsJson) {
        try {
          const parsedHabits = JSON.parse(savedHabitsJson).map((h: any) => ({
            ...h,
            createdAt: new Date(h.createdAt),
          }));
          setHabits(parsedHabits);
        } catch (error) {
          console.error("Error parsing habits from localStorage:", error);
          setHabits(initialHabits); // Fallback to initial if parsing fails
          localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(initialHabits));
        }
      } else {
        setHabits(initialHabits);
        localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(initialHabits));
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading) { // Only save if not loading
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
    }
  }, [habits, isLoading]);
  
  const checkAndResetStreaks = useCallback(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    setHabits(prevHabits => {
      return prevHabits.map(habit => {
        let newStreak = habit.streak;
        let newCompletedToday = habit.completedToday;

        if (habit.lastCompletedDate && !isToday(new Date(habit.lastCompletedDate))) {
          // Reset completedToday if last completion was not today
          newCompletedToday = 0;
          // If last completion was not yesterday either, reset streak (unless goal was 0)
          if (habit.goal > 0 && !isYesterday(new Date(habit.lastCompletedDate))) {
             // Check if it was day before yesterday and streak was already incremented
             const dayBeforeYesterday = format(subDays(new Date(), 2), "yyyy-MM-dd");
             if(habit.lastCompletedDate !== dayBeforeYesterday || habit.streak === 0) {
                newStreak = 0;
             }
          }
        } else if (!habit.lastCompletedDate && habit.streak > 0) {
            // Edge case: if streak > 0 but no lastCompletedDate, reset streak
            newStreak = 0;
        }
        
        return { ...habit, streak: newStreak, completedToday: newCompletedToday };
      });
    });
  }, []);

  // Call checkAndResetStreaks once on initial load after habits are set
  useEffect(() => {
    if (!isLoading && habits.length > 0) {
      checkAndResetStreaks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]); // Only run when isLoading changes to false

  const addHabit = useCallback((habitData: HabitFormData) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      completedToday: 0,
      streak: 0,
      lastCompletedDate: null,
      createdAt: new Date(),
    };
    setHabits((prevHabits) => [newHabit, ...prevHabits]);
  }, []);

  const updateHabit = useCallback((updatedHabit: Habit) => {
    setHabits((prevHabits) =>
      prevHabits.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
    );
  }, []);

  const deleteHabit = useCallback((habitId: string) => {
    setHabits((prevHabits) => prevHabits.filter((h) => h.id !== habitId));
  }, []);

  const markHabitDone = useCallback((habitId: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((h) => {
        if (h.id === habitId && h.completedToday < h.goal) {
          const newCompletedToday = h.completedToday + 1;
          let newStreak = h.streak;
          const todayStr = format(new Date(), "yyyy-MM-dd");

          if (newCompletedToday >= h.goal) {
            // Goal met for today
            if (h.lastCompletedDate) {
              const lastCompletion = new Date(h.lastCompletedDate);
              if (isYesterday(lastCompletion)) {
                newStreak += 1; // Consecutive day
              } else if (!isToday(lastCompletion)) {
                newStreak = 1; // Broke streak or first time after a gap
              }
              // If it's already today and they complete more, streak doesn't change further for *today*
            } else {
              newStreak = 1; // First time ever completing
            }
            return { ...h, completedToday: newCompletedToday, streak: newStreak, lastCompletedDate: todayStr };
          }
          // Goal not yet met, but progress made
          return { ...h, completedToday: newCompletedToday, lastCompletedDate: todayStr };
        }
        return h;
      })
    );
  }, []);

  return (
    <HabitContext.Provider value={{ habits, addHabit, updateHabit, deleteHabit, markHabitDone, isLoading, checkAndResetStreaks }}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitProvider");
  }
  return context;
}
