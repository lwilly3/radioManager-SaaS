import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { useAuthStore } from '../../store/useAuthStore';
import type { ShowPlan, ShowSegment, Guest, Presenter } from '../../types';

/**
 * Génère un document PDF à partir d'un conducteur radio
 * @param showPlan Données du conducteur à exporter
 * @returns Le PDF généré sous forme de blob
 */
export const generateShowPlanPDF = (showPlan: ShowPlan): Blob => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

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

  // En-tête principal
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text('RADIO AUDACE', 105, 15, { align: 'center' });
  doc.setFontSize(18);
  doc.text('CONDUCTEUR RADIO', 105, 25, { align: 'center' });

  // Informations générales
  const date = new Date(showPlan.date);
  const formattedDate = format(date, 'EEEE d MMMM yyyy', { locale: fr });
  const formattedTime = format(date, 'HH:mm', { locale: fr });
  const totalDuration = showPlan.segments.reduce((acc, s) => acc + s.duration, 0);
  const endTime = new Date(date.getTime() + totalDuration * 60000);
  const formattedEndTime = format(endTime, 'HH:mm', { locale: fr });
  const statusLabel = getStatusLabel(showPlan.status);
  const statusColor = getStatusColor(showPlan.status);

  let yPos = 35;
  doc.setFontSize(14);
  doc.text(`Émission : ${showPlan.emission}`, 20, yPos);
  yPos += 7;

  // Affichage dynamique du thème (titre) centré avec coupure de ligne automatique
  if (showPlan.title && showPlan.title !== showPlan.emission) {
    doc.setFontSize(13);
    const themeLines = doc.splitTextToSize(`Thème : ${showPlan.title}`, 170);
    doc.text(themeLines, 105, yPos, { align: 'center' });
    yPos += themeLines.length * 6 + 2;
  }

  // Informations temporelles
  doc.setFontSize(13);
  doc.text(`Date : ${formattedDate}`, 20, yPos);
  yPos += 6;
  doc.text(`Horaire : ${formattedTime} - ${formattedEndTime}`, 20, yPos);
  yPos += 6;
  doc.text(`Durée totale : ${totalDuration} minutes`, 20, yPos);
  yPos += 6;
  doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
  doc.text(`Statut : ${statusLabel}`, 20, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 10;

  // Description de l'émission
  if (showPlan.description) {
    doc.setFontSize(12);
    doc.text('Description :', 20, yPos);
    yPos += 6;
    const splitDescription = doc.splitTextToSize(showPlan.description, 170);
    doc.text(splitDescription, 20, yPos);
    yPos += splitDescription.length * 6 + 4;
  }

  // Présentateurs (seulement s'ils existent)
  if (showPlan.presenters && showPlan.presenters.length > 0) {
    doc.setFontSize(14);
    doc.text('Présentateurs :', 20, yPos);
    yPos += 6;
    doc.setFontSize(12);
    const main = showPlan.presenters.find(p => p.isMainPresenter);
    if (main) {
      doc.setFont('helvetica', 'bold');
      doc.text(`${main.name} (Principal)`, 25, yPos);
      yPos += 6;
    }
    doc.setFont('helvetica', 'normal');
    showPlan.presenters.filter(p => !p.isMainPresenter).forEach(p => {
      doc.text(p.name, 25, yPos);
      yPos += 6;
    });
    yPos += 4;
  }

  // Invités (seulement s'ils existent)
  if (showPlan.guests && showPlan.guests.length > 0) {
    doc.setFontSize(14);
    doc.text('Invités :', 20, yPos);
    yPos += 6;
    doc.setFontSize(12);
    const uniqueGuests = Array.from(new Map(showPlan.guests.map(g => [g.name + g.role, g])).values());
    uniqueGuests.forEach(g => {
      doc.setFont('helvetica', 'bold');
      doc.text(g.name, 25, yPos);
      doc.setFont('helvetica', 'normal');
      if (g.role) doc.text(getGuestRoleLabel(g.role), 80, yPos);
      yPos += 6;
    });
    yPos += 4;
  }

  // Table des segments
  doc.setFontSize(14);
  doc.text('Segments :', 20, yPos);
  yPos += 5;

  const tableData = showPlan.segments.map((s, i) => [
    String(i + 1).padStart(2, '0'),
    s.title,
    getSegmentTypeLabel(s.type),
    `${s.duration} min`,
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
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 15 },
      4: { cellWidth: 50 },
      5: { cellWidth: 40 },
    },
  });

  // Pied de page avec pagination et informations utilisateur
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${i} sur ${pageCount}`, 105, doc.internal.pageSize.height - 15, { align: 'center' });
    
    // Date de génération et nom de l'utilisateur
    const generationDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr });
    doc.text(`Généré le ${generationDate} par ${userName} - Radio Audace`, 105, doc.internal.pageSize.height - 5, { align: 'center' });
  }

  return doc.output('blob');
};

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
    'attente-diffusion': 'En attente de diffusion',
    'en-cours': 'En cours',
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
    preparation: { r: 252, g: 211, b: 77 }, // Yellow
    'attente-diffusion': { r: 249, g: 115, b: 22 }, // Orange
    'en-cours': { r: 239, g: 68, b: 68 }, // Red
    termine: { r: 52, g: 211, b: 153 }, // Green
    archive: { r: 156, g: 163, b: 175 }, // Gray
  };
  return map[status] || { r: 0, g: 0, b: 0 }; // Default black
};