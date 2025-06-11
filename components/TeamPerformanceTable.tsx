"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDuration, formatPercentage } from '@/lib/analytics';
import { User, Trophy, Clock, CheckCircle } from 'lucide-react';

interface TeamMember {
  userId: string;
  userName: string;
  role: string;
  assignedTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  resolutionRate: number;
}

interface TeamPerformanceTableProps {
  teamData: TeamMember[];
}

export const TeamPerformanceTable: React.FC<TeamPerformanceTableProps> = ({ teamData }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'it_admin': return 'bg-red-100 text-red-800';
      case 'developer': return 'bg-green-100 text-green-800';
      case 'tech_support': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'it_admin': return 'IT Admin';
      case 'tech_support': return 'Tech Support';
      case 'developer': return 'Developer';
      default: return 'Employee';
    }
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const sortedTeam = [...teamData].sort((a, b) => b.resolutionRate - a.resolutionRate);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <span>Team Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTeam.map((member, index) => (
            <div key={member.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {index < 3 && (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      'bg-orange-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                  )}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {member.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900">{member.userName}</h3>
                  <Badge className={getRoleColor(member.role)} variant="secondary">
                    {getRoleDisplay(member.role)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 text-center">
                <div>
                  <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Assigned</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{member.assignedTickets}</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Resolved</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{member.resolvedTickets}</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Avg Time</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatDuration(member.averageResolutionTime)}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-center space-x-1 text-yellow-600 mb-1">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm font-medium">Success Rate</span>
                  </div>
                  <div className={`text-lg font-bold ${getPerformanceColor(member.resolutionRate)}`}>
                    {formatPercentage(member.resolutionRate)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {sortedTeam.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No team performance data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};