
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

// Data migration and validation function
const validateAndMigrateTasks = (savedData: any): PlannedTask[] => {
  if (!Array.isArray(savedData)) {
    return [];
  }

  return savedData.map((task: any): PlannedTask => {
    const validatedDailyTasks = Array.isArray(task.dailyTasks)
      ? task.dailyTasks.map((dt: any): DailyTask => {
          const validatedSubTasks = Array.isArray(dt.subTasks)
            ? dt.subTasks.map((st: any): SubTask => ({
                id: st.id || `sub-${dt.id || Math.random()}-${Date.now()}`,
                description: st.description || "Untitled Sub-task",
                status: st.status || "todo",
              }))
            : [];
          return {
            id: dt.id || `daily-${task.id || Math.random()}-${Date.now()}`,
            dayDescription: dt.dayDescription || "Untitled Day",
            subTasks: validatedSubTasks,
            status: dt.status || "todo",
          };
        })
      : [];

    return {
      id: task.id || `task-${Date.now()}`,
      taskName: task.taskName || "Untitled Task",
      originalDescription: task.originalDescription || "",
      deadline: task.deadline || "No deadline set",
      createdAt: new Date(task.createdAt || Date.now()),
      isDailyReminderSet: task.isDailyReminderSet || false,
      status: task.status || "todo",
      overallReminder: task.overallReminder || "",
      dailyTasks: validatedDailyTasks,
    };
  });
};


export function TaskProvider({ children }: { children: ReactNode }) {
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>(() => {
    if (typeof window !== "undefined") {
      const savedTasksJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedTasksJson) {
        try {
          const parsedData = JSON.parse(savedTasksJson);
          return validateAndMigrateTasks(parsedData);
        } catch (error) {
          console.error("Error parsing or migrating tasks from localStorage:", error);
          return [];
        }
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
          const anySubInProgress = updatedSubTasks.some(st => st.status === "inprogress" || (st.status === 'completed' && updatedSubTasks.length > 0));
          
          let newDailyStatus: TaskStatus = "todo";
          if (allSubCompleted) {
            newDailyStatus = "completed";
          } else if (anySubInProgress || updatedSubTasks.some(st => st.status === 'completed')) {
            newDailyStatus = "inprogress";
          }
          
          return { ...dailyTask, subTasks: updatedSubTasks, status: newDailyStatus };
        });
        
        const allDailyCompleted = updatedDailyTasks.every(dt => dt.status === "completed");
        const anyDailyInProgress = updatedDailyTasks.some(dt => dt.status === "inprogress" || (dt.status === "completed" && updatedDailyTasks.length > 0));

        let newOverallStatus: TaskStatus = "todo";
        if (allDailyCompleted) {
          newOverallStatus = "completed";
        } else if (anyDailyInProgress || updatedDailyTasks.some(dt => dt.status === 'completed')) {
          newOverallStatus = "inprogress";
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
