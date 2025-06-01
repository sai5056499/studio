
"use client";

import * as React from "react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Monitor, Moon, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";

export default function SettingsPage() {
  const { toast } = useToast();
  const [currentTheme, setCurrentTheme] = React.useState<Theme>("system");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      applyTheme(storedTheme);
      setCurrentTheme(storedTheme);
    } else {
      applyTheme("system"); // Apply system theme by default if nothing stored
    }
  }, []);
  
  React.useEffect(() => {
    if (!mounted) return; // Wait for mount to avoid SSR mismatch for localStorage

    let systemThemeListener: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | undefined;

    if (currentTheme === "system") {
      const systemThemeDark = window.matchMedia("(prefers-color-scheme: dark)");
      if (systemThemeDark.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      systemThemeListener = (e) => {
        if (currentTheme === "system") { // Re-check in case theme changed
          if (e.matches) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      };
      systemThemeDark.addEventListener("change", systemThemeListener);
    }

    return () => {
      if (systemThemeListener) {
        window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", systemThemeListener);
      }
    };
  }, [currentTheme, mounted]);


  const applyTheme = (theme: Theme) => {
    localStorage.setItem("theme", theme);
    setCurrentTheme(theme); // Update state before manipulating classList
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else { // System theme
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    applyTheme(newTheme);
    toast({
      title: "Theme Updated",
      description: `Theme set to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}.`,
    });
  };

  if (!mounted) {
    // Render nothing or a SKELETON to avoid hydration mismatch issues with theme
    return (
      <div className="flex h-full flex-col">
        <AppHeader title="Settings" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
           {/* Placeholder for loading state or skeleton */}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Settings" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:max-w-md mx-auto">
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          <TabsContent value="theme">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application. Select your preferred theme.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={currentTheme}
                  onValueChange={(value) => handleThemeChange(value as Theme)}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  {(["light", "dark", "system"] as Theme[]).map((themeOption) => (
                    <Label
                      key={themeOption}
                      htmlFor={`theme-${themeOption}`}
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                    >
                      <RadioGroupItem value={themeOption} id={`theme-${themeOption}`} className="sr-only" />
                      {themeOption === "light" && <Sun className="mb-3 h-6 w-6" />}
                      {themeOption === "dark" && <Moon className="mb-3 h-6 w-6" />}
                      {themeOption === "system" && <Monitor className="mb-3 h-6 w-6" />}
                      <span className="text-sm font-medium capitalize">
                        {themeOption}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Selecting "System" will automatically use your operating system's theme preference.
                  The Light theme is "Violet" and the Dark theme is "Neon Depths".
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account details. (These are currently placeholders and not functional).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="User123" disabled />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="user@example.com" disabled />
                </div>
                <Button disabled>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general application preferences. (These are currently placeholders).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications" className="text-base">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for important updates.
                    </p>
                  </div>
                  <Switch id="notifications" disabled />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="autocorrect" className="text-base">Enable Autocorrect</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically correct spelling mistakes.
                    </p>
                  </div>
                  <Switch id="autocorrect" defaultChecked disabled />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
