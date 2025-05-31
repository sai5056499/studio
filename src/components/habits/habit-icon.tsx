
"use client";
import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";

interface HabitIconProps extends LucideProps {
  iconName: string;
}

const HabitIcon = ({ iconName, ...props }: HabitIconProps) => {
  const IconComponent = (LucideIcons as any)[iconName] as React.ElementType;

  if (!IconComponent) {
    // Fallback icon if the specified one doesn't exist
    return <LucideIcons.HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
};

export default HabitIcon;
