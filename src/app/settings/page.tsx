
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
import { Monitor, Moon, Sun, Bell, Save, Send } from "lucide-react";
import { sendEmail } from "@/services/email-service";
import type { PlannedTask, Habit } from "@/lib/types";

// Types for settings
type Theme = "light" | "dark" | "system";

interface NotificationSettings {
  email: string;
  taskReminders: boolean;
  habitStreaks: boolean;
  aiSuggestions: boolean;
}

interface AccountSettings {
  username: string;
  email: string;
}

interface GeneralSettings {
  allNotifications: boolean;
  autocorrect: boolean;
}

interface AppSettings {
  theme: Theme;
  notifications: NotificationSettings;
  account: AccountSettings;
  general: GeneralSettings;
}

const SETTINGS_STORAGE_KEY = "contentAllySettings";
const TASKS_STORAGE_KEY = "contentAllyTasks";
const HABITS_STORAGE_KEY = "contentAllyHabits";

const defaultSettings: AppSettings = {
  theme: "system",
  notifications: {
    email: "",
    taskReminders: true,
    habitStreaks: true,
    aiSuggestions: false,
  },
  account: {
    username: "User123",
    email: "",
  },
  general: {
    allNotifications: true,
    autocorrect: true,
  }
};


export default function SettingsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSendingTest, setIsSendingTest] = React.useState(false);

  // Unified state for all settings
  const [settings, setSettings] = React.useState<AppSettings>(defaultSettings);

  // Load settings from localStorage on mount
  React.useEffect(() => {
    const savedSettingsJson = localStorage.getItem(SETTINGS_STORAGE_KEY);
    let loadedSettings: AppSettings = defaultSettings;
    if (savedSettingsJson) {
      try {
        const savedSettings = JSON.parse(savedSettingsJson);
        // Deep merge to handle cases where new settings keys are added
        loadedSettings = {
          ...defaultSettings,
          ...savedSettings,
          notifications: { ...defaultSettings.notifications, ...savedSettings.notifications },
          account: { ...defaultSettings.account, ...savedSettings.account },
          general: { ...defaultSettings.general, ...savedSettings.general },
        };
      } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        // Fallback to default settings if parsing fails
      }
    }
    setSettings(loadedSettings);
    applyTheme(loadedSettings.theme);
    setMounted(true);
  }, []);
  
  // Theme change effect
  React.useEffect(() => {
    if (!mounted) return;

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (settings.theme === 'system') {
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
  }, [mounted, settings.theme]);


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

  const handleSettingsChange = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    return updatedSettings;
  }

  const handleSaveSettings = async (updatedSettings: AppSettings, showToast: boolean = true) => {
    setIsSaving(true);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate async save
    setIsSaving(false);
    if (showToast) {
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated.",
      });
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    applyTheme(newTheme);
    const updatedSettings = handleSettingsChange({ theme: newTheme });
    handleSaveSettings(updatedSettings, false); // No toast for theme change, it's instant
    toast({
      title: "Theme Updated",
      description: `Theme set to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}.`,
    });
  };
  
  const handleSendTestSummary = async () => {
    if (!settings.notifications.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address in the notification settings first.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTest(true);
    let emailBody = "<h1>Your Content Ally Daily Summary</h1>";

    // Get Tasks
    const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
    const tasks: PlannedTask[] = tasksJson ? JSON.parse(tasksJson) : [];
    const activeTasks = tasks.filter(t => t.status !== 'completed');
    if (activeTasks.length > 0) {
      emailBody += "<h2>Active Tasks:</h2><ul>";
      activeTasks.forEach(task => {
        emailBody += `<li><strong>${task.taskName}</strong> (Status: ${task.status})</li>`;
      });
      emailBody += "</ul>";
    } else {
      emailBody += "<p>No active tasks today. Great job or great time to plan!</p>";
    }

    // Get Habits
    const habitsJson = localStorage.getItem(HABITS_STORAGE_KEY);
    const habits: Habit[] = habitsJson ? JSON.parse(habitsJson) : [];
    if (habits.length > 0) {
      emailBody += "<h2>Habit Progress:</h2><ul>";
      habits.forEach(habit => {
        emailBody += `<li><strong>${habit.name}</strong> - Today: ${habit.completedToday}/${habit.goal}, Streak: ${habit.streak} days 🔥</li>`;
      });
      emailBody += "</ul>";
    }

    emailBody += "<p>Have a productive day!</p>";

    try {
      await sendEmail({
        to: settings.notifications.email,
        subject: "Your Daily Content Ally Summary",
        body: emailBody,
      });
      toast({
        title: "Test Summary Sent",
        description: `A summary has been sent to ${settings.notifications.email}. (Check console for simulation)`,
      });
    } catch (error) {
       toast({
        title: "Failed to Send Summary",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
        setIsSendingTest(false);
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
                  value={settings.theme}
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
                  Manage how and where you receive notifications. Controlled by the master switch in General settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email-notif">Notification Email</Label>
                   <Input 
                    id="email-notif" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={settings.notifications.email}
                    onChange={(e) => setSettings(s => ({...s, notifications: {...s.notifications, email: e.target.value}}))}
                    disabled={!settings.general.allNotifications}
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
                    checked={settings.notifications.taskReminders}
                    onCheckedChange={(checked) => setSettings(s => ({...s, notifications: {...s.notifications, taskReminders: checked}}))}
                    disabled={!settings.general.allNotifications}
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
                    checked={settings.notifications.habitStreaks}
                    onCheckedChange={(checked) => setSettings(s => ({...s, notifications: {...s.notifications, habitStreaks: checked}}))}
                    disabled={!settings.general.allNotifications}
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
                    checked={settings.notifications.aiSuggestions}
                    onCheckedChange={(checked) => setSettings(s => ({...s, notifications: {...s.notifications, aiSuggestions: checked}}))}
                    disabled={!settings.general.allNotifications}
                  />
                </div>
              </CardContent>
              <CardFooter>
                 <Button onClick={() => handleSaveSettings(settings)} disabled={isSaving || !settings.general.allNotifications}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Notification Settings"}
                 </Button>
              </CardFooter>
            </Card>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Test Notifications</CardTitle>
                <CardDescription>
                  Manually send a test notification to your configured email address to see how it looks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleSendTestSummary} disabled={isSendingTest || !settings.general.allNotifications}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSendingTest ? "Sending..." : "Send Test Daily Summary"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account details. Changes are saved locally.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={settings.account.username}
                    onChange={(e) => setSettings(s => ({...s, account: {...s.account, username: e.target.value}}))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email-account">Email</Label>
                  <Input 
                    id="email-account" 
                    type="email"
                    placeholder="you@example.com"
                    value={settings.account.email}
                    onChange={(e) => setSettings(s => ({...s, account: {...s.account, email: e.target.value}}))}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSaveSettings(settings)} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Account Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="general">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general application preferences. Changes save automatically.
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
                  <Switch 
                    id="notifications-general" 
                    checked={settings.general.allNotifications}
                    onCheckedChange={(checked) => {
                      const updatedSettings = {...settings, general: {...settings.general, allNotifications: checked}};
                      setSettings(updatedSettings);
                      handleSaveSettings(updatedSettings, false); // Save without showing toast for every toggle
                    }}
                  />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="autocorrect" className="text-base">Enable Autocorrect (Simulated)</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically correct spelling mistakes in input fields.
                    </p>
                  </div>
                  <Switch 
                    id="autocorrect" 
                    checked={settings.general.autocorrect}
                    onCheckedChange={(checked) => {
                      const updatedSettings = {...settings, general: {...settings.general, autocorrect: checked}};
                      setSettings(updatedSettings);
                      handleSaveSettings(updatedSettings, false); // Save without showing toast
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
