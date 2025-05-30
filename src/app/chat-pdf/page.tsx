
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
import { improvePageContent, type ImprovePageContentInput, type ImprovePageContentOutput } from "@/ai/flows/improve-page-content";
import { FileText, Loader2, SendHorizonal, FilePlus2, Trash2, Wand2, UploadCloud } from "lucide-react";
import type { ChatMessage } from "@/lib/types"; 
import { ChatMessageCard } from "@/components/chat/chat-message-card";

import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist';
// Import the worker module namespace. We don't use it directly, but its presence
// helps the bundler identify the dependency for the `new URL()` constructor.
import * as PdfJsWorkerMjs from 'pdfjs-dist/legacy/build/pdf.worker.mjs';


const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ChatPdfPage() {
  const [documentContent, setDocumentContent] = React.useState<string>("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [isParsingPdf, setIsParsingPdf] = React.useState<boolean>(false);

  const [currentDocumentText, setCurrentDocumentText] = React.useState<string>("");
  const [isDocumentLoaded, setIsDocumentLoaded] = React.useState<boolean>(false);
  
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isImproving, setIsImproving] = React.useState<boolean>(false);
  
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    try {
      // Use `new URL` with `import.meta.url` for robust worker path resolution with bundlers.
      // The path should point to the worker file within node_modules.
      const workerUrl = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url);
      GlobalWorkerOptions.workerSrc = workerUrl.toString();
    } catch (error) {
      console.error("Error setting PDF worker source:", error);
      toast({
        title: "PDF Worker Setup Error",
        description: "Could not initialize the PDF processing worker. File uploads might not function correctly.",
        variant: "destructive",
      });
    }
  }, [toast]);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
        setSelectedFile(null);
        setFileName(null);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          title: "File Too Large",
          description: `Please upload a PDF smaller than ${MAX_FILE_SIZE_MB}MB.`,
          variant: "destructive",
        });
        setSelectedFile(null);
        setFileName(null);
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      setDocumentContent(""); 
    }
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    setIsParsingPdf(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf: PDFDocumentProxy = await getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
      }
      toast({ title: "PDF Processed", description: `Extracted text from ${file.name}.` });
      return fullText;
    } catch (error) {
      console.error("Error parsing PDF:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error parsing PDF.";
      toast({
        title: "PDF Parsing Failed",
        description: `Could not extract text from the PDF. ${errorMessage}`,
        variant: "destructive",
      });
      return "";
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handleLoadDocument = async () => {
    let textToLoad = "";
    if (selectedFile) {
      textToLoad = await extractTextFromPdf(selectedFile);
    } else if (documentContent.trim()) {
      textToLoad = documentContent;
    } else {
      toast({
        title: "No Content Provided",
        description: "Please upload a PDF file or paste its text content.",
        variant: "destructive",
      });
      return;
    }

    if (!textToLoad.trim()) {
      if (selectedFile) { 
         toast({ title: "No Text Extracted", description: "No text could be extracted from the selected PDF or it was empty.", variant: "destructive" });
      }
      return; 
    }

    setCurrentDocumentText(textToLoad);
    setIsDocumentLoaded(true);
    setMessages([{
      id: `assistant-greeting-${Date.now()}`,
      role: "assistant",
      content: "Document content loaded. How can I help you with it? Ask questions or request improvements.",
      timestamp: new Date(),
      type: "text",
    }]);
    toast({ title: "Document Loaded", description: "You can now interact with the document's content." });
  };
  
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove("border-primary", "bg-primary/10");
    const file = event.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({ title: "Invalid File Type", description: "Please drop a PDF file.", variant: "destructive" });
        return;
      }
       if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ title: "File Too Large", description: `Please upload a PDF smaller than ${MAX_FILE_SIZE_MB}MB.`, variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      setDocumentContent(""); 
      toast({title: "PDF Dropped", description: `${file.name} is ready. Click "Load Document Content".`})
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add("border-primary", "bg-primary/10");
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove("border-primary", "bg-primary/10");
  };


  const handleLoadNewDocument = () => {
    setIsDocumentLoaded(false);
    setDocumentContent("");
    setCurrentDocumentText("");
    setSelectedFile(null);
    setFileName(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
    setMessages([]);
    setCurrentQuestion("");
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim() || !isDocumentLoaded || isLoading || isImproving || isParsingPdf) return;

    const userMessage: ChatMessage = {
      id: `user-question-${Date.now()}`,
      role: "user",
      content: currentQuestion,
      timestamp: new Date(),
      type: "text",
    };
    setMessages((prev) => [...prev, userMessage]);
    const questionToAsk = currentQuestion;
    setCurrentQuestion("");
    setIsLoading(true);

    try {
      const input: ChatWithPdfInput = {
        documentContent: currentDocumentText,
        question: questionToAsk,
      };
      const result = await chatWithPdf(input);
      
      const assistantMessage: ChatMessage = {
        id: `assistant-answer-${Date.now()}`,
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
        id: `error-chat-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I couldn't process your question: ${errorMessage}`,
        timestamp: new Date(),
        type: "error",
        data: { error: errorMessage },
      };
      setMessages((prev) => [...prev, errorResponseMessage]);
      toast({
        title: "Error Asking Question",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImproveDocument = async () => {
    if (!currentDocumentText || !isDocumentLoaded || isLoading || isImproving || isParsingPdf) return;

    const userMessage: ChatMessage = {
      id: `user-improve-${Date.now()}`,
      role: "user",
      content: "Please improve the loaded document text.",
      timestamp: new Date(),
      type: "text",
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsImproving(true);

    try {
      const input: ImprovePageContentInput = {
        pageContent: currentDocumentText,
      };
      const result: ImprovePageContentOutput = await improvePageContent(input);
      
      const assistantMessage: ChatMessage = {
        id: `assistant-improvement-${Date.now()}`,
        role: "assistant",
        content: "Here are the suggested improvements for your document:", 
        timestamp: new Date(),
        type: "improvement", 
        data: result 
      };
      setMessages((prev) => [...prev, assistantMessage]);
      toast({
        title: "Document Improvement Suggested",
        description: "The AI has provided suggestions for your document's text.",
      });

    } catch (error) {
      console.error("Error improving document:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      const errorResponseMessage: ChatMessage = {
        id: `error-improve-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I couldn't improve the document: ${errorMessage}`,
        timestamp: new Date(),
        type: "error",
        data: { error: errorMessage },
      };
      setMessages((prev) => [...prev, errorResponseMessage]);
      toast({
        title: "Error Improving Document",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsImproving(false);
    }
  };


  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Chat with PDF" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 flex justify-center">
        <Card className="w-full max-w-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <FileText className="mr-3 h-7 w-7 text-primary" /> Chat & Improve Your Document
            </CardTitle>
            <CardDescription>
              {isDocumentLoaded 
                ? "Ask questions about the loaded document or request AI-powered improvements to its text." 
                : "Upload a PDF or paste its text content below to start."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isDocumentLoaded ? (
              <div className="space-y-6">
                <div 
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md cursor-pointer transition-colors hover:border-primary hover:bg-primary/5"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <UploadCloud className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-center text-muted-foreground">
                    {fileName ? `Selected: ${fileName}` : "Click or drag & drop a PDF file here"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Max size: {MAX_FILE_SIZE_MB}MB</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf"
                    className="hidden"
                  />
                </div>
                 {fileName && (
                  <div className="text-center">
                    <Button variant="link" size="sm" onClick={() => {setSelectedFile(null); setFileName(null); if(fileInputRef.current) fileInputRef.current.value = "";}}>Clear selected file</Button>
                  </div>
                )}

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-muted"></div>
                  <span className="mx-4 text-sm text-muted-foreground">OR</span>
                  <div className="flex-grow border-t border-muted"></div>
                </div>

                <div>
                  <Label htmlFor="pdf-content">Paste PDF Text Content Here</Label>
                  <Textarea
                    id="pdf-content"
                    placeholder="Copy and paste the full text from your PDF document..."
                    value={documentContent}
                    onChange={(e) => { setDocumentContent(e.target.value); setSelectedFile(null); setFileName(null);}}
                    rows={10}
                    className="mt-1"
                    disabled={!!selectedFile}
                  />
                </div>
                <Button 
                  onClick={handleLoadDocument} 
                  className="w-full" 
                  disabled={(!documentContent.trim() && !selectedFile) || isLoading || isImproving || isParsingPdf}
                >
                  {isParsingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePlus2 className="mr-2 h-4 w-4" />}
                  {isParsingPdf ? "Processing PDF..." : "Load Document Content"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col h-[calc(100vh-20rem)] sm:h-[calc(100vh-18rem)]">
                <div className="flex justify-between items-center mb-3 p-3 bg-muted/50 rounded-md gap-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    Document loaded. You are now chatting with the AI assistant.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleLoadNewDocument} disabled={isLoading || isImproving || isParsingPdf}>
                    <Trash2 className="mr-2 h-4 w-4" /> Load New
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-0 pr-1 mb-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <ChatMessageCard key={msg.id} message={msg} />
                    ))}
                     {(isLoading || isImproving) && messages.length > 0 && messages[messages.length -1].role === 'user' && (
                       <div className="flex items-start gap-3 p-4 rounded-lg shadow-sm bg-secondary/20">
                         <div className="flex items-center justify-center h-8 w-8 shrink-0 rounded-full bg-primary text-primary-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                         </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-primary">AI Assistant is processing...</p>
                            <p className="text-xs text-muted-foreground">Please wait a moment.</p>
                          </div>
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
                    disabled={isLoading || isImproving || isParsingPdf}
                  />
                  <Button type="submit" size="icon" disabled={isLoading || isImproving || isParsingPdf || !currentQuestion.trim()} aria-label="Ask question">
                    {isLoading && !isImproving ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={handleImproveDocument} 
                    disabled={isLoading || isImproving || isParsingPdf}
                    aria-label="Improve document text"
                  >
                    {isImproving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
          {!isDocumentLoaded && (
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Note: For PDF uploads, text will be extracted. For complex PDFs or scanned documents, extraction quality may vary. Pasting selectable text can sometimes yield better results for AI processing.
                </p>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  );
}
