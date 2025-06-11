"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ResolutionStepsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (resolutionSteps: string) => void;
  ticketTitle: string;
  loading?: boolean;
}

export const ResolutionStepsDialog: React.FC<ResolutionStepsDialogProps> = ({
  isOpen,
  onClose,
  onResolve,
  ticketTitle,
  loading = false
}) => {
  const [resolutionSteps, setResolutionSteps] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!resolutionSteps.trim()) {
      setError('Resolution steps are required to resolve a ticket');
      return;
    }
    
    setError('');
    onResolve(resolutionSteps.trim());
  };

  const handleClose = () => {
    setResolutionSteps('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Resolve Ticket</span>
          </DialogTitle>
          <DialogDescription>
            Please provide detailed steps on how you resolved this ticket: <strong>{ticketTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resolutionSteps">Resolution Steps *</Label>
            <Textarea
              id="resolutionSteps"
              placeholder="Describe the steps you took to resolve this issue:&#10;&#10;1. Identified the problem...&#10;2. Applied the following solution...&#10;3. Tested the fix...&#10;4. Verified with the user..."
              value={resolutionSteps}
              onChange={(e) => {
                setResolutionSteps(e.target.value);
                if (error) setError('');
              }}
              rows={8}
              className="resize-none"
            />
            <p className="text-sm text-gray-600">
              These steps will be included in the ticket history and PDF exports for future reference.
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Resolving...' : 'Resolve Ticket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};