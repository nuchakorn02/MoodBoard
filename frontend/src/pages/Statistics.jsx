import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { format, subDays } from 'date-fns';
import { th, enUS } from 'date-fns/locale';

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
  Relaxed: '#84cc16',
};

const ALL_MOOD_TYPES = ['Happy', 'Sad', 'Angry', 'Excited', 'Tired', 'Stressed', 'Lonely', 'Confused', 'Motivated', 'Relaxed'];

// Custom tooltip for Line Chart
const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const filtered = payload.filter(p => p.value > 0);
    if (!filtered.length) return null;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-3 border border-slate-100 dark:border-slate-700 text-sm min-w-[140px]">
        <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
        {filtered.map(p => (
          <div key={p.dataKey} className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-slate-600 dark:text-slate-300">{p.name}</span>
            <span className="ml-auto font-bold text-slate-800 dark:text-slate-100">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-3 border border-slate-100 dark:border-slate-700 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
          <span className="font-semibold text-slate-700 dark:text-slate-200">{payload[0].name}</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{payload[0].value} posts · {payload[0].payload.percentage}%</p>
      </div>
    );
  }
  return null;
};

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMoods, setActiveMoods] = useState(new Set(['Happy', 'Sad', 'Stressed', 'Excited', 'Tired']));
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'th' ? th : enUS;

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

  const toggleMood = (mood) => {
    setActiveMoods(prev => {
      const next = new Set(prev);
      if (next.has(mood)) {
        if (next.size > 1) next.delete(mood); // keep at least 1
      } else {
        next.add(mood);
      }
      return next;
    });
  };

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
          <div className="glass p-6 rounded-3xl h-64 skeleton col-span-full"></div>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-center text-red-500 py-10 glass rounded-3xl">{error}</div>;

  // Format data for PieChart
  const pieData = Object.keys(stats.moodBreakdown).map(key => ({
    name: t(`MoodTypes.${key}`, key),
    value: stats.moodBreakdown[key].count,
    percentage: stats.moodBreakdown[key].percentage,
    color: moodColors[key] || '#6366f1',
  })).sort((a, b) => b.value - a.value);

  // Format data for BarChart (Faculty Ranking)
  const barData = stats.facultyRanking.map(item => ({
    name: t(`Faculties.${item._id}`, item._id),
    posts: item.count,
  }));

  // Format data for LineChart (Mood Trend - last 7 days)
  // Build last 7 days labels
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return format(d, 'yyyy-MM-dd');
  });

  // Pivot moodTrend: [{ date, Happy: N, Sad: N, ... }]
  const lineData = last7Days.map(dateStr => {
    const entry = { date: format(new Date(dateStr), 'MMM d', { locale: currentLocale }) };
    ALL_MOOD_TYPES.forEach(mood => {
      const found = stats.moodTrend.find(
        d => d._id.date === dateStr && d._id.moodType === mood
      );
      entry[mood] = found ? found.count : 0;
    });
    return entry;
  });

  // Summary stats for the top stats bar
  const totalHappy = stats.moodBreakdown['Happy']?.count || 0;
  const totalSad = stats.moodBreakdown['Sad']?.count || 0;
  const totalStressed = stats.moodBreakdown['Stressed']?.count || 0;
  const happyPct = stats.moodBreakdown['Happy']?.percentage || 0;
  const sadPct = stats.moodBreakdown['Sad']?.percentage || 0;
  const stressPct = stats.moodBreakdown['Stressed']?.percentage || 0;

  return (
    <div className="space-y-8 fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('Statistics.Campus Statistics')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('Statistics.Overview')}</p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Posts */}
        <div className="glass p-5 rounded-2xl flex flex-col items-center text-center col-span-2 md:col-span-1">
          <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.totalPosts}</p>
          <p className="text-sm text-slate-500 font-medium mt-1">{t('Statistics.Total Posts')}</p>
        </div>
        {/* Happy % */}
        <div className="glass p-5 rounded-2xl flex flex-col items-center text-center">
          <div className="text-3xl mb-2">😊</div>
          <p className="text-2xl font-extrabold text-emerald-500">{happyPct}%</p>
          <p className="text-sm text-slate-500 font-medium mt-1">{t('Statistics.Happy %', 'มีความสุข')}</p>
        </div>
        {/* Sad % */}
        <div className="glass p-5 rounded-2xl flex flex-col items-center text-center">
          <div className="text-3xl mb-2">😢</div>
          <p className="text-2xl font-extrabold text-blue-500">{sadPct}%</p>
          <p className="text-sm text-slate-500 font-medium mt-1">{t('Statistics.Sad %', 'เศร้า')}</p>
        </div>
        {/* Stress % */}
        <div className="glass p-5 rounded-2xl flex flex-col items-center text-center">
          <div className="text-3xl mb-2">😰</div>
          <p className="text-2xl font-extrabold text-rose-500">{stressPct}%</p>
          <p className="text-sm text-slate-500 font-medium mt-1">{t('Statistics.Stress %', 'เครียด')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Faculty Ranking - compact */}
        <div className="glass p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">{t('Statistics.Most Active Faculties')}</h3>
          <div className="space-y-3">
            {barData.slice(0, 6).map((item, idx) => {
              const maxVal = barData[0]?.posts || 1;
              const pct = Math.round((item.posts / maxVal) * 100);
              const colors = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[70%]">{item.name}</span>
                    <span className="text-slate-500 font-semibold">{item.posts}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: colors[idx] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Line Chart: 7-Day Mood Trend */}
      <div className="glass p-6 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t('Statistics.Mood Trend', '7 วันที่ผ่านมา')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t('Statistics.Trend Desc', 'แนวโน้มความรู้สึกของนักศึกษาแต่ละวัน')}</p>
          </div>
          {/* Mood toggles */}
          <div className="flex flex-wrap gap-1.5">
            {ALL_MOOD_TYPES.map(mood => (
              <button
                key={mood}
                onClick={() => toggleMood(mood)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                  activeMoods.has(mood)
                    ? 'text-white border-transparent shadow-sm'
                    : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                }`}
                style={activeMoods.has(mood) ? { backgroundColor: moodColors[mood] } : {}}
              >
                {t(`MoodTypes.${mood}`, mood)}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomLineTooltip />} />
              {ALL_MOOD_TYPES.filter(m => activeMoods.has(m)).map(mood => (
                <Line
                  key={mood}
                  type="monotone"
                  dataKey={mood}
                  name={t(`MoodTypes.${mood}`, mood)}
                  stroke={moodColors[mood]}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: moodColors[mood], strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart: Faculty Ranking Full */}
      <div className="glass p-6 rounded-3xl">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">{t('Statistics.Faculty Bar Chart', 'สถิติตามคณะ (ทั้งหมด)')}</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 20, left: -10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="posts" name={t('Statistics.Posts', 'โพสต์')} fill="#6366f1" radius={[6, 6, 0, 0]}>
                {barData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${230 + index * 12}, 75%, 62%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
