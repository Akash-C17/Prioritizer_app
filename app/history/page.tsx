"use client";

import { useState, useMemo } from "react";
import { useProjectStore } from "@/lib/store";
import { History, Filter, Trash2, Clock, BarChart3, Brain, Zap } from "lucide-react";
import toast from "react-hot-toast";

type DecisionType = "feature-prioritization" | "ai-analysis" | "discussion" | "all";

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
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case "ai-analysis":
        return <Brain className="w-5 h-5 text-purple-400" />;
      default:
        return <Clock className="w-5 h-5 text-blue-400" />;
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
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <History className="w-8 h-8" />
            Decision History
          </h1>
          <p className="text-gray-400">Track all your product decisions and project evolution</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            All Decisions
          </button>
          <button
            onClick={() => setFilter("feature-prioritization")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === "feature-prioritization"
                ? "bg-yellow-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Zap className="w-4 h-4" />
            Features
          </button>
          <button
            onClick={() => setFilter("ai-analysis")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === "ai-analysis"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Brain className="w-4 h-4" />
            AI Analysis
          </button>
        </div>

        {/* Decisions Timeline */}
        <div className="space-y-4">
          {filteredDecisions.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
              <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No decisions in this category yet.</p>
              <p className="text-gray-500 text-sm mt-2">
                Start making decisions from the Feature Prioritize or AI Analyze pages.
              </p>
            </div>
          ) : (
            filteredDecisions.map((decision: any) => {
              const project = getReleVantProject(decision.projectId);
              const isExpanded = expandedId === decision.id;

              return (
                <div
                  key={decision.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors"
                >
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : decision.id)
                    }
                    className="w-full px-6 py-4 text-left hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          {getDecisionIcon(decision.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">
                            {getDecisionTitle(decision)}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            {project && (
                              <span className="flex items-center gap-1">
                                📁 {project.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(decision.timestamp).toLocaleString()}
                            </span>
                            <span className="px-2 py-1 bg-gray-900 rounded text-xs capitalize">
                              {decision.type.replace("-", " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(decision.id);
                        }}
                        className="p-2 hover:bg-red-900/30 rounded text-red-400 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-700 px-6 py-4 bg-gray-900/50">
                      {decision.type === "feature-prioritization" && decision.features && (
                        <div>
                          <h4 className="font-semibold mb-3 text-blue-400">
                            ✓ Prioritized Features
                          </h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {decision.features.map((f: any, i: number) => (
                              <div
                                key={i}
                                className="bg-gray-800 p-3 rounded text-sm"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{i + 1}. {f.name}</span>
                                  <span className="text-blue-400 text-xs font-semibold">
                                    Score: {(f.impact * 2 / (f.effort + f.cost + 0.001)).toFixed(2)}
                                  </span>
                                </div>
                                {f.description && (
                                  <p className="text-gray-400 text-xs mt-1">
                                    {f.description}
                                  </p>
                                )}
                                <div className="text-xs text-gray-500 mt-2">
                                  Impact: {f.impact}/10 | Effort: {f.effort}/10 | Cost: {f.cost}/10
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {decision.type === "ai-analysis" && decision.analysis && (
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                          <div>
                            <h4 className="font-semibold text-amber-400 mb-2">
                              ⚖ Key Trade-offs
                            </h4>
                            <ul className="text-sm space-y-1 text-gray-300">
                              {decision.analysis.tradeoffs?.slice(0, 2).map((t: string, i: number) => (
                                <li key={i}>• {t}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-green-400 mb-2">
                              ✓ Recommendations
                            </h4>
                            <ul className="text-sm space-y-1 text-gray-300">
                              {decision.analysis.recommendations?.slice(0, 2).map((r: string, i: number) => (
                                <li key={i}>• {r}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
