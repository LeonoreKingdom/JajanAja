"use client";

import React from "react";
import * as LucideIcons from "lucide-react";

interface IconHelperProps {
  name: string;
  className?: string;
  size?: number;
}

export default function IconHelper({ name, className, size = 20 }: IconHelperProps) {
  // @ts-expect-error Lucide dynamic icon indexing
  const IconComponent = LucideIcons[name] || LucideIcons.CircleDot;
  return <IconComponent className={className} size={size} />;
}
