import React from 'react';
// import { X } from 'lucide-react';

// Interface pour les props du composant Tabs
interface TabsProps {
  value: string; // Valeur de l'onglet actuellement actif
  onValueChange: (value: string) => void; // Fonction appelée lors du changement d'onglet
  children: React.ReactNode; // Enfants (TabsList, TabsTrigger, TabsContent)
  className?: string; // Classe CSS optionnelle
}

/**
 * Composant principal des onglets.
 * Propage les props value et onValueChange aux enfants via React.cloneElement et force l'état actif.
 */
export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  children,
  className = '',
}) => {
  console.log(
    `[Tabs] Current value: ${value}, onValueChange defined: ${!!!onValueChange}`
  ); // Vérifie si onValueChange est défini
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            value,
            onValueChange: onValueChange, // Assure que la fonction est bien passée
            active: child.props.value === value, // Force l'état actif basé sur la valeur actuelle
          });
        }
        return child;
      })}
    </div>
  );
};

// Interface pour les props du composant TabsList
interface TabsListProps {
  children: React.ReactNode; // Enfants (TabsTrigger)
  className?: string; // Classe CSS optionnelle
}

/**
 * Conteneur de la liste des onglets (TabsTrigger).
 * Affiche les déclencheurs d'onglets horizontalement avec un espacement.
 */
export const TabsList: React.FC<TabsListProps> = ({
  children,
  className = '',
}) => {
  return <div className={`flex space-x-1 ${className}`}>{children}</div>;
};

// Interface pour les props du composant TabsTrigger
interface TabsTriggerProps {
  value: string; // Valeur associée à cet onglet
  children: React.ReactNode; // Contenu du déclencheur (texte/icônes)
  className?: string; // Classe CSS optionnelle
  onValueChange?: (value: string) => void; // Fonction de changement (passée par Tabs)
  active?: boolean; // Indique si cet onglet est actif
}

/**
 * Déclencheur individuel d'un onglet.
 * Appelle onValueChange lorsque cliqué et applique un style actif basé sur la prop active.
 */
export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className = '',
  onValueChange,
  active = false,
}) => {
  const handleClick = () => {
    console.log(
      `[TabsTrigger] Clicked on value: ${value}, active before click: ${active}, onValueChange defined: ${!!onValueChange}`
    ); // Log détaillé
    if (onValueChange) {
      console.log(`onValueChange present`);
      onValueChange(value); // Déclenche le changement d'onglet
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${
        active
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      } ${className}`}
    >
      {children}
    </button>
  );
};

// Interface pour les props du composant TabsContent
interface TabsContentProps {
  value: string; // Valeur associée à ce contenu
  children: React.ReactNode; // Contenu à afficher
  className?: string; // Classe CSS optionnelle
  active: boolean;
}

/**
 * Contenu d'un onglet, rendu uniquement si sa valeur correspond à l'onglet actif.
 * Utilise la prop value du parent pour déterminer l'état actif.
 */
export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className = '',
  ...props
}) => {
  const isActive = props.active;
  console.log(
    `[TabsContent] Checking value: ${value}, props.value: ${props.value}, isActive: ${isActive}`
  ); // Log pour débogage

  if (!isActive) return null;
  // return (
  //   <button
  //     onClick={onClose}
  //     className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
  //   >
  //     <X className="h-5 w-5" />
  //   </button>
  // );

  return <div className={className}>{children}</div>;
};
