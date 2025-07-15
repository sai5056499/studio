
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
import { Loader2, Sparkles, BookCopy, FileText, Bot, HelpCircle, Library } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";

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
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Bot className="mr-3 h-7 w-7 text-primary" /> Research Agent
              </CardTitle>
              <CardDescription>
                Provide a topic, and our AI assistant will generate a summary, list sources, and suggest follow-up questions.
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

          <Card className="shadow-lg h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Research Results</CardTitle>
                        <CardDescription>The AI's findings will appear here.</CardDescription>
                    </div>
                    {researchOutput && researchOutput.sources.length > 0 && (
                       <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline">
                               <Library className="mr-2 h-4 w-4" /> View Sources ({researchOutput.sources.length})
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-md">
                            <SheetHeader>
                                <SheetTitle className="flex items-center"><BookCopy className="mr-2 h-5 w-5 text-primary" />Sources</SheetTitle>
                                <SheetDescription>The AI referenced these sources to generate the summary. Note: These may not always be real or currently accessible.</SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100%-6rem)] mt-4 pr-3">
                                <ul className="space-y-4">
                                  {researchOutput.sources.map((source, index) => (
                                    <li key={index} className="flex items-start p-2 rounded-md border bg-muted/30">
                                      <span className="text-muted-foreground mr-3 font-mono text-sm mt-1">{index + 1}.</span>
                                      <div>
                                        <span className="font-medium text-foreground">{source.title}</span>
                                        {source.publication && <span className="text-muted-foreground text-xs"> ({source.publication})</span>}
                                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-500 hover:underline truncate">
                                          {source.url}
                                        </a>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                    )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ScrollArea className="h-full w-full rounded-md border p-4 bg-muted/30 min-h-[300px]">
                  {isResearching ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                      <p className="text-muted-foreground">AI is conducting research...</p>
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
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Your research findings will appear here.</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
