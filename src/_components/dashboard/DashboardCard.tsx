"use client";

import React from "react";
import { Card, CardBody } from "@heroui/react";
import { FolderIcon, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface DashboardCardProps {
  name: string;
  path: string;
  description: string;
  icon?: React.ReactElement;
}

// Color schemes for different cards
const colorSchemes = [
  {
    gradient: "from-blue-500 via-blue-600 to-purple-600",
    shadow: "shadow-blue-500/20",
    hoverShadow: "hover:shadow-blue-500/30",
    ring: "ring-blue-500/10",
    accent: "bg-blue-50 group-hover:bg-blue-100",
    accentText: "text-blue-600",
  },
  {
    gradient: "from-emerald-500 via-green-600 to-teal-600",
    shadow: "shadow-emerald-500/20",
    hoverShadow: "hover:shadow-emerald-500/30",
    ring: "ring-emerald-500/10",
    accent: "bg-emerald-50 group-hover:bg-emerald-100",
    accentText: "text-emerald-600",
  },
  {
    gradient: "from-purple-500 via-violet-600 to-pink-600",
    shadow: "shadow-purple-500/20",
    hoverShadow: "hover:shadow-purple-500/30",
    ring: "ring-purple-500/10",
    accent: "bg-purple-50 group-hover:bg-purple-100",
    accentText: "text-purple-600",
  },
  {
    gradient: "from-orange-500 via-red-500 to-pink-600",
    shadow: "shadow-orange-500/20",
    hoverShadow: "hover:shadow-orange-500/30",
    ring: "ring-orange-500/10",
    accent: "bg-orange-50 group-hover:bg-orange-100",
    accentText: "text-orange-600",
  },
  {
    gradient: "from-cyan-500 via-blue-500 to-indigo-600",
    shadow: "shadow-cyan-500/20",
    hoverShadow: "hover:shadow-cyan-500/30",
    ring: "ring-cyan-500/10",
    accent: "bg-cyan-50 group-hover:bg-cyan-100",
    accentText: "text-cyan-600",
  },
];

export default function DashboardCard({
  name,
  path,
  description,
  icon,
}: DashboardCardProps) {
  // Get color scheme based on card name hash
  const colorIndex =
    Math.abs(name.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) %
    colorSchemes.length;
  const colors = colorSchemes[colorIndex];

  return (
    <Link href={path} className="no-underline group">
      <Card
        className={`
        relative h-64 w-full transition-all duration-500 ease-out
        hover:shadow-2xl hover:-translate-y-2 
        border-0 bg-gradient-to-br from-white via-gray-50/50 to-white
        backdrop-blur-sm
        ${colors.shadow} ${colors.hoverShadow}
        ring-1 ${colors.ring} hover:ring-2
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:via-white/5 before:to-transparent
        before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100
      `}
      >
        <CardBody className="p-4 h-64 overflow-hidden">
          <div className="h-full w-full flex flex-col">
            {/* Icon Section */}
            <div className="mb-3 relative">
              <div
                className={`
                w-10 h-10 bg-gradient-to-br ${colors.gradient} 
                rounded-lg flex items-center justify-center 
                group-hover:scale-105 
                transition-all duration-300 ease-out
                shadow-md
              `}
              >
                {icon ? (
                  React.cloneElement(icon, {
                    className: "w-5 h-5 text-white",
                  })
                ) : (
                  <FolderIcon className="w-5 h-5 text-white" />
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 overflow-hidden">
              <h3
                className={`
                text-base font-bold text-gray-800 mb-2 
                group-hover:${colors.accentText} transition-colors duration-300
                leading-tight truncate
              `}
              >
                {name}
              </h3>
              <p className="text-sm text-gray-600 leading-snug group-hover:text-gray-700 transition-colors duration-300 overflow-hidden">
                {description.length > 80
                  ? description.substring(0, 80) + "..."
                  : description}
              </p>
            </div>

            {/* Action Section */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full group-hover:bg-current transition-all duration-300"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full group-hover:bg-current transition-all duration-300"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full group-hover:bg-current transition-all duration-300"></div>
              </div>

              <div
                className={`
                w-7 h-7 ${colors.accent} rounded-lg 
                flex items-center justify-center 
                transition-all duration-300 
                group-hover:scale-105
                shadow-sm
              `}
              >
                <ArrowRight
                  className={`
                  w-3.5 h-3.5 ${colors.accentText} 
                  group-hover:translate-x-0.5 transition-transform duration-300
                `}
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
