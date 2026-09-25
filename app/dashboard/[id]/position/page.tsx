'use client';

import { useState } from 'react';
import { useProjectStore } from '@/components/ProjectProvider';
import { WorkflowStage } from '@/lib/types';
import { StageHeader } from '@/components/StageHeader';
import { Activity, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

export default function PositioningPage() {
  const router = useRouter();
  const { activeProject, updateProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPositioning = async () => {
    if (!activeProject || !activeProject.discover) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/positioning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discovery: activeProject.discover,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      updateProject(activeProject.id, { positioning: data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDirection = (directionId: string) => {
    if (!activeProject || !activeProject.positioning) return;
    const direction = activeProject.positioning.directions.find(d => d.id === directionId);
    updateProject(activeProject.id, {
      positioning: {
        ...activeProject.positioning,
        selectedDirectionId: directionId,
      }
    });
  };

  const handleApprove = () => {
    if (!activeProject || !activeProject.positioning?.selectedDirectionId) return;
    updateProject(activeProject.id, {
      completedStages: [...new Set([...activeProject.completedStages, 'position'])] as WorkflowStage[],
      currentStage: 'shape',
    });
    router.push(`/dashboard/${activeProject.id}/shape`);
  };

  if (!activeProject) return null;

  return (
    <div className="max-w-5xl">
      <StageHeader
        stageNumber={2}
        title="Position"
        description="Positioning defines how your brand is perceived in relation to competitors. Choose a strategic direction that resonates most with your goals."
        icon={Activity}
      />

      {!activeProject.positioning && !loading && (
        <div className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Explore strategic angles</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">We&apos;ll generate 3 distinct directions based on your discovery results.</p>
          <button
            onClick={runPositioning}
            className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            Generate Directions
          </button>
        </div>
      )}

      {loading && (
        <div className="p-20 text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Comparing strategic directions...</p>
        </div>
      )}

      {error && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-400 mb-8">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={runPositioning} className="ml-auto underline text-xs">Try again</button>
        </div>
      )}

      {activeProject.positioning && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(activeProject.positioning?.directions || []).map((direction) => {
              const isSelected = activeProject.positioning?.selectedDirectionId === direction.id;
              return (
                <button
                  key={direction.id}
                  onClick={() => handleSelectDirection(direction.id)}
                  className={`p-6 rounded-2xl border text-left transition-all flex flex-col h-full group ${
                    isSelected 
                      ? 'bg-indigo-600/10 border-indigo-500 shadow-xl shadow-indigo-500/10 scale-[1.02]' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className={`font-bold text-lg ${isSelected ? 'text-indigo-400' : 'text-white'}`}>{direction.name}</h3>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-6 flex-1">{direction.description}</p>
                  
                  <div className="space-y-4 mt-auto">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Strength</span>
                      </div>
                      <p className="text-[11px] text-slate-300">{direction.strength}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-3 h-3 text-red-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Risk</span>
                      </div>
                      <p className="text-[11px] text-slate-300">{direction.risk}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {activeProject.positioning.selectedDirectionId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Strategic Foundation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-xs font-bold text-indigo-400 block mb-2">Category</label>
                  <p className="text-slate-200">{activeProject.positioning.category}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-indigo-400 block mb-2">Value Proposition</label>
                  <p className="text-slate-200">{activeProject.positioning.valueProposition}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-indigo-400 block mb-2">Positioning Statement</label>
                  <p className="text-lg font-medium text-slate-200 leading-relaxed italic">&quot;{activeProject.positioning.positioningStatement}&quot;</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="pt-8 border-t border-white/5 flex items-center justify-between">
            <button
              onClick={runPositioning}
              className="text-sm font-medium text-slate-500 hover:text-white transition-colors"
            >
              Regenerate Directions
            </button>
            <button
              onClick={handleApprove}
              disabled={!activeProject.positioning.selectedDirectionId}
              className={`px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                activeProject.positioning.selectedDirectionId
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5 shadow-none'
              }`}
            >
              Confirm Positioning
              <Check className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
