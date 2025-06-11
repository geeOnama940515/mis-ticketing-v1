export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'tech_support' | 'developer' | 'it_admin';
  department?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  reproductionSteps: string;
  category: 'hardware' | 'software' | 'network' | 'security' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  assignedToName?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  screenshots: string[];
  comments: TicketComment[];
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => Promise<boolean>;
  logout: () => void;
}