'use client';

import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  stageNumber: number;
}

export function StageHeader({ title, description, icon: Icon, stageNumber }: StageHeaderProps) {
  return (
    <div className="mb-10">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 mb-4"
      >
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <Icon className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">Stage 0{stageNumber}</span>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
      </motion.div>
      <p className="text-slate-400 max-w-2xl leading-relaxed">{description}</p>
    </div>
  );
}
