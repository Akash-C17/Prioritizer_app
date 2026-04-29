"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Home, Zap, MessageSquare, History } from "lucide-react";
import { motion } from "framer-motion";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/feature-prioritize", icon: Zap, label: "Prioritize" },
    { href: "/ai-analyze", icon: Brain, label: "AI Analyze" },
    { href: "/discussion", icon: MessageSquare, label: "Discussion" },
    { href: "/history", icon: History, label: "History" },
  ];

  return (
    <nav className="border-b-2 border-purple-300 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                <Brain className="w-6 h-6 text-purple-600 group-hover:text-orange-500 transition-colors" />
              </motion.div>
              <span className="font-bold text-lg bg-gradient-to-r from-purple-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                Decision AI
              </span>
            </Link>
          </motion.div>

          <div className="flex items-center gap-1">
            {navItems.map(({ href, icon: Icon, label }, index) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  href={href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    pathname === href
                      ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg"
                      : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
