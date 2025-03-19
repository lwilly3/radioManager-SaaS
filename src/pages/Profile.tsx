import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/useAuthStore';
import { User, Mail, Phone, Save, Loader, Lock, Edit2, X } from 'lucide-react';
import FormField from '../components/common/FormField';
import api from '../api/api';

// Schema for profile information
const profileSchema = z.object({
  name: z.string().min(1, 'Le prénom est requis'),
  family_name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone_number: z.string().nullable(),
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
});

// Schema for password update
const passwordSchema = z.object({
  current_password: z.string().min(1, 'Le mot de passe actuel est requis'),
  new_password: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const Profile: React.FC = () => {
  const { user, token, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: errorsProfile },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      family_name: user?.family_name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      username: user?.username || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitProfile = async (data: ProfileFormData) => {
    if (!token || !user) return;

    setIsLoadingProfile(true);
    try {
      await api.put(
        `users/updte/${user.id}`,
        {
          name: data.name,
          family_name: data.family_name,
          email: data.email,
          phone_number: data.phone_number,
          username: data.username,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser({
        ...user,
        name: data.name,
        family_name: data.family_name,
        email: data.email,
        phone_number: data.phone_number,
        username: data.username,
      });

      setNotification({
        type: 'success',
        message: 'Profil mis à jour avec succès',
      });
      setIsEditing(false);
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Erreur lors de la mise à jour du profil',
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    if (!token || !user) return;

    setIsLoadingPassword(true);
    try {
      await api.put(
        `users/upd_pwd/${user.id}`,
        {
          current_password: data.current_password,
          new_password: data.new_password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      resetPassword();
      setNotification({
        type: 'success',
        message: 'Mot de passe mis à jour avec succès',
      });
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe',
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Edit2 className="h-5 w-5" />
                Mettre à jour mes informations
              </button>
            )}
          </div>
          <p className="mt-1 text-gray-600">
            Gérez vos informations personnelles
          </p>
        </div>

        {notification && (
          <div
            className={`p-4 ${
              notification.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {notification.message}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="p-6 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="w-10 h-10 text-indigo-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Prénom" error={errorsProfile.name?.message} required>
                <input
                  type="text"
                  {...registerProfile('name')}
                  className="form-input"
                />
              </FormField>

              <FormField label="Nom" error={errorsProfile.family_name?.message} required>
                <input
                  type="text"
                  {...registerProfile('family_name')}
                  className="form-input"
                />
              </FormField>

              <FormField label="Email" error={errorsProfile.email?.message} required>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    {...registerProfile('email')}
                    className="form-input pl-10"
                  />
                </div>
              </FormField>

              <FormField label="Téléphone" error={errorsProfile.phone_number?.message}>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    {...registerProfile('phone_number')}
                    className="form-input pl-10"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </FormField>

              <FormField label="Nom d'utilisateur" error={errorsProfile.username?.message} required>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    {...registerProfile('username')}
                    className="form-input pl-10"
                  />
                </div>
              </FormField>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <X className="h-5 w-5" />
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoadingProfile}
                className="btn btn-primary flex items-center gap-2"
              >
                {isLoadingProfile ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                Enregistrer
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="w-10 h-10 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {user?.name} {user?.family_name}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nom d'utilisateur</h3>
                <p className="mt-1 text-gray-900">{user?.username}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-gray-900">{user?.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Prénom</h3>
                <p className="mt-1 text-gray-900">{user?.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                <p className="mt-1 text-gray-900">{user?.family_name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
                <p className="mt-1 text-gray-900">{user?.phone_number || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Update */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sécurité</h2>
              <p className="mt-1 text-gray-600">
                Mettez à jour votre mot de passe
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Mot de passe actuel"
              error={errorsPassword.current_password?.message}
              required
            >
              <input
                type="password"
                {...registerPassword('current_password')}
                className="form-input"
              />
            </FormField>

            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Nouveau mot de passe"
                error={errorsPassword.new_password?.message}
                required
              >
                <input
                  type="password"
                  {...registerPassword('new_password')}
                  className="form-input"
                />
              </FormField>

              <FormField
                label="Confirmer le mot de passe"
                error={errorsPassword.confirm_password?.message}
                required
              >
                <input
                  type="password"
                  {...registerPassword('confirm_password')}
                  className="form-input"
                />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoadingPassword}
              className="btn btn-primary flex items-center gap-2"
            >
              {isLoadingPassword ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Mettre à jour le mot de passe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;