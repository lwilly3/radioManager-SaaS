import api from '../api';

export const inviteApi = {
  // Generate an invite link
  generateInvite: async (token: string, email: string) => {
    try {
      const response = await api.post(
        '/auth/invite',
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating invite:', error);
      throw error;
    }
  },

  // Validate an invite token
  validateToken: async (token: string) => {
    try {
      const response = await api.get(`/auth/invite/validate?token=${token}`);
      return response.data;
    } catch (error) {
      console.error('Error validating token:', error);
      throw error;
    }
  },

  // Sign up with an invite token
  signupWithInvite: async (data: {
    token: string;
    email: string;
    username: string;
    password: string;
    name: string;
    family_name: string;
    phone_number?: string;
  }) => {
    try {
      const response = await api.post('/auth/signup-with-invite', data);
      return response.data;
    } catch (error) {
      console.error('Error signing up with invite:', error);
      throw error;
    }
  }
};