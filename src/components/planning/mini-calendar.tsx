
"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

export function MiniCalendar() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="rounded-md border overflow-hidden bg-card w-full">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate} // Allows date selection, not used for filtering yet
        initialFocus
        className="p-0" // Adjust padding if needed to fit compact space
        classNames={{
          caption_label: "text-sm font-medium",
          day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 text-xs", // Smaller days
          head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]", // Smaller head cells
          nav_button: "h-6 w-6", // Smaller nav buttons
        }}
      />
    </div>
  );
}
