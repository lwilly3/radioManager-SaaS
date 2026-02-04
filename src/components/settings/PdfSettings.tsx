import React, { useEffect, useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../api/firebase/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { FileText, LayoutTemplate, Sparkles, Monitor, Smartphone, Check, Archive } from 'lucide-react';
import { PDF_TEMPLATES, ARCHIVE_PDF_TEMPLATES, type PdfTemplateId, type PdfOrientation } from '../../utils/pdf/pdfTemplates';

interface PdfSettingsData {
  // Conducteur settings
  defaultTemplate: PdfTemplateId;
  defaultOrientation: PdfOrientation;
  includeQuotesByDefault: boolean;
  // Archive settings
  archiveDefaultTemplate: PdfTemplateId;
  archiveDefaultOrientation: PdfOrientation;
  // Metadata
  updatedAt?: string;
  updatedBy?: string;
  updatedByName?: string;
}

const DEFAULT_SETTINGS: PdfSettingsData = {
  defaultTemplate: 'professional',
  defaultOrientation: 'landscape',
  includeQuotesByDefault: false,
  archiveDefaultTemplate: 'professional',
  archiveDefaultOrientation: 'landscape',
};

const PdfSettings: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [settings, setSettings] = useState<PdfSettingsData>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Charger les paramètres depuis Firestore
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'pdf_settings');
        const docSnap = await getDoc(settingsRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as PdfSettingsData;
          setSettings({
            ...DEFAULT_SETTINGS,
            ...data,
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres PDF:', error);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);

      const settingsRef = doc(db, 'settings', 'pdf_settings');
      const settingsData: PdfSettingsData = {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.id || 'anonymous',
        updatedByName: user ? `${user.name} ${user.family_name}` : 'anonymous',
      };

      await setDoc(settingsRef, settingsData, { merge: true });
      setSaveMessage('Paramètres enregistrés avec succès');
      
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres PDF:', error);
      setSaveMessage('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTemplateChange = (template: PdfTemplateId) => {
    setSettings(prev => ({
      ...prev,
      defaultTemplate: template,
      defaultOrientation: PDF_TEMPLATES[template].defaultOrientation,
    }));
  };

  const handleArchiveTemplateChange = (template: PdfTemplateId) => {
    setSettings(prev => ({
      ...prev,
      archiveDefaultTemplate: template,
      archiveDefaultOrientation: ARCHIVE_PDF_TEMPLATES[template].defaultOrientation,
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-indigo-500" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Export PDF
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configurez les paramètres par défaut pour l'export des conducteurs en PDF
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Template par défaut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Modèle par défaut
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Template Classique */}
            <button
              type="button"
              onClick={() => handleTemplateChange('classic')}
              className={`relative flex flex-col items-start p-4 rounded-xl border-2 transition-all ${
                settings.defaultTemplate === 'classic'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {settings.defaultTemplate === 'classic' && (
                <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  settings.defaultTemplate === 'classic' 
                    ? 'bg-indigo-100 dark:bg-indigo-800' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <LayoutTemplate className={`h-5 w-5 ${
                    settings.defaultTemplate === 'classic' 
                      ? 'text-indigo-600 dark:text-indigo-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
                <span className={`font-semibold ${
                  settings.defaultTemplate === 'classic'
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  Classique
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
                {PDF_TEMPLATES.classic.description}
              </p>
              <ul className="mt-2 text-xs text-gray-400 dark:text-gray-500 space-y-1">
                {PDF_TEMPLATES.classic.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span className="text-indigo-400">•</span> {feature}
                  </li>
                ))}
              </ul>
            </button>

            {/* Template Professionnel */}
            <button
              type="button"
              onClick={() => handleTemplateChange('professional')}
              className={`relative flex flex-col items-start p-4 rounded-xl border-2 transition-all ${
                settings.defaultTemplate === 'professional'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {settings.defaultTemplate === 'professional' && (
                <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  settings.defaultTemplate === 'professional' 
                    ? 'bg-indigo-100 dark:bg-indigo-800' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Sparkles className={`h-5 w-5 ${
                    settings.defaultTemplate === 'professional' 
                      ? 'text-indigo-600 dark:text-indigo-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
                <span className={`font-semibold ${
                  settings.defaultTemplate === 'professional'
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  Professionnel
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
                {PDF_TEMPLATES.professional.description}
              </p>
              <ul className="mt-2 text-xs text-gray-400 dark:text-gray-500 space-y-1">
                {PDF_TEMPLATES.professional.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span className="text-indigo-400">•</span> {feature}
                  </li>
                ))}
              </ul>
            </button>
          </div>
        </div>

        {/* Orientation par défaut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Orientation par défaut
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, defaultOrientation: 'landscape' }))}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition ${
                settings.defaultOrientation === 'landscape'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Monitor className="h-5 w-5" />
              <span className="font-medium">Paysage</span>
            </button>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, defaultOrientation: 'portrait' }))}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition ${
                settings.defaultOrientation === 'portrait'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Smartphone className="h-5 w-5" />
              <span className="font-medium">Portrait</span>
            </button>
          </div>
        </div>

        {/* Option citations par défaut */}
        <div>
          <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={settings.includeQuotesByDefault}
              onChange={(e) => setSettings(prev => ({ ...prev, includeQuotesByDefault: e.target.checked }))}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                Inclure les citations par défaut
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cocher automatiquement l'option d'inclusion des citations lors de l'export
              </p>
            </div>
          </label>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <Archive className="h-5 w-5 text-indigo-500" />
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Archives
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Paramètres par défaut pour l'export des archives en PDF
              </p>
            </div>
          </div>

          {/* Template archives par défaut */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Modèle archives par défaut
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Template Classique Archives */}
              <button
                type="button"
                onClick={() => handleArchiveTemplateChange('classic')}
                className={`relative flex flex-col items-start p-4 rounded-xl border-2 transition-all ${
                  settings.archiveDefaultTemplate === 'classic'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {settings.archiveDefaultTemplate === 'classic' && (
                  <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    settings.archiveDefaultTemplate === 'classic' 
                      ? 'bg-indigo-100 dark:bg-indigo-800' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <LayoutTemplate className={`h-5 w-5 ${
                      settings.archiveDefaultTemplate === 'classic' 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <span className={`font-semibold ${
                    settings.archiveDefaultTemplate === 'classic'
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    Classique
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
                  {ARCHIVE_PDF_TEMPLATES.classic.description}
                </p>
                <ul className="mt-2 text-xs text-gray-400 dark:text-gray-500 space-y-1">
                  {ARCHIVE_PDF_TEMPLATES.classic.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <span className="text-indigo-400">•</span> {feature}
                    </li>
                  ))}
                </ul>
              </button>

              {/* Template Professionnel Archives */}
              <button
                type="button"
                onClick={() => handleArchiveTemplateChange('professional')}
                className={`relative flex flex-col items-start p-4 rounded-xl border-2 transition-all ${
                  settings.archiveDefaultTemplate === 'professional'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {settings.archiveDefaultTemplate === 'professional' && (
                  <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    settings.archiveDefaultTemplate === 'professional' 
                      ? 'bg-indigo-100 dark:bg-indigo-800' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Sparkles className={`h-5 w-5 ${
                      settings.archiveDefaultTemplate === 'professional' 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <span className={`font-semibold ${
                    settings.archiveDefaultTemplate === 'professional'
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    Professionnel
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
                  {ARCHIVE_PDF_TEMPLATES.professional.description}
                </p>
                <ul className="mt-2 text-xs text-gray-400 dark:text-gray-500 space-y-1">
                  {ARCHIVE_PDF_TEMPLATES.professional.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <span className="text-indigo-400">•</span> {feature}
                    </li>
                  ))}
                </ul>
              </button>
            </div>
          </div>

          {/* Orientation archives par défaut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Orientation archives par défaut
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, archiveDefaultOrientation: 'landscape' }))}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition ${
                  settings.archiveDefaultOrientation === 'landscape'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Monitor className="h-5 w-5" />
                <span className="font-medium">Paysage</span>
              </button>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, archiveDefaultOrientation: 'portrait' }))}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition ${
                  settings.archiveDefaultOrientation === 'portrait'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Smartphone className="h-5 w-5" />
                <span className="font-medium">Portrait</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          {saveMessage && (
            <span className={`text-sm ${saveMessage.includes('succès') ? 'text-green-600' : 'text-red-600'}`}>
              {saveMessage}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfSettings;
