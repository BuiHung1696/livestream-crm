import React from "react";
import { TalentType } from "@/types";
import { cn } from "@/lib/utils";
import { Mic, Video, Star, Sparkles } from "lucide-react";

interface TalentBadgeProps {
  type: TalentType;
  className?: string;
  showIcon?: boolean;
}

export function TalentBadge({ type, className, showIcon = true }: TalentBadgeProps) {
  const configs: Record<TalentType, { label: string; bgClass: string; icon: React.ComponentType<{ className?: string }> }> = {
    HOST: {
      label: "Host",
      bgClass: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
      icon: Mic,
    },
    KOC: {
      label: "KOC",
      bgClass: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
      icon: Video,
    },
    KOL: {
      label: "KOL",
      bgClass: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
      icon: Star,
    },
    HYBRID: {
      label: "Hybrid",
      bgClass: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
      icon: Sparkles,
    },
  };

  const config = configs[type] || configs.HOST;
  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
        config.bgClass,
        className
      )}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
}
