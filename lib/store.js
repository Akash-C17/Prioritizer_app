import { create } from 'zustand';

export const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  decisions: [],
  
  // Project management
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({
    projects: [...state.projects, { ...project, id: Date.now(), createdAt: new Date() }]
  })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  })),
  setCurrentProject: (id) => set({ currentProject: id }),
  
  // Decision management
  addDecision: (decision) => set((state) => ({
    decisions: [...state.decisions, { ...decision, id: Date.now(), createdAt: new Date() }]
  })),
  updateDecision: (id, updates) => set((state) => ({
    decisions: state.decisions.map(d => d.id === id ? { ...d, ...updates } : d)
  })),
  deleteDecision: (id) => set((state) => ({
    decisions: state.decisions.filter(d => d.id !== id)
  })),
  setDecisions: (decisions) => set({ decisions }),
}));
