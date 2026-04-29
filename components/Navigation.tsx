"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Home, Zap, MessageSquare, History } from "lucide-react";

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
    <nav className="border-b border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg text-white">Decision AI</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  pathname === href
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
