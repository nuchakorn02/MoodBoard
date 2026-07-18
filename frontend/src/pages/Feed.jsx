import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, PlusCircle, AlertCircle, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import MoodCard from '../components/MoodCard';
import MoodModal from '../components/MoodModal';
import ConfirmModal from '../components/ConfirmModal';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { faculties as kmitlFaculties, kmitlData } from '../utils/constants';

const moodTypes = ['All', 'Happy', 'Sad', 'Angry', 'Excited', 'Tired', 'Stressed', 'Lonely', 'Confused', 'Motivated', 'Relaxed'];
const faculties = ['All', ...kmitlFaculties];
const dateFilters = ['All Time', 'Today', 'This Week', 'This Month', 'This Year'];
const yearOptions = ['All', '1', '2', '3', '4', '5'];
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [moodType, setMoodType] = useState('All');
  const [faculty, setFaculty] = useState('All');
  const [major, setMajor] = useState('All');
  const [year, setYear] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMood, setEditingMood] = useState(null);
  const { t } = useTranslation();
  const { user } = useAuthStore();

  // Dynamic major list based on selected faculty
  const majorOptions = useMemo(() => {
    if (faculty === 'All') return ['All'];
    return ['All', ...(kmitlData[faculty] || [])];
  }, [faculty]);

  // Reset major when faculty changes
  const handleFacultyChange = (e) => {
    setFaculty(e.target.value);
    setMajor('All');
    setPage(1);
  };

  // Check if any advanced filter is active
  const hasActiveFilters = major !== 'All' || year !== 'All' || moodType !== 'All' || dateFilter !== 'All Time' || faculty !== 'All';

  const clearAllFilters = () => {
    setMoodType('All');
    setFaculty('All');
    setMajor('All');
    setYear('All');
    setDateFilter('All Time');
    setSortBy('newest');
    setSearchTerm('');
    setPage(1);
  };

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
      if (major !== 'All') params.append('major', major);
      if (year !== 'All') params.append('year', year);
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
  }, [page, searchTerm, moodType, faculty, major, year, dateFilter, sortBy, t]);

  useEffect(() => {
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
      <div className="glass p-4 rounded-2xl mb-8 space-y-3">
        {/* Row 1: Search + Sort + Advanced Toggle */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-grow min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              className="input-field w-full !pl-10"
              placeholder={t('Feed.Search')}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <Select
            className="w-full sm:w-40"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            options={sortOptions.map(s => ({ value: s.value, label: t(s.labelKey, s.value) }))}
          />
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all whitespace-nowrap ${
              showAdvanced || hasActiveFilters
                ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-200 dark:shadow-sky-900'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('Feed.Filters', 'ตัวกรอง')}
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
            )}
          </button>
        </div>

        {/* Row 2: Advanced Filters (collapsible) */}
        {showAdvanced && (
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 animate-in slide-in-from-top-2 duration-200">
            <Select
              className="w-full"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              options={dateFilters.map(d => ({ value: d, label: t(`Feed.${d}`) }))}
            />
            <Select
              className="w-full"
              value={moodType}
              onChange={(e) => { setMoodType(e.target.value); setPage(1); }}
              options={moodTypes.map(m => ({ value: m, label: t(`MoodTypes.${m}`) }))}
            />
            <Select
              className="w-full"
              value={faculty}
              onChange={handleFacultyChange}
              options={faculties.map(f => ({ value: f, label: t(`Faculties.${f}`, f) }))}
            />
            <Select
              className="w-full"
              value={major}
              onChange={(e) => { setMajor(e.target.value); setPage(1); }}
              options={majorOptions.map(m => ({ value: m, label: m === 'All' ? t('Feed.All Majors', 'ทุกสาขา') : t(`Majors.${m}`, m) }))}
              disabled={faculty === 'All'}
            />
            <Select
              className="w-full"
              value={year}
              onChange={(e) => { setYear(e.target.value); setPage(1); }}
              options={yearOptions.map(y => ({
                value: y,
                label: y === 'All' ? t('Feed.All Years', 'ทุกชั้นปี') : `${t('Feed.Year Prefix', 'ชั้นปี')} ${y}`
              }))}
            />
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="col-span-2 md:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <X className="w-4 h-4" />
                {t('Feed.Clear Filters', 'ล้างตัวกรอง')}
              </button>
            )}
          </div>
        )}
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
