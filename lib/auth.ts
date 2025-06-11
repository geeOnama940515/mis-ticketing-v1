"use client";

import { User, AuthState } from '@/types';

// Mock database - in production, this would be a real database
const USERS_STORAGE_KEY = 'it_ticketing_users';
const CURRENT_USER_KEY = 'it_ticketing_current_user';

// Default users including all roles
const getDefaultUsers = (): User[] => [
  {
    id: 'admin-1',
    email: 'admin@company.com',
    name: 'IT Administrator',
    role: 'it_admin',
    department: 'Information Technology',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tech-1',
    email: 'tech@company.com',
    name: 'Tech Support',
    role: 'tech_support',
    department: 'IT Support',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dev-1',
    email: 'dev@company.com',
    name: 'Developer',
    role: 'developer',
    department: 'Engineering',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'employee-1',
    email: 'employee@company.com',
    name: 'John Employee',
    role: 'employee',
    department: 'Sales',
    createdAt: new Date().toISOString(),
  }
];

// Initialize with default users and passwords
const initializeUsers = () => {
  if (typeof window === 'undefined') return [];
  
  // Force reinitialize to ensure all accounts are available
  const defaultUsers = getDefaultUsers();
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
  
  // Set default passwords (in production, these would be hashed)
  localStorage.setItem('password_admin@company.com', 'admin123');
  localStorage.setItem('password_tech@company.com', 'tech123');
  localStorage.setItem('password_dev@company.com', 'dev123');
  localStorage.setItem('password_employee@company.com', 'employee123');
  
  return defaultUsers;
};

export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  return initializeUsers();
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const login = async (email: string, password: string): Promise<User | null> => {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) return null;
  
  // Check password (in production, this would be hashed comparison)
  const storedPassword = localStorage.getItem(`password_${email}`);
  if (storedPassword !== password) return null;
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const register = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<User | null> => {
  const users = getUsers();
  
  // Check if user already exists
  if (users.find(u => u.email === userData.email)) {
    return null;
  }
  
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  delete (newUser as any).password;
  
  const updatedUsers = [...users, newUser];
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  localStorage.setItem(`password_${userData.email}`, userData.password);
  
  return newUser;
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};