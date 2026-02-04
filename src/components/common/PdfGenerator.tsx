import React, { useState, useEffect } from 'react';
import { Download, FileText, Quote, X, Monitor, Smartphone, LayoutTemplate, Sparkles, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateShowPlanPDF, generateArchivePDF } from '../../utils/pdf';
import { useQuotesByShowPlan } from '../../hooks/quotes/useQuotesByShowPlan';
import { usePdfSettings } from '../../hooks/usePdfSettings';
import { PDF_TEMPLATES, ARCHIVE_PDF_TEMPLATES, type PdfTemplateId, type PdfOrientation } from '../../utils/pdf/pdfTemplates';
import type { ShowPlan } from '../../types';

interface PdfGeneratorProps {
  data: ShowPlan | ShowPlan[] | any;
  type: 'showPlan' | 'archive';
  buttonText?: string;
  className?: string;
  filters?: Record<string, any>;
  totalCount?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showOptionsDialog?: boolean;
}

const PdfGenerator: React.FC<PdfGeneratorProps> = ({
  data,
  type,
  buttonText = 'Exporter en PDF',
  className = 'w-full btn btn-primary flex items-center justify-center gap-2',
  filters = {},
  totalCount = 1,
  onSuccess,
  onError,
  showOptionsDialog = true
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [includeQuotes, setIncludeQuotes] = useState(false);
  const [template, setTemplate] = useState<PdfTemplateId>('professional');
  const [orientation, setOrientation] = useState<PdfOrientation>('landscape');
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  
  // Load PDF settings from Firestore
  const { settings: pdfSettings, isLoading: settingsLoading } = usePdfSettings();
  
  // Apply settings once loaded
  useEffect(() => {
    if (!settingsLoading && !settingsLoaded) {
      if (type === 'archive') {
        setTemplate(pdfSettings.archiveDefaultTemplate);
        setOrientation(pdfSettings.archiveDefaultOrientation);
      } else {
        setTemplate(pdfSettings.defaultTemplate);
        setOrientation(pdfSettings.defaultOrientation);
        setIncludeQuotes(pdfSettings.includeQuotesByDefault);
      }
      setSettingsLoaded(true);
    }
  }, [pdfSettings, settingsLoading, settingsLoaded, type]);
  
  // Get showPlanId for quotes
  const showPlan = Array.isArray(data) ? data[0] : data;
  const showPlanId = type === 'showPlan' ? showPlan?.id : null;
  
  // Fetch quotes for the showPlan
  const { quotes, isLoading: quotesLoading } = useQuotesByShowPlan(
    showOptionsDialog && showDialog && includeQuotes ? showPlanId : null
  );

  const handleClick = () => {
    if (showOptionsDialog) {
      setShowDialog(true);
    } else {
      executeExport(false);
    }
  };

  const executeExport = async (withQuotes: boolean) => {
    try {
      setIsExporting(true);
      setShowDialog(false);
      
      let pdfBlob: Blob;
      let fileName: string;
      
      if (type === 'showPlan') {
        // For single show plan export
        const showPlan = Array.isArray(data) ? data[0] : data;
        pdfBlob = generateShowPlanPDF(showPlan, {
          template,
          orientation,
          includeQuotes: withQuotes,
          quotes: withQuotes ? quotes : [],
        });
        
        // Create a filename with the show title and date
        const date = new Date(showPlan.date);
        const formattedDate = format(date, 'yyyy-MM-dd', { locale: fr });
        const showName = showPlan.emission || showPlan.title || 'conducteur';
        fileName = `conducteur_${showName.replace(/\s+/g, '_')}_${formattedDate}.pdf`;
      } else {
        // For archives export
        pdfBlob = generateArchivePDF(data, filters, totalCount, {
          template,
          orientation,
        });
        
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
      if (type === 'archive') {
        setTemplate(pdfSettings.archiveDefaultTemplate);
        setOrientation(pdfSettings.archiveDefaultOrientation);
      } else {
        setIncludeQuotes(pdfSettings.includeQuotesByDefault);
        setTemplate(pdfSettings.defaultTemplate);
        setOrientation(pdfSettings.defaultOrientation);
      }
    }
  };
  
  // Update orientation when template changes
  const handleTemplateChange = (newTemplate: PdfTemplateId) => {
    setTemplate(newTemplate);
    if (type === 'archive') {
      setOrientation(ARCHIVE_PDF_TEMPLATES[newTemplate].defaultOrientation);
    } else {
      setOrientation(PDF_TEMPLATES[newTemplate].defaultOrientation);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isExporting}
        className={className}
        title="Exporter en PDF"
      >
        <Download className="h-4 w-4" />
        {buttonText && (isExporting ? 'Export en cours...' : buttonText)}
      </button>
      
      {/* Dialog for PDF options */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {type === 'archive' ? (
                  <Archive className="h-5 w-5 text-indigo-500" />
                ) : (
                  <FileText className="h-5 w-5 text-indigo-500" />
                )}
                Options d'export PDF
              </h3>
              <button
                onClick={() => setShowDialog(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {type === 'archive' 
                ? 'Choisissez les options d\'export pour vos archives.'
                : 'Choisissez les options d\'export pour votre conducteur.'}
            </p>
            
            {/* Template selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modèle de mise en page
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTemplateChange('classic')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${
                    template === 'classic'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <LayoutTemplate className="h-6 w-6" />
                  <span className="font-medium text-sm">Classique</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {type === 'archive' ? 'Liste compacte' : 'Simple et épuré'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('professional')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${
                    template === 'professional'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Sparkles className="h-6 w-6" />
                  <span className="font-medium text-sm">Professionnel</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {type === 'archive' ? 'Détaillé avec stats' : 'Complet avec horaires'}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Orientation selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Orientation de la page
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition ${
                    orientation === 'landscape'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Monitor className="h-5 w-5" />
                  <span className="font-medium">Paysage</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition ${
                    orientation === 'portrait'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Smartphone className="h-5 w-5" />
                  <span className="font-medium">Portrait</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {orientation === 'landscape' 
                  ? (type === 'archive' 
                      ? 'Recommandé pour afficher plus de colonnes' 
                      : 'Recommandé pour les conducteurs avec beaucoup de segments')
                  : 'Format classique, idéal pour l\'impression'}
              </p>
            </div>
            
            {/* Option to include quotes (only for showPlan) */}
            {type === 'showPlan' && (
              <div className="mb-6">
                <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={includeQuotes}
                    onChange={(e) => setIncludeQuotes(e.target.checked)}
                    className="mt-0.5 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <span className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                      <Quote className="h-4 w-4 text-indigo-500" />
                      Inclure les citations
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Ajoute une page supplémentaire avec toutes les citations collectées pour cette émission.
                    </p>
                  </div>
                </label>
              </div>
            )}
            
            {/* Spacer when no quotes option */}
            {type === 'archive' && <div className="mb-6" />}
            
            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDialog(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => executeExport(includeQuotes)}
                disabled={isExporting || (includeQuotes && quotesLoading)}
                className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Export...' : (includeQuotes && quotesLoading) ? 'Chargement...' : 'Exporter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PdfGenerator;