
import { z } from 'zod';

/**
 * Schéma de validation pour les identifiants de connexion
 */
export const loginSchema = z.object({
  username: z.string().min(1, 'Le nom d\'utilisateur est requis'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});
