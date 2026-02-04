import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../api/firebase/firebase';
import type { PdfTemplateId, PdfOrientation } from '../utils/pdf/pdfTemplates';

export interface PdfSettings {
  // Conducteur settings
  defaultTemplate: PdfTemplateId;
  defaultOrientation: PdfOrientation;
  includeQuotesByDefault: boolean;
  // Archive settings
  archiveDefaultTemplate: PdfTemplateId;
  archiveDefaultOrientation: PdfOrientation;
}

const DEFAULT_SETTINGS: PdfSettings = {
  defaultTemplate: 'professional',
  defaultOrientation: 'landscape',
  includeQuotesByDefault: false,
  archiveDefaultTemplate: 'professional',
  archiveDefaultOrientation: 'landscape',
};

/**
 * Hook pour récupérer les paramètres PDF depuis Firestore
 */
export const usePdfSettings = () => {
  const [settings, setSettings] = useState<PdfSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const settingsRef = doc(db, 'settings', 'pdf_settings');
        const docSnap = await getDoc(settingsRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            defaultTemplate: data.defaultTemplate || DEFAULT_SETTINGS.defaultTemplate,
            defaultOrientation: data.defaultOrientation || DEFAULT_SETTINGS.defaultOrientation,
            includeQuotesByDefault: data.includeQuotesByDefault ?? DEFAULT_SETTINGS.includeQuotesByDefault,
            archiveDefaultTemplate: data.archiveDefaultTemplate || DEFAULT_SETTINGS.archiveDefaultTemplate,
            archiveDefaultOrientation: data.archiveDefaultOrientation || DEFAULT_SETTINGS.archiveDefaultOrientation,
          });
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des paramètres PDF:', err);
        setError('Impossible de charger les paramètres PDF');
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  return {
    settings,
    isLoading,
    error,
  };
};

export default usePdfSettings;
