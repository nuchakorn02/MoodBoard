import React, { useState, useEffect, useCallback } from 'react';
import { Search, PlusCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import MoodCard from '../components/MoodCard';
import MoodModal from '../components/MoodModal';
import ConfirmModal from '../components/ConfirmModal';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { faculties as kmitlFaculties } from '../utils/constants';

const moodTypes = ['All', 'Happy', 'Sad', 'Angry', 'Excited', 'Tired', 'Stressed', 'Lonely', 'Confused', 'Motivated', 'Relaxed'];
const faculties = ['All', ...kmitlFaculties];
const dateFilters = ['All Time', 'Today', 'This Week', 'This Month', 'This Year'];
const sortOptions = [
  { value: 'newest', labelKey: 'Feed.Sort.Newest' },
  { value: 'oldest', labelKey: 'Feed.Sort.Oldest' },
  { value: 'most_popular', labelKey: 'Feed.Sort.MostPopular' },
];

const Feed = () => {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [moodType, setMoodType] = useState('All');
  const [faculty, setFaculty] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMood, setEditingMood] = useState(null);
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const fetchMoods = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 12,
        sort: sortBy,
      });
      if (searchTerm) params.append('keyword', searchTerm);
      if (moodType !== 'All') params.append('moodType', moodType);
      if (faculty !== 'All') params.append('faculty', faculty);
      if (dateFilter !== 'All Time') params.append('dateFilter', dateFilter);

      const { data } = await api.get(`/moods?${params.toString()}`);
      setMoods(data.data);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      setError(t('Feed.Failed fetch'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, moodType, faculty, dateFilter, sortBy, t]);

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchMoods();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMoods]);

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      const { user } = useAuthStore.getState();
      if (user?.role === 'admin') {
        await api.delete(`/admin/moods/${confirmDeleteId}`);
      } else {
        await api.delete(`/moods/${confirmDeleteId}`);
      }
      fetchMoods();
      toast.success(t('Feed.Delete Success') || 'Post deleted successfully');
    } catch (err) {
      console.error('Failed to delete mood', err);
      toast.error(t('Feed.Delete Failed') || 'Failed to delete post');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const openEditModal = (mood) => {
    setEditingMood(mood);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-4xl">✨</span> {t('Feed.Campus Vibe')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {t('Feed.See how everyone')}
          </p>
        </div>
        {user && (
          <Button onClick={() => { setEditingMood(null); setIsModalOpen(true); }} className="flex items-center gap-2 shadow-lg hover:shadow-sky-500/25 w-full md:w-auto">
            <PlusCircle className="w-5 h-5" />
            {t('Feed.Express Yourself')}
          </Button>
        )}
      </div>

      {/* Filters Section */}
      <div className="glass p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            className="input-field w-full !pl-10"
            placeholder={t('Feed.Search')}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
        
        <div className="grid grid-cols-2 md:flex w-full md:w-auto gap-3">
          <Select 
            className="w-full md:w-36 lg:w-40"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            options={sortOptions.map(s => ({ value: s.value, label: t(s.labelKey, s.value) }))}
          />
          <Select 
            className="w-full md:w-36 lg:w-40"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            options={dateFilters.map(d => ({ value: d, label: t(`Feed.${d}`) }))}
          />
          <Select 
            className="w-full md:w-36 lg:w-40"
            value={moodType}
            onChange={(e) => { setMoodType(e.target.value); setPage(1); }}
            options={moodTypes.map(m => ({ value: m, label: t(`MoodTypes.${m}`) }))}
          />
          <Select 
            className="w-full col-span-2 md:col-span-1 md:w-48 lg:w-56"
            value={faculty}
            onChange={(e) => { setFaculty(e.target.value); setPage(1); }}
            options={faculties.map(f => ({ value: f, label: t(`Faculties.${f}`) }))}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-8 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass p-5 rounded-2xl h-48 skeleton"></div>
          ))}
        </div>
      ) : moods.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moods.map((mood) => (
              <MoodCard 
                key={mood._id} 
                mood={mood} 
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('Feed.Previous')}
              </Button>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-lg">
                {t('Feed.Page')} {page} {t('Feed.of')} {totalPages}
              </span>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t('Feed.Next')}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 px-4 glass rounded-3xl">
          <div className="text-6xl mb-4 opacity-50">👻</div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">{t('Feed.No moods')}</h3>
        </div>
      )}

      {/* Modals */}
      <MoodModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchMoods}
        initialData={editingMood}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={executeDelete}
        title={t('Profile.DeleteTitle', 'Delete Post')}
        message={t('Profile.DeleteConfirm', 'Are you sure you want to delete this mood?')}
        confirmText={t('Admin.Delete', 'Delete')}
        cancelText={t('Profile.Cancel', 'Cancel')}
      />
    </div>
  );
};

export default Feed;
