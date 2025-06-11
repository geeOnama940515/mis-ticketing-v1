"use client";

import jsPDF from 'jspdf';
import { Ticket } from '@/types';
import { format } from 'date-fns';

export const exportTicketToPDF = (ticket: Ticket) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };

  // Helper function to add a section
  const addSection = (title: string, content: string, currentY: number) => {
    // Add title
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, currentY);
    currentY += lineHeight + 2;

    // Add content
    pdf.setFont('helvetica', 'normal');
    if (content) {
      currentY = addWrappedText(content, margin, currentY, pageWidth - (margin * 2), 10);
    } else {
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Not provided', margin, currentY);
      pdf.setTextColor(0, 0, 0);
      currentY += lineHeight;
    }
    
    return currentY + 5;
  };

  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('IT Support Ticket Report', margin, yPosition);
  yPosition += 15;

  // Ticket ID and Status
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Ticket #${ticket.id.split('-')[1]}`, margin, yPosition);
  
  // Status badge
  const statusX = pageWidth - margin - 40;
  pdf.setFillColor(220, 220, 220);
  pdf.rect(statusX - 5, yPosition - 5, 45, 10, 'F');
  pdf.setFontSize(10);
  pdf.text(ticket.status.toUpperCase().replace('_', ' '), statusX, yPosition);
  yPosition += 20;

  // Basic Information
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Ticket Information', margin, yPosition);
  yPosition += lineHeight + 2;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const infoItems = [
    ['Title:', ticket.title],
    ['Category:', ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)],
    ['Priority:', ticket.priority.toUpperCase()],
    ['Created By:', ticket.createdByName],
    ['Created Date:', format(new Date(ticket.createdAt), 'PPP p')],
    ['Last Updated:', format(new Date(ticket.updatedAt), 'PPP p')],
    ['Assigned To:', ticket.assignedToName || 'Unassigned'],
  ];

  if (ticket.status === 'resolved' && ticket.resolvedByName) {
    infoItems.push(['Resolved By:', ticket.resolvedByName]);
    if (ticket.resolvedAt) {
      infoItems.push(['Resolved Date:', format(new Date(ticket.resolvedAt), 'PPP p')]);
    }
  }

  infoItems.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, margin + 35, yPosition);
    yPosition += lineHeight;
  });

  yPosition += 10;

  // Check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Problem Description
  checkNewPage(30);
  yPosition = addSection('Problem Description', ticket.description, yPosition);

  // Reproduction Steps
  if (ticket.reproductionSteps) {
    checkNewPage(30);
    yPosition = addSection('How to Reproduce', ticket.reproductionSteps, yPosition);
  }

  // Resolution Steps
  if (ticket.resolutionSteps && ticket.status === 'resolved') {
    checkNewPage(30);
    yPosition = addSection('Resolution Steps', ticket.resolutionSteps, yPosition);
  }

  // Comments
  if (ticket.comments.length > 0) {
    checkNewPage(40);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Comments (${ticket.comments.length})`, margin, yPosition);
    yPosition += lineHeight + 5;

    ticket.comments.forEach((comment, index) => {
      checkNewPage(25);
      
      // Comment header
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${comment.userName}`, margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(128, 128, 128);
      pdf.text(format(new Date(comment.createdAt), 'PPP p'), margin + 60, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += lineHeight + 2;

      // Comment content
      yPosition = addWrappedText(comment.content, margin + 5, yPosition, pageWidth - (margin * 2) - 5, 9);
      yPosition += 5;

      // Add separator line if not last comment
      if (index < ticket.comments.length - 1) {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      }
    });
  }

  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Generated on ${format(new Date(), 'PPP p')} - Page ${i} of ${pageCount}`,
      margin,
      pdf.internal.pageSize.getHeight() - 10
    );
  }

  // Save the PDF
  const fileName = `ticket-${ticket.id.split('-')[1]}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  pdf.save(fileName);
};