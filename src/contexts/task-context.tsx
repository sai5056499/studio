
"use client";

import type { PlannedTask, TaskStatus, DailyTask, SubTask } from "@/lib/types";
import type { ReactNode } from "react";
import { createContext, useContext, useState, useCallback, useEffect } from "react";

interface TaskContextType {
  plannedTasks: PlannedTask[];
  addPlannedTask: (task: PlannedTask) => void;
  updatePlannedTask: (updatedTask: PlannedTask) => void;
  deletePlannedTask: (taskId: string) => void;
  toggleSubTaskStatus: (taskId: string, dailyTaskIndex: number, subTaskIndex: number) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  toggleDailyReminder: (taskId: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "contentAllyTasks";

export function TaskProvider({ children }: { children: ReactNode }) {
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>(() => {
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
      try {
        return savedTasks ? JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt) // Ensure dates are Date objects
        })) : [];
      } catch (error) {
        console.error("Error parsing tasks from localStorage:", error);
        return [];
      }
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plannedTasks));
    }
  }, [plannedTasks]);

  const addPlannedTask = useCallback((task: PlannedTask) => {
    setPlannedTasks((prevTasks) => [task, ...prevTasks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const updatePlannedTask = useCallback((updatedTask: PlannedTask) => {
    setPlannedTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? { ...updatedTask, createdAt: new Date(updatedTask.createdAt) } : task
      )
    );
  }, []);

  const deletePlannedTask = useCallback((taskId: string) => {
    setPlannedTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, []);

  const toggleSubTaskStatus = useCallback((taskId: string, dailyTaskIndex: number, subTaskIndex: number) => {
    setPlannedTasks(prevTasks => {
      // Create a new top-level array
      return prevTasks.map(task => {
        // If it's not the task we're looking for, return it as is
        if (task.id !== taskId) {
          return task;
        }

        // It's our task, create a new task object
        const updatedTask = {
          ...task,
          // Create a new dailyTasks array
          dailyTasks: task.dailyTasks.map((dailyTask, dIndex) => {
            // If it's not the daily task we're looking for, return it as is
            if (dIndex !== dailyTaskIndex) {
              return dailyTask;
            }

            // It's our daily task, create a new daily task object
            const updatedDailyTask = {
              ...dailyTask,
              // Create a new subTasks array
              subTasks: dailyTask.subTasks.map((subTask, sIndex) => {
                // If it's not the sub-task, return it
                if (sIndex !== subTaskIndex) {
                  return subTask;
                }
                // It's our sub-task, create a new one with the toggled status
                return {
                  ...subTask,
                  status: subTask.status === "completed" ? "todo" : "completed",
                };
              }),
            };

            // Now, after updating subtasks, recalculate the status of this daily task
            const allSubTasksCompleted = updatedDailyTask.subTasks.every(st => st.status === "completed");
            const anySubTaskInProgress = updatedDailyTask.subTasks.some(st => st.status === "inprogress");
            const anySubTaskDone = updatedDailyTask.subTasks.some(st => st.status === 'completed');

            if (allSubTasksCompleted) {
              updatedDailyTask.status = "completed";
            } else if (anySubTaskInProgress || anySubTaskDone) {
              updatedDailyTask.status = "inprogress";
            } else {
              updatedDailyTask.status = "todo";
            }
            
            return updatedDailyTask;
          }),
        };
        
        // Now, after updating daily tasks, recalculate the overall task status
        const allDailyTasksCompleted = updatedTask.dailyTasks.every(dt => dt.status === "completed");
        const anyDailyTaskInProgress = updatedTask.dailyTasks.some(dt => dt.status === "inprogress");
        const anyDailyTaskDone = updatedTask.dailyTasks.some(dt => dt.status === 'completed');

        if (allDailyTasksCompleted) {
          updatedTask.status = "completed";
        } else if (anyDailyTaskInProgress || anyDailyTaskDone) {
          updatedTask.status = "inprogress";
        } else {
          updatedTask.status = "todo";
        }

        return updatedTask;
      });
    });
  }, []);

  const updateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    setPlannedTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id !== taskId) {
          return task;
        }

        // It's the task to update.
        const wasCompleted = task.status === 'completed';
        const updatedTask = { ...task, status: newStatus };

        // If marking the whole task as complete, mark all children as complete.
        if (newStatus === "completed") {
          updatedTask.dailyTasks = task.dailyTasks.map(dt => ({
            ...dt,
            status: "completed",
            subTasks: dt.subTasks.map(st => ({ ...st, status: "completed" })),
          }));
        } 
        // If reopening a completed task, reset all children to 'todo'.
        else if (wasCompleted && newStatus !== 'completed') {
          updatedTask.dailyTasks = task.dailyTasks.map(dt => ({
            ...dt,
            status: "todo",
            subTasks: dt.subTasks.map(st => ({ ...st, status: "todo" })),
          }));
        }

        return updatedTask;
      })
    );
  }, []);

  const toggleDailyReminder = useCallback((taskId: string) => {
    setPlannedTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, isDailyReminderSet: !task.isDailyReminderSet }
          : task
      )
    );
  }, []);

  return (
    <TaskContext.Provider value={{ 
      plannedTasks, 
      addPlannedTask, 
      updatePlannedTask,
      deletePlannedTask,
      toggleSubTaskStatus,
      updateTaskStatus,
      toggleDailyReminder,
      isLoading, 
      setIsLoading 
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
