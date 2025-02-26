import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  color: string;
  iconColor: string;
}

export function DashboardCard({ title, value, icon: Icon, trend, color, iconColor }: DashboardCardProps) {
  return (
    <div className={`p-6 rounded-xl bg-white shadow-sm ${color} text-gray-800`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs font-semibold opacity-80">{title}</h3>
          <p className="text-lg font-poppins font-semibold text-gray-700 mt-2">₵ {value}</p>
          {trend !== undefined && (
            <p className={`text-xs font-semibold mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ?  ' ↑' + ' ' + '+' :  '↓' + ' ' + '-'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className='p-2 bg-emerald-100 rounded-lg'>
          <Icon className={`opacity-80 h-6 w-6 text-emerald-600 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}