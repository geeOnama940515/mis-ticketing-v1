"use client";

import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTickets, updateTicket, addComment } from '@/lib/tickets';
import { getUsers } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Ticket, User, TicketComment } from '@/types';
import { ArrowLeft, Send, Clock, User as UserIcon, AlertCircle, CheckCircle, XCircle, Pause, MessageSquare, Image, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function TicketDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [comment, setComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const tickets = getTickets();
      const allUsers = getUsers();
      const foundTicket = tickets.find(t => t.id === id);
      
      if (!foundTicket) {
        router.push('/tickets');
        return;
      }

      setTicket(foundTicket);
      setUsers(allUsers);
      setLoading(false);
    };

    loadData();
  }, [id, router]);

  const canAssignTickets = user?.role === 'it_admin';
  const canUpdateStatus = user?.role === 'it_admin' || user?.role === 'tech_support' || user?.role === 'developer';

  const handleStatusUpdate = async (newStatus: string) => {
    if (!ticket) return;
    
    setUpdating(true);
    const updatedTicket = updateTicket(ticket.id, { status: newStatus as any });
    if (updatedTicket) {
      setTicket(updatedTicket);
    }
    setUpdating(false);
  };

  const handleAssignment = async (assignedTo: string, assignedToName: string) => {
    if (!ticket) return;
    
    setUpdating(true);
    const updatedTicket = updateTicket(ticket.id, { 
      assignedTo: assignedTo === 'unassigned' ? undefined : assignedTo,
      assignedToName: assignedTo === 'unassigned' ? undefined : assignedToName
    });
    if (updatedTicket) {
      setTicket(updatedTicket);
    }
    setUpdating(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !ticket || !user) return;

    setAddingComment(true);
    const success = addComment(ticket.id, {
      ticketId: ticket.id,
      userId: user.id,
      userName: user.name,
      content: comment.trim(),
    });

    if (success) {
      const tickets = getTickets();
      const updatedTicket = tickets.find(t => t.id === ticket.id);
      if (updatedTicket) {
        setTicket(updatedTicket);
      }
      setComment('');
    }
    setAddingComment(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hardware': return 'bg-blue-100 text-blue-800';
      case 'software': return 'bg-purple-100 text-purple-800';
      case 'network': return 'bg-green-100 text-green-800';
      case 'security': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Pause className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getAssignableUsers = () => {
    if (!ticket) return [];
    
    // IT admins can assign to anyone
    if (user?.role === 'it_admin') {
      if (ticket.category === 'hardware' || ticket.category === 'network') {
        return users.filter(u => u.role === 'tech_support' || u.role === 'it_admin');
      } else if (ticket.category === 'software' || ticket.category === 'security') {
        return users.filter(u => u.role === 'developer' || u.role === 'it_admin');
      } else {
        return users.filter(u => u.role !== 'employee');
      }
    }
    
    return [];
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!ticket) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Alert variant="destructive">
              <AlertDescription>Ticket not found.</AlertDescription>
            </Alert>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/tickets">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tickets
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
                <Badge className={getStatusColor(ticket.status)} variant="secondary">
                  {getStatusIcon(ticket.status)}
                  <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className={getPriorityColor(ticket.priority)} variant="secondary">
                  {ticket.priority.toUpperCase()}
                </Badge>
                <Badge className={getCategoryColor(ticket.category)} variant="secondary">
                  {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                </Badge>
                <span className="text-gray-600 text-sm">
                  Ticket #{ticket.id.split('-')[1]}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ticket Details */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Problem Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                  </div>

                  {ticket.reproductionSteps && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">How to Reproduce</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{ticket.reproductionSteps}</p>
                    </div>
                  )}

                  {ticket.screenshots && ticket.screenshots.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Screenshots</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ticket.screenshots.map((screenshot, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border">
                              <img
                                src={screenshot}
                                alt={`Screenshot ${index + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(screenshot, '_blank')}
                              />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-sm p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  <Image className="h-4 w-4" />
                                  <span>Screenshot {index + 1}</span>
                                </div>
                                <button
                                  onClick={() => window.open(screenshot, '_blank')}
                                  className="hover:text-blue-300"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comments */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Comments ({ticket.comments.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ticket.comments.length > 0 ? (
                    <div className="space-y-4">
                      {ticket.comments.map((comment) => (
                        <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                                {comment.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium text-gray-900">{comment.userName}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 ml-11 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No comments yet.</p>
                  )}

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="border-t pt-4">
                    <div className="space-y-3">
                      <Label htmlFor="comment">Add a comment</Label>
                      <Textarea
                        id="comment"
                        placeholder="Enter your comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={!comment.trim() || addingComment}
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {addingComment ? (
                            <>Adding...</>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Add Comment
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Ticket Info */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Ticket Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Created By</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-gray-200">
                          {ticket.createdByName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-900">{ticket.createdByName}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Created</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Assigned To</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {ticket.assignedToName ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-gray-200">
                              {ticket.assignedToName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-900">{ticket.assignedToName}</span>
                        </>
                      ) : (
                        <>
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Unassigned</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {(canUpdateStatus || canAssignTickets) && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {canUpdateStatus && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600 mb-2 block">Update Status</Label>
                        <Select 
                          value={ticket.status} 
                          onValueChange={handleStatusUpdate}
                          disabled={updating}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {canAssignTickets && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600 mb-2 block">Assign To</Label>
                        <Select 
                          value={ticket.assignedTo || 'unassigned'} 
                          onValueChange={(value) => {
                            const selectedUser = users.find(u => u.id === value);
                            handleAssignment(value, selectedUser?.name || '');
                          }}
                          disabled={updating}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {getAssignableUsers().map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name} ({user.role.replace('_', ' ')})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}