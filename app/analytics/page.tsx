"use client";

import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { KPICard } from '@/components/KPICard';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { TeamPerformanceTable } from '@/components/TeamPerformanceTable';
import { calculateKPIMetrics, formatDuration, formatPercentage, formatGrowth } from '@/lib/analytics';
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Target,
  Star,
  Calendar,
  Activity
} from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(calculateKPIMetrics());

  useEffect(() => {
    // Refresh metrics when component mounts
    setMetrics(calculateKPIMetrics());
  }, []);

  // Prepare chart data
  const categoryData = Object.entries(metrics.categoryBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const priorityData = Object.entries(metrics.priorityDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const dailyVolumeData = metrics.dailyTicketVolume.slice(-14).map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <ProtectedRoute requiredRole="it_admin">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & KPIs</h1>
            <p className="text-gray-600">
              Comprehensive performance metrics and insights for IT support operations.
            </p>
          </div>

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Total Tickets"
              value={metrics.totalTickets}
              subtitle="All time"
              icon={BarChart3}
              trend={{
                value: metrics.ticketTrends.weeklyGrowth,
                label: "vs last week"
              }}
              color="blue"
            />
            
            <KPICard
              title="Resolution Rate"
              value={formatPercentage((metrics.resolvedTickets / metrics.totalTickets) * 100)}
              subtitle="Tickets resolved"
              icon={CheckCircle}
              color="green"
            />
            
            <KPICard
              title="Avg Resolution Time"
              value={formatDuration(metrics.averageResolutionTime)}
              subtitle="Time to resolve"
              icon={Clock}
              color="purple"
            />
            
            <KPICard
              title="SLA Compliance"
              value={formatPercentage(metrics.slaMetrics.slaCompliance)}
              subtitle="Within SLA targets"
              icon={Target}
              color={metrics.slaMetrics.slaCompliance >= 90 ? "green" : metrics.slaMetrics.slaCompliance >= 70 ? "yellow" : "red"}
            />
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Open Tickets"
              value={metrics.openTickets}
              subtitle="Awaiting response"
              icon={AlertCircle}
              color="red"
            />
            
            <KPICard
              title="In Progress"
              value={metrics.inProgressTickets}
              subtitle="Being worked on"
              icon={Activity}
              color="yellow"
            />
            
            <KPICard
              title="First Response Time"
              value={formatDuration(metrics.firstResponseTime)}
              subtitle="Avg first response"
              icon={Clock}
              color="blue"
            />
            
            <KPICard
              title="Customer Satisfaction"
              value={`${metrics.customerSatisfactionScore}/5`}
              subtitle="User rating"
              icon={Star}
              color="yellow"
            />
          </div>

          {/* Trend Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="This Week"
              value={metrics.ticketTrends.thisWeek}
              subtitle="New tickets"
              icon={Calendar}
              trend={{
                value: metrics.ticketTrends.weeklyGrowth,
                label: "vs last week"
              }}
              color="blue"
            />
            
            <KPICard
              title="This Month"
              value={metrics.ticketTrends.thisMonth}
              subtitle="New tickets"
              icon={Calendar}
              trend={{
                value: metrics.ticketTrends.monthlyGrowth,
                label: "vs last month"
              }}
              color="purple"
            />
            
            <KPICard
              title="Team Members"
              value={metrics.teamPerformance.length}
              subtitle="Active support staff"
              icon={Users}
              color="green"
            />
            
            <KPICard
              title="SLA Breaches"
              value={metrics.slaMetrics.breachedSLA}
              subtitle="Tickets over SLA"
              icon={AlertCircle}
              color="red"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <AnalyticsChart
              title="Daily Ticket Volume (Last 14 Days)"
              data={dailyVolumeData}
              type="line"
              xAxisKey="date"
              height={300}
            />
            
            <AnalyticsChart
              title="Tickets by Category"
              data={categoryData}
              type="pie"
              dataKey="value"
              height={300}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <AnalyticsChart
              title="Priority Distribution"
              data={priorityData}
              type="bar"
              dataKey="value"
              xAxisKey="name"
              height={300}
              colors={['#EF4444', '#F59E0B', '#10B981', '#3B82F6']}
            />
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg border-0 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average tickets per day</span>
                  <span className="font-semibold text-gray-900">
                    {(metrics.totalTickets / 30).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Peak resolution time</span>
                  <span className="font-semibold text-gray-900">
                    {formatDuration(Math.max(...metrics.teamPerformance.map(t => t.averageResolutionTime)))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Best performing category</span>
                  <span className="font-semibold text-gray-900">
                    {Object.entries(metrics.categoryBreakdown)
                      .sort(([,a], [,b]) => b - a)[0]?.[0]?.charAt(0).toUpperCase() + 
                     Object.entries(metrics.categoryBreakdown)
                      .sort(([,a], [,b]) => b - a)[0]?.[0]?.slice(1) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Most common priority</span>
                  <span className="font-semibold text-gray-900">
                    {Object.entries(metrics.priorityDistribution)
                      .sort(([,a], [,b]) => b - a)[0]?.[0]?.charAt(0).toUpperCase() + 
                     Object.entries(metrics.priorityDistribution)
                      .sort(([,a], [,b]) => b - a)[0]?.[0]?.slice(1) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Performance */}
          <TeamPerformanceTable teamData={metrics.teamPerformance} />
        </div>
      </div>
    </ProtectedRoute>
  );
}