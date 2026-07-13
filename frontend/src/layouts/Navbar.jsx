import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, User as UserIcon, LayoutDashboard, PlusCircle, Menu, X } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'th' ? 'en' : 'th');
  };

  useEffect(() => {
    // Check local storage or system preference
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="glass-nav fixed top-0 w-full z-50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                M
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400">
                Mood of the Major
              </span>
            </Link>

            {user && (
              <div className="hidden md:flex space-x-1 ml-4">
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  {t('Navbar.Feed')}
                </Link>
                <Link to="/statistics" className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  {t('Navbar.Statistics')}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" /> {t('Navbar.Admin Dashboard')}
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 text-sm font-bold rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {i18n.language === 'th' ? 'EN' : 'TH'}
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-600">
                    <UserIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user.studentId}</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} title={t('Navbar.Logout')}>
                  <LogOut className="w-5 h-5 text-red-500 dark:text-red-400" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">{t('Navbar.Login')}</Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">{t('Navbar.Register')}</Button>
                </Link>
              </div>
            )}
            
            {/* Hamburger Button */}
            {user && (
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t('Navbar.Feed')}
            </Link>
            <Link 
              to="/statistics" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t('Navbar.Statistics')}
            </Link>
            {user.role === 'admin' && (
              <Link 
                to="/admin" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" /> {t('Navbar.Admin Dashboard')}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
