
"use client";

import * as React from "react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Monitor, Moon, Sun, Bell, Save } from "lucide-react";
import { sendEmail } from "@/services/email-service";

type Theme = "light" | "dark" | "system";

interface NotificationSettings {
  email: string;
  taskReminders: boolean;
  habitStreaks: boolean;
  aiSuggestions: boolean;
}

const SETTINGS_STORAGE_KEY = "contentAllySettings";

export default function SettingsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);

  // Theme settings state
  const [currentTheme, setCurrentTheme] = React.useState<Theme>("system");

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = React.useState<NotificationSettings>({
    email: "",
    taskReminders: true,
    habitStreaks: true,
    aiSuggestions: false,
  });

  // Load settings from localStorage on mount
  React.useEffect(() => {
    const savedSettingsJson = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettingsJson) {
      try {
        const savedSettings = JSON.parse(savedSettingsJson);
        // Load theme
        if (savedSettings.theme) {
          applyTheme(savedSettings.theme);
          setCurrentTheme(savedSettings.theme);
        } else {
          applyTheme("system");
        }
        // Load notification settings
        if (savedSettings.notifications) {
          setNotificationSettings(savedSettings.notifications);
        }
      } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        applyTheme("system");
      }
    } else {
      applyTheme("system");
    }
    setMounted(true);
  }, []);
  
  // Theme change effect
  React.useEffect(() => {
    if (!mounted) return;

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(SETTINGS_STORAGE_KEY) && JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY)!).theme === 'system') {
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };
    
    const systemThemeDark = window.matchMedia("(prefers-color-scheme: dark)");
    systemThemeDark.addEventListener("change", handleSystemThemeChange);

    return () => {
      systemThemeDark.removeEventListener("change", handleSystemThemeChange);
    };
  }, [mounted]);


  const applyTheme = (theme: Theme) => {
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
    setCurrentTheme(newTheme);
    applyTheme(newTheme);
    saveSettings({ theme: newTheme, notifications: notificationSettings });
    toast({
      title: "Theme Updated",
      description: `Theme set to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}.`,
    });
  };

  const handleNotificationSettingChange = (key: keyof NotificationSettings, value: string | boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = (settingsToSave: { theme: Theme; notifications: NotificationSettings }) => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave));
  };

  const handleSaveNotificationSettings = async () => {
    saveSettings({ theme: currentTheme, notifications: notificationSettings });
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });

    // Example of using the placeholder email service
    if (notificationSettings.email) {
      await sendEmail({
        to: notificationSettings.email,
        subject: "Content Ally Notification Settings Updated",
        body: "Your notification settings were successfully updated. This is a test of the email service.",
      });
      toast({
          title: "Test Email Sent (Simulated)",
          description: "Check the console to see the simulated email details.",
      })
    }
  };

  if (!mounted) {
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
          <TabsList className="grid w-full grid-cols-4 md:max-w-xl mx-auto">
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
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

          <TabsContent value="notifications">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Manage how and where you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Notification Email</Label>
                   <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={notificationSettings.email}
                    onChange={(e) => handleNotificationSettingChange('email', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">The email address where notifications will be sent.</p>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="task-reminders" className="text-base">Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for upcoming task deadlines.
                    </p>
                  </div>
                  <Switch 
                    id="task-reminders" 
                    checked={notificationSettings.taskReminders}
                    onCheckedChange={(checked) => handleNotificationSettingChange('taskReminders', checked)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="habit-streaks" className="text-base">Habit Streaks</Label>
                    <p className="text-sm text-muted-foreground">
                      Get alerts about maintaining or breaking your habit streaks.
                    </p>
                  </div>
                  <Switch 
                    id="habit-streaks" 
                    checked={notificationSettings.habitStreaks}
                    onCheckedChange={(checked) => handleNotificationSettingChange('habitStreaks', checked)}
                  />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai-suggestions" className="text-base">AI Suggestions</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow AI to proactively send you useful suggestions.
                    </p>
                  </div>
                  <Switch 
                    id="ai-suggestions" 
                    checked={notificationSettings.aiSuggestions}
                    onCheckedChange={(checked) => handleNotificationSettingChange('aiSuggestions', checked)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                 <Button onClick={handleSaveNotificationSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notification Settings
                 </Button>
              </CardFooter>
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
                    <Label htmlFor="notifications-general" className="text-base">Enable All Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      A master switch for all application alerts.
                    </p>
                  </div>
                  <Switch id="notifications-general" disabled />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="autocorrect" className="text-base">Enable Autocorrect</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically correct spelling mistakes in input fields.
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
