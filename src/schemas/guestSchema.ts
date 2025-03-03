import { z } from 'zod';

export const guestSchema = z.object({
  name: z.string().min(1, "Le nom de l'invité est requis"),
  role: z.enum(
    [
      'journalist',
      'expert',
      'artist',
      'politician',
      'athlete',
      'writer',
      'scientist',
      'other',
    ],
    {
      required_error: "Le rôle de l'invité est requis",
    }
  ),
  biography: z
    .string()
    .min(10, 'La biographie doit contenir au moins 10 caractères'),
  contact: z.object({
    email: z.string().email("L'email n'est pas valide").optional().nullable(),
    phone: z.string().min(1, "Le telephone de l'invite est obligatoire"),
  }),
});

export type GuestFormData = z.infer<typeof guestSchema>;
