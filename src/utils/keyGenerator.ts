// src/utils/keyGenerator.ts

/**
 * Génère une clé unique basée sur un ID fourni.
 * @param id - L'ID à utiliser comme base pour la clé.
 * @returns Une clé unique combinant l'ID et une chaîne aléatoire.
 */
export const generateKey = (id: string): string => {
  return `${id}-${Math.random().toString(36).substr(2, 9)}`;
};
