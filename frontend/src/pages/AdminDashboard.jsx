import React, { useState, useEffect } from 'react';
import { Users, Trash2, Edit, Shield, ShieldOff, Activity, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import { Button } from '../components/ui/Button';
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [recentMoods, setRecentMoods] = useState([]);
  const [reportedMoods, setReportedMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuthStore();
  const currentLocale = i18n.language === 'th' ? th : enUS;

  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState(null);
  const [confirmDeleteMoodId, setConfirmDeleteMoodId] = useState(null);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'reports', 'posts'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, moodsRes, reportsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/moods'),
        api.get('/admin/reports')
      ]);
      setUsers(usersRes.data);
      setRecentMoods(moodsRes.data);
      setReportedMoods(reportsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    if (userId === currentUser.id || userId === currentUser._id) return;
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(t('Admin.Error Update Role'));
    }
  };

  const handleDeleteUser = (userId) => {
    if (userId === currentUser.id || userId === currentUser._id) return;
    setConfirmDeleteUserId(userId);
  };

  const executeDeleteUser = async () => {
    if (!confirmDeleteUserId) return;
    try {
      await api.delete(`/admin/users/${confirmDeleteUserId}`);
      setUsers(users.filter(u => u._id !== confirmDeleteUserId));
      setRecentMoods(recentMoods.filter(m => m.createdBy !== confirmDeleteUserId));
    } catch (err) {
      alert(t('Admin.Error Delete User'));
    } finally {
      setConfirmDeleteUserId(null);
    }
  };

  const handleDeleteMood = (moodId) => {
    setConfirmDeleteMoodId(moodId);
  };

  const executeDeleteMood = async () => {
    if (!confirmDeleteMoodId) return;
    try {
      await api.delete(`/admin/moods/${confirmDeleteMoodId}`);
      setRecentMoods(recentMoods.filter(m => m._id !== confirmDeleteMoodId));
      setReportedMoods(reportedMoods.filter(m => m._id !== confirmDeleteMoodId));
    } catch (err) {
      alert(t('Admin.Error Delete Mood'));
    } finally {
      setConfirmDeleteMoodId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 glass skeleton rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-2xl">
          <Users className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('Admin.Admin Dashboard')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('Admin.Manage the community')}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 border-b-2 border-sky-500'
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-4 h-4" /> {t('Admin.Registered Students')}
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-b-2 border-red-500'
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Reported Posts ({reportedMoods.length})
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'posts'
              ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 border-b-2 border-pink-500'
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-4 h-4" /> {t('Admin.Recent Posts')}
        </button>
      </div>

      {/* Users Table */}
      {activeTab === 'users' && (
      <div className="glass rounded-3xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-800/50 scale-in">
        <div className="px-6 py-5 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50">
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{t('Admin.Registered Students')}</h3>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">{t('Admin.Student ID')}</th>
                <th className="px-6 py-4 font-medium">{t('Admin.Faculty / Major')}</th>
                <th className="px-6 py-4 font-medium">{t('Admin.Role')}</th>
                <th className="px-6 py-4 font-medium">{t('Admin.Joined')}</th>
                <th className="px-6 py-4 font-medium">{t('Admin.Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((user) => {
                const isMe = user._id === (currentUser.id || currentUser._id);
                return (
                  <tr key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                      {user.studentId}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {t(`Faculties.${user.faculty}`)} <br/> <span className="text-xs text-slate-400">{t(`Majors.${user.major}`)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {t(`Admin.Role.${user.role}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: currentLocale })}
                    </td>
                    <td className="px-6 py-4">
                      {!isMe && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRoleChange(user._id, user.role)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title={user.role === 'admin' ? t('Admin.Make Student') : t('Admin.Make Admin')}
                          >
                            {user.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('Admin.Delete User')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              {t('Admin.No users found')}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Reported Posts Table */}
      {activeTab === 'reports' && (
        <div className="glass rounded-3xl overflow-hidden shadow-sm border border-red-200/50 dark:border-red-900/30 scale-in">
          <div className="px-6 py-5 border-b border-red-200/50 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-red-800 dark:text-red-200">Reported Posts</h3>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Post Content</th>
                  <th className="px-6 py-4 font-medium">Report Reasons</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportedMoods.map((mood) => (
                  <tr key={mood._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{mood.title}</p>
                        <p className="text-xs text-slate-500">{mood.description}</p>
                        <p className="text-[10px] text-slate-400">By: {mood.anonymousName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <ul className="list-disc list-inside text-xs space-y-1">
                        {mood.reports.map((report, idx) => (
                          <li key={idx} className="text-red-600 dark:text-red-400">{report.reason}</li>
                        ))}
                      </ul>
                      <span className="text-[10px] text-slate-400 mt-2 block">Total Reports: {mood.reports.length}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDeleteMood(mood._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Reported Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reportedMoods.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                ไม่มีโพสต์ที่ถูกรายงาน
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Recent Posts Table */}
      {activeTab === 'posts' && (
      <div className="glass rounded-3xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-800/50 scale-in">
        <div className="px-6 py-5 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 flex items-center gap-3">
          <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{t('Admin.Recent Posts')}</h3>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">{t('Admin.Content')}</th>
                <th className="px-6 py-4 font-medium">{t('Admin.Author')}</th>
                <th className="px-6 py-4 font-medium">{t('Admin.Date')}</th>
                <th className="px-6 py-4 font-medium">{t('Admin.Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentMoods.map((mood) => (
                <tr key={mood._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-sm" style={{ backgroundColor: `${mood.backgroundColor}33` }}>
                        {mood.emoji}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{mood.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{mood.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <p className="font-medium text-xs">{mood.anonymousName}</p>
                    <p className="text-[10px] text-slate-400">{t(`Faculties.${mood.faculty}`)}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {formatDistanceToNow(new Date(mood.createdAt), { addSuffix: true, locale: currentLocale })}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleDeleteMood(mood._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('Admin.Delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentMoods.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              {t('Admin.No recent posts')}
            </div>
          )}
        </div>
      </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteUserId}
        onClose={() => setConfirmDeleteUserId(null)}
        onConfirm={executeDeleteUser}
        title={t('Admin.Delete User', 'Delete User')}
        message={t('Admin.Confirm Delete User', 'Confirm delete user and all their posts?')}
        confirmText={t('Admin.Delete', 'Delete')}
        cancelText={t('Profile.Cancel', 'Cancel')}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteMoodId}
        onClose={() => setConfirmDeleteMoodId(null)}
        onConfirm={executeDeleteMood}
        title={t('Profile.DeleteTitle', 'Delete Post')}
        message={t('Profile.DeleteConfirm', 'Are you sure you want to delete this mood?')}
        confirmText={t('Admin.Delete', 'Delete')}
        cancelText={t('Profile.Cancel', 'Cancel')}
      />
    </div>
  );
};

export default AdminDashboard;
