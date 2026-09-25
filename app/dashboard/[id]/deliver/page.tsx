'use client';

import { useState } from 'react';
import { useProjectStore } from '@/components/ProjectProvider';
import { StageHeader } from '@/components/StageHeader';
import { Rocket, Loader2, Check, Download, ExternalLink, Mail, Share2, Instagram, Linkedin } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

export default function DeliverPage() {
  const router = useRouter();
  const { activeProject, updateProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDeliver = async () => {
    if (!activeProject) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: activeProject,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      updateProject(activeProject.id, { deliver: data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!activeProject) return null;

  return (
    <div className="max-w-5xl">
      <StageHeader
        stageNumber={6}
        title="Deliver"
        description="Your brand identity is ready. Review your final Brand Kit and launch assets to start your journey."
        icon={Rocket}
      />

      {!activeProject.deliver && !loading && (
        <div className="p-12 rounded-3xl bg-white/5 border border-white/10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Ready to launch?</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">We&apos;ll consolidate everything into a final brand book and generate your first social media posts.</p>
          <button
            onClick={runDeliver}
            className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            Generate Brand Kit
          </button>
        </div>
      )}

      {loading && (
        <div className="p-20 text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Assembling final brand book & launch assets...</p>
        </div>
      )}

      {activeProject.deliver && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12 pb-20"
        >
          {/* Summary Section */}
          <section className="p-8 rounded-3xl bg-indigo-600/10 border border-indigo-500/20">
            <h2 className="text-2xl font-bold mb-4">Launch Strategy</h2>
            <p className="text-indigo-200/80 leading-relaxed max-w-3xl">{activeProject.deliver.finalSummary}</p>
          </section>

          {/* Asset Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-6">
              <h3 className="font-bold flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-400" />
                Launch Assets
              </h3>
              <div className="space-y-4">
                {(activeProject.deliver?.launchAssets || []).map((asset, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 group hover:border-white/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {asset.type.toLowerCase().includes('instagram') ? <Instagram className="w-4 h-4 text-pink-400" /> : <Linkedin className="w-4 h-4 text-blue-400" />}
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{asset.type}</span>
                      </div>
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <Download className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{asset.content}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="font-bold flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <ActionCard 
                  title="Export Brand Book" 
                  desc="Download a structured PDF with all strategy and visual assets." 
                  icon={Download}
                />
                <ActionCard 
                  title="Share with Team" 
                  desc="Invite collaborators to view the final brand identity." 
                  icon={Share2}
                />
                <ActionCard 
                  title="Connect to Website" 
                  desc="Directly push styles and assets to your web project." 
                  icon={ExternalLink}
                />
              </div>
            </section>
          </div>

          {/* Final Brand Snapshot */}
          <section className="p-8 rounded-3xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-bold mb-8">Brand Snapshot</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Name</label>
                <p className="font-bold">{activeProject.name}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Tagline</label>
                <p className="text-sm italic">&quot;{activeProject.shape?.tagline}&quot;</p>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Primary Color</label>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activeProject.visualIdentity?.primaryColor }} />
                  <span className="text-xs font-mono uppercase">{activeProject.visualIdentity?.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Status</label>
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase">Launch Ready</span>
              </div>
            </div>
          </section>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-12">
            <button
              onClick={() => router.push('/')}
              className="px-10 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all"
            >
              Start New Project
            </button>
            <button
              onClick={() => alert("Brand kit exported as JSON (Simulated)")}
              className="px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            >
              Download Full Kit
              <Download className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ActionCard({ title, desc, icon: Icon }: { title: string; desc: string; icon: any }) {
  return (
    <button className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-left transition-all group">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
          <Icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
        </div>
        <div>
          <h4 className="font-bold text-slate-200 mb-1">{title}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </div>
      </div>
    </button>
  );
}
