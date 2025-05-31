
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
      const taskIndex = prevTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prevTasks;

      const newTasks = prevTasks.map(t => ({...t, dailyTasks: t.dailyTasks.map(dt => ({...dt, subTasks: [...dt.subTasks]}))})); // Deep clone relevant parts
      const taskToUpdate = newTasks[taskIndex];
      
      if (!taskToUpdate.dailyTasks[dailyTaskIndex] || !taskToUpdate.dailyTasks[dailyTaskIndex].subTasks[subTaskIndex]) {
        console.error("SubTask not found for toggling status");
        return prevTasks; // Or handle error appropriately
      }

      const subTask = taskToUpdate.dailyTasks[dailyTaskIndex].subTasks[subTaskIndex];
      subTask.status = subTask.status === "completed" ? "todo" : "completed";

      const currentDailyTask = taskToUpdate.dailyTasks[dailyTaskIndex];
      const allSubTasksCompleted = currentDailyTask.subTasks.every(st => st.status === "completed");
      const anySubTaskInProgress = currentDailyTask.subTasks.some(st => st.status === "inprogress");

      if (allSubTasksCompleted) {
        currentDailyTask.status = "completed";
      } else if (anySubTaskInProgress || currentDailyTask.subTasks.some(st => st.status === "completed")) {
        currentDailyTask.status = "inprogress";
      } else {
        currentDailyTask.status = "todo";
      }

      const allDailyTasksCompleted = taskToUpdate.dailyTasks.every(dt => dt.status === "completed");
      const anyDailyTaskInProgress = taskToUpdate.dailyTasks.some(dt => dt.status === "inprogress");

      if (allDailyTasksCompleted) {
        taskToUpdate.status = "completed";
      } else if (anyDailyTaskInProgress || taskToUpdate.dailyTasks.some(dt => dt.status === "completed" || dt.status === "inprogress")) {
        taskToUpdate.status = "inprogress";
      } else {
        taskToUpdate.status = "todo";
      }
      
      return newTasks;
    });
  }, []);

  const updateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    setPlannedTasks(prevTasks => {
      const taskIndex = prevTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prevTasks;

      const updatedTasks = prevTasks.map(t => ({...t})); // Shallow clone tasks
      const taskToUpdate = {...updatedTasks[taskIndex]}; // Clone task to update
      taskToUpdate.status = newStatus;

      if (newStatus === "completed") {
        taskToUpdate.dailyTasks = taskToUpdate.dailyTasks.map(dt => ({
          ...dt,
          status: "completed",
          subTasks: dt.subTasks.map(st => ({ ...st, status: "completed" })),
        }));
      } else if (taskToUpdate.status !== "completed" && updatedTasks[taskIndex].status === "completed") { 
         taskToUpdate.dailyTasks = taskToUpdate.dailyTasks.map(dt => ({
          ...dt,
          status: "todo", 
          subTasks: dt.subTasks.map(st => ({ ...st, status: "todo" })),
        }));
      }
      updatedTasks[taskIndex] = taskToUpdate;
      return updatedTasks;
    });
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
