
"use client";
// This file is now obsolete as dashboard functionality is merged into src/app/page.tsx
// You can delete this file. For now, I'll make it redirect or show a message.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from "@/components/layout/app-header";
import { Loader2 } from 'lucide-react';

export default function OldDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/'); // Redirect to the new main dashboard page
  }, [router]);

  return (
    <div className="flex h-full flex-col">
        <AppHeader title="Redirecting..." />
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Redirecting to the new Dashboard...</p>
        </main>
    </div>
  );
}
