import { z } from 'zod';

export const userSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  email: z.string().email("L'adresse email n'est pas valide"),
  name: z.string().min(1, "Le prénom est requis"),
  family_name: z.string().min(1, "Le nom est requis"),
  phone_number: z.string().optional(),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});