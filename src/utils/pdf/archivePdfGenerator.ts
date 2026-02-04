import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuthStore } from '../../store/useAuthStore';
import type { PdfTemplateId, PdfOrientation } from './pdfTemplates';

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

export interface ArchivePdfOptions {
  template?: PdfTemplateId;
  orientation?: PdfOrientation;
}

export const generateArchivePDF = (
  shows: Show | Show[],
  filters: SearchFilters = {},
  total: number = 1,
  options: ArchivePdfOptions = {}
): Blob => {
  const { template = 'professional', orientation } = options;
  const showsArray = Array.isArray(shows) ? shows : [shows];
  
  if (template === 'classic') {
    return generateClassicArchivePDF(showsArray, filters, total, orientation || 'portrait');
  } else {
    return generateProfessionalArchivePDF(showsArray, filters, total, orientation || 'landscape');
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE CLASSIQUE
// ═══════════════════════════════════════════════════════════════════════════

const generateClassicArchivePDF = (
  shows: Show[],
  filters: SearchFilters,
  total: number,
  orientation: PdfOrientation
): Blob => {
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  // Récupérer les informations de l'utilisateur connecté
  const user = useAuthStore.getState().user;
  const userName = user ? `${user.name} ${user.family_name}` : 'Utilisateur';

  // Titre principal
  doc.setFontSize(22);
  doc.text('ARCHIVES RADIO AUDACE', pageWidth / 2, 20, { align: 'center' });

  // Si plusieurs archives, afficher les filtres et tableau récapitulatif
  if (shows.length > 1) {
    doc.setFontSize(12);
    let criteriaText = 'Critères de recherche: ';
    if (filters.keywords) criteriaText += `Mots-clés: "${filters.keywords}" `;
    if (filters.dateFrom) criteriaText += `Du: ${filters.dateFrom} `;
    if (filters.dateTo) criteriaText += `Au: ${filters.dateTo} `;
    if (filters.status) criteriaText += `Statut: ${filters.status} `;

    const splitCriteria = doc.splitTextToSize(criteriaText, pageWidth - (margin * 2));
    doc.text(splitCriteria, margin, 30);

    const exportDate = format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr });
    doc.text(`Exporté le: ${exportDate}`, margin, 40);
    doc.text(`Nombre total d'archives: ${total}`, margin, 50);

    const tableData = shows.map((show: Show) => [
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
      headStyles: { fillColor: [63, 81, 181], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      styles: { fontSize: 10, cellPadding: 3 },
      margin: { left: margin, right: margin },
    });
  } else {
    // Détail d'une archive unique
    const show = shows[0];
    doc.setFontSize(18);
    doc.text(show.emission, pageWidth / 2, 35, { align: 'center' });
    doc.setFontSize(16);
    const titleLines = doc.splitTextToSize(show.title, pageWidth - (margin * 2));
    doc.text(titleLines, pageWidth / 2, 45, { align: 'center' });

    doc.setFontSize(12);
    const broadcastDate = format(new Date(show.broadcast_date), 'dd MMMM yyyy à HH:mm', { locale: fr });
    doc.text(`Date de diffusion: ${broadcastDate}`, margin, 60);
    doc.text(`Durée: ${show.duration} minutes`, margin, 70);
    doc.text(`Statut: ${show.status}`, margin, 80);

    let yPos = 90;
    if (show.description) {
      doc.text('Description:', margin, yPos);
      const descriptionLines = doc.splitTextToSize(show.description, pageWidth - (margin * 2));
      doc.text(descriptionLines, margin, yPos + 8);
      yPos += 8 + (descriptionLines.length * 7);
    }

    yPos += 10;
    doc.setFontSize(14);
    doc.text('Présentateurs', margin, yPos);
    yPos += 8;

    if (show.presenters?.length) {
      doc.setFontSize(12);
      show.presenters.forEach(p => {
        const text = p.isMainPresenter ? `${p.name} (Principal)` : p.name;
        doc.text(text, margin, yPos);
        yPos += 7;
      });
    } else {
      doc.text('Aucun présentateur', margin, yPos);
      yPos += 7;
    }

    if (show.guests?.length) {
      yPos += 10;
      doc.setFontSize(14);
      doc.text('Invités', margin, yPos);
      yPos += 8;

      doc.setFontSize(12);
      show.guests.forEach(g => {
        doc.text(`${g.name} (${g.role})`, margin, yPos);
        yPos += 7;
      });
    }

    if (show.segments?.length) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 10;
      }

      doc.setFontSize(14);
      doc.text('Segments', margin, yPos);
      yPos += 10;

      const segmentTableData = show.segments.map((segment, index) => [
        String(index + 1),
        segment.title,
        segment.type,
        `${segment.duration} min`,
        segment.description || '-',
        segment.guests?.map(g => g.name).join(', ') || '-'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Titre', 'Type', 'Durée', 'Description', 'Invités']],
        body: segmentTableData,
        headStyles: { fillColor: [63, 81, 181], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        styles: { fontSize: 10, cellPadding: 3 },
        margin: { left: margin, right: margin },
      });
    }
  }

  // Pied de page avec pagination et informations utilisateur
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${i} sur ${pageCount}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
    
    const generationDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr });
    doc.text(`Généré le ${generationDate} par ${userName} - Radio Audace`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  return doc.output('blob');
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE PROFESSIONNEL
// ═══════════════════════════════════════════════════════════════════════════

const generateProfessionalArchivePDF = (
  shows: Show[],
  filters: SearchFilters,
  total: number,
  orientation: PdfOrientation
): Blob => {
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Récupérer les informations de l'utilisateur connecté
  const user = useAuthStore.getState().user;
  const userName = user ? `${user.name} ${user.family_name}` : 'Utilisateur';

  // ═══════════════════════════════════════════════════════════════════
  // EN-TÊTE PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════
  
  // Cadre d'en-tête
  doc.setDrawColor(63, 81, 181);
  doc.setLineWidth(0.5);
  doc.rect(margin, 10, contentWidth, 25);
  
  // Logo / Nom de la radio
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(63, 81, 181);
  doc.text('RADIO AUDACE', margin + 10, 22);
  
  // Type de document
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('ARCHIVES', margin + 10, 30);
  
  // Badge nombre d'archives
  doc.setFillColor(99, 102, 241);
  doc.roundedRect(pageWidth - margin - 50, 15, 45, 15, 3, 3, 'F');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`${total} archive${total > 1 ? 's' : ''}`, pageWidth - margin - 27, 24, { align: 'center' });

  let yPos = 45;

  // ═══════════════════════════════════════════════════════════════════
  // FILTRES DE RECHERCHE (si plusieurs archives)
  // ═══════════════════════════════════════════════════════════════════
  
  if (shows.length > 1) {
    // Afficher les critères de recherche
    const hasFilters = filters.keywords || filters.dateFrom || filters.dateTo || filters.status;
    
    if (hasFilters) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text('Critères de recherche :', margin, yPos);
      
      doc.setFont('helvetica', 'normal');
      let filterX = margin + 45;
      
      if (filters.keywords) {
        doc.text(`"${filters.keywords}"`, filterX, yPos);
        filterX += doc.getTextWidth(`"${filters.keywords}"`) + 10;
      }
      if (filters.dateFrom || filters.dateTo) {
        const dateRange = `${filters.dateFrom || '...'} → ${filters.dateTo || '...'}`;
        doc.text(dateRange, filterX, yPos);
        filterX += doc.getTextWidth(dateRange) + 10;
      }
      if (filters.status) {
        doc.setFillColor(200, 200, 200);
        doc.roundedRect(filterX, yPos - 4, doc.getTextWidth(filters.status) + 6, 6, 2, 2, 'F');
        doc.text(filters.status, filterX + 3, yPos);
      }
      yPos += 8;
    }

    // Date d'export
    const exportDate = format(new Date(), 'EEEE d MMMM yyyy à HH:mm', { locale: fr });
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Exporté le ${exportDate}`, margin, yPos);
    yPos += 10;

    // ═══════════════════════════════════════════════════════════════════
    // STATISTIQUES
    // ═══════════════════════════════════════════════════════════════════
    
    const totalDuration = shows.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalSegments = shows.reduce((acc, s) => acc + (s.segments?.length || 0), 0);
    const uniquePresenters = new Set(shows.flatMap(s => s.presenters.map(p => p.name)));
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    // Stats en ligne
    const stats = [
      `${shows.length} émission${shows.length > 1 ? 's' : ''}`,
      `${totalDuration} min totales`,
      `${totalSegments} segment${totalSegments > 1 ? 's' : ''}`,
      `${uniquePresenters.size} présentateur${uniquePresenters.size > 1 ? 's' : ''}`,
    ];
    
    const statSpacing = contentWidth / stats.length;
    stats.forEach((stat, i) => {
      doc.setFont('helvetica', 'bold');
      const [num, label] = stat.split(' ');
      doc.text(num, margin + (i * statSpacing) + (statSpacing / 2) - 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(` ${label}`, margin + (i * statSpacing) + (statSpacing / 2) - 15 + doc.getTextWidth(num), yPos);
    });
    yPos += 10;

    // ═══════════════════════════════════════════════════════════════════
    // TABLEAU DES ARCHIVES
    // ═══════════════════════════════════════════════════════════════════
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(63, 81, 181);
    doc.text('LISTE DES ARCHIVES', margin, yPos);
    yPos += 5;

    const tableData = shows.map((show: Show) => {
      const date = format(new Date(show.broadcast_date), 'dd/MM/yyyy', { locale: fr });
      const time = format(new Date(show.broadcast_date), 'HH:mm', { locale: fr });
      return [
        date,
        time,
        show.emission,
        show.title.length > 40 ? show.title.substring(0, 40) + '...' : show.title,
        `${show.duration} min`,
        show.presenters.slice(0, 2).map(p => p.name).join(', ') + (show.presenters.length > 2 ? '...' : ''),
        getStatusLabel(show.status),
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Heure', 'Émission', 'Titre', 'Durée', 'Présentateurs', 'Statut']],
      body: tableData,
      headStyles: { 
        fillColor: [63, 81, 181], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 22, halign: 'center' },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 35 },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 40 },
        6: { cellWidth: 25, halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

  } else {
    // ═══════════════════════════════════════════════════════════════════
    // DÉTAIL D'UNE ARCHIVE UNIQUE
    // ═══════════════════════════════════════════════════════════════════
    
    const show = shows[0];
    const broadcastDate = new Date(show.broadcast_date);
    
    // Titre de l'émission
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(show.emission, margin, yPos);
    
    // Badge de statut
    const statusLabel = getStatusLabel(show.status);
    const statusColor = getStatusColor(show.status);
    doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
    const statusWidth = doc.getTextWidth(statusLabel) + 10;
    doc.roundedRect(pageWidth - margin - statusWidth, yPos - 6, statusWidth, 10, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(statusLabel, pageWidth - margin - statusWidth / 2, yPos - 1, { align: 'center' });
    
    yPos += 8;
    
    // Thème
    if (show.title && show.title !== show.emission) {
      doc.setFontSize(13);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(80, 80, 80);
      const titleLines = doc.splitTextToSize(`Thème : ${show.title}`, contentWidth);
      doc.text(titleLines, margin, yPos);
      yPos += titleLines.length * 5 + 3;
    }
    
    yPos += 5;
    
    // Informations en colonnes
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    const formattedDate = format(broadcastDate, 'EEEE d MMMM yyyy', { locale: fr });
    const formattedTime = format(broadcastDate, 'HH:mm', { locale: fr });
    const endTime = addMinutes(broadcastDate, show.duration);
    const formattedEndTime = format(endTime, 'HH:mm', { locale: fr });
    
    if (orientation === 'landscape') {
      doc.setFont('helvetica', 'bold');
      doc.text('Date :', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(formattedDate, margin + 18, yPos);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Horaires :', margin + 90, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${formattedTime} → ${formattedEndTime} (${show.duration} min)`, margin + 115, yPos);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.text('Date :', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(formattedDate, margin + 18, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Horaires :', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${formattedTime} → ${formattedEndTime} (${show.duration} min)`, margin + 25, yPos);
    }
    
    yPos += 10;

    // Description
    if (show.description) {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(80, 80, 80);
      const splitDescription = doc.splitTextToSize(show.description, contentWidth);
      doc.text(splitDescription, margin, yPos);
      yPos += splitDescription.length * 4 + 5;
    }

    // ═══════════════════════════════════════════════════════════════════
    // ÉQUIPE
    // ═══════════════════════════════════════════════════════════════════
    
    if (show.presenters?.length || show.guests?.length) {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 6;
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      if (show.presenters?.length) {
        doc.setFont('helvetica', 'bold');
        doc.text('Présentateurs : ', margin, yPos);
        doc.setFont('helvetica', 'normal');
        const presenterNames = show.presenters.map(p => 
          p.isMainPresenter ? `${p.name} (principal)` : p.name
        ).join(', ');
        doc.text(presenterNames, margin + 30, yPos);
      }
      
      if (show.guests?.length) {
        const guestStartX = show.presenters?.length ? (orientation === 'landscape' ? margin + 140 : margin) : margin;
        if (show.presenters?.length && orientation === 'portrait') yPos += 6;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Invités : ', guestStartX, yPos);
        doc.setFont('helvetica', 'normal');
        const guestNames = show.guests.map(g => `${g.name} (${g.role})`).join(', ');
        const maxWidth = orientation === 'landscape' ? contentWidth - (guestStartX - margin) - 20 : contentWidth - 20;
        const guestLines = doc.splitTextToSize(guestNames, maxWidth);
        doc.text(guestLines, guestStartX + 18, yPos);
        yPos += (guestLines.length - 1) * 4;
      }
      
      yPos += 10;
    }

    // ═══════════════════════════════════════════════════════════════════
    // SEGMENTS
    // ═══════════════════════════════════════════════════════════════════
    
    if (show.segments?.length) {
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(63, 81, 181);
      doc.text('DÉROULÉ DE L\'ÉMISSION', margin, yPos);
      yPos += 5;

      // Calcul des heures de début
      let currentTime = new Date(broadcastDate);
      const segmentData = show.segments.map((s, i) => {
        const startTimeStr = format(currentTime, 'HH:mm', { locale: fr });
        const row = [
          String(i + 1).padStart(2, '0'),
          startTimeStr,
          s.title || 'Sans titre',
          getSegmentTypeLabel(s.type),
          `${s.duration || 0} min`,
        ];
        currentTime = addMinutes(currentTime, s.duration || 0);
        return row;
      });

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Heure', 'Titre du segment', 'Type', 'Durée']],
        body: segmentData,
        headStyles: { 
          fillColor: [63, 81, 181], 
          textColor: [255, 255, 255], 
          fontStyle: 'bold',
          fontSize: 10,
          cellPadding: 3
        },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { 
          fontSize: 10, 
          cellPadding: 4,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 30, halign: 'center' },
          4: { cellWidth: 20, halign: 'center' },
        },
        margin: { left: margin, right: margin },
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // PIED DE PAGE
  // ═══════════════════════════════════════════════════════════════════
  
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    
    // Pagination
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} / ${pageCount}`, pageWidth / 2, pageHeight - 7, { align: 'center' });
    
    // Date de génération
    const generationDate = format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr });
    doc.text(`Généré le ${generationDate} par ${userName}`, margin, pageHeight - 7);
    
    // Logo/marque à droite
    doc.text('RadioManager', pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  return doc.output('blob');
};

// ═══════════════════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    preparation: 'En préparation',
    'attente-diffusion': 'Attente diffusion',
    'en-cours': 'En direct',
    termine: 'Terminé',
    archive: 'Archivé',
    published: 'Publié',
    draft: 'Brouillon',
  };
  return map[status] || status;
};

const getStatusColor = (status: string): { r: number, g: number, b: number } => {
  const map: Record<string, { r: number, g: number, b: number }> = {
    preparation: { r: 59, g: 130, b: 246 },
    'attente-diffusion': { r: 249, g: 115, b: 22 },
    'en-cours': { r: 239, g: 68, b: 68 },
    termine: { r: 34, g: 197, b: 94 },
    archive: { r: 107, g: 114, b: 128 },
    published: { r: 34, g: 197, b: 94 },
    draft: { r: 156, g: 163, b: 175 },
  };
  return map[status] || { r: 63, g: 81, b: 181 };
};

const getSegmentTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    intro: 'Introduction',
    interview: 'Interview',
    music: 'Musique',
    ad: 'Publicité',
    outro: 'Conclusion',
    jingle: 'Jingle',
    news: 'Actualités',
    weather: 'Météo',
    traffic: 'Info trafic',
    debate: 'Débat',
    chronicle: 'Chronique',
    game: 'Jeu',
    other: 'Autre',
  };
  return map[type] || type;
};