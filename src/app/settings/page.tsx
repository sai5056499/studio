
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
import { Monitor, Moon, Sun, Bell, Save, Send, ArrowUp, ArrowDown, RotateCcw, Palette } from "lucide-react";
import { sendEmail } from "@/services/email-service";
import type { PlannedTask, Habit, NavItem } from "@/lib/types";
import { defaultNavItems, SIDEBAR_ORDER_STORAGE_KEY } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

// Types for settings
type ThemeMode = "light" | "dark" | "system";
type ThemePalette = "violet" | "devias";

interface ThemeSettings {
  mode: ThemeMode;
  palette: ThemePalette;
}

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
  theme: ThemeSettings;
  notifications: NotificationSettings;
  account: AccountSettings;
  general: GeneralSettings;
}

const SETTINGS_STORAGE_KEY = "contentAllySettings";
const TASKS_STORAGE_KEY = "contentAllyTasks";
const HABITS_STORAGE_KEY = "contentAllyHabits";

const defaultSettings: AppSettings = {
  theme: {
    mode: "system",
    palette: "devias",
  },
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

  const [settings, setSettings] = React.useState<AppSettings>(defaultSettings);
  
  const [sidebarItems, setSidebarItems] = React.useState<NavItem[]>(defaultNavItems);
  const [isSavingOrder, setIsSavingOrder] = React.useState(false);

  const applyTheme = React.useCallback((themeSettings: ThemeSettings) => {
    const { mode, palette } = themeSettings;
    let themeName = "";
    if (mode === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      themeName = `${palette}-${systemPrefersDark ? 'dark' : 'light'}`;
    } else {
      themeName = `${palette}-${mode}`;
    }
    document.body.setAttribute('data-theme', themeName);
  }, []);

  React.useEffect(() => {
    const savedSettingsJson = localStorage.getItem(SETTINGS_STORAGE_KEY);
    let loadedSettings: AppSettings = defaultSettings;
    if (savedSettingsJson) {
      try {
        const savedSettings = JSON.parse(savedSettingsJson);
        loadedSettings = {
          ...defaultSettings,
          ...savedSettings,
          theme: { ...defaultSettings.theme, ...savedSettings.theme },
          notifications: { ...defaultSettings.notifications, ...savedSettings.notifications },
          account: { ...defaultSettings.account, ...savedSettings.account },
          general: { ...defaultSettings.general, ...savedSettings.general },
        };
      } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
      }
    }
    setSettings(loadedSettings);
    
    const savedOrderJson = localStorage.getItem(SIDEBAR_ORDER_STORAGE_KEY);
    if (savedOrderJson) {
      try {
        const savedOrder: string[] = JSON.parse(savedOrderJson);
        const itemMap = new Map(defaultNavItems.map(item => [item.href, item]));
        const newOrderedItems = savedOrder
          .map(href => itemMap.get(href))
          .filter((item): item is NavItem => !!item);
          
        defaultNavItems.forEach(item => {
            if(!newOrderedItems.find(i => i.href === item.href)) {
                newOrderedItems.push(item);
            }
        });
        setSidebarItems(newOrderedItems);
      } catch (e) {
        setSidebarItems(defaultNavItems);
      }
    }

    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted) {
      applyTheme(settings.theme);
    }
  }, [settings.theme, mounted, applyTheme]);
  
  React.useEffect(() => {
    if (!mounted) return;

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (settings.theme.mode === 'system') {
        applyTheme(settings.theme);
      }
    };
    
    const systemThemeDark = window.matchMedia("(prefers-color-scheme: dark)");
    systemThemeDark.addEventListener("change", handleSystemThemeChange);

    return () => {
      systemThemeDark.removeEventListener("change", handleSystemThemeChange);
    };
  }, [mounted, settings.theme, applyTheme]);

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

  const handleThemeModeChange = (newMode: ThemeMode) => {
    const newThemeSettings = { ...settings.theme, mode: newMode };
    const updatedSettings = handleSettingsChange({ theme: newThemeSettings });
    handleSaveSettings(updatedSettings, false);
    toast({ title: "Theme Mode Updated" });
  };
  
  const handleThemePaletteChange = (newPalette: ThemePalette) => {
    const newThemeSettings = { ...settings.theme, palette: newPalette };
    const updatedSettings = handleSettingsChange({ theme: newThemeSettings });
    handleSaveSettings(updatedSettings, false);
    toast({ title: "Theme Palette Updated" });
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

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sidebarItems.length) return;

    const newItems = [...sidebarItems];
    const [movedItem] = newItems.splice(index, 1);
    newItems.splice(newIndex, 0, movedItem);
    setSidebarItems(newItems);
  };

  const handleSaveOrder = async () => {
      setIsSavingOrder(true);
      const orderToSave = sidebarItems.map(item => item.href);
      localStorage.setItem(SIDEBAR_ORDER_STORAGE_KEY, JSON.stringify(orderToSave));
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsSavingOrder(false);
      toast({
          title: "Sidebar Order Saved",
          description: "The new sidebar order will be applied on the next page refresh.",
      });
  };

  const handleResetOrder = () => {
      localStorage.removeItem(SIDEBAR_ORDER_STORAGE_KEY);
      setSidebarItems(defaultNavItems);
      toast({
          title: "Sidebar Order Reset",
          description: "The sidebar order has been reset to default.",
      });
  };

  if (!mounted) {
    return (
      <div className="flex h-full flex-col">
        <AppHeader title="Settings" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6"></main>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Settings" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="grid w-full grid-cols-5 md:max-w-xl mx-auto">
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="reorder">Reorder Pages</TabsTrigger>
          </TabsList>

          <TabsContent value="theme">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application. Select your preferred theme palette and mode.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <Label className="text-base font-semibold">Color Palette</Label>
                  <RadioGroup
                    value={settings.theme.palette}
                    onValueChange={(value) => handleThemePaletteChange(value as ThemePalette)}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2"
                  >
                    <Label
                      htmlFor="palette-devias"
                      className={cn(
                        "flex flex-col items-center justify-center rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                        settings.theme.palette === 'devias' ? "border-primary" : "border-muted bg-popover"
                      )}
                    >
                      <RadioGroupItem value="devias" id="palette-devias" className="sr-only" />
                      <div className="flex gap-2 mb-2">
                          <div className="h-6 w-6 rounded-full bg-[#5048E5]"></div>
                          <div className="h-6 w-6 rounded-full bg-[#10B981]"></div>
                          <div className="h-6 w-6 rounded-full bg-[#F0B429]"></div>
                      </div>
                      <span className="text-sm font-medium">Devias</span>
                    </Label>
                     <Label
                      htmlFor="palette-violet"
                       className={cn(
                        "flex flex-col items-center justify-center rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                        settings.theme.palette === 'violet' ? "border-primary" : "border-muted bg-popover"
                      )}
                    >
                      <RadioGroupItem value="violet" id="palette-violet" className="sr-only" />
                      <div className="flex gap-2 mb-2">
                          <div className="h-6 w-6 rounded-full bg-[#6534e9]"></div>
                          <div className="h-6 w-6 rounded-full bg-[#3c82f6]"></div>
                          <div className="h-6 w-6 rounded-full bg-[#ec4899]"></div>
                      </div>
                      <span className="text-sm font-medium">Violet</span>
                    </Label>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-semibold">Theme Mode</Label>
                   <RadioGroup
                    value={settings.theme.mode}
                    onValueChange={(value) => handleThemeModeChange(value as ThemeMode)}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2"
                  >
                    {(["light", "dark", "system"] as ThemeMode[]).map((modeOption) => (
                      <Label
                        key={modeOption}
                        htmlFor={`theme-mode-${modeOption}`}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                          settings.theme.mode === modeOption ? "border-primary" : "border-muted bg-popover"
                        )}
                      >
                        <RadioGroupItem value={modeOption} id={`theme-mode-${modeOption}`} className="sr-only" />
                        {modeOption === "light" && <Sun className="mb-3 h-6 w-6" />}
                        {modeOption === "dark" && <Moon className="mb-3 h-6 w-6" />}
                        {modeOption === "system" && <Monitor className="mb-3 h-6 w-6" />}
                        <span className="text-sm font-medium capitalize">
                          {modeOption}
                        </span>
                      </Label>
                    ))}
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground mt-2">
                    Selecting "System" will automatically use your operating system's theme preference.
                  </p>
                </div>
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
                      handleSaveSettings(updatedSettings, false);
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
                      handleSaveSettings(updatedSettings, false);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reorder">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Reorder Sidebar Pages</CardTitle>
                <CardDescription>
                  Click the arrows to change the order of pages in the main sidebar navigation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 rounded-md border p-4">
                  {sidebarItems.map((item, index) => (
                    <li key={item.href} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <span className="font-medium">{item.label}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveItem(index, 'up')} disabled={index === 0}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveItem(index, 'down')} disabled={index === sidebarItems.length - 1}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="gap-2">
                <Button onClick={handleSaveOrder} disabled={isSavingOrder}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSavingOrder ? "Saving..." : "Save Order"}
                </Button>
                <Button variant="outline" onClick={handleResetOrder}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset to Default
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
