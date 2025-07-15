
"use client";

import * as React from "react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRightLeft, Languages, Loader2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { translateText, type TranslateTextInput, type TranslateTextOutput } from "@/ai/flows/translate-text-flow";

const languageOptions = [
  { value: "auto", label: "Auto Detect" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese (Simplified)" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
];

export default function TranslatePage() {
  const [inputText, setInputText] = React.useState("");
  const [translatedText, setTranslatedText] = React.useState("");
  const [sourceLang, setSourceLang] = React.useState("auto");
  const [targetLang, setTargetLang] = React.useState("en");
  const [detectedLang, setDetectedLang] = React.useState<string | null>(null);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to translate.",
        variant: "destructive",
      });
      return;
    }
    if (sourceLang === targetLang && sourceLang !== "auto") {
      toast({
        title: "Same Languages",
        description: "Source and target languages are the same.",
        variant: "default",
      });
      setTranslatedText(inputText);
      return;
    }

    setIsTranslating(true);
    setTranslatedText("");
    setDetectedLang(null);

    try {
      const input: TranslateTextInput = {
        textToTranslate: inputText,
        targetLanguage: targetLang,
      };
      if (sourceLang !== "auto") {
        input.sourceLanguage = sourceLang;
      }

      const result = await translateText(input);
      setTranslatedText(result.translatedText);
      if (result.detectedSourceLanguage) {
        const detected = languageOptions.find(l => l.value === result.detectedSourceLanguage)?.label || result.detectedSourceLanguage;
        setDetectedLang(detected);
        toast({
          title: "Translation Successful",
          description: `Detected source language: ${detected}`,
        });
      } else {
         toast({
          title: "Translation Successful",
        });
      }
    } catch (error) {
      console.error("Translation error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Translation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang === "auto") {
        // If source is auto, and we have a detected language, use that for the new source
        // Otherwise, if target is not auto, make target the new source.
        // If both are auto, or target is also auto, this swap is less meaningful without prior detection.
        // For simplicity, if source is auto, we'll swap target to source, and set target to 'en' (or a common default)
        // unless the target is 'auto', in which case we do nothing or pick a common pair.
        if (detectedLang) {
            const detectedLangValue = languageOptions.find(l => l.label === detectedLang)?.value || targetLang; // Fallback to target
            setSourceLang(detectedLangValue);
            setTargetLang(sourceLang === "auto" ? targetLang : sourceLang); // old source becomes new target
        } else if (targetLang !== "auto") {
            setSourceLang(targetLang);
            setTargetLang("en"); // Default to English or previous source if not auto
        } else {
            // Both are auto, or source is auto and target is auto/unclear
            // A common swap pair might be to set source to 'en' and target to another common lang
            setSourceLang("en"); 
            setTargetLang("es"); // Example: Spanish
             toast({ title: "Swapped to EN -> ES", description: "Specify languages for a more precise swap."});
        }
    } else if (targetLang === "auto") {
        // If target is auto, and source is specified, make source the new target and set source to auto or a common lang
        setTargetLang(sourceLang);
        setSourceLang("auto"); // Or "en"
    }
    else {
      // Both languages are specified
      const tempLang = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(tempLang);
    }
    setDetectedLang(null); // Reset detected language on swap
  };
  
  const handleCopyToClipboard = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText)
      .then(() => {
        toast({ title: "Copied to clipboard!" });
      })
      .catch(err => {
        toast({ title: "Failed to copy", description: String(err), variant: "destructive" });
      });
  };


  return (
    <div className="flex h-full flex-col">
      <AppHeader title="AI Translator" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Languages className="mr-3 h-7 w-7 text-primary" /> Translate Text
            </CardTitle>
            <CardDescription>
              Select source and target languages, then enter your text. "Auto Detect" will try to identify the source language.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <Label htmlFor="source-lang">From</Label>
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger id="source-lang">
                    <SelectValue placeholder="Select source language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (
                      <SelectItem key={`source-${lang.value}`} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleSwapLanguages}
                className="mt-0 sm:mt-6 self-center"
                aria-label="Swap languages"
              >
                <ArrowRightLeft className="h-5 w-5" />
              </Button>

              <div className="flex-1 w-full">
                <Label htmlFor="target-lang">To</Label>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger id="target-lang">
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.filter(lang => lang.value !== "auto").map((lang) => ( // Target cannot be "auto"
                      <SelectItem key={`target-${lang.value}`} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="input-text">Text to Translate</Label>
              <Textarea
                id="input-text"
                placeholder="Type or paste text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                className="mt-1"
              />
            </div>

            <Button onClick={handleTranslate} disabled={isTranslating || !inputText.trim()} className="w-full">
              {isTranslating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Languages className="mr-2 h-4 w-4" />
              )}
              Translate
            </Button>

            {translatedText && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="translated-text">
                    Translated Text {detectedLang && `(Detected: ${detectedLang})`}
                  </Label>
                  <Button variant="ghost" size="sm" onClick={handleCopyToClipboard}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
                <Textarea
                  id="translated-text"
                  value={translatedText}
                  readOnly
                  rows={6}
                  className="mt-1 bg-muted/50"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
