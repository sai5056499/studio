
"use client";

import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart3, TrendingUp } from "lucide-react"; // Example icons

export default function AnalyticsPage() {
  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Analytics & Insights" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 flex items-center justify-center">
        <Card className="w-full max-w-md text-center shadow-xl bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <CardHeader>
            <div className="mx-auto bg-accent/20 text-accent p-3 rounded-full w-fit mb-4">
                <BarChart3 className="h-10 w-10" />
            </div>
            <CardTitle className="text-3xl font-bold">Analytics & Insights</CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-1">
              This feature is under construction!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-foreground/90">
              We're working on bringing you powerful analytics to understand your productivity and content performance. Check back soon!
            </p>
            <Button asChild size="lg" variant="outline">
              <Link href="/">
                <TrendingUp className="mr-2 h-5 w-5" /> Explore Other Features
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
