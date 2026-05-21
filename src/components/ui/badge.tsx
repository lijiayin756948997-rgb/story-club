import * as React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "warm";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    warm: "bg-warm-100 text-amber-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
