import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import type { RegisterFormValues, TokenResponse, User } from '../../../types';
import RegisterForm from '../components/RegisterForm';

const RegisterContainer = () => {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (values: RegisterFormValues) => {
    setError('');
    setIsSubmitting(true);

    try {
      await api.post<User>('/auth/register', {
        ...values,
        role: 'trainee',
      });

      const form = new URLSearchParams();
      form.set('username', values.email);
      form.set('password', values.password);

      const loginResponse = await api.post<TokenResponse>('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      await login(loginResponse.data.access_token);
      navigate('/');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        setError(typeof detail === 'string' ? detail : 'Registration failed');
      } else {
        setError('Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return <RegisterForm onSubmit={handleRegister} error={error} isSubmitting={isSubmitting} />;
};

export default RegisterContainer;
