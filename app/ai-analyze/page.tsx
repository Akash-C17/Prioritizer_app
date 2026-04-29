"use client";

import { useState, useMemo } from "react";
import { useProjectStore } from "@/lib/store";
import { Brain, Send, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface Analysis {
  tradeoffs: string[];
  constraints: string[];
  recommendations: string[];
  risks: string[];
}

const resultVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AIAnalyze() {
  const { projects, currentProject, addDecision } = useProjectStore();
  const [problem, setProblem] = useState("");
  const [constraints, setConstraints] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const project = useMemo(
    () => projects.find((p: any) => p.id === currentProject),
    [projects, currentProject]
  );

  const handleAnalyze = async () => {
    if (!problem.trim()) {
      toast.error("Please describe the decision problem");
      return;
    }

    setLoading(true);
    try {
      // Simulated AI analysis - replace with actual API call
      const mockAnalysis: Analysis = {
        tradeoffs: [
          "Speed to market vs. Feature completeness",
          "User experience vs. Development cost",
          "Scalability vs. Simplicity",
          "Customization vs. Standardization",
        ],
        constraints: [
          constraints.split("\n").filter(Boolean)[0] || "Budget limitations",
          "Timeline constraints (Q2 delivery required)",
          "Team capacity (5 engineers available)",
          "Technical debt considerations",
        ],
        recommendations: [
          "Prioritize core features for MVP launch",
          "Phase feature rollout based on user feedback",
          "Implement modular architecture for scalability",
          "Establish clear success metrics before development",
        ],
        risks: [
          "Feature creep during implementation",
          "Scope misalignment with stakeholders",
          "Technical risk in unfamiliar technologies",
          "Market timing and competitive pressure",
        ],
      };

      setAnalysis(mockAnalysis);
      toast.success("Analysis complete!");

      // Save to history
      addDecision({
        projectId: currentProject,
        type: "ai-analysis",
        problem,
        analysis: mockAnalysis,
        timestamp: new Date(),
      });
    } catch (error) {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAnalysis = () => {
    if (!analysis) return;
    const text = JSON.stringify(analysis, null, 2);
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            AI Decision Analysis
          </h1>
          {project && (
            <p className="text-gray-700">Project: <span className="text-purple-600 font-semibold">{project.name}</span></p>
          )}
        </motion.div>

        {/* Input Section */}
        <motion.div 
          className="bg-white border-2 border-purple-300 rounded-lg p-6 mb-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-900">Decision Problem</label>
            <textarea
              placeholder="Describe the product decision you're facing. What are you trying to decide?"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 resize-none h-32 transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-900">Additional Constraints (optional)</label>
            <textarea
              placeholder="List any constraints or context (e.g., budget: $50K, timeline: 3 months)"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 resize-none h-24 transition-all"
            />
          </div>

          <motion.button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 hover:shadow-lg disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={{ rotate: loading ? 360 : 0 }}
              transition={{ duration: 2, repeat: loading ? Infinity : 0 }}
            >
              <Brain className="w-5 h-5" />
            </motion.div>
            {loading ? "Analyzing..." : "Analyze with AI"}
          </motion.button>
        </motion.div>

        {/* Results Section */}
        {analysis && (
          <motion.div 
            className="space-y-6"
            initial="hidden"
            animate="show"
            variants={{
              show: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            <motion.div 
              className="flex items-center justify-between mb-6"
              variants={resultVariants}
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                Analysis Results
              </h2>
              <motion.button
                onClick={handleCopyAnalysis}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2 text-sm font-medium transition-all text-gray-900"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Copy className="w-4 h-4" />
                Copy All
              </motion.button>
            </motion.div>

            {/* Trade-offs */}
            <motion.div 
              className="bg-white border-2 border-orange-300 rounded-lg p-6 shadow-lg"
              variants={resultVariants}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-orange-600">⚖ Key Trade-offs</h3>
              <ul className="space-y-3">
                {analysis.tradeoffs.map((tradeoff, i) => (
                  <motion.li 
                    key={i} 
                    className="flex gap-3 text-gray-700"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="text-orange-500 font-bold">⚖</span>
                    <span>{tradeoff}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Constraints */}
            <motion.div 
              className="bg-white border-2 border-red-300 rounded-lg p-6 shadow-lg"
              variants={resultVariants}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-red-600">🔒 Constraints</h3>
              <ul className="space-y-3">
                {analysis.constraints.map((constraint, i) => (
                  <motion.li 
                    key={i} 
                    className="flex gap-3 text-gray-700"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="text-red-500 font-bold">🔒</span>
                    <span>{constraint}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Recommendations */}
            <motion.div 
              className="bg-white border-2 border-green-300 rounded-lg p-6 shadow-lg"
              variants={resultVariants}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-green-600">✓ Recommendations</h3>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <motion.li 
                    key={i} 
                    className="flex gap-3 text-gray-700"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{rec}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Risks */}
            <motion.div 
              className="bg-white border-2 border-yellow-300 rounded-lg p-6 shadow-lg"
              variants={resultVariants}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-yellow-600">⚠ Potential Risks</h3>
              <ul className="space-y-3">
                {analysis.risks.map((risk, i) => (
                  <motion.li 
                    key={i} 
                    className="flex gap-3 text-gray-700"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="text-yellow-500 font-bold">⚠</span>
                    <span>{risk}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
