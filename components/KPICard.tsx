"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue'
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          icon: 'text-green-600',
          trend: trend && trend.value >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
        };
      case 'red':
        return {
          icon: 'text-red-600',
          trend: trend && trend.value <= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
        };
      case 'yellow':
        return {
          icon: 'text-yellow-600',
          trend: trend && trend.value >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
        };
      case 'purple':
        return {
          icon: 'text-purple-600',
          trend: trend && trend.value >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
        };
      case 'gray':
        return {
          icon: 'text-gray-600',
          trend: 'text-gray-600 bg-gray-100'
        };
      default:
        return {
          icon: 'text-blue-600',
          trend: trend && trend.value >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClasses.icon}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {subtitle && (
          <p className="text-sm text-gray-600 mb-2">{subtitle}</p>
        )}
        {trend && (
          <Badge variant="secondary" className={`${colorClasses.trend} text-xs`}>
            {trend.value >= 0 ? '↗' : '↘'} {Math.abs(trend.value).toFixed(1)}% {trend.label}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};