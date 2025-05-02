import React, { useState } from 'react';
import { Send, Copy, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { inviteApi } from '../../api/auth/inviteApi';

interface GenerateInviteLinkProps {
  onInviteSent?: (token: string) => void;
}

const GenerateInviteLink: React.FC<GenerateInviteLinkProps> = ({ onInviteSent }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const token = useAuthStore((state) => state.token);

  // Validation simple de l'email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleGenerate = async () => {
    if (!token) {
      setError("Vous devez être connecté pour générer un lien d'invitation");
      return;
    }

    setLoading(true);
    setError(null);
    setInviteLink(null);
    setExpiresAt(null);

    try {
      const response = await inviteApi.generateInvite(token, email);
      const { token: inviteToken, expires_at } = response;
      const link = `${window.location.origin}/signup/${inviteToken}`;
      
      setInviteLink(link);
      setExpiresAt(expires_at);
      
      if (onInviteSent) {
        onInviteSent(inviteToken);
      }
    } catch (err: any) {
      console.error("Erreur lors de la génération du lien d'invitation:", err);
      setError(
        err.response?.data?.detail || 
        "Erreur lors de la génération du lien d'invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Générer un lien d'invitation</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email de l'invité
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemple.com"
            className="form-input"
          />
          <p className="mt-1 text-sm text-gray-500">
            Un lien d'invitation sera généré pour cette adresse email.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !isValidEmail(email)}
          className="btn btn-primary flex items-center justify-center gap-2 w-full"
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <Send className="h-5 w-5" />
          )}
          Générer le lien d'invitation
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {inviteLink && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Lien d'invitation</h4>
              <button
                onClick={handleCopyLink}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                title="Copier le lien"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <div className="p-3 bg-white border border-gray-200 rounded text-sm break-all">
              {inviteLink}
            </div>
            
            {expiresAt && (
              <p className="text-xs text-gray-500">
                Ce lien expirera le {new Date(expiresAt).toLocaleString()} et ne peut être utilisé qu'une seule fois.
              </p>
            )}
            
            {copied && (
              <div className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-4 w-4" />
                Lien copié !
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateInviteLink;