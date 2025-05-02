import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Radio, Loader, AlertCircle, Check } from 'lucide-react';
import { inviteApi } from '../../api/auth/inviteApi';
import FormField from '../../components/common/FormField';

// Schéma de validation pour le formulaire d'inscription
const signupSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  name: z.string().min(1, "Le prénom est requis"),
  family_name: z.string().min(1, "Le nom de famille est requis"),
  phone_number: z.string().optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupWithInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  // Valider le token au chargement de la page
  useEffect(() => {
    if (!token) {
      setError("Lien d'invitation invalide ou manquant");
      setValidating(false);
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await inviteApi.validateToken(token);
        if (response.valid) {
          setValid(true);
          setEmail(response.email);
        } else {
          setError("Ce lien d'invitation n'est plus valide ou a déjà été utilisé");
        }
      } catch (err: any) {
        console.error("Erreur lors de la validation du token:", err);
        setError(
          err.response?.data?.detail || 
          "Ce lien d'invitation n'est plus valide ou a déjà été utilisé"
        );
      } finally {
        setValidating(false);
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data: SignupFormData) => {
    if (!token) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const payload = {
        token,
        email,
        ...data,
      };
      
      await inviteApi.signupWithInvite(payload);
      setSuccess(true);
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Compte créé avec succès. Veuillez vous connecter.' 
          } 
        });
      }, 3000);
    } catch (err: any) {
      console.error("Erreur lors de la création du compte:", err);
      setError(
        err.response?.data?.detail || 
        "Une erreur est survenue lors de la création de votre compte"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Radio className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Vérification du lien d'invitation
          </h2>
          <div className="mt-8 flex justify-center">
            <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !valid) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Radio className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Lien d'invitation invalide
          </h2>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Retour à la page de connexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Radio className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Compte créé avec succès
          </h2>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Succès</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Radio className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Vous avez été invité à rejoindre RadioManager
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  value={email}
                  disabled
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50"
                />
              </div>
            </div>

            <FormField label="Nom d'utilisateur" error={errors.username?.message} required>
              <input
                type="text"
                {...register('username')}
                className="form-input"
                placeholder="johndoe"
              />
            </FormField>

            <FormField label="Mot de passe" error={errors.password?.message} required>
              <input
                type="password"
                {...register('password')}
                className="form-input"
                placeholder="••••••••"
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Prénom" error={errors.name?.message} required>
                <input
                  type="text"
                  {...register('name')}
                  className="form-input"
                  placeholder="John"
                />
              </FormField>

              <FormField label="Nom" error={errors.family_name?.message} required>
                <input
                  type="text"
                  {...register('family_name')}
                  className="form-input"
                  placeholder="Doe"
                />
              </FormField>
            </div>

            <FormField label="Téléphone" error={errors.phone_number?.message}>
              <input
                type="tel"
                {...register('phone_number')}
                className="form-input"
                placeholder="+33 6 12 34 56 78"
              />
            </FormField>

            <div>
              <button
                type="submit"
                disabled={submitting || !isValid}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  'Créer mon compte'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupWithInvite;