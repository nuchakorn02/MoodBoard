import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2, Clock, MapPin, Heart, MessageCircle, AlertTriangle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';
import PromptModal from './PromptModal';

const REACTION_EMOJIS = {
  Like: '👍',
  Love: '❤️',
  Haha: '😂',
  Wow: '😮',
  Sad: '😢',
  Angry: '😡'
};

const MoodCard = ({ mood, onEdit, onDelete }) => {
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  
  const currentLocale = i18n.language === 'th' ? th : enUS;
  
  // Check if current user is owner (using the flag injected by backend to protect identity) or admin
  const isOwner = mood.isOwner === true;
  const isAdmin = user && user.role === 'admin';
  const canModify = isOwner || isAdmin;
  const canOpenMenu = !!user;

  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localMood, setLocalMood] = useState(mood);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleReact = async (type) => {
    if (!user) return toast.error('Please login to react');
    try {
      const { data } = await api.post(`/moods/${localMood._id}/react`, { type });
      setLocalMood({ ...localMood, reactions: data });
      setShowReactionPicker(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to comment');
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { data } = await api.post(`/moods/${localMood._id}/comment`, { text: commentText });
      setLocalMood({ ...localMood, comments: data });
      setCommentText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportClick = () => {
    if (!user) return toast.error('Please login to report');
    setShowReportModal(true);
    setShowMenu(false);
  };

  const executeReport = async (reason) => {
    try {
      await api.post(`/moods/${localMood._id}/report`, { reason });
      toast.success(i18n.language === 'th' ? 'รายงานโพสต์สำเร็จ' : 'Report submitted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report');
    } finally {
      setShowReportModal(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
  };

  const executeDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      const { data } = await api.delete(`/moods/${localMood._id}/comment/${commentToDelete}`);
      setLocalMood({ ...localMood, comments: data });
      toast.success(i18n.language === 'th' ? 'ลบคอมเมนต์แล้ว' : 'Comment deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    } finally {
      setCommentToDelete(null);
    }
  };

  // Find user's current reaction if any
  const userReaction = user && localMood.reactions?.find(r => r.user === user._id || r.user === user.id)?.type;
  
  return (
    <div 
      className="glass p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden group transition-all duration-300 hover:shadow-2xl dark:hover:shadow-sky-500/10 hover:-translate-y-1"
      style={{ borderTop: `4px solid ${mood.backgroundColor || '#6366f1'}` }}
    >
      {/* Header: Avatar, Name, Faculty, Options */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner"
            style={{ backgroundColor: `${mood.backgroundColor}33` }}
          >
            {mood.emoji}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {mood.anonymousName}
            </h3>
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1 gap-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {t(`Faculties.${mood.faculty}`)} ({t(`Majors.${mood.major}`)})
              </span>
            </div>
          </div>
        </div>

        {canOpenMenu && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10 scale-in origin-top-right">
                {isOwner && (
                  <button 
                    onClick={() => { setShowMenu(false); onEdit(localMood); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" /> {t('MoodCard.Edit')}
                  </button>
                )}
                {canModify && (
                  <button 
                    onClick={() => { setShowMenu(false); onDelete(localMood._id); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> {t('MoodCard.Delete')}
                  </button>
                )}
                {user && (
                  <button 
                    onClick={handleReportClick}
                    className="w-full text-left px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 mt-1 pt-1"
                  >
                    <AlertTriangle className="w-4 h-4" /> {i18n.language === 'th' ? 'รายงาน' : 'Report'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-1">
        <h4 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">{localMood.title}</h4>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {localMood.description}
        </p>
      </div>

      {/* Interactions */}
      <div className="flex items-center gap-4 mt-2">
        <div 
          className="relative flex items-center gap-1"
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          <button 
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${userReaction ? 'text-sky-600 bg-sky-50 dark:bg-sky-900/30' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
            onClick={() => handleReact(userReaction || 'Like')}
          >
            {userReaction ? <span>{REACTION_EMOJIS[userReaction]}</span> : <Heart className="w-4 h-4" />}
            <span>{localMood.reactions?.length || 0}</span>
          </button>
          
          {/* Reaction Picker Popup */}
          {showReactionPicker && (
            <div className="absolute bottom-full left-0 pb-2 z-20">
              <div className="flex items-center gap-1 p-2 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 scale-in">
                {Object.entries(REACTION_EMOJIS).map(([key, emoji]) => (
                  <button
                    key={key}
                    onClick={(e) => { e.stopPropagation(); handleReact(key); }}
                    className="text-2xl hover:scale-125 transition-transform px-1"
                    title={key}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${showComments ? 'text-sky-600 bg-sky-50 dark:bg-sky-900/30' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{localMood.comments?.length || 0}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2 flex flex-col gap-3 scale-in">
          {localMood.comments?.length > 0 ? (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {localMood.comments.map((comment, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl relative group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">{comment.anonymousName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: currentLocale })}</span>
                      {user && (user._id === comment.createdBy || user.id === comment.createdBy || user.role === 'admin') && (
                        <button 
                          onClick={() => handleDeleteComment(comment._id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-slate-400 py-2">
              {i18n.language === 'th' ? 'ยังไม่มีคอมเมนต์ เป็นคนแรกที่คอมเมนต์เลย!' : 'No comments yet. Be the first!'}
            </p>
          )}

          {user && (
            <form onSubmit={handleComment} className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder={i18n.language === 'th' ? 'เขียนคอมเมนต์แบบไม่ระบุตัวตน...' : 'Write an anonymous comment...'}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="input-field flex-grow text-sm py-2"
                disabled={isSubmitting}
              />
              <button 
                type="submit" 
                disabled={isSubmitting || !commentText.trim()}
                className="bg-sky-500 text-white p-2 rounded-xl hover:bg-sky-600 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* Footer: Mood type tag and timestamp */}
      <div className="mt-auto pt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
        <span 
          className="px-2.5 py-1 text-xs font-medium rounded-full"
          style={{ backgroundColor: `${localMood.backgroundColor}20`, color: localMood.backgroundColor || '#6366f1' }}
        >
          {t(`MoodTypes.${localMood.moodType}`)}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(localMood.createdAt), { addSuffix: true, locale: currentLocale })}
        </span>
      </div>

      <ConfirmModal
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onConfirm={executeDeleteComment}
        title={i18n.language === 'th' ? 'ลบคอมเมนต์' : 'Delete Comment'}
        message={i18n.language === 'th' ? 'คุณแน่ใจหรือไม่ว่าต้องการลบคอมเมนต์นี้?' : 'Are you sure you want to delete this comment?'}
        confirmText={t('Profile.Delete', 'Delete')}
        cancelText={t('Profile.Cancel', 'Cancel')}
      />

      <PromptModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={executeReport}
        title={i18n.language === 'th' ? 'รายงานโพสต์' : 'Report Post'}
        message={i18n.language === 'th' ? 'ทำไมคุณถึงรายงานโพสต์นี้?' : 'Why are you reporting this post?'}
        placeholder={i18n.language === 'th' ? 'ระบุเหตุผล...' : 'Enter reason...'}
        submitText={i18n.language === 'th' ? 'รายงาน' : 'Report'}
        cancelText={t('Profile.Cancel', 'Cancel')}
      />
    </div>
  );
};

export default MoodCard;
