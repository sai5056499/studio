
"use client";

import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Habit, HabitFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import HabitIcon from "./habit-icon"; // For preview
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils"; // Added import for cn

const iconList = Object.keys(LucideIcons).filter(key => key !== "createLucideIcon" && key !== "icons" && key[0] === key[0].toUpperCase());


const editHabitSchema = z.object({
  name: z.string().min(2, "Habit name must be at least 2 characters."),
  iconName: z.string().min(1, "Icon name is required."),
  goal: z.coerce.number().int().min(1, "Goal must be at least 1 per day."),
});

interface EditHabitModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  habitToEdit: Habit | null; // Pass null for adding new habit
  onSave: (habitData: HabitFormData, habitId?: string) => void;
  isSaving: boolean;
}

export function EditHabitModal({ isOpen, onOpenChange, habitToEdit, onSave, isSaving }: EditHabitModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HabitFormData>({
    resolver: zodResolver(editHabitSchema),
    defaultValues: {
      name: "",
      iconName: "Activity", // Default icon
      goal: 1,
    },
  });

  const currentIconName = watch("iconName");

  useEffect(() => {
    if (habitToEdit) {
      setValue("name", habitToEdit.name);
      setValue("iconName", habitToEdit.iconName);
      setValue("goal", habitToEdit.goal);
    } else {
      reset({ name: "", iconName: "Activity", goal: 1 });
    }
  }, [habitToEdit, setValue, reset]);

  const onSubmit: SubmitHandler<HabitFormData> = (data) => {
    onSave(data, habitToEdit?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{habitToEdit ? "Edit Habit" : "Add New Habit"}</DialogTitle>
          <DialogDescription>
            {habitToEdit ? "Make changes to your habit." : "Set up a new daily habit to track."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input
                id="habit-name"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
                placeholder="e.g., Morning Jog"
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            
            <div className="flex items-end gap-3">
                <div className="flex-grow">
                    <Label htmlFor="habit-iconName">Icon</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-normal">
                            <HabitIcon iconName={currentIconName || "Activity"} className="mr-2 h-4 w-4" />
                            {currentIconName || "Select an icon"}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <ScrollArea className="h-[200px]">
                            <div className="p-2 grid grid-cols-5 gap-1">
                                {iconList.map((icon) => (
                                <Button
                                    key={icon}
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setValue("iconName", icon, {shouldValidate: true})}
                                    className={cn("h-8 w-8", currentIconName === icon && "bg-accent text-accent-foreground")}
                                >
                                    <HabitIcon iconName={icon} className="h-4 w-4" />
                                </Button>
                                ))}
                            </div>
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>
                    <Input type="hidden" {...register("iconName")} />
                    {errors.iconName && <p className="text-sm text-destructive mt-1">{errors.iconName.message}</p>}
                </div>
                 <div className="p-2 border rounded-md bg-muted flex items-center justify-center">
                     <HabitIcon iconName={currentIconName || "Activity"} className="h-6 w-6 text-muted-foreground" />
                 </div>
            </div>


            <div>
              <Label htmlFor="habit-goal">Daily Goal (Times)</Label>
              <Input
                id="habit-goal"
                type="number"
                {...register("goal")}
                className={errors.goal ? "border-destructive" : ""}
              />
              {errors.goal && <p className="text-sm text-destructive mt-1">{errors.goal.message}</p>}
            </div>
          </form>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (habitToEdit ? "Save Changes" : "Add Habit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
