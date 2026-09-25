'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrandProject, WorkflowStage } from '@/lib/types';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';

interface ProjectContextType {
  projects: BrandProject[];
  activeProject: BrandProject | null;
  setActiveProjectId: (id: string | null) => void;
  createProject: (initialData: Partial<BrandProject>) => BrandProject;
  updateProject: (projectId: string, updates: Partial<BrandProject>) => void;
  deleteProject: (projectId: string) => void;
  isLoading: boolean;
  currentUser: User | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'brandforge_projects';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<BrandProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      if (event?.error?.name === 'ChunkLoadError' || (event?.message && event.message.includes('Loading chunk'))) {
        console.warn('ChunkLoadError caught, refreshing client bundle...');
        window.location.reload();
      }
    };
    window.addEventListener('error', handleChunkError);

    // Auth listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // Load local storage first as quick initial render state
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProjects(parsed);
      } catch (e) {
        console.error('Failed to parse projects', e);
      }
    }

    // Firestore real-time listener for projects
    const pathForSnapshot = 'projects';
    const unsubscribeSnapshot = onSnapshot(
      collection(db, pathForSnapshot),
      (snapshot) => {
        const docs = snapshot.docs.map(doc => doc.data() as BrandProject);
        if (docs.length > 0) {
          setProjects(docs);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
        }
        setIsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, pathForSnapshot);
        setIsLoading(false);
      }
    );

    return () => {
      window.removeEventListener('error', handleChunkError);
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, []);

  const saveProjects = (updatedProjects: BrandProject[]) => {
    setProjects(updatedProjects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign In Error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const createProject = (initialData: Partial<BrandProject>) => {
    const id = Math.random().toString(36).substring(7);
    const newProject: BrandProject = {
      id,
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

    // Persist to Firestore
    const path = `projects/${id}`;
    setDoc(doc(db, 'projects', id), newProject).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, path);
    });

    return newProject;
  };

  const updateProject = (projectId: string, updates: Partial<BrandProject>) => {
    const existing = projects.find(p => p.id === projectId);
    const updatedProject = {
      ...(existing || {}),
      ...updates,
      id: projectId,
      updatedAt: Date.now()
    } as BrandProject;

    const updated = projects.map(p => 
      p.id === projectId ? updatedProject : p
    );
    saveProjects(updated);

    // Persist to Firestore
    const path = `projects/${projectId}`;
    setDoc(doc(db, 'projects', projectId), updatedProject, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, path);
    });
  };

  const deleteProject = (projectId: string) => {
    const updated = projects.filter(p => p.id !== projectId);
    saveProjects(updated);
    if (activeProjectId === projectId) setActiveProjectId(null);

    // Persist to Firestore
    const path = `projects/${projectId}`;
    deleteDoc(doc(db, 'projects', projectId)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, path);
    });
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
      isLoading,
      currentUser,
      signInWithGoogle,
      logout
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
