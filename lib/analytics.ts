"use client";

import { Ticket, User } from '@/types';
import { getTickets } from '@/lib/tickets';
import { getUsers } from '@/lib/auth';
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, subDays, subWeeks, subMonths, isWithinInterval, differenceInHours, differenceInDays } from 'date-fns';

export interface KPIMetrics {
  // Ticket Metrics
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  inProgressTickets: number;
  closedTickets: number;
  
  // Performance Metrics
  averageResolutionTime: number; // in hours
  firstResponseTime: number; // in hours
  customerSatisfactionScore: number;
  
  // Trend Metrics
  ticketTrends: {
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    lastMonth: number;
    weeklyGrowth: number;
    monthlyGrowth: number;
  };
  
  // Category Breakdown
  categoryBreakdown: {
    hardware: number;
    software: number;
    network: number;
    security: number;
    other: number;
  };
  
  // Priority Distribution
  priorityDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  
  // Team Performance
  teamPerformance: {
    userId: string;
    userName: string;
    role: string;
    assignedTickets: number;
    resolvedTickets: number;
    averageResolutionTime: number;
    resolutionRate: number;
  }[];
  
  // Time-based Analytics
  dailyTicketVolume: {
    date: string;
    created: number;
    resolved: number;
  }[];
  
  // SLA Metrics
  slaMetrics: {
    withinSLA: number;
    breachedSLA: number;
    slaCompliance: number;
  };
}

export const calculateKPIMetrics = (): KPIMetrics => {
  const tickets = getTickets();
  const users = getUsers();
  const now = new Date();
  
  // Basic counts
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const closedTickets = tickets.filter(t => t.status === 'closed').length;
  
  // Time periods
  const thisWeekStart = startOfWeek(now);
  const thisWeekEnd = endOfWeek(now);
  const lastWeekStart = startOfWeek(subWeeks(now, 1));
  const lastWeekEnd = endOfWeek(subWeeks(now, 1));
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  
  // Trend calculations
  const thisWeekTickets = tickets.filter(t => 
    isWithinInterval(new Date(t.createdAt), { start: thisWeekStart, end: thisWeekEnd })
  ).length;
  
  const lastWeekTickets = tickets.filter(t => 
    isWithinInterval(new Date(t.createdAt), { start: lastWeekStart, end: lastWeekEnd })
  ).length;
  
  const thisMonthTickets = tickets.filter(t => 
    isWithinInterval(new Date(t.createdAt), { start: thisMonthStart, end: thisMonthEnd })
  ).length;
  
  const lastMonthTickets = tickets.filter(t => 
    isWithinInterval(new Date(t.createdAt), { start: lastMonthStart, end: lastMonthEnd })
  ).length;
  
  const weeklyGrowth = lastWeekTickets === 0 ? 0 : ((thisWeekTickets - lastWeekTickets) / lastWeekTickets) * 100;
  const monthlyGrowth = lastMonthTickets === 0 ? 0 : ((thisMonthTickets - lastMonthTickets) / lastMonthTickets) * 100;
  
  // Resolution time calculation
  const resolvedTicketsWithTime = tickets.filter(t => t.status === 'resolved' && t.resolvedAt);
  const averageResolutionTime = resolvedTicketsWithTime.length > 0 
    ? resolvedTicketsWithTime.reduce((acc, ticket) => {
        const created = new Date(ticket.createdAt);
        const resolved = new Date(ticket.resolvedAt!);
        return acc + differenceInHours(resolved, created);
      }, 0) / resolvedTicketsWithTime.length
    : 0;
  
  // First response time (simulated - based on first comment)
  const ticketsWithComments = tickets.filter(t => t.comments.length > 0);
  const firstResponseTime = ticketsWithComments.length > 0
    ? ticketsWithComments.reduce((acc, ticket) => {
        const created = new Date(ticket.createdAt);
        const firstComment = new Date(ticket.comments[0].createdAt);
        return acc + differenceInHours(firstComment, created);
      }, 0) / ticketsWithComments.length
    : 0;
  
  // Category breakdown
  const categoryBreakdown = {
    hardware: tickets.filter(t => t.category === 'hardware').length,
    software: tickets.filter(t => t.category === 'software').length,
    network: tickets.filter(t => t.category === 'network').length,
    security: tickets.filter(t => t.category === 'security').length,
    other: tickets.filter(t => t.category === 'other').length,
  };
  
  // Priority distribution
  const priorityDistribution = {
    critical: tickets.filter(t => t.priority === 'critical').length,
    high: tickets.filter(t => t.priority === 'high').length,
    medium: tickets.filter(t => t.priority === 'medium').length,
    low: tickets.filter(t => t.priority === 'low').length,
  };
  
  // Team performance
  const supportUsers = users.filter(u => u.role !== 'employee');
  const teamPerformance = supportUsers.map(user => {
    const assignedTickets = tickets.filter(t => t.assignedTo === user.id);
    const resolvedByUser = assignedTickets.filter(t => t.status === 'resolved');
    const userAvgResolutionTime = resolvedByUser.length > 0
      ? resolvedByUser.reduce((acc, ticket) => {
          if (ticket.resolvedAt) {
            const created = new Date(ticket.createdAt);
            const resolved = new Date(ticket.resolvedAt);
            return acc + differenceInHours(resolved, created);
          }
          return acc;
        }, 0) / resolvedByUser.length
      : 0;
    
    return {
      userId: user.id,
      userName: user.name,
      role: user.role,
      assignedTickets: assignedTickets.length,
      resolvedTickets: resolvedByUser.length,
      averageResolutionTime: userAvgResolutionTime,
      resolutionRate: assignedTickets.length > 0 ? (resolvedByUser.length / assignedTickets.length) * 100 : 0,
    };
  });
  
  // Daily ticket volume for last 30 days
  const dailyTicketVolume = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(now, 29 - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const createdOnDate = tickets.filter(t => 
      t.createdAt.split('T')[0] === dateStr
    ).length;
    
    const resolvedOnDate = tickets.filter(t => 
      t.resolvedAt && t.resolvedAt.split('T')[0] === dateStr
    ).length;
    
    return {
      date: dateStr,
      created: createdOnDate,
      resolved: resolvedOnDate,
    };
  });
  
  // SLA Metrics (assuming 24h SLA for high/critical, 48h for medium, 72h for low)
  const getSLAHours = (priority: string) => {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 24;
      case 'medium': return 48;
      case 'low': return 72;
      default: return 48;
    }
  };
  
  const slaAnalysis = resolvedTicketsWithTime.map(ticket => {
    const slaHours = getSLAHours(ticket.priority);
    const resolutionHours = differenceInHours(new Date(ticket.resolvedAt!), new Date(ticket.createdAt));
    return resolutionHours <= slaHours;
  });
  
  const withinSLA = slaAnalysis.filter(Boolean).length;
  const breachedSLA = slaAnalysis.length - withinSLA;
  const slaCompliance = slaAnalysis.length > 0 ? (withinSLA / slaAnalysis.length) * 100 : 100;
  
  return {
    totalTickets,
    openTickets,
    resolvedTickets,
    inProgressTickets,
    closedTickets,
    averageResolutionTime,
    firstResponseTime,
    customerSatisfactionScore: 4.2, // Simulated score
    ticketTrends: {
      thisWeek: thisWeekTickets,
      lastWeek: lastWeekTickets,
      thisMonth: thisMonthTickets,
      lastMonth: lastMonthTickets,
      weeklyGrowth,
      monthlyGrowth,
    },
    categoryBreakdown,
    priorityDistribution,
    teamPerformance,
    dailyTicketVolume,
    slaMetrics: {
      withinSLA,
      breachedSLA,
      slaCompliance,
    },
  };
};

export const formatDuration = (hours: number): string => {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  } else if (hours < 24) {
    return `${Math.round(hours)}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100) / 100}%`;
};

export const formatGrowth = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Math.round(value * 100) / 100}%`;
};