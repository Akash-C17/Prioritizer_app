"use client";

import { useState } from "react";
import Link from "next/link";
import { useProjectStore } from "@/lib/store";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function Home() {
  const { projects, addProject, deleteProject, setCurrentProject } = useProjectStore();
  const [projectName, setProjectName] = useState("");

  const handleAddProject = () => {
    if (!projectName.trim()) {
      toast.error("Project name is required");
      return;
    }

    addProject({
      name: projectName,
      description: "",
      status: "ideation",
    });

    toast.success("Project created!");
    setProjectName("");
  };

  const handleStartProject = (projectId: string) => {
    setCurrentProject(projectId);
    toast.success("Project loaded");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Decision AI
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Reason through competing product decisions, constraints, and trade-offs during ideation and design
          </p>

          {/* New Project Form */}
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Enter new project name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddProject()}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleAddProject}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create
            </button>
          </div>
        </div>

        {/* Projects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-500 text-lg mb-4">No projects yet. Create one to get started!</p>
              <div className="space-y-4 text-left max-w-2xl mx-auto">
                <h3 className="font-semibold text-blue-400">What you can do:</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>✨ Create feature scenarios and prioritize them</li>
                  <li>🤖 Get AI-powered analysis of your decisions</li>
                  <li>💬 Collaborate with discussion panels</li>
                  <li>📊 Track decision history and project evolution</li>
                </ul>
              </div>
            </div>
          ) : (
            projects.map((project: any) => (
              <div
                key={project.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <button
                    onClick={() => {
                      deleteProject(project.id);
                      toast.success("Project deleted");
                    }}
                    className="p-2 hover:bg-red-900/30 rounded-lg text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
                <Link
                  href="/feature-prioritize"
                  onClick={() => handleStartProject(project.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
