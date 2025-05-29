
"use client";

import { useState, useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { aiPoweredTaskPlanning, type AiPoweredTaskPlanningInput, type AiPoweredTaskPlanningOutput } from "@/ai/flows/ai-powered-task-planning";
import type { PlannedTask } from "@/lib/types";
import { ListChecks, CheckCircle, CalendarClock, Loader2, BellRing, BellOff, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const taskPlanningSchema = z.object({
  taskDescription: z.string().min(10, "Task description must be at least 10 characters."),
  deadline: z.string().min(3, "Deadline is required."),
});

type TaskPlanningFormValues = z.infer<typeof taskPlanningSchema>;

export default function TaskPlanningPage() {
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskPlanningFormValues>({
    resolver: zodResolver(taskPlanningSchema),
  });

  const onSubmit: SubmitHandler<TaskPlanningFormValues> = (data) => {
    startTransition(async () => {
      try {
        const result = await aiPoweredTaskPlanning(data as AiPoweredTaskPlanningInput);
        const newTask: PlannedTask = {
          ...(result as AiPoweredTaskPlanningOutput), // Cast to ensure new structure
          id: Date.now().toString(),
          originalDescription: data.taskDescription,
          deadline: data.deadline,
          createdAt: new Date(),
          isDailyReminderSet: false,
        };
        setPlannedTasks((prevTasks) => [newTask, ...prevTasks]);
        toast({
          title: "Task Planned Successfully!",
          description: `"${result.taskName}" has been added to your tasks.`,
        });
        reset();
      } catch (error) {
        console.error("Error planning task:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during task planning.";
        toast({
          title: "Task Planning Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    });
  };

  const toggleDailyReminder = (taskId: string) => {
    setPlannedTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, isDailyReminderSet: !task.isDailyReminderSet }
          : task
      )
    );
    const task = plannedTasks.find(t => t.id === taskId);
    if (task) {
      toast({
        title: `Daily Reminder ${task.isDailyReminderSet ? "Disabled" : "Enabled"}`,
        description: `Daily reminder for "${task.taskName}" is now ${task.isDailyReminderSet ? "off" : "on"}. (This is a simulation)`,
      });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="AI Task Planning" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Plan a New Task</CardTitle>
              <CardDescription>Describe your task and set a deadline. AI will help you break it down into daily sub-tasks.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="taskDescription">Task Description</Label>
                  <Textarea
                    id="taskDescription"
                    placeholder="e.g., Write a blog post about AI in content creation"
                    {...register("taskDescription")}
                    className={errors.taskDescription ? "border-destructive" : ""}
                  />
                  {errors.taskDescription && (
                    <p className="text-sm text-destructive mt-1">{errors.taskDescription.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    placeholder="e.g., End of next week, Tomorrow evening"
                    {...register("deadline")}
                    className={errors.deadline ? "border-destructive" : ""}
                  />
                  {errors.deadline && (
                    <p className="text-sm text-destructive mt-1">{errors.deadline.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListChecks className="mr-2 h-4 w-4" />}
                  Plan Task
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Planned Tasks</h2>
            {plannedTasks.length === 0 ? (
               <Alert className="bg-primary/5">
                <ListChecks className="h-4 w-4 text-primary" />
                <AlertTitle className="font-semibold text-primary">No tasks planned yet.</AlertTitle>
                <AlertDescription className="text-foreground/80">
                  Use the form to create your first AI-assisted task plan.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[calc(100vh-18rem)]"> {/* Adjust height as needed */}
                <div className="space-y-4">
                  {plannedTasks.map((task) => (
                    <Card key={task.id} className="shadow-lg">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{task.taskName}</CardTitle>
                            <CardDescription>
                              <CalendarClock className="inline-block mr-1 h-4 w-4" /> Deadline: {task.deadline}
                            </CardDescription>
                          </div>
                           <Button 
                            variant={task.isDailyReminderSet ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => toggleDailyReminder(task.id)}
                            className="shrink-0"
                          >
                            {task.isDailyReminderSet ? <BellOff className="mr-2 h-4 w-4" /> : <BellRing className="mr-2 h-4 w-4" />}
                            {task.isDailyReminderSet ? "Reminder On" : "Set Reminder"}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Original: {task.originalDescription}
                        </p>
                        <h4 className="font-semibold mb-2 text-md">Daily Breakdown:</h4>
                        {task.dailyTasks && task.dailyTasks.length > 0 ? (
                          <Accordion type="single" collapsible className="w-full">
                            {task.dailyTasks.map((dailyTask, index) => (
                              <AccordionItem value={`day-${index}`} key={index}>
                                <AccordionTrigger className="text-sm font-medium hover:no-underline py-2">
                                  {dailyTask.dayDescription}
                                </AccordionTrigger>
                                <AccordionContent className="pl-4 pt-1 pb-2">
                                  <ul className="list-none space-y-1 text-sm">
                                    {dailyTask.subTasks.map((subTask, subIndex) => (
                                      <li key={subIndex} className="flex items-start">
                                        <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                                        <span>{subTask}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        ) : (
                          <p className="text-sm text-muted-foreground">No daily steps provided for this task.</p>
                        )}
                      </CardContent>
                      <CardFooter>
                        <p className="text-xs text-muted-foreground">Overall Reminder: {task.overallReminder}</p>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
