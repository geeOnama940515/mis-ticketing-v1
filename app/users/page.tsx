"use client";

import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getUsers } from '@/lib/auth';
import { getTickets } from '@/lib/tickets';
import { useState, useEffect } from 'react';
import { User, Ticket } from '@/types';
import { Users, BarChart3, UserCheck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const loadData = () => {
      const allUsers = getUsers();
      const allTickets = getTickets();
      
      setUsers(allUsers);
      setTickets(allTickets);
    };

    loadData();
  }, []);

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

  const getUserStats = (userId: string) => {
    const userTickets = tickets.filter(t => t.createdBy === userId);
    const assignedTickets = tickets.filter(t => t.assignedTo === userId);
    return {
      created: userTickets.length,
      assigned: assignedTickets.length,
      resolved: assignedTickets.filter(t => t.status === 'resolved').length,
    };
  };

  const getTotalStats = () => {
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: users.length,
      ...roleStats,
    };
  };

  const stats = getTotalStats();

  return (
    <ProtectedRoute requiredRole="it_admin">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">
              Manage users and view their activity across the support system.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <Badge variant="secondary" className="mt-2">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  All roles
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Employees</CardTitle>
                <UserCheck className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.employee || 0}</div>
                <Badge variant="outline" className="mt-2 border-gray-200 text-gray-700">
                  Regular users
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Tech Support</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.tech_support || 0}</div>
                <Badge variant="outline" className="mt-2 border-blue-200 text-blue-700">
                  Hardware & Network
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Developers</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.developer || 0}</div>
                <Badge variant="outline" className="mt-2 border-green-200 text-green-700">
                  Software & Security
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Users List */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(userData => {
                  const userStats = getUserStats(userData.id);
                  return (
                    <Card key={userData.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg">
                              {userData.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {userData.name}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">{userData.email}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Role:</span>
                            <Badge className={getRoleColor(userData.role)} variant="secondary">
                              {getRoleDisplay(userData.role)}
                            </Badge>
                          </div>

                          {userData.department && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Department:</span>
                              <span className="text-sm text-gray-900">{userData.department}</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Joined:</span>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {formatDistanceToNow(new Date(userData.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-gray-200">
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <div className="text-lg font-semibold text-blue-600">{userStats.created}</div>
                                <div className="text-xs text-gray-600">Created</div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-yellow-600">{userStats.assigned}</div>
                                <div className="text-xs text-gray-600">Assigned</div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-green-600">{userStats.resolved}</div>
                                <div className="text-xs text-gray-600">Resolved</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}