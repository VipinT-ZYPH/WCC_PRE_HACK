'use client';

import { useState } from 'react';
import { useProjectStore } from '@/components/ProjectProvider';
import { WorkflowStage } from '@/lib/types';
import { StageHeader } from '@/components/StageHeader';
import { Sparkles, Loader2, Check, AlertCircle, ShieldAlert, Flag, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

export default function ChallengePage() {
  const router = useRouter();
  const { activeProject, updateProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runChallenge = async () => {
    if (!activeProject) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: activeProject,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      updateProject(activeProject.id, { critique: data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    if (!activeProject || !activeProject.critique) return;
    updateProject(activeProject.id, {
      completedStages: [...new Set([...activeProject.completedStages, 'challenge'])] as WorkflowStage[],
      currentStage: 'deliver',
    });
    router.push(`/dashboard/${activeProject.id}/deliver`);
  };

  if (!activeProject) return null;

  return (
    <div className="max-w-5xl">
      <StageHeader
        stageNumber={5}
        title="Challenge"
        description="The AI Brand Critic stress-tests your brand identity to ensure it's unique, consistent, and strategically sound."
        icon={Sparkles}
      />

      {!activeProject.critique && !loading && (
        <div className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] -z-10" />
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Summon the Critic</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">We&apos;ll evaluate your entire brand system for weaknesses, inconsistencies, and generic choices.</p>
          <button
            onClick={runChallenge}
            className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            Run AI Stress Test
          </button>
        </div>
      )}

      {loading && (
        <div className="p-20 text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Analyzing strategic alignment & market uniqueness...</p>
        </div>
      )}

      {error && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-400 mb-8">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={runChallenge} className="ml-auto underline text-xs">Try again</button>
        </div>
      )}

      {activeProject.critique && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          <div className="p-6 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 block mb-1">Critic Status</span>
              <h3 className="text-xl font-bold">{activeProject.critique.overallStatus}</h3>
            </div>
            <div className="flex -space-x-2">
              {(activeProject.critique?.strengths || []).map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-400">
                  <Check className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                Identified Issues
              </h3>
              <div className="space-y-4">
                {(activeProject.critique?.issues || []).map((issue, i) => (
                  <div key={i} className={`p-5 rounded-2xl border transition-all ${
                    issue.severity === 'high' ? 'bg-red-500/5 border-red-500/30' : 'bg-orange-500/5 border-orange-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{issue.category}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        issue.severity === 'high' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                      }`}>
                        {issue.severity}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-200 mb-2">{issue.problem}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{issue.reason}</p>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 block mb-1">Recommendation</span>
                      <p className="text-xs text-slate-300 italic">&quot;{issue.suggestion}&quot;</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="font-bold flex items-center gap-2 mb-6">
                  <Check className="w-5 h-5 text-green-400" />
                  Strategic Strengths
                </h3>
                <div className="space-y-3">
                  {(activeProject.critique?.strengths || []).map((strength, i) => (
                    <div key={i} className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-sm text-slate-300 flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      {strength}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-indigo-400" />
                  Recommended Changes
                </h3>
                <ul className="space-y-3">
                  {(activeProject.critique?.recommendedChanges || []).map((change, i) => (
                    <li key={i} className="text-sm text-slate-400 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={runChallenge}
                className="text-sm font-medium text-slate-500 hover:text-white transition-colors"
              >
                Regenerate Critique
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
                onClick={() => {
                   // This would trigger a "Smart Improve" loop in a real product
                   alert("In a full version, this would automatically refine the brand based on the critic's suggestions.");
                }}
              >
                Apply Recommendations
              </button>
            </div>
            <button
              onClick={handleApprove}
              className="px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            >
              Acknowledge & Finalize
              <Check className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
