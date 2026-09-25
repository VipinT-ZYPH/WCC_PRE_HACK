'use client';

import { useProjectStore } from '@/components/ProjectProvider';
import { WorkflowStage } from '@/lib/types';
import { motion } from 'motion/react';
import { 
  Target, Activity, Shield, Zap, Sparkles, Rocket, 
  ChevronRight, CheckCircle2, Circle, LayoutDashboard,
  Menu, X
} from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const stages: { id: WorkflowStage; label: string; icon: any }[] = [
  { id: 'discover', label: 'Discover', icon: Target },
  { id: 'position', label: 'Position', icon: Activity },
  { id: 'shape', label: 'Shape', icon: Shield },
  { id: 'visualize', label: 'Visualize', icon: Zap },
  { id: 'challenge', label: 'Challenge', icon: Sparkles },
  { id: 'deliver', label: 'Deliver', icon: Rocket },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { projects, setActiveProjectId, activeProject, isLoading, currentUser, signInWithGoogle, logout } = useProjectStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      setActiveProjectId(params.id as string);
    }
  }, [params.id, setActiveProjectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-indigo-500/40" />
          </div>
          <div className="h-2 w-24 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
          <Target className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
        <p className="text-slate-400 mb-8 max-w-sm">We couldn&apos;t find the brand project you&apos;re looking for. It might have been deleted or the link is incorrect.</p>
        <Link href="/" className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all">
          Back to Safety
        </Link>
      </div>
    );
  }

  const currentStageIndex = stages.findIndex(s => s.id === activeProject.currentStage);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 border-r border-white/5 flex-col shrink-0">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">BrandForge AI</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          <div>
            <div className="px-4 mb-4 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Workspace</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold">Project Beta</span>
            </div>
            <div className="space-y-1">
              <Link 
                href={`/dashboard/${activeProject.id}`}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${pathname === `/dashboard/${activeProject.id}` ? 'bg-white/5 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm font-medium">Overview</span>
              </Link>
            </div>
          </div>

          <div>
            <span className="px-4 mb-4 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Workflow</span>
            <div className="space-y-1">
              {stages.map((stage, i) => {
                const isCompleted = activeProject.completedStages.includes(stage.id);
                const isActive = activeProject.currentStage === stage.id;
                const isLocked = i > activeProject.completedStages.length && !isActive;

                return (
                  <button
                    key={stage.id}
                    disabled={isLocked}
                    onClick={() => router.push(`/dashboard/${activeProject.id}/${stage.id}`)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left relative group ${
                      isActive 
                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                        : isLocked 
                          ? 'opacity-40 cursor-not-allowed' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="relative">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                      ) : isActive ? (
                        <div className="w-5 h-5 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold block">{stage.label}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Stage 0{i + 1}</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
            <h4 className="text-xs font-bold text-indigo-400 mb-1">AI Agent Status</h4>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-slate-300 font-medium">Ready for input</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden p-4 border-b border-white/5 flex items-center justify-between bg-[#020617]">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-500" />
          <span className="font-bold">BrandForge AI</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-slate-200">{activeProject.name}</h2>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>{activeProject.industry || 'General'}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-indigo-400 capitalize">{activeProject.currentStage}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-white leading-none">{currentUser.displayName || 'User'}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{currentUser.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 border border-white/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20"
              >
                <span>Sign In with Google</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
