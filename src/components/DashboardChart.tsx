import React from 'react';

interface ChartProps {
  title: string;
  children: React.ReactNode;
}

export function DashboardChart({ title, children }: ChartProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="w-full h-[300px]">
        {children}
      </div>
    </div>
  );
}