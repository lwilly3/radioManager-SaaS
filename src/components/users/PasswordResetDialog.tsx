import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Copy, Check, Key, AlertTriangle, Loader } from 'lucide-react';
import { usersApi } from '../../services/api/users';
import { useAuthStore } from '../../store/useAuthStore';

interface PasswordResetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: number;
    email: string;
    name: string;
    family_name: string;
  };
}

const PasswordResetDialog: React.FC<PasswordResetDialogProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { token } = useAuthStore();

  const handleGenerateToken = async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await usersApi.generateResetToken(token, user.id);
      setResetToken(response.reset_token);
      setExpiresAt(response.expires_at);
      
      // Créer le lien complet de réinitialisation
      const baseUrl = window.location.origin;
      const resetUrl = `${baseUrl}/reset-password/${response.reset_token}`;
      setResetLink(resetUrl);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        'Erreur lors de la génération du token de réinitialisation'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!resetLink) return;
    
    navigator.clipboard.writeText(resetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-600" />
              <Dialog.Title className="text-lg font-semibold">
                Réinitialisation de mot de passe
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <p className="text-gray-700">
                Générer un lien de réinitialisation de mot de passe pour :
              </p>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{user.name} {user.family_name}</p>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!resetLink ? (
              <button
                onClick={handleGenerateToken}
                disabled={isLoading}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Key className="h-5 w-5" />
                )}
                {isLoading ? 'Génération en cours...' : 'Générer un lien de réinitialisation'}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 mb-2">
                    Lien de réinitialisation généré avec succès !
                  </p>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={resetLink}
                      readOnly
                      className="flex-1 p-2 text-sm border border-gray-300 rounded-l-lg focus:outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="p-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
                      title="Copier le lien"
                    >
                      {copied ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {expiresAt && (
                    <p className="mt-2 text-xs text-gray-600">
                      Ce lien expirera le {new Date(expiresAt).toLocaleString()} et ne peut être utilisé qu'une seule fois.
                    </p>
                  )}
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Instructions :</p>
                  <ol className="list-decimal pl-5 mt-1 space-y-1">
                    <li>Copiez ce lien</li>
                    <li>Envoyez-le à l'utilisateur par un canal sécurisé</li>
                    <li>L'utilisateur pourra définir un nouveau mot de passe en suivant ce lien</li>
                  </ol>
                </div>
                
                <button
                  onClick={handleGenerateToken}
                  className="w-full btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Key className="h-5 w-5" />
                  Générer un nouveau lien
                </button>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Fermer
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PasswordResetDialog;