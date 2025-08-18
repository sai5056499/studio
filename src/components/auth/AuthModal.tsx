"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  initialView: "login" | "signup";
  children: React.ReactNode;
}

export function AuthModal({ initialView, children }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState(initialView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form on close
      setEmail("");
      setPassword("");
      setError("");
    }
    setIsOpen(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (view === "login") {
        await login(email, password);
        toast({ title: "Signed in successfully!" });
      } else {
        await signup(email, password);
        toast({ title: "Account created successfully!" });
      }
      handleOpenChange(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } else {
        setError("An unexpected error occurred.");
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{view === "login" ? "Sign In" : "Create an account"}</DialogTitle>
          <DialogDescription>
            {view === "login"
              ? "Enter your credentials to access your account."
              : "Enter your email and password to get started."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" className="w-full">
            {view === "login" ? "Sign In" : "Sign Up"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {view === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setView(view === "login" ? "signup" : "login")}
            className="underline"
          >
            {view === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
