
"use client";

import type { Source } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Favicon from "./favicon";
import { Globe } from "lucide-react";

interface WebSearchResultsPanelProps {
  sources?: Source[];
}

export function SearchResultItem({ source }: { source: Source }) {
  const domain = source.url ? new URL(source.url).hostname.replace("www.", "") : "unknown.com";

  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all">
      <div className="flex items-center gap-2">
        <Favicon domain={domain} />
        <a 
          href={source.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm font-medium text-primary hover:underline truncate"
        >
          {source.title}
        </a>
      </div>
      <p className="text-xs text-muted-foreground">{domain}</p>
      <p className="text-xs text-foreground/80 leading-snug">{source.snippet}</p>
    </div>
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-8 w-full" />
    </div>
  )
}

export function WebSearchResultsPanel({ sources }: WebSearchResultsPanelProps) {
  if (!sources || sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
        <Globe className="h-10 w-10 mb-3" />
        <p className="text-sm">Web search results will appear here.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-1">
        {sources.map((source, index) => (
          <SearchResultItem key={`${source.url}-${index}`} source={source} />
        ))}
      </div>
    </ScrollArea>
  );
}
