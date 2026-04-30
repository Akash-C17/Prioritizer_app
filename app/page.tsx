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
  const [newConstraint, setNewConstraint] = useState("");

  // Common constraint templates
  const constraintTemplates = [
    "Budget limitations",
    "Timeline constraints",
    "Team capacity",
    "Scalability requirements",
    "Security/Privacy",
    "Mobile compatibility",
    "Browser support",
    "Regulatory compliance",
  ];

  const handleAddConstraint = () => {
    if (!newConstraint.trim()) {
      toast.error("Constraint cannot be empty");
      return;
    }
    if (constraints.includes(newConstraint.trim())) {
      toast.error("Constraint already exists");
      return;
    }
    setConstraints([...constraints, newConstraint.trim()]);
    setNewConstraint("");
    toast.success("Constraint added!");
  };

  const handleAddConstraintFromTemplate = (template: string) => {
    if (constraints.includes(template)) {
      toast.error("Constraint already exists");
      return;
    }
    setConstraints([...constraints, template]);
    toast.success(`"${template}" added!`);
  };

  const handleClearAllConstraints = () => {
    if (constraints.length === 0) return;
    setConstraints([]);
    toast.success("All constraints cleared");
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
            className="flex flex-col gap-4 max-w-2xl mx-auto bg-gray-50 p-6 rounded-lg border border-purple-200 shadow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Project Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Mobile App Redesign, New Payment Flow..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all"
                suppressHydrationWarning
              />
            </div>

            {/* User Story */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                User Story <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Describe your user story, problem, or feature idea..."
                value={userStory}
                onChange={(e) => setUserStory(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all min-h-[100px]"
                suppressHydrationWarning
              />
              <p className="text-xs text-gray-500 mt-1">{userStory.length} characters</p>
            </div>

            {/* Quick Add Constraint */}
            <div className="bg-white border border-purple-100 rounded p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Add Constraints</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Type a constraint and press add..."
                  value={newConstraint}
                  onChange={(e) => setNewConstraint(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddConstraint()}
                  className="flex-1 px-3 py-2 border-2 border-purple-200 rounded focus:outline-none focus:border-purple-600 text-sm"
                />
                <motion.button
                  onClick={handleAddConstraint}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium text-sm transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add
                </motion.button>
              </div>

              {/* Constraint Templates */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {constraintTemplates.map((template, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleAddConstraintFromTemplate(template)}
                      disabled={constraints.includes(template)}
                      className="text-xs px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      + {template}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Constraints List with Badge */}
              {constraints.length > 0 && (
                <div className="border-t border-purple-100 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Constraints Added:</span>
                    <span className="inline-block bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {constraints.length}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {constraints.map((c, idx) => (
                      <motion.li 
                        key={idx} 
                        className="flex items-center gap-2 bg-purple-50 p-2 rounded"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        {editingConstraint === idx ? (
                          <>
                            <input
                              className="flex-1 px-2 py-1 border rounded text-sm"
                              value={constraintInput}
                              onChange={e => setConstraintInput(e.target.value)}
                              autoFocus
                            />
                            <button className="text-xs text-green-600 font-semibold" onClick={() => handleSaveConstraint(idx)}>Save</button>
                            <button className="text-xs text-gray-500" onClick={() => setEditingConstraint(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm">{c}</span>
                            <button className="text-xs text-blue-600 hover:text-blue-800" onClick={() => handleEditConstraint(idx)}>Edit</button>
                            <button className="text-xs text-red-500 hover:text-red-700" onClick={() => handleRemoveConstraint(idx)}>Remove</button>
                          </>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                  <motion.button
                    onClick={handleClearAllConstraints}
                    className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    Clear All Constraints
                  </motion.button>
                </div>
              )}
            </div>

            {/* Form Summary */}
            {(projectName || userStory || constraints.length > 0) && (
              <motion.div 
                className="bg-blue-50 border border-blue-200 rounded p-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs font-semibold text-blue-700 mb-2">📋 Project Summary:</p>
                <div className="space-y-1 text-xs text-blue-900">
                  {projectName && <p>• <strong>Project:</strong> {projectName}</p>}
                  {userStory && <p>• <strong>Story:</strong> {userStory.substring(0, 50)}...</p>}
                  {constraints.length > 0 && <p>• <strong>Constraints:</strong> {constraints.length} added</p>}
                </div>
              </motion.div>
            )}

            {/* Create Button */}
            <motion.button
              onClick={handleAddProject}
              disabled={!projectName.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 hover:shadow-lg rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              suppressHydrationWarning
            >
              <Plus className="w-5 h-5" />
              Create Project
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
