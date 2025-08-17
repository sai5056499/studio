
"use client";
import React from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

export function HabitIcon({ iconName, className, size = 24 }: HabitIconProps) {
  const IconComponent = (LucideIcons as Record<string, React.ElementType>)[iconName] as React.ElementType;
  
  if (!IconComponent) {
    return <div className={cn("bg-muted rounded flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <span className="text-xs text-muted-foreground">?</span>
    </div>;
  }

  return <IconComponent className={className} size={size} />;
}
