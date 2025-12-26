
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../store';
import { Moon, Sun, Globe, LogOut, User as UserIcon, Settings, ChevronDown, Check, X, Shield, UserCog } from 'lucide-react';
import { TRANSLATIONS } from '../../constants';
import { storageService } from '../../services/storageService';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, dispatch } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  // Profile Form State
  const [editName, setEditName] = useState('');
  
  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  
  const t = TRANSLATIONS[state.settings.language];
  const isRtl = state.settings.language === 'fa';
  const user = state.user;

  // Initialize edit name
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

  const openSettings = () => {
      setIsSettingsOpen(true);
      setIsMenuOpen(false);
      setMessage(null);
      setCurrentPassword('');
      setNewPassword('');
  };

  const handleUpdateProfile = () => {
      if (!user) return;
      if (editName.trim()) {
          // Update Redux state
          dispatch({ type: 'UPDATE_USER', payload: { name: editName } });
          // Update Persistent Registry
          storageService.updateUserRegistry(user.id, { name: editName });
          setMessage({ type: 'success', text: t.usernameUpdated });
          setTimeout(() => setMessage(null), 3000);
      }
  };

  const handleChangePassword = () => {
      if (!user) return;
      
      if (!currentPassword || !newPassword) return;

      if (newPassword.length < 6) {
           setMessage({ type: 'error', text: state.settings.language === 'fa' ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : 'Password must be at least 6 characters' });
           return;
      }

      const isValid = storageService.verifyPassword(user.id, currentPassword);
      
      if (isValid) {
          storageService.updateUserRegistry(user.id, { password: newPassword });
          setMessage({ type: 'success', text: t.passwordUpdated });
          setCurrentPassword('');
          setNewPassword('');
      } else {
          setMessage({ type: 'error', text: t.incorrectPassword });
      }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
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
                         <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{user?.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                            <button 
                                onClick={openSettings}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                title="Settings"
                            >
                                <Settings size={16} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-2 space-y-1">
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

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Settings size={20} className="text-slate-400" />
                        {t.settings}
                    </h3>
                    <button 
                        onClick={() => setIsSettingsOpen(false)}
                        className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex border-b border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={() => { setActiveTab('profile'); setMessage(null); }}
                        className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <UserCog size={16} />
                            {t.account}
                        </div>
                    </button>
                    <button 
                        onClick={() => { setActiveTab('security'); setMessage(null); }}
                        className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'security' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                         <div className="flex items-center justify-center gap-2">
                            <Shield size={16} />
                            {t.security}
                        </div>
                    </button>
                </div>

                <div className="p-8">
                    {message && (
                        <div className={`mb-6 p-3 rounded-xl text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
                            {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 opacity-60">
                                    Email (Cannot be changed)
                                </label>
                                <input
                                    type="text"
                                    value={user?.email}
                                    disabled
                                    className="w-full p-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 cursor-not-allowed"
                                />
                             </div>
                             <div className="pt-4">
                                <button 
                                    onClick={handleUpdateProfile}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    {t.update} {t.profile}
                                </button>
                             </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    {t.currentPassword}
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    {t.newPassword}
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                />
                             </div>
                             <div className="pt-4">
                                <button 
                                    onClick={handleChangePassword}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    {t.changePassword}
                                </button>
                             </div>
                        </div>
                    )}
                </div>
             </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
