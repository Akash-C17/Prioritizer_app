"use client";

import { useState, useMemo } from "react";
import { useProjectStore } from "@/lib/store";
import { History, Filter, Trash2, Clock, BarChart3, Brain, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

type DecisionType = "feature-prioritization" | "ai-analysis" | "discussion" | "all";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HistoryPage() {
  const { projects, decisions, deleteDecision } = useProjectStore();
  const [filter, setFilter] = useState<DecisionType>("all");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const filteredDecisions = useMemo(() => {
    if (filter === "all") return decisions;
    return decisions.filter((d: any) => d.type === filter);
  }, [decisions, filter]);

  const handleDelete = (id: string | number) => {
    deleteDecision(id);
    toast.success("Decision removed from history");
  };

  const getDecisionIcon = (type: string) => {
    switch (type) {
      case "feature-prioritization":
        return <Zap className="w-5 h-5 text-orange-500" />;
      case "ai-analysis":
        return <Brain className="w-5 h-5 text-purple-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDecisionTitle = (decision: any) => {
    switch (decision.type) {
      case "feature-prioritization":
        return `Prioritized ${decision.features?.length || 0} features`;
      case "ai-analysis":
        return decision.problem || "AI Analysis";
      default:
        return decision.type;
    }
  };

  const getReleVantProject = (projectId: string | number) => {
    return projects.find((p: any) => p.id === projectId);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            <History className="w-8 h-8 text-purple-600" />
            Decision History
          </h1>
          <p className="text-gray-700">Track all your product decisions and project evolution</p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="mb-6 flex gap-2 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "all"
                ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            All Decisions
          </motion.button>
          <motion.button
            onClick={() => setFilter("feature-prioritization")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filter === "feature-prioritization"
                ? "bg-orange-500 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-4 h-4" />
            Features
          </motion.button>
          <motion.button
            onClick={() => setFilter("ai-analysis")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filter === "ai-analysis"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Brain className="w-4 h-4" />
            AI Analysis
          </motion.button>
        </motion.div>

        {/* Decisions Timeline */}
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredDecisions.length === 0 ? (
            <motion.div 
              className="bg-white border-2 border-gray-300 rounded-lg p-12 text-center shadow-lg"
              variants={itemVariants}
            >
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700">No decisions in this category yet.</p>
              <p className="text-gray-600 text-sm mt-2">
                Start making decisions from the Feature Prioritize or AI Analyze pages.
              </p>
            </motion.div>
          ) : (
            filteredDecisions.map((decision: any, index: number) => {
              const project = getReleVantProject(decision.projectId);
              const isExpanded = expandedId === decision.id;

              return (
                <motion.div
                  key={decision.id}
                  className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden hover:border-purple-400 transition-colors shadow-lg"
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                >
                  <motion.button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : decision.id)
                    }
                    className="w-full px-6 py-4 text-left hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <motion.div 
                          className="mt-1"
                          whileHover={{ scale: 1.2 }}
                        >
                          {getDecisionIcon(decision.type)}
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getDecisionTitle(decision)}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            {project && (
                              <span className="flex items-center gap-1">
                                📁 {project.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(decision.timestamp).toLocaleString()}
                            </span>
                            <span className="px-2 py-1 bg-gray-200 rounded text-xs capitalize font-medium text-gray-700">
                              {decision.type.replace("-", " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(decision.id);
                        }}
                        className="p-2 hover:bg-red-100 rounded text-red-600 transition-colors flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.button>

                  {/* Expanded Content */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: isExpanded ? 1 : 0, height: isExpanded ? "auto" : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {isExpanded && (
                      <div className="border-t-2 border-gray-300 px-6 py-4 bg-gray-50">
                        {decision.type === "feature-prioritization" && decision.features && (
                          <div>
                            <h4 className="font-semibold mb-3 text-orange-600">
                              ✓ Prioritized Features
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {decision.features.map((f: any, i: number) => (
                                <motion.div
                                  key={i}
                                  className="bg-white p-3 rounded border-2 border-orange-200 text-sm"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900">{i + 1}. {f.name}</span>
                                    <span className="text-orange-600 text-xs font-semibold">
                                      Score: {(f.impact * 2 / (f.effort + f.cost + 0.001)).toFixed(2)}
                                    </span>
                                  </div>
                                  {f.description && (
                                    <p className="text-gray-600 text-xs mt-1">
                                      {f.description}
                                    </p>
                                  )}
                                  <div className="text-xs text-gray-500 mt-2">
                                    Impact: {f.impact}/10 | Effort: {f.effort}/10 | Cost: {f.cost}/10
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {decision.type === "ai-analysis" && decision.analysis && (
                          <div className="space-y-4 max-h-64 overflow-y-auto">
                            <div>
                              <h4 className="font-semibold text-orange-600 mb-2">
                                ⚖ Key Trade-offs
                              </h4>
                              <ul className="text-sm space-y-1 text-gray-700">
                                {decision.analysis.tradeoffs?.slice(0, 2).map((t: string, i: number) => (
                                  <li key={i}>• {t}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-green-600 mb-2">
                                ✓ Recommendations
                              </h4>
                              <ul className="text-sm space-y-1 text-gray-700">
                                {decision.analysis.recommendations?.slice(0, 2).map((r: string, i: number) => (
                                  <li key={i}>• {r}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
}
