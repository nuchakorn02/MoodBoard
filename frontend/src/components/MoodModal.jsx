import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const moodTypes = [
  { value: 'Happy', label: 'Happy', color: '#10b981', emoji: '😊' },
  { value: 'Sad', label: 'Sad', color: '#3b82f6', emoji: '😢' },
  { value: 'Angry', label: 'Angry', color: '#ef4444', emoji: '😠' },
  { value: 'Excited', label: 'Excited', color: '#f59e0b', emoji: '🤩' },
  { value: 'Tired', label: 'Tired', color: '#64748b', emoji: '😴' },
  { value: 'Stressed', label: 'Stressed', color: '#f43f5e', emoji: '😫' },
  { value: 'Lonely', label: 'Lonely', color: '#8b5cf6', emoji: '🥺' },
  { value: 'Confused', label: 'Confused', color: '#06b6d4', emoji: '😕' },
  { value: 'Motivated', label: 'Motivated', color: '#14b8a6', emoji: '💪' },
  { value: 'Relaxed', label: 'Relaxed', color: '#84cc16', emoji: '😌' },
];

const MoodModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const isEditing = !!initialData;
  const { t } = useTranslation();

  const moodSchema = z.object({
    moodType: z.string().min(1, t('MoodModal.Error Select Mood')),
    title: z.string().min(1, t('MoodModal.Error Title')).max(100, t('MoodModal.Error Title Max')),
    description: z.string().min(1, t('MoodModal.Error Description')).max(500, t('MoodModal.Error Description Max')),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm({
    resolver: zodResolver(moodSchema),
    defaultValues: {
      moodType: '',
      title: '',
      description: '',
    }
  });

  const selectedMoodType = watch('moodType');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue('moodType', initialData.moodType);
        setValue('title', initialData.title);
        setValue('description', initialData.description);
      } else {
        reset();
      }
    }
  }, [isOpen, initialData, setValue, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      const selectedMood = moodTypes.find(m => m.value === data.moodType);
      const payload = {
        ...data,
        emoji: selectedMood.emoji,
        backgroundColor: selectedMood.color,
      };

      if (isEditing) {
        await api.put(`/moods/${initialData._id}`, payload);
      } else {
        await api.post('/moods', payload);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save mood:', error);
    }
  };

  const currentThemeColor = moodTypes.find(m => m.value === selectedMoodType)?.color || '#6366f1';

  return createPortal(
    <div className="fixed inset-0 z-[100] p-4 sm:p-6 bg-black/60 animate-in fade-in duration-200">
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col" style={{ maxHeight: '100%' }}>
          
          {/* Header - Fixed */}
          <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10" style={{ borderBottomColor: `${currentThemeColor}30` }}>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {isEditing ? t('MoodModal.Update your Mood') : t('MoodModal.How are you feeling')}
              {selectedMoodType && <span className="text-2xl">{moodTypes.find(m => m.value === selectedMoodType)?.emoji}</span>}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors focus-ring"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Container - Constrained */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col overflow-hidden">
            
            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                {t('MoodModal.Select Mood')}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {moodTypes.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setValue('moodType', mood.value, { shouldValidate: true })}
                    className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border-2 transition-all ${
                      selectedMoodType === mood.value 
                        ? 'bg-slate-50 dark:bg-slate-800 shadow-md transform scale-105' 
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 opacity-70 hover:opacity-100'
                    }`}
                    style={{ borderColor: selectedMoodType === mood.value ? mood.color : 'transparent' }}
                  >
                    <span className="text-xl sm:text-2xl mb-1">{mood.emoji}</span>
                    <span className="text-[9px] sm:text-[10px] font-medium text-slate-600 dark:text-slate-400">{t(`MoodTypes.${mood.value}`)}</span>
                  </button>
                ))}
              </div>
              {errors.moodType && <p className="mt-2 text-sm text-red-500 fade-in-up">{errors.moodType.message}</p>}
            </div>

            <Input
              label={t('MoodModal.Title')}
              placeholder={t('MoodModal.Title Placeholder')}
              {...register('title')}
              error={errors.title}
            />

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                {t('MoodModal.Description')}
              </label>
              <textarea
                className={`input-field min-h-[80px] sm:min-h-[100px] resize-none ${errors.description ? 'border-red-500' : ''}`}
                placeholder={t('MoodModal.Description Placeholder')}
                {...register('description')}
              />
              {errors.description && <p className="mt-1.5 text-sm text-red-500 fade-in-up">{errors.description.message}</p>}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 z-10">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('MoodModal.Cancel')}
            </Button>
            <Button 
              type="submit" 
              isLoading={isSubmitting}
              style={{ backgroundColor: currentThemeColor }}
              className="text-white hover:opacity-90 shadow-md"
            >
              {isEditing ? t('MoodModal.Save Changes') : t('MoodModal.Post Mood')}
            </Button>
          </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MoodModal;
