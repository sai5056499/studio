"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PageContentModalProps {
  triggerButton: React.ReactNode;
  title: string;
  description: string;
  actionButtonText: string;
  onConfirm: (content: string, url?: string) => void;
}

export function PageContentModal({
  triggerButton,
  title,
  description,
  actionButtonText,
  onConfirm,
}: PageContentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pageContent, setPageContent] = useState("");
  const [pageUrl, setPageUrl] = useState("");

  const handleConfirm = () => {
    onConfirm(pageContent, pageUrl);
    setIsOpen(false);
    setPageContent(""); // Optionally clear after submit
    setPageUrl("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="page-url">Page URL (Optional)</Label>
            <Input
              id="page-url"
              placeholder="https://example.com/article"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="page-content">Page Content</Label>
            <Textarea
              id="page-content"
              placeholder="Paste the content of the webpage here..."
              value={pageContent}
              onChange={(e) => setPageContent(e.target.value)}
              className="min-h-[200px]"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!pageContent.trim()}>
            {actionButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
