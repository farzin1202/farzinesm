
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../store';
import { Moon, Sun, Globe, LogOut, User as UserIcon, Settings, ChevronDown, PenLine, Check, Key } from 'lucide-react';
import { TRANSLATIONS } from '../../constants';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, dispatch } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  
  const menuRef = useRef<HTMLDivElement>(null);
  
  const t = TRANSLATIONS[state.settings.language];
  const isRtl = state.settings.language === 'fa';
  const user = state.user;

  // Initialize edit name when menu opens or user changes
  useEffect(() => {
    if (user) {
        setEditName(user.name);
    }
  }, [user]);

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const toggleLang = () => {
    dispatch({ type: 'SET_LANGUAGE', payload: state.settings.language === 'en' ? 'fa' : 'en' });
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    setIsMenuOpen(false);
  };

  const handleUpdateProfile = () => {
    if (editName.trim()) {
        dispatch({ type: 'UPDATE_USER', payload: { name: editName } });
        setIsEditingProfile(false);
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_API_KEY', payload: e.target.value });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsEditingProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300"
    >
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/75 dark:bg-slate-950/75 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-indigo-500/20 shadow-lg">
              <span className="text-white font-bold text-base">F</span>
            </div>
            <span className="font-semibold text-lg tracking-tight hidden sm:block text-slate-800 dark:text-slate-100">FxAnalytics</span>
          </div>

          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <UserIcon size={16} />
                </div>
              )}
              <div className="hidden md:flex flex-col items-start">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">{user?.name || 'Guest'}</span>
                  <span className="text-[10px] text-slate-400 leading-none mt-1">{user?.email || ''}</span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div className={`absolute top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isRtl ? 'left-0' : 'right-0'}`}>
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        {isEditingProfile ? (
                            <div className="flex items-center gap-2">
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="flex-1 text-sm p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateProfile()}
                                />
                                <button 
                                    onClick={handleUpdateProfile}
                                    className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <Check size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{user?.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                </div>
                                <button 
                                    onClick={() => { setIsEditingProfile(true); setEditName(user?.name || ''); }}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                    title="Edit Name"
                                >
                                    <PenLine size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-2 space-y-1">
                        <div className="px-3 py-2">
                             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block flex items-center gap-1.5">
                                <Key size={12} />
                                {t.apiKeyLabel}
                             </label>
                             <input 
                                type="password"
                                value={state.settings.apiKey || ''}
                                onChange={handleApiKeyChange}
                                placeholder={t.apiKeyPlaceholder}
                                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white placeholder:text-slate-400"
                             />
                             <p className="text-[10px] text-slate-400 mt-1">{t.apiKeyHelp}</p>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 my-1"></div>

                        <button onClick={toggleTheme} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-3">
                                {state.settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                                <span>{t.theme}</span>
                            </div>
                            <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md capitalize">{state.settings.theme}</span>
                        </button>
                        
                        <button onClick={toggleLang} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm text-slate-600 dark:text-slate-300">
                             <div className="flex items-center gap-3">
                                <Globe size={16} />
                                <span>{t.language}</span>
                            </div>
                            <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md capitalize">{state.settings.language === 'en' ? 'English' : 'فارسی'}</span>
                        </button>
                    </div>

                    <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 transition-colors text-sm font-medium">
                            <LogOut size={16} />
                            <span>{t.signOut}</span>
                        </button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};