"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  colorClass: string;
  iconColorClass: string;
  delay?: number;
  onClick?: () => void;
}

export default function AnimatedCard({
  title,
  subtitle,
  icon: Icon,
  colorClass,
  iconColorClass,
  delay = 0,
  onClick,
}: AnimatedCardProps) {
  return (
    <motion.button 
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center p-4 backdrop-blur-md rounded-[1.75rem]",
        colorClass,
        "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.08)]",
        "transition-all text-center w-full group overflow-hidden border border-white/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, filter: "brightness(0.96)" }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />

      <motion.div 
        className={cn("p-3 rounded-2xl mb-3 transition-transform group-hover:-translate-y-1 shadow-sm bg-white/60")}
      >
        <Icon className={cn("w-6 h-6", iconColorClass)} />
      </motion.div>
      <h4 className="font-semibold text-slate-800/90 text-sm mb-1">{title}</h4>
      <p className="text-xs text-slate-600/80 font-medium tabular-nums">{subtitle}</p>
    </motion.button>
  );
}
