
"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { deepResearch } from '@/ai/flows/deep-research-flow';
import { Loader2, Sparkles, Bot, HelpCircle, FileText, Search, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DeepResearchOutput } from "@/lib/types";
import { WebSearchResultsPanel, SearchResultSkeleton } from "@/components/research/web-search-results-panel";

const researchSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters long."),
  focusPoints: z.string().optional(),
});

type ResearchFormValues = z.infer<typeof researchSchema>;

export default function ResearchPage() {
  const [researchOutput, setResearchOutput] = React.useState<DeepResearchOutput | null>(null);
  const [isResearching, setIsResearching] = React.useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResearchFormValues>({
    resolver: zodResolver(researchSchema),
  });

  const onSubmit: SubmitHandler<ResearchFormValues> = async (data) => {
    setIsResearching(true);
    setResearchOutput(null);
    try {
              const result = await deepResearch(data);
      setResearchOutput(result);
      toast({
        title: "Research Complete!",
        description: `Successfully gathered information on "${data.topic}".`,
      });
    } catch (error) {
      console.error("Error during research:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Research Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Deep Research Agent" />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6 overflow-hidden">
        {/* Left Pane: Main Content & Form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="shadow-lg shrink-0">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Bot className="mr-3 h-7 w-7 text-primary" /> Research Agent
              </CardTitle>
              <CardDescription>
                Provide a topic, and the AI will perform a simulated web search and synthesize the findings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="topic">Research Topic</Label>
                  <Textarea
                    id="topic"
                    placeholder="e.g., The impact of quantum computing on cybersecurity"
                    {...register("topic")}
                    className={errors.topic ? "border-destructive" : ""}
                    rows={2}
                  />
                  {errors.topic && (
                    <p className="text-sm text-destructive mt-1">{errors.topic.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="focusPoints">Focus Points (Optional)</Label>
                  <Textarea
                    id="focusPoints"
                    placeholder="e.g., Key vulnerabilities, new encryption methods, market leaders"
                    {...register("focusPoints")}
                    rows={2}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isResearching}>
                  {isResearching ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Start Research
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-lg flex-1 flex flex-col min-h-0">
            <CardHeader>
              <CardTitle>Synthesized Report</CardTitle>
              <CardDescription>The AI&apos;s generated summary and insights will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 w-full rounded-md border p-4 bg-muted/30">
                {isResearching ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                    <p className="font-semibold text-muted-foreground">AI is conducting research...</p>
                    <p className="text-sm text-muted-foreground">This may take a moment.</p>
                  </div>
                ) : researchOutput ? (
                  <div className="space-y-6 text-sm">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center mb-2"><FileText className="mr-2 h-5 w-5 text-primary" />Summary</h3>
                      <p className="whitespace-pre-wrap leading-relaxed">{researchOutput.summary}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg flex items-center mb-2"><HelpCircle className="mr-2 h-5 w-5 text-primary" />Follow-up Questions</h3>
                      <ul className="space-y-2 list-inside">
                        {researchOutput.followUpQuestions.map((question, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-muted-foreground mr-2 font-mono text-xs mt-1">{`Q${index + 1}:`}</span>
                            <span>{question}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      No research yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start your research by entering a topic or question above.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Pane: Web Search Results */}
        <div className="lg:col-span-1 flex flex-col min-h-0">
          <Card className="shadow-lg h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center"><Search className="mr-2 h-5 w-5 text-primary" />Simulated Web Search</CardTitle>
              <CardDescription>Sources the AI used for its report.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                {isResearching ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => <SearchResultSkeleton key={i} />)}
                  </div>
                ) : (
                  <WebSearchResultsPanel sources={researchOutput?.sources} />
                )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
