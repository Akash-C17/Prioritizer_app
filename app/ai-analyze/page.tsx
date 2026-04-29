"use client";

import { useState, useMemo } from "react";
import { useProjectStore } from "@/lib/store";
import { Brain, Send, Copy } from "lucide-react";
import toast from "react-hot-toast";

interface Analysis {
  tradeoffs: string[];
  constraints: string[];
  recommendations: string[];
  risks: string[];
}

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
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Decision Analysis</h1>
          {project && (
            <p className="text-gray-400">Project: <span className="text-blue-400">{project.name}</span></p>
          )}
        </div>

        {/* Input Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Decision Problem</label>
            <textarea
              placeholder="Describe the product decision you're facing. What are you trying to decide?"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none h-32"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Additional Constraints (optional)</label>
            <textarea
              placeholder="List any constraints or context (e.g., budget: $50K, timeline: 3 months)"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none h-24"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Brain className="w-5 h-5" />
            {loading ? "Analyzing..." : "Analyze with AI"}
          </button>
        </div>

        {/* Results Section */}
        {analysis && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <button
                onClick={handleCopyAnalysis}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy All
              </button>
            </div>

            {/* Trade-offs */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-amber-400">Key Trade-offs</h3>
              <ul className="space-y-3">
                {analysis.tradeoffs.map((tradeoff, i) => (
                  <li key={i} className="flex gap-3 text-gray-300">
                    <span className="text-amber-400 font-bold">⚖</span>
                    <span>{tradeoff}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Constraints */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-400">Constraints</h3>
              <ul className="space-y-3">
                {analysis.constraints.map((constraint, i) => (
                  <li key={i} className="flex gap-3 text-gray-300">
                    <span className="text-red-400 font-bold">🔒</span>
                    <span>{constraint}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-400">Recommendations</h3>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3 text-gray-300">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Potential Risks</h3>
              <ul className="space-y-3">
                {analysis.risks.map((risk, i) => (
                  <li key={i} className="flex gap-3 text-gray-300">
                    <span className="text-orange-400 font-bold">⚠</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
