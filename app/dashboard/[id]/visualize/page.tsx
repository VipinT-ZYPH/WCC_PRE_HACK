'use client';

import { useState } from 'react';
import { useProjectStore } from '@/components/ProjectProvider';
import { WorkflowStage } from '@/lib/types';
import { StageHeader } from '@/components/StageHeader';
import { Zap, Loader2, Check, AlertCircle, Palette, Type as TypeIcon, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

export default function VisualizePage() {
  const router = useRouter();
  const { activeProject, updateProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runVisualize = async () => {
    if (!activeProject || !activeProject.shape) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shape: activeProject.shape,
          positioning: activeProject.positioning,
          discovery: activeProject.discover,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      updateProject(activeProject.id, { visualIdentity: data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    if (!activeProject || !activeProject.visualIdentity) return;
    updateProject(activeProject.id, {
      completedStages: [...new Set([...activeProject.completedStages, 'visualize'])] as WorkflowStage[],
      currentStage: 'challenge',
    });
    router.push(`/dashboard/${activeProject.id}/challenge`);
  };

  if (!activeProject) return null;

  return (
    <div className="max-w-5xl">
      <StageHeader
        stageNumber={4}
        title="Visualize"
        description="We translate your brand strategy and personality into a visual system, including colors, typography, and logo direction."
        icon={Zap}
      />

      {!activeProject.visualIdentity && !loading && (
        <div className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Build the visual system</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">We&apos;ll generate a complete visual identity direction based on your approved brand strategy.</p>
          <button
            onClick={runVisualize}
            className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            Generate Visual Identity
          </button>
        </div>
      )}

      {loading && (
        <div className="p-20 text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Crafting color palettes & type recommendations...</p>
        </div>
      )}

      {error && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-400 mb-8">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={runVisualize} className="ml-auto underline text-xs">Try again</button>
        </div>
      )}

      {activeProject.visualIdentity && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Color Palette */}
          <section className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-8">
              <Palette className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold">Color Palette</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <div 
                  className="aspect-square rounded-2xl shadow-inner flex items-end p-3" 
                  style={{ backgroundColor: activeProject.visualIdentity.primaryColor }}
                >
                  <span className="text-[10px] font-bold px-2 py-1 bg-black/20 rounded-md backdrop-blur-sm text-white uppercase">{activeProject.visualIdentity.primaryColor}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block text-center">Primary</span>
              </div>
              {(activeProject.visualIdentity?.secondaryColors || []).map((color, i) => (
                <div key={i} className="space-y-2">
                  <div 
                    className="aspect-square rounded-2xl shadow-inner flex items-end p-3" 
                    style={{ backgroundColor: color }}
                  >
                    <span className="text-[10px] font-bold px-2 py-1 bg-black/20 rounded-md backdrop-blur-sm text-white uppercase">{color}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block text-center">Secondary {i + 1}</span>
                </div>
              ))}
              <div className="space-y-2">
                <div 
                  className="aspect-square rounded-2xl shadow-inner flex items-end p-3" 
                  style={{ backgroundColor: activeProject.visualIdentity.accentColor }}
                >
                  <span className="text-[10px] font-bold px-2 py-1 bg-black/20 rounded-md backdrop-blur-sm text-white uppercase">{activeProject.visualIdentity.accentColor}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block text-center">Accent</span>
              </div>
            </div>
          </section>

          {/* Typography */}
          <section className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-8">
              <TypeIcon className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold">Typography</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-4">Heading Font</label>
                  <div className="text-4xl font-bold text-white mb-2">{activeProject.visualIdentity.typography.heading}</div>
                  <p className="text-2xl text-slate-400">The quick brown fox jumps over the lazy dog.</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-4">Body Font</label>
                  <div className="text-lg font-medium text-white mb-2">{activeProject.visualIdentity.typography.body}</div>
                  <p className="text-slate-400 leading-relaxed">Design is not just what it looks like and feels like. Design is how it works. A well-chosen typeface conveys emotion and professionalism without saying a word.</p>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
                <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Typography Rationale</h4>
                <p className="text-sm text-slate-300 leading-relaxed italic">&quot;{activeProject.visualIdentity.typography.rationale}&quot;</p>
              </div>
            </div>
          </section>

          {/* Concepts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold">Visual Concepts</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Logo Concept</label>
                  <p className="text-slate-300 text-sm leading-relaxed">{activeProject.visualIdentity.logoConcept}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Shape Language</label>
                  <p className="text-slate-300 text-sm leading-relaxed">{activeProject.visualIdentity.shapeLanguage}</p>
                </div>
              </div>
            </section>

            <section className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold">Visual Direction</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Imagery Style</label>
                  <p className="text-slate-300 text-sm leading-relaxed">{activeProject.visualIdentity.imageryDirection}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Mood & Atmosphere</label>
                  <p className="text-slate-300 text-sm leading-relaxed font-bold italic">&quot;{activeProject.visualIdentity.visualMood}&quot;</p>
                </div>
              </div>
            </section>
          </div>

          <div className="pt-8 border-t border-white/5 flex items-center justify-between">
            <button
              onClick={runVisualize}
              className="text-sm font-medium text-slate-500 hover:text-white transition-colors"
            >
              Regenerate Visual Identity
            </button>
            <button
              onClick={handleApprove}
              className="px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            >
              Confirm Visual Identity
              <Check className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
