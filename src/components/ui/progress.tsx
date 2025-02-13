"use client";
import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <div className={`w-full bg-gray-200 rounded-full ${className}`}>
      <div
        className="bg-blue-500 rounded-full h-2"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}