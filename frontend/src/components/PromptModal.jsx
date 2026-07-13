import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

const PromptModal = ({ isOpen, onClose, onSubmit, title, message, submitText, cancelText, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSubmit(inputValue);
    setInputValue('');
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden scale-in">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              {message}
            </p>
            <input
              type="text"
              className="input-field w-full"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              {cancelText}
            </Button>
            <Button type="submit" disabled={!inputValue.trim()} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-transparent">
              {submitText}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PromptModal;
