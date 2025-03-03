import { z } from 'zod';

export const teamMemberSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("L'email n'est pas valide"),
  role: z.enum(['admin', 'host', 'producer', 'technician', 'editor', 'journalist'], {
    required_error: "Le rôle est requis",
  }),
  phone: z.string().optional(),
  bio: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;