"use client";

import { useState, useMemo } from "react";
import { useProjectStore } from "@/lib/store";
import { Plus, Trash2, TrendingUp, BarChart3, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface Feature {
  id: string | number;
  name: string;
  description: string;
  impact: number;
  business: number;
  alignment: number;
  effort: number;
  cost: number;
  risk: number;
}

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

/**
 * Advanced Decision Intelligence Scoring
 * Weighted formula combining opportunity and feasibility metrics
 */
const calculateScore = (feature: Feature): number => {
  const { impact, business, alignment, effort, cost, risk } = feature;
  
  // Numerator: Opportunity factors (weighted importance)
  const opportunity = 0.3 * impact + 0.25 * business + 0.2 * alignment;
  
  // Denominator: Effort/Risk factors (weighted constraints)
  const feasibility = 0.25 * effort + 0.15 * cost + 0.1 * risk + 0.001;
  
  // Raw score
  const rawScore = opportunity / feasibility;
  
  // Normalize to max 10 scale
  return Math.min(10, rawScore * 2);
};

/**
 * Classify features by priority based on score
 */
const getPriorityLabel = (score: number): string => {
  if (score > 7) return "High Priority";
  if (score > 4) return "Medium Priority";
  return "Low Priority";
};

/**
 * Get priority color for visual indication
 */
const getPriorityColor = (score: number): string => {
  if (score > 7) return "bg-green-100 text-green-700 border-green-300";
  if (score > 4) return "bg-yellow-100 text-yellow-700 border-yellow-300";
  return "bg-red-100 text-red-700 border-red-300";
};

export default function FeaturePrioritize() {
  const { projects, currentProject, addDecision } = useProjectStore();
  const [features, setFeatures] = useState<Feature[]>([
    { id: 1, name: "", description: "", impact: 5, business: 5, alignment: 5, effort: 5, cost: 5, risk: 5 },
  ]);

  const project = useMemo(
    () => projects.find((p: any) => p.id === currentProject),
    [projects, currentProject]
  );

  const sortedFeatures = useMemo(
    () => [...features].sort((a, b) => calculateScore(b) - calculateScore(a)),
    [features]
  );

  const handleAddFeature = () => {
    setFeatures([
      ...features,
      { id: Date.now(), name: "", description: "", impact: 5, business: 5, alignment: 5, effort: 5, cost: 5, risk: 5 },
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
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            Feature Prioritization
          </h1>
          {project && (
            <p className="text-gray-700">Project: <span className="text-purple-600 font-semibold">{project.name}</span></p>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div 
          className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-2 items-start">
            <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-purple-900 font-medium mb-1">Advanced Decision Intelligence</p>
              <p className="text-purple-800 text-sm">
                Rate features across 7 dimensions: Impact, Business Value, Strategic Alignment, Effort, Cost, and Risk. 
                Our weighted algorithm calculates strategic priority combining opportunity with feasibility.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features Table */}
        <motion.div 
          className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden mb-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-orange-500 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Feature</th>
                  {/* Opportunity Factors */}
                  <th className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">
                    <div className="text-yellow-200 text-xs">Impact</div>
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">
                    <div className="text-yellow-200 text-xs">Business</div>
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">
                    <div className="text-yellow-200 text-xs">Alignment</div>
                  </th>
                  {/* Effort Factors */}
                  <th className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">
                    <div className="text-blue-200 text-xs">Effort</div>
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">
                    <div className="text-blue-200 text-xs">Cost</div>
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">
                    <div className="text-blue-200 text-xs">Risk</div>
                  </th>
                  {/* Score & Priority */}
                  <th className="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Score
                    </div>
                  </th>
                  <th className="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">Priority</th>
                  <th className="px-3 py-3 text-center text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedFeatures.map((feature, index) => {
                  const score = calculateScore(feature);
                  const priorityLabel = getPriorityLabel(score);
                  const priorityClass = getPriorityColor(score);
                  
                  return (
                    <motion.tr
                      key={feature.id}
                      className="border-b border-gray-200 hover:bg-purple-50 transition-colors"
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="show"
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      {/* Feature Name & Description */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500 text-sm font-bold w-6">{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              placeholder="Feature name"
                              value={feature.name}
                              onChange={(e) => handleUpdateFeature(feature.id, { name: e.target.value })}
                              className="w-full px-2 py-1 bg-white border-2 border-gray-300 rounded text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                            />
                            <textarea
                              placeholder="Description"
                              value={feature.description}
                              onChange={(e) => handleUpdateFeature(feature.id, { description: e.target.value })}
                              className="w-full px-2 py-1 mt-1 bg-white border-2 border-gray-300 rounded text-gray-900 placeholder-gray-500 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 resize-none h-8"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Impact (Opportunity) */}
                      <td className="px-3 py-4 text-center">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={feature.impact}
                          onChange={(e) => handleUpdateFeature(feature.id, { impact: Number(e.target.value) })}
                          className="w-14 accent-yellow-500"
                        />
                        <div className="text-xs font-bold mt-1 text-gray-900">{feature.impact}</div>
                      </td>

                      {/* Business Value (Opportunity) */}
                      <td className="px-3 py-4 text-center">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={feature.business}
                          onChange={(e) => handleUpdateFeature(feature.id, { business: Number(e.target.value) })}
                          className="w-14 accent-yellow-500"
                        />
                        <div className="text-xs font-bold mt-1 text-gray-900">{feature.business}</div>
                      </td>

                      {/* Strategic Alignment (Opportunity) */}
                      <td className="px-3 py-4 text-center">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={feature.alignment}
                          onChange={(e) => handleUpdateFeature(feature.id, { alignment: Number(e.target.value) })}
                          className="w-14 accent-yellow-500"
                        />
                        <div className="text-xs font-bold mt-1 text-gray-900">{feature.alignment}</div>
                      </td>

                      {/* Effort */}
                      <td className="px-3 py-4 text-center">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={feature.effort}
                          onChange={(e) => handleUpdateFeature(feature.id, { effort: Number(e.target.value) })}
                          className="w-14 accent-blue-500"
                        />
                        <div className="text-xs font-bold mt-1 text-gray-900">{feature.effort}</div>
                      </td>

                      {/* Cost */}
                      <td className="px-3 py-4 text-center">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={feature.cost}
                          onChange={(e) => handleUpdateFeature(feature.id, { cost: Number(e.target.value) })}
                          className="w-14 accent-blue-500"
                        />
                        <div className="text-xs font-bold mt-1 text-gray-900">{feature.cost}</div>
                      </td>

                      {/* Risk */}
                      <td className="px-3 py-4 text-center">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={feature.risk}
                          onChange={(e) => handleUpdateFeature(feature.id, { risk: Number(e.target.value) })}
                          className="w-14 accent-red-500"
                        />
                        <div className="text-xs font-bold mt-1 text-gray-900">{feature.risk}</div>
                      </td>

                      {/* Intelligent Score */}
                      <td className="px-3 py-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-orange-100 border-2 border-purple-300 rounded text-sm font-bold text-purple-700">
                          {score.toFixed(2)}
                        </div>
                      </td>

                      {/* Priority Label */}
                      <td className="px-3 py-4 text-center">
                        <motion.span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold border-2 ${priorityClass}`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                        >
                          {priorityLabel}
                        </motion.span>
                      </td>

                      {/* Delete Button */}
                      <td className="px-3 py-4 text-center">
                        <motion.button
                          onClick={() => handleDeleteFeature(feature.id)}
                          className="p-2 hover:bg-red-100 rounded text-red-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Scoring Legend */}
        <motion.div 
          className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Intelligent Scoring Formula</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opportunity Factors */}
            <div>
              <h4 className="font-semibold text-yellow-700 mb-3">📈 Opportunity Factors (Weighted)</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <span className="font-medium">Impact</span> (30%) - Business value</li>
                <li>• <span className="font-medium">Business</span> (25%) - Revenue/growth potential</li>
                <li>• <span className="font-medium">Alignment</span> (20%) - Strategic fit</li>
              </ul>
            </div>

            {/* Effort Factors */}
            <div>
              <h4 className="font-semibold text-blue-700 mb-3">⚙️ Effort Factors (Weighted)</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <span className="font-medium">Effort</span> (25%) - Implementation work</li>
                <li>• <span className="font-medium">Cost</span> (15%) - Budget required</li>
                <li>• <span className="font-medium">Risk</span> (10%) - Technical/business risk</li>
              </ul>
            </div>

            {/* Priority Legend */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-gray-800 mb-3">🎯 Priority Classification</h4>
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border-2 border-green-300">High Priority</span>
                  <span className="text-sm text-gray-600">(Score &gt; 7)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border-2 border-yellow-300">Medium Priority</span>
                  <span className="text-sm text-gray-600">(Score 4-7)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border-2 border-red-300">Low Priority</span>
                  <span className="text-sm text-gray-600">(Score &lt; 4)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div 
          className="flex gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={handleAddFeature}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium flex items-center gap-2 transition-all text-gray-900"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Add Feature
          </motion.button>
          <motion.button
            onClick={handleSaveAnalysis}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:shadow-lg rounded-lg font-medium flex items-center gap-2 transition-all text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BarChart3 className="w-5 h-5" />
            Save to History
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
