import { generateArchivePDF, type ArchivePdfOptions } from './archivePdfGenerator';
import { generateShowPlanPDF, type PdfOptions } from './showPlanPdfGenerator';
import { 
  PDF_TEMPLATES, 
  ARCHIVE_PDF_TEMPLATES,
  getPdfTemplate, 
  getPdfTemplatesList,
  getArchivePdfTemplate,
  getArchivePdfTemplatesList,
  DEFAULT_PDF_TEMPLATE, 
  type PdfTemplate, 
  type PdfTemplateId, 
  type PdfOrientation 
} from './pdfTemplates';

export {
  generateArchivePDF,
  generateShowPlanPDF,
  PDF_TEMPLATES,
  ARCHIVE_PDF_TEMPLATES,
  getPdfTemplate,
  getPdfTemplatesList,
  getArchivePdfTemplate,
  getArchivePdfTemplatesList,
  DEFAULT_PDF_TEMPLATE,
};

export type {
  ArchivePdfOptions,
  PdfOptions,
  PdfTemplate,
  PdfTemplateId,
  PdfOrientation,
};