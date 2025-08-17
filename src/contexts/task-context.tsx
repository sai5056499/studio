
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { PlannedTask, DailyTask, SubTask } from "@/lib/types";

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

interface TaskRaw {
  id: string;
  taskName: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
  overallReminder: string;
  dailyTasks: Array<{
    id: string;
    dayDescription: string;
    status: string;
    subTasks: Array<{
      id: string;
      description: string;
      status: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Data migration and validation function
const validateAndMigrateTasks = (savedData: TaskRaw[]): PlannedTask[] => {
  if (!Array.isArray(savedData)) return [];
  
  return savedData.map((task: TaskRaw): PlannedTask => ({
    ...task,
    dailyTasks: Array.isArray(task.dailyTasks) 
      ? task.dailyTasks.map((dt: TaskRaw['dailyTasks'][0]): DailyTask => ({
          ...dt,
          subTasks: Array.isArray(dt.subTasks) 
            ? dt.subTasks.map((st: TaskRaw['dailyTasks'][0]['subTasks'][0]): SubTask => ({
                ...st,
                status: st.status as 'todo' | 'inprogress' | 'completed',
              }))
            : [],
          status: dt.status as 'todo' | 'inprogress' | 'completed',
        }))
      : [],
    status: task.status as 'todo' | 'inprogress' | 'completed',
    priority: task.priority as 'low' | 'medium' | 'high',
    deadline: task.deadline ? new Date(task.deadline) : null,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  }));
};


export function TaskProvider({ children }: { children: ReactNode }) {
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with true to indicate loading
  
  // Load tasks from localStorage on mount
  useEffect(() => {
    setIsLoading(true);
    if (typeof window !== "undefined") {
      const savedTasksJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedTasksJson) {
        try {
          const parsedData = JSON.parse(savedTasksJson);
          setPlannedTasks(validateAndMigrateTasks(parsedData));
        } catch (error) {
          console.error("Error parsing or migrating tasks from localStorage:", error);
          setPlannedTasks([]);
        }
      }
    }
    setIsLoading(false); // Set loading to false after attempting to load
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    // We only save to localStorage if the initial load is complete.
    // This prevents wiping out stored data on the very first render.
    if (!isLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plannedTasks));
    }
  }, [plannedTasks, isLoading]);

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
      return prevTasks.map(task => {
        if (task.id !== taskId) {
          return task;
        }

        const updatedDailyTasks = task.dailyTasks.map((dailyTask, dIndex) => {
          if (dIndex !== dailyTaskIndex) {
            return dailyTask;
          }

          const updatedSubTasks = dailyTask.subTasks.map((subTask, sIndex) => {
            if (sIndex !== subTaskIndex) {
              return subTask;
            }
            return {
              ...subTask,
              status: subTask.status === "completed" ? "todo" : "completed",
            };
          });

          const allSubCompleted = updatedSubTasks.every(st => st.status === "completed");
          const noSubStarted = updatedSubTasks.every(st => st.status === "todo");
          
          let newDailyStatus: TaskStatus = "inprogress";
          if (allSubCompleted) {
            newDailyStatus = "completed";
          } else if (noSubStarted) {
            newDailyStatus = "todo";
          }
          
          return { ...dailyTask, subTasks: updatedSubTasks, status: newDailyStatus };
        });
        
        const allDailyCompleted = updatedDailyTasks.every(dt => dt.status === "completed");
        const noDailyStarted = updatedDailyTasks.every(dt => dt.status === "todo");

        let newOverallStatus: TaskStatus = "inprogress";
        if (allDailyCompleted) {
          newOverallStatus = "completed";
        } else if (noDailyStarted) {
          newOverallStatus = "todo";
        }
        
        return { ...task, dailyTasks: updatedDailyTasks, status: newOverallStatus };
      });
    });
  }, []);

  const updateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    setPlannedTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id !== taskId) {
          return task;
        }

        if (task.status === newStatus) {
            return task;
        }

        const wasCompleted = task.status === 'completed';
        const updatedTask = { ...task, status: newStatus };

        if (newStatus === "completed") {
          updatedTask.dailyTasks = task.dailyTasks.map(dt => ({
            ...dt,
            status: "completed",
            subTasks: dt.subTasks.map(st => ({ ...st, status: "completed" })),
          }));
        } 
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
