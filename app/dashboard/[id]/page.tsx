'use client';

import { useProjectStore } from '@/components/ProjectProvider';
import { motion } from 'motion/react';
import { Target, Activity, Shield, Zap, Sparkles, Rocket, ArrowRight, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardOverview() {
  const router = useRouter();
  const { activeProject } = useProjectStore();

  if (!activeProject) return null;

  const steps = [
    { id: 'discover', label: 'Discovery', desc: 'Understanding your problem & audience', icon: Target },
    { id: 'position', label: 'Positioning', desc: 'Defining your unique value prop', icon: Activity },
    { id: 'shape', label: 'Shaping', desc: 'Personality, naming & messaging', icon: Shield },
    { id: 'visualize', label: 'Visual Identity', desc: 'Colors, typography & visual style', icon: Zap },
    { id: 'challenge', label: 'Brand Critic', desc: 'AI-powered stress testing', icon: Sparkles },
    { id: 'deliver', label: 'Final Delivery', desc: 'Launch assets & brand book', icon: Rocket },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Project Overview</h1>
        <p className="text-slate-400">Welcome to your brand creation workspace. Follow the steps below to build your identity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Project Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Rough Idea</label>
              <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">{activeProject.roughIdea}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Target Audience</label>
                <p className="text-sm text-slate-300">{activeProject.targetAudience || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Industry</label>
                <p className="text-sm text-slate-300">{activeProject.industry || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex flex-col justify-between">
          <div>
            <h3 className="font-bold mb-2">Current Stage</h3>
            <p className="text-sm text-indigo-300/80 mb-6">You are currently at the {activeProject.currentStage} stage.</p>
          </div>
          <button
            onClick={() => router.push(`/dashboard/${activeProject.id}/${activeProject.currentStage}`)}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-all group"
          >
            Continue Workflow
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold mb-4">Workflow Progress</h3>
        <div className="grid grid-cols-1 gap-3">
          {steps.map((step, i) => {
            const isCompleted = activeProject.completedStages.includes(step.id as any);
            const isActive = activeProject.currentStage === step.id;
            
            return (
              <div 
                key={step.id}
                className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
                  isActive 
                    ? 'bg-indigo-500/5 border-indigo-500/30' 
                    : isCompleted 
                      ? 'bg-white/5 border-white/10 opacity-70' 
                      : 'bg-white/5 border-white/5 opacity-40'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-indigo-500 text-white' : isCompleted ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{step.label}</h4>
                  <p className="text-xs text-slate-500">{step.desc}</p>
                </div>
                {isCompleted && <span className="text-[10px] font-bold text-green-500 uppercase">Completed</span>}
                {isActive && <span className="text-[10px] font-bold text-indigo-400 uppercase animate-pulse">In Progress</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
