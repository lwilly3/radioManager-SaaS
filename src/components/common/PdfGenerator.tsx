import React from 'react';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateShowPlanPDF, generateArchivePDF } from '../../utils/pdf';
import type { ShowPlan } from '../../types';

interface PdfGeneratorProps {
  data: ShowPlan | ShowPlan[];
  type: 'showPlan' | 'archive';
  buttonText?: string;
  className?: string;
  filters?: Record<string, any>;
  totalCount?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PdfGenerator: React.FC<PdfGeneratorProps> = ({
  data,
  type,
  buttonText = 'Exporter en PDF',
  className = 'w-full btn btn-primary flex items-center justify-center gap-2',
  filters = {},
  totalCount = 1,
  onSuccess,
  onError
}) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      
      let pdfBlob: Blob;
      let fileName: string;
      
      if (type === 'showPlan') {
        // For single show plan export
        const showPlan = Array.isArray(data) ? data[0] : data;
        pdfBlob = generateShowPlanPDF(showPlan);
        
        // Create a filename with the show title and date
        const date = new Date(showPlan.date);
        const formattedDate = format(date, 'yyyy-MM-dd', { locale: fr });
        fileName = `conducteur_${showPlan.emission.replace(/\s+/g, '_')}_${formattedDate}.pdf`;
      } else {
        // For archives export
        pdfBlob = generateArchivePDF(data, filters, totalCount);
        
        // Create a filename with the current date
        const date = new Date();
        const formattedDate = format(date, 'yyyy-MM-dd', { locale: fr });
        fileName = `archives_${formattedDate}.pdf`;
      }
      
      // Create a download link for the blob
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      if (onError) onError(error.message || 'Une erreur est survenue lors de l\'export du PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExportPDF}
      disabled={isExporting}
      className={className}
      title="Exporter en PDF"
    >
      <Download className="h-4 w-4" />
      {buttonText && (isExporting ? 'Export en cours...' : buttonText)}
    </button>
  );
};

export default PdfGenerator;