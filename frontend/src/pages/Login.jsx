import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useTranslation } from 'react-i18next';

// Removed static loginSchema from here

const Login = () => {
  const { login: loginUser, error: authError, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const loginSchema = z.object({
    studentId: z.string().min(1, t('Login.Error Student ID')).length(8, t('Login.Error Student ID')),
    password: z.string().min(6, t('Login.Error Password')),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    clearError();
    try {
      await loginUser(data);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="glass w-full max-w-md p-8 rounded-3xl scale-in">
        <div className="text-center mb-8 fade-in-up">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-sky-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4 transform -rotate-3 hover:rotate-0 transition-transform">
            M
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('Login.Welcome Back')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t('Login.Share your mood')}</p>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm fade-in-up">
            {authError === 'Invalid credentials' ? t('Login.Invalid credentials') : 
             authError === 'User not found' ? t('Login.User not found') :
             (authError === 'Login failed' ? t('Login.Login failed') : authError)}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Input
            label={t('Login.Student ID')}
            placeholder={t('Login.Student ID Placeholder')}
            {...register('studentId')}
            error={errors.studentId}
          />
          <Input
            label={t('Login.Password')}
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password}
          />
          
          <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
            {t('Login.Login Button')}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 fade-in-up" style={{ animationDelay: '0.2s' }}>
          {t('Login.No account')}{' '}
          <Link to="/register" className="font-medium text-sky-600 dark:text-sky-400 hover:underline">
            {t('Login.Register here')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
