'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ChevronLeft } from 'lucide-react';
import { useProjectStore } from '@/components/ProjectProvider';
import Link from 'next/link';

export default function CreateProjectPage() {
  const router = useRouter();
  const { createProject } = useProjectStore();
  const [formData, setFormData] = useState({
    name: '',
    roughIdea: '',
    targetAudience: '',
    industry: '',
    market: '',
    goal: '',
    constraints: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roughIdea) return;
    const project = createProject(formData);
    router.push(`/dashboard/${project.id}`);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            Forge a New Brand
          </h1>
          <p className="text-slate-400">Tell us about your rough idea. Don&apos;t worry about making it perfect — that&apos;s our job.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Project Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. HackMatch"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Rough Idea (Required)</label>
            <textarea
              required
              rows={4}
              placeholder="e.g. I want to build an app that helps college students find teammates for hackathons..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-all resize-none"
              value={formData.roughIdea}
              onChange={e => setFormData({ ...formData, roughIdea: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Target Audience</label>
              <input
                type="text"
                placeholder="e.g. College students"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-all"
                value={formData.targetAudience}
                onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Industry</label>
              <input
                type="text"
                placeholder="e.g. Education / Tech"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-all"
                value={formData.industry}
                onChange={e => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Main Goal</label>
            <input
              type="text"
              placeholder="e.g. Launch a MVP by next month"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-all"
              value={formData.goal}
              onChange={e => setFormData({ ...formData, goal: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-all group shadow-lg shadow-indigo-500/20"
          >
            Analyze My Idea
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
