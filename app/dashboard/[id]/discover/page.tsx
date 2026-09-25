'use client';

import { useEffect, useState } from 'react';
import { useProjectStore } from '@/components/ProjectProvider';
import { WorkflowStage } from '@/lib/types';
import { StageHeader } from '@/components/StageHeader';
import { Target, Loader2, Check, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

export default function DiscoverPage() {
  const router = useRouter();
  const { activeProject, updateProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiscovery = async () => {
    if (!activeProject) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roughIdea: activeProject.roughIdea,
          targetAudience: activeProject.targetAudience,
          industry: activeProject.industry,
          market: activeProject.market,
          goal: activeProject.goal,
          constraints: activeProject.constraints,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      updateProject(activeProject.id, { discover: data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    if (!activeProject) return;
    updateProject(activeProject.id, {
      completedStages: [...new Set([...activeProject.completedStages, 'discover'])] as WorkflowStage[],
      currentStage: 'position',
    });
    router.push(`/dashboard/${activeProject.id}/position`);
  };

  if (!activeProject) return null;

  return (
    <div className="max-w-5xl">
      <StageHeader
        stageNumber={1}
        title="Discover"
        description="We analyze your rough idea to understand the core problem, target audience, and market context before we even think about colors or names."
        icon={Target}
      />

      {!activeProject.discover && !loading && (
        <div className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Ready to analyze?</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Our AI agent will break down your idea into a structured brand strategy context.</p>
          <button
            onClick={runDiscovery}
            className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            Run Discovery Agent
          </button>
        </div>
      )}

      {loading && (
        <div className="p-20 text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Analyzing audience fit & core problem...</p>
        </div>
      )}

      {error && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-400 mb-8">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={runDiscovery} className="ml-auto underline text-xs">Try again</button>
        </div>
      )}

      {activeProject.discover && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Core Problem" content={activeProject.discover.problem} />
            <Card title="Context" content={activeProject.discover.context} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ListCard title="Target Audience" items={activeProject.discover.targetAudience} />
            <ListCard title="User Needs" items={activeProject.discover.userNeeds} />
            <ListCard title="Pain Points" items={activeProject.discover.painPoints} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ListCard title="Goals" items={activeProject.discover.goals} />
            <ListCard title="Constraints" items={activeProject.discover.constraints} />
          </div>

          <div className="pt-8 border-t border-white/5 flex items-center justify-between">
            <button
              onClick={runDiscovery}
              className="text-sm font-medium text-slate-500 hover:text-white transition-colors"
            >
              Regenerate Analysis
            </button>
            <button
              onClick={handleApprove}
              className="px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            >
              Approve & Continue
              <Check className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Card({ title, content }: { title: string; content: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">{title}</h3>
      <p className="text-slate-200 leading-relaxed">{content}</p>
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
