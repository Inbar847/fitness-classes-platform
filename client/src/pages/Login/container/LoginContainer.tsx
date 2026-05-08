import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import type { LoginFormValues, TokenResponse } from '../../../types';
import LoginForm from '../components/LoginForm';

const LoginContainer = () => {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormValues) => {
    setError('');
    setIsSubmitting(true);

    try {
      const form = new URLSearchParams();
      form.set('username', values.email);
      form.set('password', values.password);

      const response = await api.post<TokenResponse>('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      await login(response.data.access_token);
      navigate('/');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        setError(typeof detail === 'string' ? detail : 'Login failed');
      } else {
        setError('Login failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return <LoginForm onSubmit={handleLogin} error={error} isSubmitting={isSubmitting} />;
};

export default LoginContainer;