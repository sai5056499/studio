
"use client";

import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Smile, Zap } from "lucide-react"; // Example icons

export default function HabitsPage() {
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Habit Tracking" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center shadow-xl bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <CardHeader>
            <div className="mx-auto bg-primary/20 text-primary p-3 rounded-full w-fit mb-4">
                <Zap className="h-10 w-10" />
            </div>
            <CardTitle className="text-3xl font-bold">Habit Tracking</CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-1">
              This feature is coming soon!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-foreground/90">
              Soon you'll be able to build positive habits and track your streaks right here. Stay tuned for updates!
            </p>
            <Button asChild size="lg">
              <Link href="/">
                <Smile className="mr-2 h-5 w-5" /> Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
