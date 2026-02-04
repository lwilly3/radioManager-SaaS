import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format, addMinutes } from "date-fns";
import { fr } from 'date-fns/locale';
import { useAuthStore } from '../../store/useAuthStore';
import type { ShowPlan } from '../../types';
import type { Quote } from '../../types/quote';
import type { PdfTemplateId, PdfOrientation } from './pdfTemplates';

export type { PdfTemplateId, PdfOrientation };

export interface PdfOptions {
  template?: PdfTemplateId;
  orientation?: PdfOrientation;
  includeQuotes?: boolean;
  quotes?: Quote[];
}

/**
 * Génère un document PDF à partir d'un conducteur radio
 * @param showPlan Données du conducteur à exporter
 * @param options Options de génération (template, orientation, includeQuotes, quotes)
 * @returns Le PDF généré sous forme de blob
 */
export const generateShowPlanPDF = (showPlan: ShowPlan, options: PdfOptions = {}): Blob => {
  const { 
    template = 'professional', 
    orientation,
    includeQuotes = false, 
    quotes = [] 
  } = options;

  // Choisir le générateur selon le template
  if (template === 'classic') {
    return generateClassicPDF(showPlan, orientation || 'portrait', includeQuotes, quotes);
  } else {
    return generateProfessionalPDF(showPlan, orientation || 'landscape', includeQuotes, quotes);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE CLASSIQUE
// ═══════════════════════════════════════════════════════════════════════════

const generateClassicPDF = (
  showPlan: ShowPlan, 
  orientation: PdfOrientation,
  includeQuotes: boolean,
  quotes: Quote[]
): Blob => {
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  // Récupérer les informations de l'utilisateur connecté
  const user = useAuthStore.getState().user;
  const userName = user ? `${user.name} ${user.family_name}` : 'Utilisateur';

  // Définition des propriétés du document
  doc.setProperties({
    title: `Conducteur - ${showPlan.title || showPlan.emission}`,
    subject: 'Conducteur Radio',
    author: 'RadioManager',
    creator: 'RadioManager',
  });

  // En-tête principal centré
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text('RADIO AUDACE', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(18);
  doc.text('CONDUCTEUR RADIO', pageWidth / 2, 30, { align: 'center' });

  // Informations générales
  const date = new Date(showPlan.date);
  const formattedDate = format(date, 'EEEE d MMMM yyyy', { locale: fr });
  const formattedTime = format(date, 'HH:mm', { locale: fr });
  const totalDuration = showPlan.segments?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0;
  const endTime = addMinutes(date, totalDuration);
  const formattedEndTime = format(endTime, 'HH:mm', { locale: fr });
  const statusLabel = getStatusLabel(showPlan.status);
  const statusColor = getStatusColor(showPlan.status);

  let yPos = 40;
  doc.setFontSize(14);
  doc.text(`Émission : ${showPlan.emission || showPlan.title || 'Sans titre'}`, margin, yPos);
  yPos += 7;

  // Affichage dynamique du thème (titre) centré avec coupure de ligne automatique
  if (showPlan.title && showPlan.title !== showPlan.emission) {
    doc.setFontSize(13);
    const themeLines = doc.splitTextToSize(`Thème : ${showPlan.title}`, pageWidth - (margin * 2));
    doc.text(themeLines, pageWidth / 2, yPos, { align: 'center' });
    yPos += themeLines.length * 6 + 2;
  }

  // Informations temporelles
  doc.setFontSize(13);
  doc.text(`Date : ${formattedDate}`, margin, yPos);
  yPos += 6;
  doc.text(`Horaire : ${formattedTime} - ${formattedEndTime}`, margin, yPos);
  yPos += 6;
  doc.text(`Durée totale : ${totalDuration} minutes`, margin, yPos);
  yPos += 6;
  doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
  doc.text(`Statut : ${statusLabel}`, margin, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 10;

  // Description de l'émission
  if (showPlan.description) {
    doc.setFontSize(12);
    doc.text('Description :', margin, yPos);
    yPos += 6;
    const splitDescription = doc.splitTextToSize(showPlan.description, pageWidth - (margin * 2));
    doc.text(splitDescription, margin, yPos);
    yPos += splitDescription.length * 6 + 4;
  }

  // Présentateurs (seulement s'ils existent)
  if (showPlan.presenters && showPlan.presenters.length > 0) {
    doc.setFontSize(14);
    doc.text('Présentateurs :', margin, yPos);
    yPos += 6;
    doc.setFontSize(12);
    const main = showPlan.presenters.find(p => p.isMainPresenter);
    if (main) {
      doc.setFont('helvetica', 'bold');
      doc.text(`${main.name} (Principal)`, margin + 5, yPos);
      yPos += 6;
    }
    doc.setFont('helvetica', 'normal');
    showPlan.presenters.filter(p => !p.isMainPresenter).forEach(p => {
      doc.text(p.name, margin + 5, yPos);
      yPos += 6;
    });
    yPos += 4;
  }

  // Invités (seulement s'ils existent)
  if (showPlan.guests && showPlan.guests.length > 0) {
    doc.setFontSize(14);
    doc.text('Invités :', margin, yPos);
    yPos += 6;
    doc.setFontSize(12);
    const uniqueGuests = Array.from(new Map(showPlan.guests.map(g => [g.name + g.role, g])).values());
    uniqueGuests.forEach(g => {
      doc.setFont('helvetica', 'bold');
      doc.text(g.name, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      if (g.role) doc.text(getGuestRoleLabel(g.role), margin + 60, yPos);
      yPos += 6;
    });
    yPos += 4;
  }

  // Table des segments
  doc.setFontSize(14);
  doc.text('Segments :', margin, yPos);
  yPos += 5;

  const tableData = (showPlan.segments || []).map((s, i) => [
    String(i + 1).padStart(2, '0'),
    s.title || 'Sans titre',
    getSegmentTypeLabel(s.type),
    `${s.duration || 0} min`,
    s.description || '-',
    s.guests?.join(', ') || '-'
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Titre', 'Type', 'Durée', 'Description', 'Invités']],
    body: tableData,
    headStyles: { fillColor: [63, 81, 181], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 35 },
      2: { cellWidth: 22 },
      3: { cellWidth: 15 },
      4: { cellWidth: 45 },
      5: { cellWidth: 35 },
    },
    margin: { left: margin, right: margin },
  });

  // Section citations (si demandé)
  if (includeQuotes && quotes.length > 0) {
    doc.addPage();
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(63, 81, 181);
    doc.text('CITATIONS COLLECTÉES', margin, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${quotes.length} citation(s)`, margin, 27);
    
    const quotesData = quotes.map((q, i) => [
      String(i + 1),
      q.author?.name || 'Inconnu',
      q.content.length > 100 ? q.content.substring(0, 100) + '...' : q.content,
      getQuoteStatusLabel(q.status),
    ]);
    
    autoTable(doc, {
      startY: 32,
      head: [['#', 'Auteur', 'Citation', 'Statut']],
      body: quotesData,
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 30 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 22, halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });
  }

  // Pied de page avec pagination et informations utilisateur
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${i} sur ${pageCount}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
    
    // Date de génération et nom de l'utilisateur
    const generationDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr });
    doc.text(`Généré le ${generationDate} par ${userName} - Radio Audace`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  return doc.output('blob');
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE PROFESSIONNEL
// ═══════════════════════════════════════════════════════════════════════════

const generateProfessionalPDF = (
  showPlan: ShowPlan, 
  orientation: PdfOrientation,
  includeQuotes: boolean,
  quotes: Quote[]
): Blob => {
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Récupérer les informations de l'utilisateur connecté
  const user = useAuthStore.getState().user;
  const userName = user ? `${user.name} ${user.family_name}` : 'Utilisateur';

  // Définition des propriétés du document
  doc.setProperties({
    title: `Conducteur - ${showPlan.title || showPlan.emission}`,
    subject: 'Conducteur Radio',
    author: 'RadioManager',
    creator: 'RadioManager',
  });

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
  doc.text('CONDUCTEUR', margin + 10, 30);
  
  // Statut à droite
  const statusLabel = getStatusLabel(showPlan.status);
  const statusColor = getStatusColor(showPlan.status);
  doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
  doc.roundedRect(pageWidth - margin - 45, 15, 40, 15, 3, 3, 'F');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(statusLabel, pageWidth - margin - 25, 24, { align: 'center' });

  // ═══════════════════════════════════════════════════════════════════
  // INFORMATIONS GÉNÉRALES
  // ═══════════════════════════════════════════════════════════════════
  
  const date = new Date(showPlan.date);
  const formattedDate = format(date, 'EEEE d MMMM yyyy', { locale: fr });
  const formattedTime = format(date, 'HH:mm', { locale: fr });
  const totalDuration = showPlan.segments?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0;
  const endTime = addMinutes(date, totalDuration);
  const formattedEndTime = format(endTime, 'HH:mm', { locale: fr });

  let yPos = 45;
  
  // Titre de l'émission (grand)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const emissionTitle = showPlan.emission || showPlan.title || 'Sans titre';
  doc.text(emissionTitle, margin, yPos);
  
  // Thème (si différent)
  if (showPlan.title && showPlan.title !== showPlan.emission) {
    yPos += 8;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80);
    const themeLines = doc.splitTextToSize(`Thème : ${showPlan.title}`, contentWidth);
    doc.text(themeLines, margin, yPos);
    yPos += themeLines.length * 5;
  }
  
  yPos += 8;
  
  // Informations en colonnes (adapté à l'orientation)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  if (orientation === 'landscape') {
    // Colonne 1 : Date
    doc.setFont('helvetica', 'bold');
    doc.text('Date :', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formattedDate, margin + 20, yPos);
    
    // Colonne 2 : Horaires
    doc.setFont('helvetica', 'bold');
    doc.text('Horaires :', margin + 90, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${formattedTime} → ${formattedEndTime} (${totalDuration} min)`, margin + 115, yPos);
    
    // Colonne 3 : Type d'émission
    if (showPlan.showType) {
      doc.setFont('helvetica', 'bold');
      doc.text('Type :', margin + 200, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(getShowTypeLabel(showPlan.showType), margin + 215, yPos);
    }
  } else {
    // En portrait, on met les infos sur plusieurs lignes
    doc.setFont('helvetica', 'bold');
    doc.text('Date :', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formattedDate, margin + 20, yPos);
    yPos += 6;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Horaires :', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${formattedTime} → ${formattedEndTime} (${totalDuration} min)`, margin + 25, yPos);
    
    if (showPlan.showType) {
      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Type :', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(getShowTypeLabel(showPlan.showType), margin + 18, yPos);
    }
  }
  
  yPos += 8;

  // Description (si présente)
  if (showPlan.description) {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80);
    const splitDescription = doc.splitTextToSize(showPlan.description, contentWidth);
    doc.text(splitDescription, margin, yPos);
    yPos += splitDescription.length * 4 + 3;
  }

  // ═══════════════════════════════════════════════════════════════════
  // ÉQUIPE (Présentateurs + Invités sur une ligne)
  // ═══════════════════════════════════════════════════════════════════
  
  const hasPresenters = showPlan.presenters && showPlan.presenters.length > 0;
  const hasGuests = showPlan.guests && showPlan.guests.length > 0;
  
  if (hasPresenters || hasGuests) {
    yPos += 3;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    
    if (hasPresenters) {
      doc.setFont('helvetica', 'bold');
      doc.text('Présentateurs : ', margin, yPos);
      doc.setFont('helvetica', 'normal');
      const presenterNames = showPlan.presenters!.map(p => 
        p.isMainPresenter ? `${p.name} (principal)` : p.name
      ).join(', ');
      doc.text(presenterNames, margin + 30, yPos);
    }
    
    if (hasGuests) {
      const guestStartX = hasPresenters ? (orientation === 'landscape' ? margin + 140 : margin) : margin;
      if (hasPresenters && orientation === 'portrait') yPos += 6;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Invités : ', guestStartX, yPos);
      doc.setFont('helvetica', 'normal');
      const uniqueGuests = Array.from(new Map(showPlan.guests!.map(g => [g.name, g])).values());
      const guestNames = uniqueGuests.map(g => g.role ? `${g.name} (${getGuestRoleLabel(g.role)})` : g.name).join(', ');
      const maxWidth = orientation === 'landscape' ? contentWidth - (guestStartX - margin) - 20 : contentWidth - 20;
      const guestLines = doc.splitTextToSize(guestNames, maxWidth);
      doc.text(guestLines, guestStartX + 18, yPos);
      yPos += (guestLines.length - 1) * 4;
    }
    
    yPos += 8;
  }

  // ═══════════════════════════════════════════════════════════════════
  // TABLEAU DES SEGMENTS
  // ═══════════════════════════════════════════════════════════════════
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(63, 81, 181);
  doc.text('DÉROULÉ DE L\'ÉMISSION', margin, yPos);
  yPos += 5;

  // Calcul des heures de début pour chaque segment
  let currentTime = new Date(date);
  const segmentData = (showPlan.segments || []).map((s, i) => {
    const startTimeStr = format(currentTime, 'HH:mm', { locale: fr });
    const row = [
      String(i + 1).padStart(2, '0'),
      startTimeStr,
      s.title || 'Sans titre',
      getSegmentTypeLabel(s.type),
      `${s.duration || 0} min`,
    ];
    currentTime = addMinutes(currentTime, s.duration || 0);
    return { row, segment: s };
  });

  // Table principale des segments
  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Heure', 'Titre du segment', 'Type', 'Durée']],
    body: segmentData.map(d => d.row),
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
    didDrawCell: (data) => {
      // Ajouter description et notes techniques sous chaque ligne de segment
      if (data.section === 'body' && data.column.index === 4) {
        const segmentInfo = segmentData[data.row.index];
        const segment = segmentInfo?.segment;
        
        if (segment && (segment.description || segment.technicalNotes)) {
          const cellY = data.cell.y + data.cell.height;
          let noteY = cellY + 2;
          
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          
          if (segment.description) {
            doc.setFont('helvetica', 'italic');
            const descLines = doc.splitTextToSize(`📝 ${segment.description}`, contentWidth - 30);
            doc.text(descLines, margin + 12, noteY);
            noteY += descLines.length * 3.5;
          }
          
          if (segment.technicalNotes) {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(180, 100, 50);
            const techLines = doc.splitTextToSize(`🎛️ ${segment.technicalNotes}`, contentWidth - 30);
            doc.text(techLines, margin + 12, noteY);
          }
        }
      }
    },
    margin: { left: margin, right: margin },
  });

  // ═══════════════════════════════════════════════════════════════════
  // SECTION CITATIONS (optionnelle)
  // ═══════════════════════════════════════════════════════════════════
  
  if (includeQuotes && quotes.length > 0) {
    // Nouvelle page pour les citations
    doc.addPage();
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(63, 81, 181);
    doc.text('CITATIONS COLLECTÉES', margin, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${quotes.length} citation(s) enregistrée(s) pour cette émission`, margin, 27);
    
    const quotesData = quotes.map((q, i) => [
      String(i + 1),
      q.author?.name || 'Inconnu',
      q.content.length > 150 ? q.content.substring(0, 150) + '...' : q.content,
      getQuoteStatusLabel(q.status),
      q.segment?.title || '-'
    ]);
    
    autoTable(doc, {
      startY: 32,
      head: [['#', 'Auteur', 'Citation', 'Statut', 'Segment']],
      body: quotesData,
      headStyles: { 
        fillColor: [99, 102, 241], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 40 },
      },
      margin: { left: margin, right: margin },
    });
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

/**
 * Libellé humain des types de segments
 */
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

/**
 * Libellé humain des rôles invités
 */
const getGuestRoleLabel = (role: string): string => {
  const map: Record<string, string> = {
    journalist: 'Journaliste',
    expert: 'Expert',
    artist: 'Artiste',
    politician: 'Politique',
    athlete: 'Athlète',
    writer: 'Écrivain',
    scientist: 'Scientifique',
    other: 'Autre',
  };
  return map[role] || role;
};

/**
 * Libellé humain des statuts
 */
const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    preparation: 'En préparation',
    'attente-diffusion': 'Attente diffusion',
    'en-cours': 'En direct',
    termine: 'Terminé',
    archive: 'Archivé',
  };
  return map[status] || status;
};

/**
 * Couleur associée au statut
 */
const getStatusColor = (status: string): { r: number, g: number, b: number } => {
  const map: Record<string, { r: number, g: number, b: number }> = {
    preparation: { r: 59, g: 130, b: 246 }, // Blue
    'attente-diffusion': { r: 249, g: 115, b: 22 }, // Orange
    'en-cours': { r: 239, g: 68, b: 68 }, // Red
    termine: { r: 34, g: 197, b: 94 }, // Green
    archive: { r: 107, g: 114, b: 128 }, // Gray
  };
  return map[status] || { r: 63, g: 81, b: 181 }; // Default indigo
};

/**
 * Libellé humain des types d'émission
 */
const getShowTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    live: 'Direct',
    recorded: 'Enregistré',
    replay: 'Rediffusion',
  };
  return map[type] || type;
};

/**
 * Libellé humain des statuts de citation
 */
const getQuoteStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'Brouillon',
    pending: 'En attente',
    approved: 'Validé',
    published: 'Publié',
  };
  return map[status] || status;
};
