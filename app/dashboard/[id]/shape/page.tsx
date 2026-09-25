'use client';

import { useState } from 'react';
import { useProjectStore } from '@/components/ProjectProvider';
import { WorkflowStage } from '@/lib/types';
import { StageHeader } from '@/components/StageHeader';
import { Shield, Loader2, Check, AlertCircle, Sparkles, Tag, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

export default function ShapePage() {
  const router = useRouter();
  const { activeProject, updateProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runShape = async () => {
    if (!activeProject || !activeProject.positioning) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/shape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positioning: activeProject.positioning,
          discovery: activeProject.discover,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      updateProject(activeProject.id, { shape: data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectName = (name: string, territoryId: string) => {
    if (!activeProject || !activeProject.shape) return;
    updateProject(activeProject.id, {
      shape: {
        ...activeProject.shape,
        selectedName: name,
        selectedNamingTerritoryId: territoryId,
      }
    });
  };

  const handleApprove = () => {
    if (!activeProject || !activeProject.shape?.selectedName) return;
    updateProject(activeProject.id, {
      name: activeProject.shape.selectedName,
      completedStages: [...new Set([...activeProject.completedStages, 'shape'])] as WorkflowStage[],
      currentStage: 'visualize',
    });
    router.push(`/dashboard/${activeProject.id}/visualize`);
  };

  if (!activeProject) return null;

  return (
    <div className="max-w-5xl">
      <StageHeader
        stageNumber={3}
        title="Shape"
        description="We define your brand's personality and explore naming territories that align with your strategic direction."
        icon={Shield}
      />

      {!activeProject.shape && !loading && (
        <div className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-pink-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Shape the personality</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">We&apos;ll generate personality traits and naming territories based on your selected direction.</p>
          <button
            onClick={runShape}
            className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            Generate Brand Shape
          </button>
        </div>
      )}

      {loading && (
        <div className="p-20 text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Drafting personality traits & naming concepts...</p>
        </div>
      )}

      {error && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-400 mb-8">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={runShape} className="ml-auto underline text-xs">Try again</button>
        </div>
      )}

      {activeProject.shape && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Naming Section */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold">Naming Territories</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(activeProject.shape?.namingTerritories || []).map((territory) => (
                <div key={territory.id} className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">{territory.territory}</h3>
                  <div className="space-y-3">
                    {(territory?.names || []).map((nameObj) => {
                      const isSelected = activeProject.shape?.selectedName === nameObj.name;
                      return (
                        <button
                          key={nameObj.name}
                          onClick={() => handleSelectName(nameObj.name, territory.id)}
                          className={`w-full p-4 rounded-xl border text-left transition-all relative group ${
                            isSelected 
                              ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-bold text-lg">{nameObj.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-indigo-500" />}
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{nameObj.concept}</p>
                          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> {nameObj.why}</span>
                            <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-red-500" /> {nameObj.weakness}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Personality Section */}
          <section className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold">Brand Personality</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(activeProject.shape?.personalityTraits || []).map((trait) => (
                <div key={trait.trait} className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <h4 className="font-bold text-indigo-400 mb-2">{trait.trait}</h4>
                  <p className="text-xs text-slate-400 mb-4">{trait.why}</p>
                  <div className="p-3 rounded-lg bg-black/20">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">How it appears</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{trait.appearance}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Traits to avoid</h4>
              <div className="flex flex-wrap gap-2">
                {(activeProject.shape?.traitsToAvoid || []).map((trait) => (
                  <span key={trait} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                    &times; {trait}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Messaging Section */}
          <section className="p-8 rounded-3xl bg-indigo-600/5 border border-indigo-500/10">
            <div className="flex items-center gap-2 mb-8">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold">Initial Messaging</h2>
            </div>
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Tagline</label>
                <p className="text-2xl font-bold italic">&quot;{activeProject.shape.tagline}&quot;</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">One-Line Pitch</label>
                  <p className="text-slate-300">{activeProject.shape.oneLinePitch}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Hero Headline</label>
                  <p className="text-slate-300 font-bold">{activeProject.shape.messagingHierarchy.hero}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-8 border-t border-white/5 flex items-center justify-between">
            <button
              onClick={runShape}
              className="text-sm font-medium text-slate-500 hover:text-white transition-colors"
            >
              Regenerate Brand Shape
            </button>
            <button
              onClick={handleApprove}
              disabled={!activeProject.shape.selectedName}
              className={`px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                activeProject.shape.selectedName
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5 shadow-none'
              }`}
            >
              Lock Brand Identity
              <Check className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
