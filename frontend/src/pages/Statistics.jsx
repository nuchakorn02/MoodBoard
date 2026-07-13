import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const moodColors = {
  Happy: '#10b981',
  Sad: '#3b82f6',
  Angry: '#ef4444',
  Excited: '#f59e0b',
  Tired: '#64748b',
  Stressed: '#f43f5e',
  Lonely: '#8b5cf6',
  Confused: '#06b6d4',
  Motivated: '#14b8a6',
  Relaxed: '#84cc16'
};

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/statistics');
        setStats(data);
      } catch (err) {
        setError('Failed to load statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 fade-in-up">
        <div>
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-3xl h-96 skeleton"></div>
          <div className="glass p-6 rounded-3xl h-96 skeleton"></div>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-center text-red-500 py-10 glass rounded-3xl">{error}</div>;

  // Format data for PieChart
  const pieData = Object.keys(stats.moodBreakdown).map(key => ({
    name: key,
    value: stats.moodBreakdown[key].count,
    color: moodColors[key] || '#6366f1'
  })).sort((a, b) => b.value - a.value);

  // Format data for BarChart (Faculty Ranking)
  const barData = stats.facultyRanking.map(item => ({
    name: t(`Faculties.${item._id}`),
    posts: item.count
  }));

  return (
    <div className="space-y-8 fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('Statistics.Campus Statistics')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('Statistics.Overview')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Total Posts Card */}
        <div className="glass p-6 rounded-3xl flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{stats.totalPosts}</h2>
          <p className="text-slate-500 font-medium">{t('Statistics.Total Posts')}</p>
        </div>

        {/* Pie Chart: Mood Breakdown */}
        <div className="glass p-6 rounded-3xl lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">{t('Statistics.Mood Breakdown')}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${t(`MoodTypes.${name}`)} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Faculty Ranking */}
        <div className="glass p-6 rounded-3xl lg:col-span-3">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">{t('Statistics.Most Active Faculties')}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="posts" fill="#6366f1" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${230 + index * 10}, 80%, 65%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
