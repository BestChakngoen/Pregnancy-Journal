"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Heart, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = [Heart, Star, Sparkles];
const COLORS = [
  "text-pink-400",
  "text-blue-400",
  "text-amber-400",
  "text-emerald-400",
  "text-purple-400",
];

interface Particle {
  id: number;
  x: number;
  icon: any;
  color: string;
  size: number;
  delay: number;
  duration: number;
}

export default function FloatingParticles({ count = 15 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage across width
      icon: ICONS[Math.floor(Math.random() * ICONS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 12 + 12, // 12px to 24px
      delay: Math.random() * 0.5, // stagger start times
      duration: Math.random() * 2 + 3, // 3s to 5s float time
    }));
    setParticles(newParticles);
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => {
        const Icon = p.icon;
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 50, x: `${p.x}vw`, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: ["100vh", "50vh", "0vh", "-10vh"],
              x: [`${p.x}vw`, `${p.x + (Math.random() * 10 - 5)}vw`, `${p.x + (Math.random() * 20 - 10)}vw`],
              scale: [0, 1, 1, 0.5],
              rotate: [0, Math.random() * 180 - 90, Math.random() * 360 - 180],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: "easeOut",
            }}
            className={cn("absolute bottom-0", p.color)}
          >
            <Icon size={p.size} className="fill-current opacity-60" />
          </motion.div>
        );
      })}
    </div>
  );
}
