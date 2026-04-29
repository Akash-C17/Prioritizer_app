// filepath: app/architecture-visualizer/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useProjectStore } from "@/lib/store";
import { 
  Database, 
  Server, 
  Monitor, 
  AlertTriangle, 
  CheckCircle, 
  Layers,
  GitBranch,
  Code2,
  HardDrive,
  Clock,
  Zap,
  ArrowRight,
  Box
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface SystemComponent {
  id: string;
  name: string;
  category: "database" | "api" | "frontend";
  changes: string[];
  impactLevel: "none" | "low" | "medium" | "high";
  filesAffected: string[];
}

interface FeaturePath {
  id: string;
  name: string;
  description: string;
  components: SystemComponent[];
  techDebtScore: number;
  techDebtFactors: {
    factor: string;
    score: number;
    reason: string;
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

// Define system components that can be affected
const availableComponents: SystemComponent[] = [
  {
    id: "db-1",
    name: "User Database",
    category: "database",
    changes: ["Add user preferences table", "Update user schema"],
    impactLevel: "medium",
    filesAffected: ["models/user.ts", "migrations/001_add_preferences.sql"],
  },
  {
    id: "db-2",
    name: "Product Catalog",
    category: "database",
    changes: ["Add product attributes", "Create search index"],
    impactLevel: "high",
    filesAffected: ["models/product.ts", "services/search.ts"],
  },
  {
    id: "db-3",
    name: "Order Management",
    category: "database",
    changes: ["Add order history", "Create transaction logs"],
    impactLevel: "medium",
    filesAffected: ["models/order.ts", "services/payment.ts"],
  },
  {
    id: "api-1",
    name: "User API",
    category: "api",
    changes: ["Add preference endpoints", "Update user CRUD"],
    impactLevel: "medium",
    filesAffected: ["routes/user.ts", "controllers/userController.ts"],
  },
  {
    id: "api-2",
    name: "Product API",
    category: "api",
    changes: ["Add search endpoints", "Create filter API"],
    impactLevel: "high",
    filesAffected: ["routes/product.ts", "controllers/productController.ts"],
  },
  {
    id: "api-3",
    name: "Payment API",
    category: "api",
    changes: ["Integrate payment gateway", "Add webhook handlers"],
    impactLevel: "high",
    filesAffected: ["routes/payment.ts", "services/paymentGateway.ts"],
  },
  {
    id: "api-4",
    name: "Analytics API",
    category: "api",
    changes: ["Add tracking endpoints", "Create metrics service"],
    impactLevel: "low",
    filesAffected: ["routes/analytics.ts", "services/metrics.ts"],
  },
  {
    id: "fe-1",
    name: "User Dashboard",
    category: "frontend",
    changes: ["Add preference UI", "Update settings page"],
    impactLevel: "medium",
    filesAffected: ["components/UserDashboard.tsx", "pages/settings.tsx"],
  },
  {
    id: "fe-2",
    name: "Product Page",
    category: "frontend",
    changes: ["Add product grid", "Create filter sidebar"],
    impactLevel: "high",
    filesAffected: ["components/ProductGrid.tsx", "pages/products.tsx"],
  },
  {
    id: "fe-3",
    name: "Checkout Flow",
    category: "frontend",
    changes: ["Add payment form", "Create order summary"],
    impactLevel: "high",
    filesAffected: ["components/Checkout.tsx", "pages/checkout.tsx"],
  },
  {
    id: "fe-4",
    name: "Navigation",
    category: "frontend",
    changes: ["Add new menu items", "Update routing"],
    impactLevel: "low",
    filesAffected: ["components/Navbar.tsx", "app/router.ts"],
  },
];

// Calculate Tech Debt Score based on various factors
const calculateTechDebtScore = (
  components: SystemComponent[],
  path: FeaturePath
): { score: number; factors: { factor: string; score: number; reason: string }[] } => {
  const factors: { factor: string; score: number; reason: string }[] = [];
  
  // Factor 1: Database changes complexity
  const dbChanges = components.filter(c => c.category === "database");
  const dbScore = dbChanges.length * 2;
  factors.push({
    factor: "Database Changes",
    score: dbScore,
    reason: `${dbChanges.length} database component(s) need modification`,
  });
  
  // Factor 2: API surface area
  const apiChanges = components.filter(c => c.category === "api");
  const apiScore = apiChanges.length * 1.5;
  factors.push({
    factor: "API Surface Area",
    score: apiScore,
    reason: `${apiChanges.length} API endpoint(s) require updates`,
  });
  
  // Factor 3: Frontend impact
  const feChanges = components.filter(c => c.category === "frontend");
  const feScore = feChanges.length * 1;
  factors.push({
    factor: "Frontend Impact",
    score: feScore,
    reason: `${feChanges.length} frontend component(s) affected`,
  });
  
  // Factor 4: High impact components
  const highImpactCount = components.filter(c => c.impactLevel === "high").length;
  const highImpactScore = highImpactCount * 2;
  factors.push({
    factor: "High Impact Components",
    score: highImpactScore,
    reason: `${highImpactCount} component(s) with high impact level`,
  });
  
  // Factor 5: Total files affected
  const totalFiles = components.reduce((acc, c) => acc + c.filesAffected.length, 0);
  const fileScore = Math.min(totalFiles * 0.3, 3);
  factors.push({
    factor: "Files Affected",
    score: fileScore,
    reason: `${totalFiles} file(s) need modifications`,
  });
  
  // Factor 6: Cross-component dependencies
  const uniqueCategories = new Set(components.map(c => c.category)).size;
  const dependencyScore = (uniqueCategories - 1) * 1.5;
  factors.push({
    factor: "Cross-component Dependencies",
    score: dependencyScore,
    reason: `Changes span ${uniqueCategories} system layer(s)`,
  });
  
  // Calculate total score (cap at 10)
  const totalScore = Math.min(Math.round(factors.reduce((acc, f) => acc + f.score, 0)), 10);
  
  return { score: totalScore, factors };
};

export default function ArchitectureVisualizer() {
  const { projects, currentProject } = useProjectStore();
  
  // Feature paths to choose from
  const [featurePaths, setFeaturePaths] = useState<FeaturePath[]>([
    {
      id: "1",
      name: "Enhanced User Profiles",
      description: "Add rich user profiles with preferences and analytics",
      components: [],
      techDebtScore: 0,
      techDebtFactors: [],
    },
    {
      id: "2",
      name: "Advanced Product Search",
      description: "Implement full-text search with filters and recommendations",
      components: [],
      techDebtScore: 0,
      techDebtFactors: [],
    },
    {
      id: "3",
      name: "Secure Payment Flow",
      description: "Add payment processing with PCI compliance",
      components: [],
      techDebtScore: 0,
      techDebtFactors: [],
    },
  ]);
  
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<FeaturePath | null>(null);

  const project = useMemo(
    () => projects.find((p: any) => p.id === currentProject),
    [projects, currentProject]
  );

  const handlePathSelect = (pathId: string) => {
    setSelectedPathId(pathId);
    setSelectedComponents([]);
    setAnalysisResult(null);
  };

  const handleComponentToggle = (componentId: string) => {
    setSelectedComponents(prev => 
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

  const handleAnalyze = () => {
    if (!selectedPathId) {
      toast.error("Please select a feature path first");
      return;
    }
    
    if (selectedComponents.length === 0) {
      toast.error("Please select at least one system component");
      return;
    }
    
    const selectedPath = featurePaths.find(p => p.id === selectedPathId);
    if (!selectedPath) return;
    
    const components = availableComponents.filter(c => 
      selectedComponents.includes(c.id)
    );
    
    const { score, factors } = calculateTechDebtScore(components, selectedPath);
    
    const result: FeaturePath = {
      ...selectedPath,
      components,
      techDebtScore: score,
      techDebtFactors: factors,
    };
    
    setAnalysisResult(result);
    toast.success("Architecture analysis complete!");
  };

  const getComponentIcon = (category: string) => {
    switch (category) {
      case "database": return <Database className="w-5 h-5" />;
      case "api": return <Server className="w-5 h-5" />;
      case "frontend": return <Monitor className="w-5 h-5" />;
      default: return <Box className="w-5 h-5" />;
    }
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case "high": return "bg-red-100 text-red-800 border-red-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTechDebtColor = (score: number) => {
    if (score <= 3) return { bg: "bg-green-100", text: "text-green-800", label: "Low" };
    if (score <= 6) return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Medium" };
    return { bg: "bg-red-100", text: "text-red-800", label: "High" };
  };

  const groupedComponents = useMemo(() => {
    const groups: Record<string, SystemComponent[]> = {
      database: [],
      api: [],
      frontend: [],
    };
    availableComponents.forEach(c => {
      groups[c.category].push(c);
    });
    return groups;
  }, []);

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            Architecture Visualizer
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
            <Layers className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-purple-900 font-medium mb-1">System Architecture Impact Analysis</p>
              <p className="text-purple-800 text-sm">
                Select a feature path and choose which system components (Database, API, Frontend) will be changed.
                The AI will calculate a Tech Debt Score (1-10) based on the complexity of changes.
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
          {/* Feature Path Selection */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Feature Paths
              </h2>
              
              <div className="space-y-3">
                {featurePaths.map(path => (
                  <div
                    key={path.id}
                    onClick={() => handlePathSelect(path.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPathId === path.id 
                        ? "border-purple-500 bg-purple-50" 
                        : "border-gray-200 bg-white hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedPathId === path.id ? (
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                      <h3 className="font-semibold text-gray-900">{path.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 ml-7">{path.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* System Components */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                System Components to Change
              </h2>
              
              {!selectedPathId ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a feature path first to see available components</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Database Components */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-600" />
                      Database
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {groupedComponents.database.map(comp => (
                        <div
                          key={comp.id}
                          onClick={() => handleComponentToggle(comp.id)}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedComponents.includes(comp.id)
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{comp.name}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(comp.impactLevel)}`}>
                              {comp.impactLevel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{comp.changes[0]}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* API Components */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Server className="w-5 h-5 text-green-600" />
                      API
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {groupedComponents.api.map(comp => (
                        <div
                          key={comp.id}
                          onClick={() => handleComponentToggle(comp.id)}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedComponents.includes(comp.id)
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{comp.name}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(comp.impactLevel)}`}>
                              {comp.impactLevel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{comp.changes[0]}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Frontend Components */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-orange-600" />
                      Frontend
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {groupedComponents.frontend.map(comp => (
                        <div
                          key={comp.id}
                          onClick={() => handleComponentToggle(comp.id)}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedComponents.includes(comp.id)
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{comp.name}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(comp.impactLevel)}`}>
                              {comp.impactLevel}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{comp.changes[0]}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    onClick={handleAnalyze}
                    disabled={selectedComponents.length === 0}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 hover:shadow-lg disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Layers className="w-5 h-5" />
                    Analyze Architecture Impact
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Analysis Results */}
        {analysisResult && (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-orange-500 px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Architecture Impact Analysis
              </h2>
            </div>
            
            <div className="bg-gray-50 border-2 border-gray-200 rounded-b-lg p-6">
              {/* Tech Debt Score */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Tech Debt Score
                </h3>
                
                <div className="flex items-center gap-6">
                  <div className={`text-6xl font-bold px-6 py-4 rounded-lg ${getTechDebtColor(analysisResult.techDebtScore).bg} ${getTechDebtColor(analysisResult.techDebtScore).text}`}>
                    {analysisResult.techDebtScore}/10
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      {getTechDebtColor(analysisResult.techDebtScore).label} Technical Debt
                    </p>
                    <p className="text-gray-600">
                      Based on {analysisResult.components.length} system component changes
                    </p>
                  </div>
                </div>
                
                {/* Tech Debt Factors */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.techDebtFactors.map((factor, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{factor.factor}</span>
                        <span className="text-sm font-bold text-purple-600">+{factor.score.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{factor.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Affected Components Table */}
              <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <HardDrive className="w-5 h-5" />
                    System Components That Will Be Changed
                  </h3>
                </div>
                
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Component</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Impact</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Changes</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Files Affected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analysisResult.components.map(comp => (
                      <tr key={comp.id}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {getComponentIcon(comp.category)}
                            <span className="font-medium text-gray-900">{comp.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="capitalize text-gray-700">{comp.category}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(comp.impactLevel)}`}>
                            {comp.impactLevel}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          <ul className="space-y-1">
                            {comp.changes.map((change, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <ArrowRight className="w-3 h-3 text-purple-500" />
                                {change}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {comp.filesAffected.map((file, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {file}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Database</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {analysisResult.components.filter(c => c.category === "database").length}
                  </p>
                  <p className="text-sm text-blue-700">components affected</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">API</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {analysisResult.components.filter(c => c.category === "api").length}
                  </p>
                  <p className="text-sm text-green-700">endpoints affected</p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-orange-800">Frontend</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">
                    {analysisResult.components.filter(c => c.category === "frontend").length}
                  </p>
                  <p className="text-sm text-orange-700">components affected</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}