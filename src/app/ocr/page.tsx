
"use client";

import * as React from "react";
import Image from "next/image";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadCloud, Camera, Loader2, Copy, ScanSearch, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromImage, type ExtractTextFromImageInput } from "@/ai/flows/extract-text-from-image-flow";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function OcrPage() {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [extractedText, setExtractedText] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = React.useState(false);


  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (e.g., PNG, JPG, WEBP).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: "File Too Large",
        description: `Please upload an image smaller than ${MAX_FILE_SIZE_MB}MB.`,
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setFileName(file.name);
      setExtractedText(""); // Clear previous results
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove("border-primary", "bg-primary/10");
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
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

  const handleExtractText = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please upload or select an image first.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setExtractedText("");
    try {
      const input: ExtractTextFromImageInput = { imageDataUri: selectedImage };
      const result = await extractTextFromImage(input);
      setExtractedText(result.extractedText);
      if (!result.extractedText) {
        toast({
          title: "No Text Found",
          description: "The AI could not find any text in the image or the image was not suitable for OCR.",
        });
      } else {
        toast({ title: "Text Extracted Successfully!" });
      }
    } catch (error) {
      console.error("OCR error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during OCR.";
      toast({
        title: "OCR Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScreenshot = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast({
        title: "Screenshot API Not Supported",
        description: "Your browser does not support the screen capture API.",
        variant: "destructive",
      });
      return;
    }
    setIsCapturingScreenshot(true);
    setExtractedText("");
    setSelectedImage(null);
    setFileName(null);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          // Give a moment for video to render before capture instruction
          toast({
            title: "Screen Capture Started",
            description: "Once you see your screen, click 'Capture Frame' to select an image for OCR.",
          });
        };
      }
    } catch (err) {
      console.error("Error starting screen capture:", err);
      toast({
        title: "Screen Capture Failed",
        description: "Could not start screen capture. Please ensure permissions are granted.",
        variant: "destructive",
      });
      setIsCapturingScreenshot(false);
    }
  };

  const captureFrame = () => {
    if (videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_METADATA) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL("image/png");
        setSelectedImage(dataUri);
        setFileName("screenshot.png");
      }
      stopScreenshotStream();
      toast({title: "Frame Captured!", description: "Click 'Extract Text' to process."})
    } else {
       toast({title: "Video not ready", description: "Please wait for the screen share to appear.", variant: "destructive"})
    }
  };
  
  const stopScreenshotStream = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturingScreenshot(false);
  };

  const handleCopyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText)
      .then(() => toast({ title: "Copied to clipboard!" }))
      .catch(err => toast({ title: "Failed to copy", description: String(err), variant: "destructive" }));
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setFileName(null);
    setExtractedText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    stopScreenshotStream();
  };


  return (
    <div className="flex h-full flex-col">
      <AppHeader title="OCR - Extract Text from Image" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <ScanSearch className="mr-3 h-7 w-7 text-primary" /> OCR
            </CardTitle>
            <CardDescription>
              Upload an image or take a screenshot to extract text using AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selectedImage && !isCapturingScreenshot && (
              <div
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md cursor-pointer transition-colors hover:border-primary hover:bg-primary/5"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <UploadCloud className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-center text-muted-foreground">
                  Click to upload or drop an image here to extract text
                </p>
                <p className="text-xs text-muted-foreground mt-1">Max size: {MAX_FILE_SIZE_MB}MB</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}

            {isCapturingScreenshot && (
              <div className="space-y-2">
                <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay playsInline />
                <div className="flex gap-2">
                <Button onClick={captureFrame} className="w-full">Capture Frame</Button>
                <Button onClick={stopScreenshotStream} variant="outline" className="w-full">Cancel Screenshot</Button>
                </div>
              </div>
            )}

            {selectedImage && (
              <div className="space-y-3">
                <Label>Selected Image Preview:</Label>
                <div className="relative group">
                  <Image
                    src={selectedImage}
                    alt={fileName || "Selected image"}
                    width={600}
                    height={400}
                    className="rounded-md object-contain max-h-[300px] w-full border"
                    data-ai-hint="uploaded image"
                  />
                   <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity h-7 w-7"
                    onClick={clearSelection}
                    aria-label="Clear selected image"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                {fileName && <p className="text-xs text-muted-foreground">File: {fileName}</p>}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
                <Button
                    onClick={handleExtractText}
                    disabled={isLoading || !selectedImage}
                    className="w-full sm:flex-1"
                >
                    {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <ScanSearch className="mr-2 h-4 w-4" />
                    )}
                    Extract Text
                </Button>
                <Button 
                    onClick={handleScreenshot} 
                    variant="outline" 
                    disabled={isLoading || isCapturingScreenshot}
                    className="w-full sm:flex-1"
                >
                    <Camera className="mr-2 h-4 w-4" /> Take a Screenshot
                </Button>
            </div>


            {extractedText && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="extracted-text">Extracted Text</Label>
                  <Button variant="ghost" size="sm" onClick={handleCopyToClipboard}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
                <Textarea
                  id="extracted-text"
                  value={extractedText}
                  readOnly
                  rows={8}
                  className="mt-1 bg-muted/50"
                  placeholder="Extracted text will appear here..."
                />
              </div>
            )}
             {isLoading && !extractedText && (
                 <Alert>
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <AlertTitle className="font-semibold text-primary">Processing Image</AlertTitle>
                    <AlertDescription className="text-foreground/80">
                        The AI is working on extracting text. This might take a few moments.
                    </AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
