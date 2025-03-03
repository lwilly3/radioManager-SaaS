import { z } from 'zod';

export const showSchema = z.object({
  title: z.string().min(1, "Le titre de l'émission est requis"),
  type: z.enum([
    'morning-show',
    'news',
    'talk-show',
    'music-show',
    'cultural',
    'sports',
    'documentary',
    'entertainment',
    'debate',
    'other'
  ], {
    required_error: "Le type d'émission est requis",
  }),
  duration: z.number().min(1, "La durée doit être supérieure à 0"),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'special'], {
    required_error: "La fréquence est requise",
  }),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
});

export type ShowFormData = z.infer<typeof showSchema>;