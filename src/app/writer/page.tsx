
"use client";

import * as React from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { generateContent, type GenerateContentInput, type GenerateContentOutput } from "@/ai/flows/generate-content-flow";
import { Loader2, Wand2, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const generateContentSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters."),
  contentType: z.enum(["blog_post", "email", "social_media_post", "poem", "short_story", "generic"])
    .default("generic"),
  tone: z.enum(["formal", "casual", "humorous", "professional", "creative"])
    .default("professional"),
  maxLength: z.coerce.number().int().positive().optional().or(z.literal("")), // Allow empty string, coerce to number
  customInstructions: z.string().optional(),
});

type GenerateContentFormValues = z.infer<typeof generateContentSchema>;

const contentTypes: { value: GenerateContentInput['contentType'], label: string }[] = [
  { value: "generic", label: "Generic Text" },
  { value: "blog_post", label: "Blog Post" },
  { value: "email", label: "Email" },
  { value: "social_media_post", label: "Social Media Post" },
  { value: "poem", label: "Poem" },
  { value: "short_story", label: "Short Story" },
];

const tones: { value: GenerateContentInput['tone'], label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "humorous", label: "Humorous" },
  { value: "creative", label: "Creative" },
];

export default function AiWriterPage() {
  const [generatedOutput, setGeneratedOutput] = React.useState<GenerateContentOutput | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<GenerateContentFormValues>({
    resolver: zodResolver(generateContentSchema),
    defaultValues: {
      prompt: "",
      contentType: "generic",
      tone: "professional",
      maxLength: undefined,
      customInstructions: "",
    },
  });

  const onSubmit: SubmitHandler<GenerateContentFormValues> = async (data) => {
    setIsGenerating(true);
    setGeneratedOutput(null);
    try {
      // Prepare input for AI flow, ensuring maxLength is number or undefined
      const flowInput: GenerateContentInput = {
        ...data,
        maxLength: data.maxLength === "" || data.maxLength === undefined ? undefined : Number(data.maxLength),
      };
      const result = await generateContent(flowInput);
      setGeneratedOutput(result);
      toast({
        title: "Content Generated!",
        description: "The AI has successfully generated your content.",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Content Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="AI Writer" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 @container">
          <Card className="lg:col-span-1 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Wand2 className="mr-3 h-7 w-7 text-primary" /> Generate Content
              </CardTitle>
              <CardDescription>
                Use AI to generate various types of text. Fill in the details below and let the AI craft it for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Main Prompt / Topic</Label>
                  <Textarea
                    id="prompt"
                    placeholder="e.g., The future of renewable energy, A marketing email for a new product..."
                    {...register("prompt")}
                    className={errors.prompt ? "border-destructive" : ""}
                    rows={4}
                  />
                  {errors.prompt && (
                    <p className="text-sm text-destructive mt-1">{errors.prompt.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contentType">Content Type</Label>
                    <Controller
                      name="contentType"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id="contentType">
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                          <SelectContent>
                            {contentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tone">Tone</Label>
                    <Controller
                      name="tone"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id="tone">
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                          <SelectContent>
                            {tones.map((tone) => (
                              <SelectItem key={tone.value} value={tone.value}>
                                {tone.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxLength">Max Length (Optional)</Label>
                  <Input
                    id="maxLength"
                    type="number"
                    placeholder="e.g., 500 (words/characters)"
                    {...register("maxLength")}
                  />
                  {errors.maxLength && (
                    <p className="text-sm text-destructive mt-1">{errors.maxLength.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customInstructions">Custom Instructions (Optional)</Label>
                  <Textarea
                    id="customInstructions"
                    placeholder="e.g., Focus on benefits for small businesses, Include a call to action..."
                    {...register("customInstructions")}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate Content
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="lg:col-span-1">
            <Card className="shadow-lg h-full flex flex-col">
              <CardHeader>
                <CardTitle>Generated Output</CardTitle>
                <CardDescription>The AI-generated content will appear here.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ScrollArea className="h-[calc(100%-4rem)] w-full rounded-md border p-4 bg-muted/30 min-h-[300px]">
                  {isGenerating && !generatedOutput && (
                     <div className="flex flex-col items-center justify-center h-full text-center">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground">AI is thinking...</p>
                    </div>
                  )}
                  {generatedOutput && generatedOutput.generatedContent && (
                    <pre className="whitespace-pre-wrap text-sm">{generatedOutput.generatedContent}</pre>
                  )}
                  {!isGenerating && !generatedOutput && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Wand2 className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Your content will appear here once generated.</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              {generatedOutput && generatedOutput.warnings && generatedOutput.warnings.length > 0 && (
                <CardFooter className="flex-col items-start border-t pt-4">
                  <h4 className="font-semibold text-sm text-amber-600 flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" /> Warnings:
                  </h4>
                  <ul className="list-disc list-inside text-xs text-amber-700 mt-1">
                    {generatedOutput.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
