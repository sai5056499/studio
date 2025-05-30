
"use client";

import * as React from "react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { chatWithPdf, type ChatWithPdfInput } from "@/ai/flows/chat-with-pdf-flow";
import { FileText, MessageSquare, Loader2, SendHorizonal, FilePlus2, Trash2 } from "lucide-react";
import type { ChatMessage } from "@/lib/types"; 
import { ChatMessageCard } from "@/components/chat/chat-message-card"; // Reusing for consistent display

export default function ChatPdfPage() {
  const [documentContent, setDocumentContent] = React.useState<string>("");
  const [currentDocumentText, setCurrentDocumentText] = React.useState<string>("");
  const [isDocumentLoaded, setIsDocumentLoaded] = React.useState<boolean>(false);
  
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleLoadDocument = () => {
    if (!documentContent.trim()) {
      toast({
        title: "No Content Provided",
        description: "Please paste the text content from your PDF.",
        variant: "destructive",
      });
      return;
    }
    setCurrentDocumentText(documentContent);
    setIsDocumentLoaded(true);
    setMessages([]); // Clear previous chat messages
    toast({ title: "Document Loaded", description: "You can now ask questions about the document." });
  };

  const handleLoadNewDocument = () => {
    setIsDocumentLoaded(false);
    setDocumentContent("");
    setCurrentDocumentText("");
    setMessages([]);
    setCurrentQuestion("");
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim() || !isDocumentLoaded) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: currentQuestion,
      timestamp: new Date(),
      type: "text",
    };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentQuestion("");
    setIsLoading(true);

    try {
      const input: ChatWithPdfInput = {
        documentContent: currentDocumentText,
        question: userMessage.content,
      };
      const result = await chatWithPdf(input);
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: result.answer,
        timestamp: new Date(),
        type: "text", 
        data: result 
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Error chatting with PDF:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      const errorResponseMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I couldn't process your question: ${errorMessage}`,
        timestamp: new Date(),
        type: "error",
        data: { error: errorMessage },
      };
      setMessages((prev) => [...prev, errorResponseMessage]);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Chat with PDF" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 flex justify-center">
        <Card className="w-full max-w-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <FileText className="mr-3 h-7 w-7 text-primary" /> Chat with Your Document
            </CardTitle>
            <CardDescription>
              {isDocumentLoaded 
                ? "Ask questions about the loaded document below." 
                : "Paste the text content from your PDF document below to start."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isDocumentLoaded ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pdf-content">Paste PDF Text Content Here</Label>
                  <Textarea
                    id="pdf-content"
                    placeholder="Copy and paste the full text from your PDF document..."
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    rows={15}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleLoadDocument} className="w-full" disabled={!documentContent.trim()}>
                  <FilePlus2 className="mr-2 h-4 w-4" /> Load Document Content
                </Button>
              </div>
            ) : (
              <div className="flex flex-col h-[calc(100vh-22rem)] sm:h-[calc(100vh-20rem)]"> {/* Adjusted height */}
                <div className="flex justify-between items-center mb-3 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm text-muted-foreground font-medium">
                    Document loaded. Ask your questions below.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleLoadNewDocument}>
                    <Trash2 className="mr-2 h-4 w-4" /> Load New Document
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-0 pr-1 mb-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <ChatMessageCard key={msg.id} message={msg} />
                    ))}
                     {isLoading && messages.length > 0 && messages[messages.length -1].role === 'user' && (
                       <div className="flex items-start gap-3 p-4 rounded-lg shadow-sm bg-secondary/20">
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                          <p className="text-sm text-muted-foreground">AI is thinking...</p>
                       </div>
                    )}
                  </div>
                </ScrollArea>
                
                <form onSubmit={handleAskQuestion} className="flex items-center gap-2 border-t pt-4">
                  <Input
                    type="text"
                    placeholder="Ask a question about the document..."
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" size="icon" disabled={isLoading || !currentQuestion.trim()} aria-label="Ask question">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
          {!isDocumentLoaded && (
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Note: This tool works with pasted text content. For complex PDFs with many images or intricate layouts, ensure you copy selectable text for best results.
                </p>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  );
}
