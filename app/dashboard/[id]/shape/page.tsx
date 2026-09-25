'use client';

import { useState, useEffect } from 'react';
import { useProjectStore } from '@/components/ProjectProvider';
import { WorkflowStage } from '@/lib/types';
import { StageHeader } from '@/components/StageHeader';
import { Shield, Loader2, Check, AlertCircle, Sparkles, Tag, MessageSquare, Edit3, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

export default function ShapePage() {
  const router = useRouter();
  const { activeProject, updateProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Auto-select a name if shape exists but no name is selected yet
  useEffect(() => {
    if (activeProject?.shape && !activeProject.shape.selectedName) {
      const firstName = activeProject.shape.namingTerritories?.[0]?.names?.[0]?.name || activeProject.name || 'Aetheria';
      const firstTerritoryId = activeProject.shape.namingTerritories?.[0]?.id || 'terr-1';
      updateProject(activeProject.id, {
        shape: {
          ...activeProject.shape,
          selectedName: firstName,
          selectedNamingTerritoryId: firstTerritoryId,
        }
      });
    }
  }, [activeProject?.shape, activeProject?.id, activeProject?.name, updateProject]);

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
      
      const firstName = data.namingTerritories?.[0]?.names?.[0]?.name || activeProject.name || 'Aetheria';
      const firstTerritoryId = data.namingTerritories?.[0]?.id || 'terr-1';

      updateProject(activeProject.id, { 
        shape: {
          ...data,
          selectedName: activeProject.shape?.selectedName || firstName,
          selectedNamingTerritoryId: activeProject.shape?.selectedNamingTerritoryId || firstTerritoryId,
        } 
      });
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

  const handleApplyCustomName = () => {
    if (!customName.trim() || !activeProject || !activeProject.shape) return;
    updateProject(activeProject.id, {
      shape: {
        ...activeProject.shape,
        selectedName: customName.trim(),
        selectedNamingTerritoryId: 'custom',
      }
    });
    setCustomName('');
    setShowCustomInput(false);
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
          {/* Currently Selected Name Banner */}
          <div className="p-6 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 block mb-1">Active Selected Name</span>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                {activeProject.shape.selectedName || 'None Selected'}
                <Check className="w-5 h-5 text-indigo-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">Select a candidate name below or type your own custom brand name.</p>
            </div>
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all shrink-0"
            >
              <Edit3 className="w-4 h-4 text-indigo-400" />
              {showCustomInput ? 'Hide Custom Input' : 'Type Custom Name'}
            </button>
          </div>

          {/* Custom Name Input Modal / Field */}
          {showCustomInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-6 rounded-2xl bg-white/5 border border-indigo-500/30 space-y-4"
            >
              <h4 className="text-sm font-bold text-white">Use Your Own Custom Brand Name</h4>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter custom brand name (e.g. Apex Studio)..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCustomName()}
                />
                <button
                  onClick={handleApplyCustomName}
                  disabled={!customName.trim()}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Apply Name
                </button>
              </div>
            </motion.div>
          )}

          {/* Naming Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold">Naming Territories</h2>
              </div>
              <span className="text-xs text-indigo-300 font-medium">Click any card to select name</span>
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
                          className={`w-full p-4 rounded-xl border text-left transition-all relative group cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500' 
                              : 'bg-white/5 border-white/10 hover:border-indigo-400/50 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className={`font-bold text-lg ${isSelected ? 'text-indigo-300' : 'text-white'}`}>{nameObj.name}</span>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold uppercase flex items-center gap-1">
                                <Check className="w-3 h-3" /> Selected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mb-3">{nameObj.concept}</p>
                          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <span className="flex items-center gap-1 text-slate-400"><Check className="w-3 h-3 text-green-400" /> {nameObj.why}</span>
                            <span className="flex items-center gap-1 text-slate-400"><AlertCircle className="w-3 h-3 text-orange-400" /> {nameObj.weakness}</span>
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
                  <p className="text-slate-300 font-bold">{activeProject.shape?.messagingHierarchy?.hero || 'Shape the Future of Your Brand'}</p>
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
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 cursor-pointer'
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
