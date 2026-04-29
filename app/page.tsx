"use client";

import { useState } from "react";
import Link from "next/link";
import { useProjectStore } from "@/lib/store";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {

  const { projects, addProject, deleteProject, setCurrentProject } = useProjectStore();
  const [projectName, setProjectName] = useState("");
  const [userStory, setUserStory] = useState("");
  const [constraints, setConstraints] = useState<string[]>([]);
  const [editingConstraint, setEditingConstraint] = useState<number | null>(null);
  const [constraintInput, setConstraintInput] = useState("");

  // Simple constraint generation from user story (stub, can be replaced with AI)
  const generateConstraints = (story: string) => {
    if (!story.trim()) return [];
    // Example: split by sentences, or use keywords
    return story
      .split(/\.|\n/)
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => `Constraint: ${s}`);
  };

  const handleAddProject = () => {
    if (!projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    addProject({
      name: projectName,
      description: userStory,
      constraints,
      status: "ideation",
    });
    toast.success("Project created!");
    setProjectName("");
    setUserStory("");
    setConstraints([]);
  };

  const handleGenerateConstraints = () => {
    setConstraints(generateConstraints(userStory));
  };

  const handleEditConstraint = (idx: number) => {
    setEditingConstraint(idx);
    setConstraintInput(constraints[idx]);
  };

  const handleSaveConstraint = (idx: number) => {
    const updated = [...constraints];
    updated[idx] = constraintInput;
    setConstraints(updated);
    setEditingConstraint(null);
    setConstraintInput("");
  };

  const handleRemoveConstraint = (idx: number) => {
    setConstraints(constraints.filter((_, i) => i !== idx));
  };

  const handleStartProject = (projectId: string) => {
    setCurrentProject(projectId);
    toast.success("Project loaded");
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-purple-600 to-orange-500 bg-clip-text text-transparent"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            PRIORA AI
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-700 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Reason through competing product decisions, constraints, and trade-offs during ideation and design
          </motion.p>

          {/* New Project Form */}
          <motion.div 
            className="flex flex-col gap-4 max-w-md mx-auto bg-gray-50 p-6 rounded-lg border border-purple-200 shadow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <input
              type="text"
              placeholder="Enter new project name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="px-4 py-3 bg-white border-2 border-purple-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all"
            />
            <textarea
              placeholder="Describe your user story..."
              value={userStory}
              onChange={(e) => setUserStory(e.target.value)}
              className="px-4 py-3 bg-white border-2 border-purple-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all min-h-[80px]"
            />
            <motion.button
              onClick={handleGenerateConstraints}
              className="px-4 py-2 bg-gradient-to-r from-purple-400 to-orange-400 rounded-lg text-white font-medium mb-2"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Generate Constraints
            </motion.button>
            {constraints.length > 0 && (
              <div className="bg-white border border-purple-100 rounded p-3 mb-2">
                <div className="font-semibold mb-2 text-purple-700">Constraints (editable):</div>
                <ul className="space-y-2">
                  {constraints.map((c, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      {editingConstraint === idx ? (
                        <>
                          <input
                            className="flex-1 px-2 py-1 border rounded"
                            value={constraintInput}
                            onChange={e => setConstraintInput(e.target.value)}
                          />
                          <button className="text-green-600" onClick={() => handleSaveConstraint(idx)}>Save</button>
                          <button className="text-gray-500" onClick={() => setEditingConstraint(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1">{c}</span>
                          <button className="text-blue-600" onClick={() => handleEditConstraint(idx)}>Edit</button>
                          <button className="text-red-500" onClick={() => handleRemoveConstraint(idx)}>Remove</button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <motion.button
              onClick={handleAddProject}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 hover:shadow-lg rounded-lg font-medium flex items-center gap-2 transition-all text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Create
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Projects List */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {projects.length === 0 ? (
            <motion.div 
              className="col-span-full text-center py-16"
              variants={item}
            >
              <p className="text-gray-600 text-lg mb-4">No projects yet. Create one to get started!</p>
              <div className="space-y-4 text-left max-w-2xl mx-auto">
                <h3 className="font-semibold tenxt-purple-600">What you can do:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✨ Create feature scenarios and prioritize them</li>
                  <li>🤖 Get AI-powered analysis of your decisions</li>
                  <li>💬 Collaborate with discussion panels</li>
                  <li>📊 Track decision history and project evolution</li>
                </ul>
              </div>
            </motion.div>
          ) : (
            projects.map((project: any) => (
              <motion.div
                key={project.id}
                className="bg-white border-2 border-purple-200 hover:border-orange-400 rounded-lg p-6 shadow-md hover:shadow-xl transition-all"
                variants={item}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <motion.button
                    onClick={() => {
                      deleteProject(project.id);
                      toast.success("Project deleted");
                    }}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/feature-prioritize"
                    onClick={() => handleStartProject(project.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:shadow-lg rounded-lg text-sm font-medium transition-all text-white"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
