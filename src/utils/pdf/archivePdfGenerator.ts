import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Presenter {
  id: number;
  name: string;
  contact_info: string | null;
  biography: string | null;
  isMainPresenter: boolean;
}

interface Show {
  id: string;
  emission: string;
  title: string;
  broadcast_date: string;
  duration: number;
  presenters: Presenter[];
  status: string;
  description?: string;
  guests?: { id: number; name: string; role: string; avatar?: string | null }[];
  segments?: {
    id: number;
    title: string;
    type: string;
    duration: number;
    description?: string;
    guests?: {
      id: number;
      name: string;
      role: string;
      avatar?: string | null;
    }[];
    technical_notes?: string | null;
  }[];
}

interface SearchFilters {
  keywords?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  presenter?: number;
  guest?: number[];
}

export const generateArchivePDF = (
  shows: Show | Show[],
  filters: SearchFilters = {},
  total: number = 1
): Blob => {
  // Ensure shows is always an array
  const showsArray = Array.isArray(shows) ? shows : [shows];
  
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(22);
  doc.text('ARCHIVES RADIO AUDACE', 105, 20, { align: 'center' });
  
  // Add search criteria if this is a multi-show export
  if (Array.isArray(shows) && shows.length > 1) {
    doc.setFontSize(12);
    let criteriaText = 'Critères de recherche: ';
    if (filters.keywords) criteriaText += `Mots-clés: "${filters.keywords}" `;
    if (filters.dateFrom) criteriaText += `Du: ${filters.dateFrom} `;
    if (filters.dateTo) criteriaText += `Au: ${filters.dateTo} `;
    if (filters.status) criteriaText += `Statut: ${filters.status} `;
    
    const splitCriteria = doc.splitTextToSize(criteriaText, 180);
    doc.text(splitCriteria, 15, 30);
    
    // Add date of export
    const exportDate = format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr });
    doc.text(`Exporté le: ${exportDate}`, 15, 40);
    
    // Add total count
    doc.text(`Nombre total d'archives: ${total}`, 15, 50);
    
    // Add table of archives
    const tableData = showsArray.map((show: Show) => [
      show.id,
      show.emission,
      show.title,
      format(new Date(show.broadcast_date), 'dd/MM/yyyy HH:mm', { locale: fr }),
      `${show.duration} min`,
      show.presenters.map(p => p.name).join(', '),
      show.status
    ]);
    
    autoTable(doc, {
      startY: 60,
      head: [['ID', 'Émission', 'Titre', 'Date', 'Durée', 'Présentateurs', 'Statut']],
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
    });
  } else if (showsArray.length === 1) {
    // Detailed export for a single show
    const show = showsArray[0];
    
    // Add show title and emission
    doc.setFontSize(18);
    doc.text(show.emission, 105, 35, { align: 'center' });
    doc.setFontSize(16);
    doc.text(show.title, 105, 45, { align: 'center' });
    
    // Add broadcast date and status
    doc.setFontSize(12);
    const broadcastDate = format(new Date(show.broadcast_date), 'dd MMMM yyyy à HH:mm', { locale: fr });
    doc.text(`Date de diffusion: ${broadcastDate}`, 15, 60);
    doc.text(`Durée: ${show.duration} minutes`, 15, 70);
    doc.text(`Statut: ${show.status}`, 15, 80);
    
    // Add description if available
    let yPos = 90;
    if (show.description) {
      doc.text('Description:', 15, yPos);
      const descriptionLines = doc.splitTextToSize(show.description, 180);
      doc.text(descriptionLines, 15, yPos + 8);
      yPos += 8 + (descriptionLines.length * 7);
    }
    
    // Add presenters section
    yPos += 10;
    doc.setFontSize(14);
    doc.text('Présentateurs', 15, yPos);
    yPos += 8;
    
    if (show.presenters && show.presenters.length > 0) {
      doc.setFontSize(12);
      show.presenters.forEach(presenter => {
        const presenterText = presenter.isMainPresenter 
          ? `${presenter.name} (Principal)` 
          : presenter.name;
        doc.text(presenterText, 15, yPos);
        yPos += 7;
        
        if (presenter.biography) {
          const bioLines = doc.splitTextToSize(`Bio: ${presenter.biography}`, 180);
          doc.setFontSize(10);
          doc.text(bioLines, 20, yPos);
          yPos += (bioLines.length * 5) + 5;
          doc.setFontSize(12);
        }
      });
    } else {
      doc.text('Aucun présentateur', 15, yPos);
      yPos += 7;
    }
    
    // Add guests section if available
    if (show.guests && show.guests.length > 0) {
      yPos += 10;
      doc.setFontSize(14);
      doc.text('Invités', 15, yPos);
      yPos += 8;
      
      doc.setFontSize(12);
      show.guests.forEach(guest => {
        doc.text(`${guest.name} (${guest.role})`, 15, yPos);
        yPos += 7;
      });
    }
    
    // Add segments section
    if (show.segments && show.segments.length > 0) {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 10;
      }
      
      doc.setFontSize(14);
      doc.text('Segments', 15, yPos);
      yPos += 10;
      
      // Create segments table
      const segmentTableData = show.segments.map((segment, index) => {
        const segmentGuests = segment.guests 
          ? segment.guests.map(g => g.name).join(', ') 
          : '-';
          
        return [
          String(index + 1),
          segment.title,
          segment.type,
          `${segment.duration} min`,
          segment.description || '-',
          segmentGuests
        ];
      });
      
      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Titre', 'Type', 'Durée', 'Description', 'Invités']],
        body: segmentTableData,
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
      });
      
      // Add detailed segment information
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.text('Détails des segments', 15, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      show.segments.forEach((segment, index) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPos - 5, 180, 10, 'F');
        doc.text(`${index + 1}. ${segment.title} (${segment.type}, ${segment.duration} min)`, 15, yPos);
        yPos += 10;
        
        if (segment.description) {
          const descLines = doc.splitTextToSize(`Description: ${segment.description}`, 170);
          doc.text(descLines, 20, yPos);
          yPos += (descLines.length * 7);
        }
        
        if (segment.technical_notes) {
          const techLines = doc.splitTextToSize(`Notes techniques: ${segment.technical_notes}`, 170);
          doc.text(techLines, 20, yPos);
          yPos += (techLines.length * 7);
        }
        
        if (segment.guests && segment.guests.length > 0) {
          doc.text('Invités du segment:', 20, yPos);
          yPos += 7;
          
          segment.guests.forEach(guest => {
            doc.text(`- ${guest.name} (${guest.role})`, 25, yPos);
            yPos += 7;
          });
        }
        
        yPos += 5; // Add some space between segments
      });
    }
  }

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

  return doc.output('blob');
};