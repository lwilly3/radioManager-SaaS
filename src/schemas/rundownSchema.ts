import { z } from 'zod';

export const segmentSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  duration: z.number().min(1, 'La durée doit être supérieure à 0'),
  type: z.enum(['intro', 'interview', 'music', 'ad', 'outro', 'other'], {
    required_error: 'Le type de segment est requis',
  }),
  description: z.string().optional(),
  technicalNotes: z.string().optional(),
  guests: z.array(z.string()).optional(),
  hosts: z.array(z.string()).optional(),
});

export const guestSchema = z.object({
  name: z.string().min(1, "Le nom de l'invité est requis"),
  role: z.enum(['journalist', 'expert', 'artist', 'politician', 'athlete', 'writer', 'scientist', 'other'], {
    required_error: "Le rôle de l'invité est requis",
  }),
  biography: z.string().optional(),
  avatar: z.string().optional(),
  contact: z.object({
    email: z.string().email("L'email n'est pas valide").optional(),
    phone: z.string().optional(),
  }).optional(),
});

export const rundownSchema = z.object({
  title: z.enum([
    'matinale',
    'midi-info',
    'journal',
    'club-sport',
    'culture-mag',
    'debat-soir',
    'musique-live',
    'interview',
    'chronique',
    'autre'
  ], {
    required_error: "Le titre de l'émission est requis",
  }),
  date: z.string().min(1, 'La date est requise'),
  time: z.string().min(1, "L'heure est requise"),
  description: z.string().optional(),
});