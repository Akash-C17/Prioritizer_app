"use client";

import { useState, useMemo } from "react";
import { useProjectStore } from "@/lib/store";
import { Plus, Trash2, TrendingUp, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";

interface Feature {
  id: string | number;
  name: string;
  description: string;
  impact: number;
  effort: number;
  cost: number;
}

export default function FeaturePrioritize() {
  const { projects, currentProject, addDecision } = useProjectStore();
  const [features, setFeatures] = useState<Feature[]>([
    { id: 1, name: "", description: "", impact: 5, effort: 5, cost: 5 },
  ]);

  const project = useMemo(
    () => projects.find((p: any) => p.id === currentProject),
    [projects, currentProject]
  );

  const calculateScore = (feature: Feature) => {
    const { impact, effort, cost } = feature;
    return (impact * 2) / (effort + cost + 0.001);
  };

  const sortedFeatures = useMemo(
    () => [...features].sort((a, b) => calculateScore(b) - calculateScore(a)),
    [features]
  );

  const handleAddFeature = () => {
    setFeatures([
      ...features,
      { id: Date.now(), name: "", description: "", impact: 5, effort: 5, cost: 5 },
    ]);
  };

  const handleUpdateFeature = (id: string | number, updates: Partial<Feature>) => {
    setFeatures(features.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleDeleteFeature = (id: string | number) => {
    setFeatures(features.filter((f) => f.id !== id));
    toast.success("Feature removed");
  };

  const handleSaveAnalysis = () => {
    const filledFeatures = features.filter((f) => f.name.trim());
    if (filledFeatures.length === 0) {
      toast.error("Add at least one feature");
      return;
    }

    addDecision({
      projectId: currentProject,
      type: "feature-prioritization",
      features: sortedFeatures,
      timestamp: new Date(),
    });

    toast.success("Analysis saved to history");
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Feature Prioritization</h1>
          {project && (
            <p className="text-gray-400">Project: <span className="text-blue-400">{project.name}</span></p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-8">
          <p className="text-blue-200">
            Rate each feature on impact (1-10), effort (1-10), and cost (1-10). Features are automatically ranked by ROI.
          </p>
        </div>

        {/* Features Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Feature Name</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Impact</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Effort</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Cost</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Score
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedFeatures.map((feature, index) => (
                  <tr
                    key={feature.id}
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm font-medium w-6">{index + 1}</span>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Feature name"
                            value={feature.name}
                            onChange={(e) => handleUpdateFeature(feature.id, { name: e.target.value })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                          />
                          <textarea
                            placeholder="Description (optional)"
                            value={feature.description}
                            onChange={(e) => handleUpdateFeature(feature.id, { description: e.target.value })}
                            className="w-full px-2 py-1 mt-1 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 resize-none h-10"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={feature.impact}
                        onChange={(e) => handleUpdateFeature(feature.id, { impact: Number(e.target.value) })}
                        className="w-16"
                      />
                      <div className="text-sm font-semibold mt-1">{feature.impact}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={feature.effort}
                        onChange={(e) => handleUpdateFeature(feature.id, { effort: Number(e.target.value) })}
                        className="w-16"
                      />
                      <div className="text-sm font-semibold mt-1">{feature.effort}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={feature.cost}
                        onChange={(e) => handleUpdateFeature(feature.id, { cost: Number(e.target.value) })}
                        className="w-16"
                      />
                      <div className="text-sm font-semibold mt-1">{feature.cost}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-blue-900/30 border border-blue-500/50 rounded text-sm font-semibold text-blue-300">
                        {calculateScore(feature).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleDeleteFeature(feature.id)}
                        className="p-2 hover:bg-red-900/30 rounded text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleAddFeature}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Feature
          </button>
          <button
            onClick={handleSaveAnalysis}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            Save to History
          </button>
        </div>
      </div>
    </div>
  );
}
