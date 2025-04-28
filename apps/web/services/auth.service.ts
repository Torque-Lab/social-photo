import api from './api';

export interface SignUpData {
  username: string;
  password: string;
  name: string;
  image?: string;
}

export interface SignInData {
  username: string;
  password: string;
}

export interface ForgotPasswordData {
  username: string;
}

export interface ResetPasswordData {
  username: string;
  otp: string;
  newPassword: string;
}

const AuthService = {
  signUp: async (data: SignUpData) => {
    const response = await api.post('/api/auth/signup', data);
    return response.data;
  },
  signIn: async (data: SignInData) => {
    const response = await api.post('/api/auth/signin', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await api.post('/api/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await api.post('/api/auth/reset-password', data);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  isLoggedIn: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },
  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }
};

export default AuthService;
