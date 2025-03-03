import React from 'react';

interface SpinnerButtonProps {
  ariaLabel?: string;
  className?: string;
}

const SpinnerButton: React.FC<SpinnerButtonProps> = ({
  ariaLabel = 'Suppression en cours',
  className,
}) => {
  // Définir une classe par défaut si `className` n'est pas fourni
  const defaultClassName =
    'p-2 rounded-full bg-red-50 text-red-600 flex items-center justify-center';
  return (
    <div className={className || defaultClassName} aria-label={ariaLabel}>
      <svg
        className="animate-spin h-4 w-4 text-red-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"
        ></path>
      </svg>
    </div>
  );
};

export default SpinnerButton;
