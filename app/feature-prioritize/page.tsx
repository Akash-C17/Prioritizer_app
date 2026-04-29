"use client";

import React, { useState, useMemo } from "react";
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

/**
 * Generate Trade-off Insights based on metric thresholds
 */
interface TradeoffInsight {
  label: string;
  type: "high" | "low";
  category: string;
}

const generateTradeoffInsights = (feature: Feature): TradeoffInsight[] => {
  const insights: TradeoffInsight[] = [];
  
  const metrics = [
    { value: feature.impact, label: "Impact", category: "impact" },
    { value: feature.business, label: "Business Value", category: "business" },
    { value: feature.alignment, label: "Strategic Alignment", category: "alignment" },
    { value: feature.effort, label: "Effort", category: "effort" },
    { value: feature.cost, label: "Cost", category: "cost" },
    { value: feature.risk, label: "Risk", category: "risk" },
  ];
  
  for (const metric of metrics) {
    if (metric.value > 7) {
      insights.push({
        label: `High ${metric.label}`,
        type: "high",
        category: metric.category,
      });
    } else if (metric.value < 4) {
      insights.push({
        label: `Low ${metric.label}`,
        type: "low",
        category: metric.category,
      });
    }
  }
  
  return insights;
};

/**
 * Get badge styling based on insight type
 */
const getInsightBadgeStyle = (type: "high" | "low", category: string): string => {
  if (type === "high") {
    if (category === "impact" || category === "business" || category === "alignment") {
      return "bg-green-100 text-green-700 border-green-300";
    }
    return "bg-red-100 text-red-700 border-red-300";
  } else {
    if (category === "effort" || category === "cost" || category === "risk") {
      return "bg-green-100 text-green-700 border-green-300";
    }
    return "bg-orange-100 text-orange-700 border-orange-300";
  }
};

/**
 * Generate recommendation reasoning for top feature
 */
const generateRecommendationReasoning = (feature: Feature): string[] => {
  const reasons: string[] = [];
  
  if (feature.impact > 7) reasons.push("High impact");
  if (feature.business > 7) reasons.push("Strong business value");
  if (feature.alignment > 7) reasons.push("Strong strategic alignment");
  if (feature.risk < 4) reasons.push("Low risk");
  if (feature.effort < 4) reasons.push("Low effort");
  if (feature.cost < 4) reasons.push("Low cost");
  
  return reasons;
};

/**
 * Generate AI-powered decision explanation based on features
 */
const generateAIExplanation = (sortedFeatures: Feature[]): string => {
  const filledFeatures = sortedFeatures.filter(f => f.name.trim());
  
  if (filledFeatures.length === 0) {
    return "No features to analyze. Add features to receive AI insights.";
  }

  const top = filledFeatures[0];
  const topScore = calculateScore(top);
  
  let explanation = `📊 Analysis of ${filledFeatures.length} feature(s):\n\n`;
  
  explanation += `🥇 Top Recommendation: "${top.name}"\n`;
  explanation += `Score: ${topScore.toFixed(2)}/10\n\n`;
  
  // Explain the top feature
  explanation += `Why "${top.name}" stands out:\n`;
  const topReasons = generateRecommendationReasoning(top);
  if (topReasons.length > 0) {
    topReasons.forEach(reason => {
      explanation += `• ${reason}\n`;
    });
  } else {
    explanation += `• Balanced across all dimensions\n`;
  }
  
  // Compare with alternatives if available
  if (filledFeatures.length > 1) {
    explanation += `\nComparison with alternatives:\n`;
    for (let i = 1; i < Math.min(3, filledFeatures.length); i++) {
      const alt = filledFeatures[i];
      const altScore = calculateScore(alt);
      const scoreDiff = topScore - altScore;
      explanation += `• "${alt.name}" (Score: ${altScore.toFixed(2)}) - ${scoreDiff.toFixed(2)} points lower\n`;
    }
  }
  
  explanation += `\n💡 Key Insight: The recommended feature balances high opportunity (impact, business value, alignment) with manageable constraints (effort, cost, risk).`;
  
  return explanation;
};

export default function FeaturePrioritize() {
  const { projects, currentProject, addDecision } = useProjectStore();
  const [features, setFeatures] = useState<Feature[]>([
    { id: 1, name: "", description: "", impact: 5, business: 5, alignment: 5, effort: 5, cost: 5, risk: 5 },
  ]);
  const [explanation, setExplanation] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerateExplanation = async () => {
    setIsGenerating(true);
    // Simulate API delay
    setTimeout(() => {
      const result = generateAIExplanation(sortedFeatures);
      setExplanation(result);
      setIsGenerating(false);
      toast.success("Explanation generated");
    }, 800);
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

        {/* Top Recommendation */}
        {sortedFeatures.length > 0 && sortedFeatures[0].name.trim() && (
          <motion.div 
            className="bg-green-50 border-2 border-green-400 rounded-lg p-6 mb-8 shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">🏆</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-green-800 mb-2">Recommended Feature</h2>
                <p className="text-lg font-semibold text-green-700 mb-3">{sortedFeatures[0].name}</p>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-green-100 border-2 border-green-400 rounded text-sm font-bold text-green-700">
                    <TrendingUp className="w-4 h-4" />
                    Score: {calculateScore(sortedFeatures[0]).toFixed(2)}/10
                  </div>
                </div>

                {generateRecommendationReasoning(sortedFeatures[0]).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {generateRecommendationReasoning(sortedFeatures[0]).map((reason, idx) => (
                      <motion.span
                        key={idx}
                        className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold border border-green-400"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 + (idx * 0.05) }}
                      >
                        ✓ {reason}
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Decision Insight */}
        <motion.div 
          className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-8 shadow-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="text-3xl">🤖</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-blue-800">AI Decision Insight</h2>
              <p className="text-sm text-blue-700 mt-1">Get an AI-powered analysis of your feature prioritization</p>
            </div>
          </div>

          <motion.button
            onClick={handleGenerateExplanation}
            disabled={isGenerating}
            className="mb-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium flex items-center gap-2 transition-all text-white"
            whileHover={{ scale: isGenerating ? 1 : 1.05 }}
            whileTap={{ scale: isGenerating ? 1 : 0.95 }}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                ✨ Generate Explanation
              </>
            )}
          </motion.button>

          {explanation && (
            <motion.textarea
              value={explanation}
              readOnly
              className="w-full h-40 px-4 py-3 bg-white border-2 border-blue-300 rounded-lg text-gray-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            />
          )}

          {!explanation && (
            <p className="text-sm text-blue-700 italic">Click "Generate Explanation" to analyze your features with AI insights</p>
          )}
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
                  const insights = generateTradeoffInsights(feature);
                  
                  return (
                    <React.Fragment key={feature.id}>
                      <motion.tr
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

                      {/* Trade-off Insights Row */}
                      {insights.length > 0 && (
                        <motion.tr
                          className="bg-gray-50 border-b border-gray-200"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ delay: index * 0.05 + 0.1 }}
                        >
                          <td colSpan={9} className="px-4 py-3">
                            <motion.div
                              className="flex flex-wrap gap-2"
                              initial="hidden"
                              animate="show"
                              variants={{
                                hidden: { opacity: 0 },
                                show: {
                                  opacity: 1,
                                  transition: {
                                    staggerChildren: 0.05,
                                  },
                                },
                              }}
                            >
                              <span className="text-xs font-semibold text-gray-600 self-center">📊 Insights:</span>
                              {insights.map((insight, insightIndex) => (
                                <motion.span
                                  key={`${feature.id}-insight-${insightIndex}`}
                                  className={`px-2 py-1 rounded text-xs font-semibold border ${getInsightBadgeStyle(insight.type, insight.category)}`}
                                  variants={{
                                    hidden: { opacity: 0, scale: 0.8 },
                                    show: { opacity: 1, scale: 1 },
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {insight.type === "high" ? "✔" : "⚠"} {insight.label}
                                </motion.span>
                              ))}
                            </motion.div>
                          </td>
                        </motion.tr>
                      )}
                    </React.Fragment>
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
