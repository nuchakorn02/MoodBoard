import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { kmitlData, faculties } from '../utils/constants';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { register: registerUser, error: authError, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const registerSchema = z.object({
    studentId: z.string().min(1, t('Register.Error Student ID Req')).length(8, t('Register.Error Student ID')),
    faculty: z.string().min(1, t('Register.Error Faculty')),
    major: z.string().min(1, t('Register.Error Major')),
    year: z.string().min(1, t('Register.Error Year')).refine(val => !isNaN(parseInt(val)), t('Register.Error Year Format')),
    password: z.string().min(6, t('Register.Error Password')),
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      studentId: '',
      faculty: '',
      major: '',
      year: '',
      password: '',
    },
  });

  const selectedFaculty = watch('faculty');
  const availableMajors = selectedFaculty && kmitlData[selectedFaculty] ? kmitlData[selectedFaculty] : [];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    clearError();
    // Convert year to integer
    const payload = { ...data, year: parseInt(data.year) };
    try {
      await registerUser(payload);
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
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-sky-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4 transform rotate-3 hover:rotate-0 transition-transform">
            M
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('Register.Join the Community')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t('Register.Connect anonymously')}</p>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm fade-in-up">
            {authError === 'Student ID already registered' ? t('Register.Student ID already registered') : 
             (authError === 'Register failed' ? t('Register.Register failed') : 
              (authError === 'cannot find user account after reload' ? t('Register.Cannot find user') : authError))}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Input
            label={t('Register.Student ID')}
            placeholder={t('Register.Student ID Placeholder')}
            {...register('studentId')}
            error={errors.studentId}
          />
          
          <Select
            label={t('Register.Faculty')}
            placeholder={t('Register.Select Faculty')}
            options={faculties.map(f => ({ value: f, label: t(`Faculties.${f}`) }))}
            {...register('faculty')}
            error={errors.faculty}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('Register.Major')}
              placeholder={t('Register.Select Major')}
              options={availableMajors.map(m => ({ value: m, label: t(`Majors.${m}`) }))}
              {...register('major')}
              error={errors.major}
              disabled={!selectedFaculty}
            />
            <Select
              label={t('Register.Year')}
              placeholder={t('Register.Select Year')}
              options={[1, 2, 3, 4].map(y => ({ value: y.toString(), label: `${t('Register.Year')} ${y}` }))}
              {...register('year')}
              error={errors.year}
            />
          </div>

          <Input
            label={t('Register.Password')}
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password}
          />
          
          <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
            {t('Register.Create Account')}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 fade-in-up" style={{ animationDelay: '0.2s' }}>
          {t('Register.Already have an account')}{' '}
          <Link to="/login" className="font-medium text-sky-600 dark:text-sky-400 hover:underline">
            {t('Register.Log in here')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
