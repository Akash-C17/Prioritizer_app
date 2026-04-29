// filepath: app/decision-audit/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useProjectStore } from "@/lib/store";
import { 
  Search, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Users,
  BarChart3,
  ArrowRight,
  GitBranch
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface Alternative {
  id: string;
  name: string;
  description: string;
  cost?: number;
  timeline?: number;
  risk?: "low" | "medium" | "high";
}

interface RejectionReason {
  category: "technical" | "business" | "resource" | "timeline" | "cost";
  constraint: string;
  reason: string;
  severity: "blocking" | "major" | "minor";
}

interface Recommendation {
  id: string;
  name: string;
  summary: string;
  alternatives: Alternative[];
  rejectionReasons: Record<string, RejectionReason[]>;
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

// Generate "Why We Said No" reasons based on constraints
const generateRejectionReasons = (
  recommendation: Recommendation,
  alternatives: Alternative[],
  constraints: { budget?: number; timeline?: number; teamSize?: number }
): Record<string, RejectionReason[]> => {
  const reasons: Record<string, RejectionReason[]> = {};
  
  alternatives.forEach(alt => {
    const altReasons: RejectionReason[] = [];
    
    // Budget constraint analysis
    if (alt.cost !== undefined && constraints.budget) {
      if (alt.cost > constraints.budget) {
        altReasons.push({
          category: "cost",
          constraint: `Budget: $${constraints.budget.toLocaleString()}`,
          reason: `Exceeds budget by $${(alt.cost - constraints.budget).toLocaleString()} (${((alt.cost / constraints.budget - 1) * 100).toFixed(0)}% over)`,
          severity: alt.cost > constraints.budget * 1.2 ? "blocking" : "major",
        });
      } else if (alt.cost < constraints.budget * 0.5) {
        altReasons.push({
          category: "business",
          constraint: `Budget: $${constraints.budget.toLocaleString()}`,
          reason: `Under-budget significantly - likely lacks critical features needed for market competitiveness`,
          severity: "major",
        });
      }
    }
    
    // Timeline constraint analysis
    if (alt.timeline !== undefined && constraints.timeline) {
      if (alt.timeline > constraints.timeline) {
        altReasons.push({
          category: "timeline",
          constraint: `Timeline: ${constraints.timeline} weeks`,
          reason: `Exceeds timeline by ${alt.timeline - constraints.timeline} weeks - delays market entry and competitive positioning`,
          severity: alt.timeline > constraints.timeline * 1.3 ? "blocking" : "major",
        });
      } else if (alt.timeline < constraints.timeline * 0.5) {
        altReasons.push({
          category: "technical",
          constraint: `Timeline: ${constraints.timeline} weeks`,
          reason: `Accelerated timeline risks technical debt and quality issues due to rushed development`,
          severity: "minor",
        });
      }
    }
    
    // Risk-based rejection
    if (alt.risk === "high") {
      altReasons.push({
        category: "technical",
        constraint: "Risk Assessment",
        reason: "High implementation risk - potential for scope creep, technical failures, and budget overruns",
        severity: "blocking",
      });
    }
    
    // Business constraint: team capacity
    if (constraints.teamSize && constraints.teamSize < 3) {
      altReasons.push({
        category: "resource",
        constraint: `Team Size: ${constraints.teamSize} developers`,
        reason: `Insufficient team capacity for ${alt.name}'s scope - would require external contractors or scope reduction`,
        severity: "major",
      });
    }
    
    // Default reasons if no specific constraints
    if (altReasons.length === 0) {
      altReasons.push({
        category: "business",
        constraint: "Strategic Fit",
        reason: `Does not align as well with primary business objectives compared to recommended option`,
        severity: "minor",
      });
    }
    
    reasons[alt.id] = altReasons;
  });
  
  return reasons;
};

export default function DecisionAudit() {
  const { projects, currentProject } = useProjectStore();
  
  // User-defined constraints
  const [constraints, setConstraints] = useState({
    budget: 50000,
    timeline: 12,
    teamSize: 5,
  });
  
  // Recommendations with alternatives
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: "1",
      name: "Option A - Full Feature Set",
      summary: "Complete MVP with all planned features, premium UX, and scalable architecture",
      alternatives: [
        { id: "a1", name: "Option B - Basic MVP", description: "Minimal viable product with core features only", cost: 35000, timeline: 8, risk: "medium" },
        { id: "a2", name: "Option C - Hybrid Approach", description: "Phased rollout with essential features first", cost: 45000, timeline: 10, risk: "low" },
      ],
      alternatives: [],
      rejectionReasons: {},
    },
  ]);
  
  const [newRecName, setNewRecName] = useState("");
  const [newRecSummary, setNewRecSummary] = useState("");
  const [alternatives, setAlternatives] = useState<Alternative[]>([
    { id: "a1", name: "Option B - Basic MVP", description: "Minimal viable product with core features only", cost: 35000, timeline: 8, risk: "medium" },
    { id: "a2", name: "Option C - Hybrid Approach", description: "Phased rollout with essential features first", cost: 45000, timeline: 10, risk: "low" },
  ]);
  
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [generatedAudit, setGeneratedAudit] = useState<Recommendation[] | null>(null);

  const project = useMemo(
    () => projects.find((p: any) => p.id === currentProject),
    [projects, currentProject]
  );

  const handleAddAlternative = () => {
    setAlternatives([
      ...alternatives,
      { id: `a${alternatives.length + 1}`, name: "", description: "", cost: 0, timeline: 0, risk: "medium" },
    ]);
  };

  const handleAlternativeChange = (id: string, field: keyof Alternative, value: any) => {
    setAlternatives(prev => prev.map(alt => 
      alt.id === id ? { ...alt, [field]: value } : alt
    ));
  };

  const handleRemoveAlternative = (id: string) => {
    setAlternatives(prev => prev.filter(alt => alt.id !== id));
  };

  const handleAddRecommendation = () => {
    if (!newRecName.trim()) {
      toast.error("Please enter a recommendation name");
      return;
    }
    
    const newRec: Recommendation = {
      id: Date.now().toString(),
      name: newRecName,
      summary: newRecSummary,
      alternatives: [...alternatives],
      rejectionReasons: {},
    };
    
    setRecommendations([...recommendations, newRec]);
    setNewRecName("");
    setNewRecSummary("");
    toast.success("Recommendation added!");
  };

  const generateAudit = () => {
    const auditWithReasons = recommendations.map(rec => ({
      ...rec,
      rejectionReasons: generateRejectionReasons(rec, rec.alternatives, constraints),
    }));
    
    setGeneratedAudit(auditWithReasons);
    toast.success("Decision audit generated with rejection reasons!");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "blocking": return "bg-red-100 text-red-800 border-red-300";
      case "major": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "minor": return "bg-blue-100 text-blue-800 border-blue-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical": return <BarChart3 className="w-4 h-4" />;
      case "business": return <TrendingUp className="w-4 h-4" />;
      case "resource": return <Users className="w-4 h-4" />;
      case "timeline": return <Clock className="w-4 h-4" />;
      case "cost": return <DollarSign className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
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
            Decision Audit
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
            <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-purple-900 font-medium mb-1">AI Decision Audit with Rejection Analysis</p>
              <p className="text-purple-800 text-sm">
                For every recommendation, the AI generates a "Why We Said No" list for all rejected alternatives.
                Each rejection cites specific technical or business constraints as the reason for rejection.
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
                <AlertCircle className="w-5 h-5" />
                Decision Constraints
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={constraints.budget}
                    onChange={(e) => setConstraints(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timeline (weeks)
                  </label>
                  <input
                    type="number"
                    value={constraints.timeline}
                    onChange={(e) => setConstraints(prev => ({ ...prev, timeline: Number(e.target.value) }))}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team Size
                  </label>
                  <input
                    type="number"
                    value={constraints.teamSize}
                    onChange={(e) => setConstraints(prev => ({ ...prev, teamSize: Number(e.target.value) }))}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recommendations & Alternatives */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recommendations & Alternatives
              </h2>
              
              {/* Add New Recommendation */}
              <div className="bg-white border-2 border-purple-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Add New Recommendation</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Recommendation name (e.g., Option A - Full Feature Set)"
                    value={newRecName}
                    onChange={(e) => setNewRecName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                  <textarea
                    placeholder="Brief summary of why this is recommended..."
                    value={newRecSummary}
                    onChange={(e) => setNewRecSummary(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 resize-none h-20"
                  />
                </div>
                
                {/* Alternatives for this recommendation */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700">Rejected Alternatives</h4>
                    <button
                      onClick={handleAddAlternative}
                      className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Alternative
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {alternatives.map((alt, idx) => (
                      <div key={alt.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-red-600">Rejected Alternative {idx + 1}</span>
                          <button
                            onClick={() => handleRemoveAlternative(alt.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Alternative name"
                            value={alt.name}
                            onChange={(e) => handleAlternativeChange(alt.id, "name", e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Cost ($)"
                            value={alt.cost || ""}
                            onChange={(e) => handleAlternativeChange(alt.id, "cost", Number(e.target.value))}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Timeline (weeks)"
                            value={alt.timeline || ""}
                            onChange={(e) => handleAlternativeChange(alt.id, "timeline", Number(e.target.value))}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 text-sm"
                          />
                          <select
                            value={alt.risk || "medium"}
                            onChange={(e) => handleAlternativeChange(alt.id, "risk", e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 text-sm"
                          >
                            <option value="low">Low Risk</option>
                            <option value="medium">Medium Risk</option>
                            <option value="high">High Risk</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          placeholder="Description"
                          value={alt.description}
                          onChange={(e) => handleAlternativeChange(alt.id, "description", e.target.value)}
                          className="w-full mt-2 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <motion.button
                  onClick={handleAddRecommendation}
                  className="mt-4 w-full px-6 py-3 bg-purple-600 hover:shadow-lg rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <TrendingUp className="w-5 h-5" />
                  Add Recommendation
                </motion.button>
              </div>

              {/* Generate Audit Button */}
              {recommendations.length > 0 && (
                <motion.button
                  onClick={generateAudit}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 hover:shadow-lg rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FileText className="w-5 h-5" />
                  Generate Decision Audit
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Audit Results */}
        {generatedAudit && (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-orange-500 px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Decision Audit Report
              </h2>
            </div>
            
            <div className="bg-gray-50 border-2 border-gray-200 rounded-b-lg p-6 space-y-6">
              {generatedAudit.map((rec, recIdx) => (
                <div key={rec.id} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                  {/* Recommendation Header */}
                  <div 
                    className="bg-green-50 px-6 py-4 cursor-pointer flex items-center justify-between"
                    onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{rec.name}</h3>
                        <p className="text-sm text-gray-600">{rec.summary}</p>
                      </div>
                    </div>
                    <ArrowRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedRec === rec.id ? "rotate-90" : ""}`} />
                  </div>
                  
                  {/* Rejected Alternatives */}
                  {rec.alternatives.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-500" />
                        Why We Said No ({rec.alternatives.length} rejected)
                      </h4>
                      
                      <div className="space-y-4">
                        {rec.alternatives.map((alt, altIdx) => {
                          const reasons = rec.rejectionReasons[alt.id] || [];
                          return (
                            <div key={alt.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                                  Rejected: {alt.name}
                                </span>
                                {alt.cost && (
                                  <span className="text-sm text-gray-600">
                                    ${alt.cost.toLocaleString()} | {alt.timeline} weeks
                                  </span>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                {reasons.length > 0 ? (
                                  reasons.map((reason, idx) => (
                                    <div 
                                      key={idx} 
                                      className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityColor(reason.severity)}`}
                                    >
                                      {getCategoryIcon(reason.category)}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-sm">{reason.constraint}</span>
                                          <span className={`text-xs px-2 py-0.5 rounded-full uppercase ${getSeverityColor(reason.severity)}`}>
                                            {reason.severity}
                                          </span>
                                        </div>
                                        <p className="text-sm">{reason.reason}</p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-600 italic">No specific constraints violated</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Expanded Details */}
                  {expandedRec === rec.id && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Summary</h5>
                          <p className="text-sm text-gray-600">{rec.summary}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Alternatives Considered</h5>
                          <p className="text-sm text-gray-600">{rec.alternatives.length} options rejected</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Audit Status</h5>
                          <span className="inline-flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" /> Complete
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}