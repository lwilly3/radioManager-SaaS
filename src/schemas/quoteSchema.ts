import { z } from 'zod';

/**
 * Schéma de validation Zod pour les citations
 */

// Schéma pour l'auteur
const authorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Le nom de l\'auteur est requis'),
  role: z.string().optional(),
  avatar: z.string().url('URL invalide').optional().or(z.literal('')),
});

// Schéma pour le contexte
const contextSchema = z.object({
  showId: z.string().optional(),
  showName: z.string().optional(),
  date: z.string().optional(),
  timestamp: z.string().optional(),
});

// Schéma pour la source
const sourceSchema = z.object({
  type: z.enum(['manual', 'transcription'], {
    errorMap: () => ({ message: 'Type de source invalide' })
  }),
  audioUrl: z.string().url('URL audio invalide').optional().or(z.literal('')),
  audioFile: z.string().optional(),
  duration: z.number().positive('Durée invalide').optional(),
  transcriptionId: z.string().optional(),
});

// Schéma pour les métadonnées
const metadataSchema = z.object({
  category: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  language: z.string().optional().default('fr'),
  isVerified: z.boolean().optional().default(false),
  confidence: z.number().min(0).max(1).optional(),
});

// Schéma pour une publication
const publicationSchema = z.object({
  id: z.string(),
  platform: z.enum(['facebook', 'twitter', 'instagram', 'linkedin', 'other']),
  content: z.string().min(1, 'Le contenu est requis'),
  image: z.string().url('URL image invalide').optional().or(z.literal('')),
  publishedAt: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'published']),
  url: z.string().url('URL invalide').optional().or(z.literal('')),
});

// Schéma complet pour une citation
export const quoteSchema = z.object({
  content: z.string()
    .min(10, 'La citation doit contenir au moins 10 caractères')
    .max(500, 'La citation ne peut pas dépasser 500 caractères'),
  author: authorSchema,
  context: contextSchema.optional(),
  source: sourceSchema,
  metadata: metadataSchema.optional(),
  publications: z.array(publicationSchema).optional().default([]),
  status: z.enum(['draft', 'approved', 'published', 'archived'], {
    errorMap: () => ({ message: 'Statut invalide' })
  }).default('draft'),
});

// Schéma pour la création d'une citation (formulaire)
export const createQuoteFormSchema = z.object({
  content: z.string()
    .min(10, 'La citation doit contenir au moins 10 caractères')
    .max(500, 'La citation ne peut pas dépasser 500 caractères'),
  authorName: z.string().min(1, 'Le nom de l\'auteur est requis'),
  authorRole: z.string().optional(),
  authorAvatar: z.string().url('URL invalide').optional().or(z.literal('')),
  showName: z.string().optional(),
  date: z.string().optional(),
  timestamp: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(), // Chaîne séparée par des virgules, transformée en tableau
  audioFile: z.instanceof(File).optional(),
});

// Type TypeScript inféré
export type QuoteFormData = z.infer<typeof createQuoteFormSchema>;
export type QuoteValidation = z.infer<typeof quoteSchema>;
