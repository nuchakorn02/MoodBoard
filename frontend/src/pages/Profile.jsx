import React, { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import MoodCard from '../components/MoodCard';
import MoodModal from '../components/MoodModal';
import ConfirmModal from '../components/ConfirmModal';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Calendar, User, BookOpen, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user } = useAuthStore();
  const [myMoods, setMyMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMood, setEditingMood] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchMyMoods = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/moods/me');
      setMyMoods(data);
    } catch (err) {
      console.error('Failed to fetch my moods', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyMoods();
  }, [fetchMyMoods]);

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const executeDelete = async () => {
    if (confirmDeleteId) {
      try {
        await api.delete(`/moods/${confirmDeleteId}`);
        fetchMyMoods();
      } catch (err) {
        console.error('Failed to delete mood', err);
      } finally {
        setConfirmDeleteId(null);
      }
    }
  };

  const openEditModal = (mood) => {
    setEditingMood(mood);
    setIsModalOpen(true);
  };

  const today = new Date();
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(today),
    end: endOfMonth(today)
  }).map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const moodOnDay = myMoods.find(m => format(new Date(m.createdAt), 'yyyy-MM-dd') === dateStr);
    return {
      day: date.getDate(),
      mood: moodOnDay
    };
  });

  return (
    <div className="space-y-8 fade-in-up">
      {/* Profile Header */}
      <div className="glass p-8 rounded-3xl flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="w-24 h-24 bg-gradient-to-tr from-sky-500 to-blue-500 rounded-full shadow-xl flex items-center justify-center text-white text-3xl font-bold">
          {user?.studentId.substring(0, 2)}
        </div>
        <div className="flex-1 w-full text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{t('Profile.Welcome')}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl">
              <User className="w-5 h-5 text-sky-500" />
              <div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{t('Profile.Student')}</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{user?.studentId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{t('Profile.Major')}</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{t(`Majors.${user?.major}`)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl">
              <Calendar className="w-5 h-5 text-pink-500" />
              <div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{t('Profile.Year')}</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{user?.year}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Mood Calendar */}
      <div className="glass p-6 rounded-3xl fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('Profile.Daily Mood Calendar')}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{t('Profile.Your mood history')}</p>
        <div className="grid grid-cols-7 gap-2 text-center">
          {t('Profile.CalendarDays', { returnObjects: true }).map((d, i) => (
            <div key={i} className="text-xs font-bold text-slate-400 py-1">{d}</div>
          ))}
          {calendarDays.map((dayObj, i) => (
            <div 
              key={i}
              className="aspect-square rounded-lg flex items-center justify-center text-sm font-medium relative group transition-all"
              style={{
                backgroundColor: dayObj.mood ? `${dayObj.mood.backgroundColor}30` : 'transparent',
                border: dayObj.mood ? `2px solid ${dayObj.mood.backgroundColor}80` : '2px dashed var(--color-slate-200)',
                color: dayObj.mood ? dayObj.mood.backgroundColor : 'var(--color-slate-400)'
              }}
              title={dayObj.mood ? `${dayObj.mood.moodType} - ${dayObj.mood.title}` : t('Profile.No mood logged')}
            >
              {dayObj.mood ? (
                <span className="text-lg">{dayObj.mood.emoji}</span>
              ) : (
                dayObj.day
              )}
            </div>
          ))}
        </div>
      </div>

      {/* My Posts */}
      <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('Profile.Your Moods')}</h2>
        
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>
        ) : myMoods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myMoods.map((mood) => (
              <MoodCard 
                key={mood._id} 
                mood={mood} 
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-3xl">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">{t('Profile.No moods')}</h3>
          </div>
        )}
      </div>

      <MoodModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingMood(null); }} 
        onSuccess={fetchMyMoods}
        initialData={editingMood}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={executeDelete}
        title={t('Profile.DeleteTitle', 'Delete Post')}
        message={t('Profile.DeleteConfirm', 'Are you sure you want to delete this post?')}
        confirmText={t('Profile.Delete', 'Delete')}
        cancelText={t('Profile.Cancel', 'Cancel')}
      />
    </div>
  );
};

export default Profile;
