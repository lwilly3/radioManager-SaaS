
import React from 'react';
import { Radio } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import { useLogin } from '../hooks/auth/useLogin';
import type { LoginCredentials } from '../types/auth';

const Login: React.FC = () => {
  const { login, isLoading, error } = useLogin();

  const handleSubmit = async (credentials: LoginCredentials) => {
    await login(credentials);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Radio className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          RadioManager
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connectez-vous pour accéder à votre espace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm 
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
