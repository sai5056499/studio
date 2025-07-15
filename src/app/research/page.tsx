
"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { deepResearch, type DeepResearchInput, type DeepResearchOutput } from "@/ai/flows/deep-research-flow";
import { Loader2, Sparkles, BookCopy, BarChart2, Link as LinkIcon, FileText, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 @container">
          <Card className="lg:col-span-1 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Bot className="mr-3 h-7 w-7 text-primary" /> Research Agent
              </CardTitle>
              <CardDescription>
                Provide a topic and optional focus points, and the AI will conduct research for you.
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
                    rows={3}
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
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Guide the AI by listing specific areas or questions to focus on.
                  </p>
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

          <div className="lg:col-span-1">
            <Card className="shadow-lg h-full flex flex-col">
              <CardHeader>
                <CardTitle>Research Results</CardTitle>
                <CardDescription>The AI's findings will appear here.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ScrollArea className="h-[calc(100%-4rem)] w-full rounded-md border p-4 bg-muted/30 min-h-[300px]">
                  {isResearching ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                      <p className="text-muted-foreground">AI is conducting research...</p>
                    </div>
                  ) : researchOutput ? (
                    <div className="space-y-6 text-sm">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center mb-2"><FileText className="mr-2 h-5 w-5 text-primary" />Summary</h3>
                        <p className="whitespace-pre-wrap">{researchOutput.summary}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg flex items-center mb-2"><BarChart2 className="mr-2 h-5 w-5 text-primary" />Key Data Points</h3>
                        <ul className="space-y-2 list-disc list-inside">
                          {researchOutput.dataPoints.map((point, index) => (
                            <li key={index}>
                              <strong>{point.point}:</strong> {point.value}
                            </li>
                          ))}
                        </ul>
                      </div>
                       <div>
                        <h3 className="font-semibold text-lg flex items-center mb-2"><BookCopy className="mr-2 h-5 w-5 text-primary" />Sources</h3>
                         <ul className="space-y-2">
                          {researchOutput.sources.map((source, index) => (
                            <li key={index} className="flex items-start">
                              <LinkIcon className="h-4 w-4 mr-2 mt-1 text-muted-foreground shrink-0"/>
                              <div>
                                <span className="font-medium">{source.title}</span>
                                <a href={source.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-500 hover:underline truncate">
                                  {source.url}
                                </a>
                              </div>
                            </li>
                          ))}
                        </ul>
                         <Alert variant="default" className="mt-4 bg-primary/5">
                           <AlertDescription className="text-xs text-foreground/80">
                            Note: The sources listed are generated by the AI based on its training data and may not always be real or currently accessible URLs.
                           </AlertDescription>
                         </Alert>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Your research findings will appear here.</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
