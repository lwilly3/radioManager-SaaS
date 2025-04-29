import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import type { ShowPlan, ShowSegment, Guest, Presenter } from '../../types';

/**
 * Generates a PDF document for a show plan
 * @param showPlan The show plan data to export
 * @returns The generated PDF document as a Blob
 */
export const generateShowPlanPDF = (showPlan: ShowPlan): Blob => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set document properties
  doc.setProperties({
    title: `Conducteur - ${showPlan.title || showPlan.emission}`,
    subject: 'Conducteur Radio',
    author: 'RadioManager',
    creator: 'RadioManager',
  });

  // Add header with logo and title
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text('RADIO AUDACE', 105, 15, { align: 'center' });
  doc.setFontSize(18);
  doc.text('CONDUCTEUR RADIO', 105, 25, { align: 'center' });

  // Add show information
  doc.setFontSize(16);
  doc.text(showPlan.emission, 105, 35, { align: 'center' });
  
  if (showPlan.title && showPlan.title !== showPlan.emission) {
    doc.setFontSize(14);
    doc.text(showPlan.title, 105, 43, { align: 'center' });
  }

  // Format date
  const date = new Date(showPlan.date);
  const formattedDate = format(date, 'EEEE d MMMM yyyy', { locale: fr });
  const formattedTime = format(date, 'HH:mm', { locale: fr });
  
  // Calculate end time
  const totalDuration = showPlan.segments.reduce(
    (acc, segment) => acc + segment.duration,
    0
  );
  const endTime = new Date(date.getTime() + totalDuration * 60000);
  const formattedEndTime = format(endTime, 'HH:mm', { locale: fr });

  // Add date and time
  doc.setFontSize(12);
  doc.text(`Date: ${formattedDate}`, 20, 55);
  doc.text(`Horaire: ${formattedTime} - ${formattedEndTime}`, 20, 63);
  doc.text(`Durée totale: ${totalDuration} minutes`, 20, 71);

  // Add status with color
  const statusColor = getStatusColor(showPlan.status);
  doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
  doc.setFontSize(12);
  doc.text(`Statut: ${getStatusLabel(showPlan.status)}`, 20, 79);
  doc.setTextColor(0, 0, 0); // Reset text color

  // Add description if available
  if (showPlan.description) {
    doc.setFontSize(11);
    doc.text('Description:', 20, 90);
    
    const splitDescription = doc.splitTextToSize(showPlan.description, 170);
    doc.text(splitDescription, 20, 97);
  }

  // Add presenters section
  const yPos = showPlan.description ? 115 : 90;
  addPresentersSection(doc, showPlan.presenters, yPos);

  // Add guests section if there are guests
  let currentY = yPos + 25;
  if (showPlan.guests && showPlan.guests.length > 0) {
    currentY = addGuestsSection(doc, showPlan.guests, currentY);
  }

  // Add segments table
  currentY += 10;
  addSegmentsTable(doc, showPlan.segments, currentY);

  // Add footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    
    // Add generation date in footer
    const generationDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr });
    doc.text(
      `Généré le ${generationDate} - Radio Audace`,
      105,
      doc.internal.pageSize.height - 5,
      { align: 'center' }
    );
  }

  // Return the PDF as a blob
  return doc.output('blob');
};

/**
 * Adds the presenters section to the PDF
 */
const addPresentersSection = (doc: jsPDF, presenters: Presenter[], yPos: number): void => {
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Présentateurs', 20, yPos);
  
  doc.setFontSize(11);
  
  if (!presenters || presenters.length === 0) {
    doc.text('Aucun présentateur assigné', 20, yPos + 8);
    return;
  }
  
  // Find main presenter
  const mainPresenter = presenters.find(p => p.isMainPresenter);
  const otherPresenters = presenters.filter(p => !p.isMainPresenter);
  
  let presenterY = yPos + 8;
  
  if (mainPresenter) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${mainPresenter.name} (Principal)`, 20, presenterY);
    presenterY += 6;
  }
  
  doc.setFont('helvetica', 'normal');
  otherPresenters.forEach(presenter => {
    doc.text(presenter.name, 20, presenterY);
    presenterY += 6;
  });
};

/**
 * Adds the guests section to the PDF
 */
const addGuestsSection = (doc: jsPDF, guests: Guest[], yPos: number): number => {
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Invités', 20, yPos);
  
  doc.setFontSize(11);
  
  let guestY = yPos + 8;
  
  guests.forEach(guest => {
    doc.setFont('helvetica', 'bold');
    doc.text(guest.name, 20, guestY);
    doc.setFont('helvetica', 'normal');
    
    // Add role if available
    if (guest.role) {
      doc.text(getGuestRoleLabel(guest.role), 80, guestY);
    }
    
    guestY += 6;
  });
  
  return guestY;
};

/**
 * Adds the segments table to the PDF
 */
const addSegmentsTable = (doc: jsPDF, segments: ShowSegment[], yPos: number): void => {
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Segments', 20, yPos);
  
  // Prepare table data
  const tableData = segments.map((segment, index) => {
    const segmentGuests = segment.guests && segment.guests.length > 0 
      ? segment.guests.join(', ') 
      : '-';
      
    return [
      String(index + 1).padStart(2, '0'),
      segment.title,
      getSegmentTypeLabel(segment.type),
      `${segment.duration} min`,
      segment.description || '-',
      segmentGuests
    ];
  });
  
  // Add table
  autoTable(doc, {
    startY: yPos + 5,
    head: [['#', 'Titre', 'Type', 'Durée', 'Description', 'Invités']],
    body: tableData,
    headStyles: {
      fillColor: [63, 81, 181],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 15 },
      4: { cellWidth: 50 },
      5: { cellWidth: 40 },
    },
  });
};

/**
 * Gets a human-readable label for a segment type
 */
const getSegmentTypeLabel = (type: string): string => {
  const typeLabels: Record<string, string> = {
    intro: 'Introduction',
    interview: 'Interview',
    music: 'Musique',
    ad: 'Publicité',
    outro: 'Conclusion',
    other: 'Autre',
  };
  
  return typeLabels[type] || type;
};

/**
 * Gets a human-readable label for a guest role
 */
const getGuestRoleLabel = (role: string): string => {
  const roleLabels: Record<string, string> = {
    journalist: 'Journaliste',
    expert: 'Expert',
    artist: 'Artiste',
    politician: 'Politique',
    athlete: 'Athlète',
    writer: 'Écrivain',
    scientist: 'Scientifique',
    other: 'Autre',
  };
  
  return roleLabels[role] || role;
};

/**
 * Gets a human-readable label for a show status
 */
const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    preparation: 'En préparation',
    'attente-diffusion': 'En attente de diffusion',
    'en-cours': 'En cours',
    termine: 'Terminé',
    archive: 'Archivé',
  };
  
  return statusLabels[status] || status;
};

/**
 * Gets RGB color values for a status
 */
const getStatusColor = (status: string): { r: number, g: number, b: number } => {
  const statusColors: Record<string, { r: number, g: number, b: number }> = {
    preparation: { r: 252, g: 211, b: 77 }, // Yellow
    'attente-diffusion': { r: 249, g: 115, b: 22 }, // Orange
    'en-cours': { r: 239, g: 68, b: 68 }, // Red
    termine: { r: 52, g: 211, b: 153 }, // Green
    archive: { r: 156, g: 163, b: 175 }, // Gray
  };
  
  return statusColors[status] || { r: 0, g: 0, b: 0 }; // Default black
};