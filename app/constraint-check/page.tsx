// filepath: app/constraint-check/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useProjectStore } from "@/lib/store";
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, DollarSign, Clock, Package } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface ProductOption {
  id: string;
  name: string;
  cost: number;
  timeline: number; // in weeks
  risk: "low" | "medium" | "high";
  description: string;
}

interface ConstraintCheckerResult {
  safest: ProductOption;
  riskiest: ProductOption;
  options: {
    option: ProductOption;
    budgetStatus: "within" | "over" | "critical";
    timelineStatus: "within" | "over" | "critical";
    overallRisk: "low" | "medium" | "high";
    tradeoffs: string[];
  }[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ConstraintCheck() {
  const { projects, currentProject } = useProjectStore();
  
  // User-defined constraints
  const [budget, setBudget] = useState<number>(50000);
  const [timeline, setTimeline] = useState<number>(12); // weeks
  
  // Product options (3 default options)
  const [options, setOptions] = useState<ProductOption[]>([
    { id: "1", name: "Option A", cost: 45000, timeline: 10, risk: "low", description: "Basic MVP with core features" },
    { id: "2", name: "Option B", cost: 55000, timeline: 14, risk: "medium", description: "Enhanced version with additional integrations" },
    { id: "3", name: "Option C", cost: 35000, timeline: 8, risk: "high", description: "Minimal viable product with essential features only" },
  ]);
  
  const [result, setResult] = useState<ConstraintCheckerResult | null>(null);

  const project = useMemo(
    () => projects.find((p: any) => p.id === currentProject),
    [projects, currentProject]
  );

  const handleOptionChange = (id: string, field: keyof ProductOption, value: any) => {
    setOptions(prev => prev.map(opt => 
      opt.id === id ? { ...opt, [field]: value } : opt
    ));
  };

  const analyzeConstraints = () => {
    const analyzed = options.map(option => {
      // Budget analysis
      let budgetStatus: "within" | "over" | "critical";
      const budgetRatio = option.cost / budget;
      if (budgetRatio <= 0.8) budgetStatus = "within";
      else if (budgetRatio <= 1) budgetStatus = "over";
      else budgetStatus = "critical";

      // Timeline analysis
      let timelineStatus: "within" | "over" | "critical";
      const timelineRatio = option.timeline / timeline;
      if (timelineRatio <= 0.8) timelineStatus = "within";
      else if (timelineRatio <= 1) timelineStatus = "over";
      else timelineStatus = "critical";

      // Overall risk calculation
      let overallRisk: "low" | "medium" | "high" = "low";
      const riskScore = (budgetStatus === "critical" ? 3 : budgetStatus === "over" ? 2 : 0) +
                        (timelineStatus === "critical" ? 3 : timelineStatus === "over" ? 2 : 0) +
                        (option.risk === "high" ? 3 : option.risk === "medium" ? 2 : 0);
      
      if (riskScore >= 6) overallRisk = "high";
      else if (riskScore >= 3) overallRisk = "medium";

      // Generate trade-offs
      const tradeoffs: string[] = [];
      if (budgetStatus !== "within") {
        tradeoffs.push(`Budget exceeds by $${option.cost - budget}`);
      }
      if (timelineStatus !== "within") {
        tradeoffs.push(`Timeline exceeds by ${option.timeline - timeline} weeks`);
      }
      if (option.risk === "high") {
        tradeoffs.push("High implementation risk");
      }
      if (option.cost < budget * 0.6) {
        tradeoffs.push("Under-budget - may lack key features");
      }
      if (option.timeline < timeline * 0.6) {
        tradeoffs.push("Accelerated timeline - quality concerns");
      }
      if (tradeoffs.length === 0) {
        tradeoffs.push("Meets all constraints within acceptable limits");
      }

      return { option, budgetStatus, timelineStatus, overallRisk, tradeoffs };
    });

    // Find safest and riskiest
    const sortedByRisk = [...analyzed].sort((a, b) => {
      const riskOrder = { low: 0, medium: 1, high: 2 };
      return riskOrder[a.overallRisk] - riskOrder[b.overallRisk];
    });

    const safest = sortedByRisk[0];
    const riskiest = sortedByRisk[sortedByRisk.length - 1];

    setResult({
      safest: safest.option,
      riskiest: riskiest.option,
      options: analyzed,
    });

    toast.success("Constraint analysis complete!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "within": return "text-green-600 bg-green-50";
      case "over": return "text-yellow-600 bg-yellow-50";
      case "critical": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "within": return <CheckCircle className="w-4 h-4" />;
      case "over": return <AlertTriangle className="w-4 h-4" />;
      case "critical": return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
            Constraint Checker
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
            <AlertTriangle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-purple-900 font-medium mb-1">Product Option Constraint Analysis</p>
              <p className="text-purple-800 text-sm">
                Compare up to 3 product options against your budget and timeline constraints. 
                Identify the safest choice, the riskiest option, and get trade-off insights for each.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Constraints Input */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Your Constraints
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all"
                    placeholder="Enter budget"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timeline (weeks)
                  </label>
                  <input
                    type="number"
                    value={timeline}
                    onChange={(e) => setTimeline(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all"
                    placeholder="Enter timeline"
                  />
                </div>

                <motion.button
                  onClick={analyzeConstraints}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 hover:shadow-lg rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <TrendingUp className="w-5 h-5" />
                  Analyze Constraints
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Product Options */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Options
              </h2>
              
              <div className="space-y-4">
                {options.map((option, idx) => (
                  <div key={option.id} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        Option {String.fromCharCode(65 + idx)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-gray-600">Name</label>
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => handleOptionChange(option.id, "name", e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-gray-600">Cost ($)</label>
                        <input
                          type="number"
                          value={option.cost}
                          onChange={(e) => handleOptionChange(option.id, "cost", Number(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-gray-600">Timeline (weeks)</label>
                        <input
                          type="number"
                          value={option.timeline}
                          onChange={(e) => handleOptionChange(option.id, "timeline", Number(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-gray-600">Risk Level</label>
                        <select
                          value={option.risk}
                          onChange={(e) => handleOptionChange(option.id, "risk", e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold mb-1 text-gray-600">Description</label>
                        <input
                          type="text"
                          value={option.description}
                          onChange={(e) => handleOptionChange(option.id, "description", e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Results Table */}
        {result && (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-orange-500 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Constraint Analysis Results
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Option</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cost</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Timeline</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Budget Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Timeline Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Overall Risk</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trade-offs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {result.options.map((item, idx) => (
                      <tr key={item.option.id} className={item === result.options[0] ? "bg-green-50" : item === result.options[result.options.length - 1] ? "bg-red-50" : ""}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="font-medium text-gray-900">{item.option.name}</span>
                            {item.option.id === result.safest.id && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">✓ Safest</span>
                            )}
                            {item.option.id === result.riskiest.id && (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">⚠ Riskiest</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-700">${item.option.cost.toLocaleString()}</td>
                        <td className="px-4 py-4 text-gray-700">{item.option.timeline} weeks</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${getStatusColor(item.budgetStatus)}`}>
                            {getStatusIcon(item.budgetStatus)}
                            {item.budgetStatus === "within" ? "Within" : item.budgetStatus === "over" ? "Over" : "Critical"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${getStatusColor(item.timelineStatus)}`}>
                            {getStatusIcon(item.timelineStatus)}
                            {item.timelineStatus === "within" ? "Within" : item.timelineStatus === "over" ? "Over" : "Critical"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-sm ${getRiskBadge(item.overallRisk)}`}>
                            {item.overallRisk.charAt(0).toUpperCase() + item.overallRisk.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <ul className="text-sm text-gray-600 space-y-1">
                            {item.tradeoffs.map((tradeoff, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-purple-600">•</span>
                                {tradeoff}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <motion.div 
                className="bg-green-50 border-2 border-green-300 rounded-lg p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold mb-4 text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Safest Option
                </h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">{result.safest.name}</p>
                <p className="text-gray-700 mb-4">
                  Cost: ${result.safest.cost.toLocaleString()} | Timeline: {result.safest.timeline} weeks
                </p>
                <p className="text-sm text-gray-600">
                  This option stays within both budget and timeline constraints with the lowest overall risk profile.
                </p>
              </motion.div>

              <motion.div 
                className="bg-red-50 border-2 border-red-300 rounded-lg p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Riskiest Option
                </h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">{result.riskiest.name}</p>
                <p className="text-gray-700 mb-4">
                  Cost: ${result.riskiest.cost.toLocaleString()} | Timeline: {result.riskiest.timeline} weeks
                </p>
                <p className="text-sm text-gray-600">
                  This option exceeds one or more constraints and has the highest risk profile. Review trade-offs carefully.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}