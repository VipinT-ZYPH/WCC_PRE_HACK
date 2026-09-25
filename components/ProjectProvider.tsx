'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrandProject, WorkflowStage } from '@/lib/types';

interface ProjectContextType {
  projects: BrandProject[];
  activeProject: BrandProject | null;
  setActiveProjectId: (id: string | null) => void;
  createProject: (initialData: Partial<BrandProject>) => BrandProject;
  updateProject: (projectId: string, updates: Partial<BrandProject>) => void;
  deleteProject: (projectId: string) => void;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'brandforge_projects';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<BrandProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      if (event?.error?.name === 'ChunkLoadError' || (event?.message && event.message.includes('Loading chunk'))) {
        console.warn('ChunkLoadError caught, refreshing client bundle...');
        window.location.reload();
      }
    };
    window.addEventListener('error', handleChunkError);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProjects(parsed);
      } catch (e) {
        console.error('Failed to parse projects', e);
      }
    }
    setIsLoading(false);

    return () => window.removeEventListener('error', handleChunkError);
  }, []);

  const saveProjects = (updatedProjects: BrandProject[]) => {
    setProjects(updatedProjects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
  };

  const createProject = (initialData: Partial<BrandProject>) => {
    const newProject: BrandProject = {
      id: Math.random().toString(36).substring(7),
      name: initialData.name || 'Untitled Project',
      roughIdea: initialData.roughIdea || '',
      targetAudience: initialData.targetAudience,
      industry: initialData.industry,
      market: initialData.market,
      goal: initialData.goal,
      constraints: initialData.constraints,
      currentStage: 'discover',
      completedStages: [],
      updatedAt: Date.now(),
    };
    const updated = [...projects, newProject];
    saveProjects(updated);
    setActiveProjectId(newProject.id);
    return newProject;
  };

  const updateProject = (projectId: string, updates: Partial<BrandProject>) => {
    const updated = projects.map(p => 
      p.id === projectId ? { ...p, ...updates, updatedAt: Date.now() } : p
    );
    saveProjects(updated);
  };

  const deleteProject = (projectId: string) => {
    const updated = projects.filter(p => p.id !== projectId);
    saveProjects(updated);
    if (activeProjectId === projectId) setActiveProjectId(null);
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  return (
    <ProjectContext.Provider value={{
      projects,
      activeProject,
      setActiveProjectId,
      createProject,
      updateProject,
      deleteProject,
      isLoading
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectStore() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectStore must be used within a ProjectProvider');
  }
  return context;
}
