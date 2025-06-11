"use client";

import { Ticket, TicketComment } from '@/types';

const TICKETS_STORAGE_KEY = 'it_ticketing_tickets';

export const getTickets = (): Ticket[] => {
  if (typeof window === 'undefined') return [];
  
  const ticketsStr = localStorage.getItem(TICKETS_STORAGE_KEY);
  if (!ticketsStr) return [];
  
  try {
    return JSON.parse(ticketsStr);
  } catch {
    return [];
  }
};

export const createTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Ticket => {
  const tickets = getTickets();
  
  const newTicket: Ticket = {
    ...ticketData,
    id: `ticket-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
  };
  
  const updatedTickets = [...tickets, newTicket];
  localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(updatedTickets));
  
  return newTicket;
};

export const updateTicket = (ticketId: string, updates: Partial<Ticket>): Ticket | null => {
  const tickets = getTickets();
  const ticketIndex = tickets.findIndex(t => t.id === ticketId);
  
  if (ticketIndex === -1) return null;
  
  const updatedTicket = {
    ...tickets[ticketIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  tickets[ticketIndex] = updatedTicket;
  localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  
  return updatedTicket;
};

export const addComment = (ticketId: string, comment: Omit<TicketComment, 'id' | 'createdAt'>): boolean => {
  const tickets = getTickets();
  const ticketIndex = tickets.findIndex(t => t.id === ticketId);
  
  if (ticketIndex === -1) return false;
  
  const newComment: TicketComment = {
    ...comment,
    id: `comment-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  tickets[ticketIndex].comments.push(newComment);
  tickets[ticketIndex].updatedAt = new Date().toISOString();
  
  localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  return true;
};