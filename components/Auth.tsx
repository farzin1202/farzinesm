
import React, { useState } from 'react';
import { useApp } from '../store';
import { TRANSLATIONS } from '../constants';
import { ShieldCheck, User, Mail, ArrowRight, Lock, AlertCircle, Loader2, Check, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';
import { storageService } from '../services/storageService';

type AuthMode = 'login' | 'signup' | 'forgot_email' | 'forgot_reset';

export const Auth: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  
  // Login/Signup State
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(true);

  // Forgot Password State
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
    
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const t = TRANSLATIONS[state.settings.language];

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail || !manualPassword) return;

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Simulate Network Delay
    setTimeout(() => {
        if (manualPassword.length < 6) {
            setErrorMsg(state.settings.language === 'fa' ? "رمز عبور باید حداقل ۶ کاراکتر باشد" : "Password must be at least 6 characters");
            setIsLoading(false);
            return;
        }

        const registry = storageService.getRegistry();
        const existingUser = registry.find((u) => u.email.toLowerCase() === manualEmail.toLowerCase());

        if (authMode === 'signup') {
            // REGISTER LOGIC
            if (existingUser) {
                setErrorMsg(state.settings.language === 'fa' ? "این ایمیل قبلا ثبت شده است" : "Account already exists with this email");
                setIsLoading(false);
                return;
            }

            const newUser = {
                id: 'user-' + Math.random().toString(36).substr(2, 9),
                name: manualName || manualEmail.split('@')[0],
                email: manualEmail,
                password: manualPassword,
                avatarUrl: `https://ui-avatars.com/api/?name=${manualName || manualEmail}&background=random`,
                authProvider: 'local' as const
            };

            const registered = storageService.registerUser(newUser);
            
            if (registered) {
                setAuthMode('login');
                setSuccessMsg(state.settings.language === 'fa' 
                    ? "حساب شما با موفقیت ساخته شد. لطفا وارد شوید." 
                    : "Account created successfully. Please sign in.");
            } else {
                setErrorMsg("Registration failed. Please try again.");
            }
            
            setIsLoading(false);

        } else {
            // LOGIN LOGIC
            if (!existingUser) {
                setErrorMsg(state.settings.language === 'fa' ? "کاربری با این ایمیل یافت نشد. لطفا ثبت نام کنید." : "User not found. Please Sign Up first.");
                setIsLoading(false);
                return;
            }

            if (existingUser.password !== manualPassword) {
                setErrorMsg(state.settings.language === 'fa' ? "رمز عبور اشتباه است." : "Invalid password.");
                setIsLoading(false);
                return;
            }

            const userState = storageService.loadUserState(existingUser.id);
            if (userState.user) {
                userState.user.rememberMe = stayLoggedIn;
            }

            dispatch({ 
                type: 'LOAD_STATE', 
                payload: userState
            });
            setIsLoading(false);
        }
    }, 800);
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setErrorMsg('');

      setTimeout(() => {
          const code = storageService.initiatePasswordReset(manualEmail);
          
          if (code) {
              // Simulated Email Sending
              // In a real app, backend sends email. Here we show it for testing.
              const simulatedEmailMsg = state.settings.language === 'fa' 
                ? `(شبیه‌سازی) کد تایید شما: ${code}` 
                : `(Simulation) Your code is: ${code}`;
              
              setSuccessMsg(simulatedEmailMsg); 
              setAuthMode('forgot_reset');
          } else {
              setErrorMsg(t.emailNotFound);
          }
          setIsLoading(false);
      }, 800);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setErrorMsg('');
      
      setTimeout(() => {
          if (newPassword.length < 6) {
              setErrorMsg(state.settings.language === 'fa' ? "رمز عبور جدید باید حداقل ۶ کاراکتر باشد" : "New password must be at least 6 characters");
              setIsLoading(false);
              return;
          }

          const success = storageService.completePasswordReset(manualEmail, resetCode, newPassword);
          
          if (success) {
              setAuthMode('login');
              setSuccessMsg(t.resetSuccessMsg);
              setManualPassword(''); // clear field
              setNewPassword('');
              setResetCode('');
          } else {
              setErrorMsg(t.invalidCode);
          }
          setIsLoading(false);
      }, 800);
  };

  const toggleSignup = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Header Icon */}
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-indigo-100 dark:ring-indigo-800">
            {authMode.includes('forgot') ? (
                <KeyRound className="w-8 h-8 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
            ) : (
                <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
            )}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {authMode === 'signup' && (state.settings.language === 'fa' ? "ساخت حساب کاربری" : "Create Account")}
            {authMode === 'login' && t.welcomeTitle}
            {authMode.includes('forgot') && t.forgotPassword}
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 mb-8">
            {authMode === 'login' && "Sign in to access your secure trade journal."}
            {authMode === 'signup' && "Start your journey to consistent profitability."}
            {authMode === 'forgot_email' && (state.settings.language === 'fa' ? "ایمیل خود را وارد کنید تا کد تایید ارسال شود." : "Enter your email to receive a verification code.")}
            {authMode === 'forgot_reset' && (state.settings.language === 'fa' ? "کد دریافتی و رمز عبور جدید را وارد کنید." : "Enter the code and your new password.")}
        </p>

        {errorMsg && (
            <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2 animate-in slide-in-from-top-1">
                <AlertCircle size={16} className="shrink-0" />
                <span className="text-left flex-1">{errorMsg}</span>
            </div>
        )}

        {successMsg && (
            <div className="w-full mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2 animate-in slide-in-from-top-1 text-left">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span className="flex-1 font-medium">{successMsg}</span>
            </div>
        )}

        {/* FORMS */}
        
        {/* 1. Login & Signup Form */}
        {(authMode === 'login' || authMode === 'signup') && (
            <form onSubmit={handleManualAuth} className="w-full space-y-3">
                {authMode === 'signup' && (
                    <div className="relative animate-in slide-in-from-top-2 fade-in">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder={state.settings.language === 'fa' ? "نام کامل" : "Full Name"}
                            value={manualName}
                            onChange={(e) => setManualName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-900 dark:text-white"
                            required={authMode === 'signup'}
                        />
                    </div>
                )}
                <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="email" 
                        placeholder={state.settings.language === 'fa' ? "ایمیل" : "Email Address"}
                        value={manualEmail}
                        onChange={(e) => setManualEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-900 dark:text-white"
                        required
                    />
                </div>
                <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="password" 
                        placeholder={state.settings.language === 'fa' ? "رمز عبور" : "Password"}
                        value={manualPassword}
                        onChange={(e) => setManualPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-900 dark:text-white"
                        required
                        minLength={6}
                    />
                </div>

                {/* Login Options: Forgot Pass & Stay Logged In */}
                {authMode === 'login' && (
                    <div className="flex items-center justify-between text-xs px-1">
                         <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setStayLoggedIn(!stayLoggedIn)}
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                    stayLoggedIn 
                                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                                        : 'bg-transparent border-slate-300 dark:border-slate-600'
                                }`}
                            >
                                {stayLoggedIn && <Check size={12} strokeWidth={3} />}
                            </button>
                            <span 
                                onClick={() => setStayLoggedIn(!stayLoggedIn)}
                                className="text-slate-600 dark:text-slate-400 cursor-pointer"
                            >
                                {t.stayLoggedIn}
                            </span>
                        </div>
                        
                        {/* 
                          DISABLED FOR NOW: FORGOT PASSWORD BUTTON
                          To re-enable, uncomment the block below.
                        */}
                        {/* 
                        <button 
                            type="button"
                            onClick={() => { setAuthMode('forgot_email'); setErrorMsg(''); setSuccessMsg(''); }}
                            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                        >
                            {t.forgotPassword}
                        </button>
                        */}
                    </div>
                )}
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-500/20 disabled:opacity-70 mt-2"
                >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                        <>
                            <span>{authMode === 'signup' ? t.getStarted : (state.settings.language === 'fa' ? "ورود به حساب" : "Sign In")}</span>
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>
        )}

        {/* 2. Request Code Form */}
        {authMode === 'forgot_email' && (
             <form onSubmit={handleRequestResetCode} className="w-full space-y-4 animate-in fade-in zoom-in-95">
                <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="email" 
                        placeholder={state.settings.language === 'fa' ? "ایمیل خود را وارد کنید" : "Enter your email"}
                        value={manualEmail}
                        onChange={(e) => setManualEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-900 dark:text-white"
                        required
                        autoFocus
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-500/20 disabled:opacity-70"
                >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                        <>
                            <span>{t.sendCode}</span>
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
                <button 
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm mt-4 transition-colors"
                >
                    <ArrowLeft size={14} />
                    {t.backToLogin}
                </button>
             </form>
        )}

        {/* 3. Reset Password Form */}
        {authMode === 'forgot_reset' && (
             <form onSubmit={handleResetPassword} className="w-full space-y-3 animate-in fade-in zoom-in-95">
                <div className="relative">
                    <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder={t.verificationCode}
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-900 dark:text-white tracking-widest font-mono"
                        required
                        maxLength={6}
                    />
                </div>
                <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="password" 
                        placeholder={t.newPassword}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-900 dark:text-white"
                        required
                        minLength={6}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition-colors font-medium shadow-lg shadow-emerald-500/20 disabled:opacity-70"
                >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                        <>
                            <span>{t.resetPassword}</span>
                            <Check size={16} />
                        </>
                    )}
                </button>
                <button 
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm mt-4 transition-colors"
                >
                    <ArrowLeft size={14} />
                    {t.backToLogin}
                </button>
             </form>
        )}

        {/* Footer for Login/Signup */}
        {(authMode === 'login' || authMode === 'signup') && (
            <div className="mt-8 flex items-center gap-2 text-sm">
                <span className="text-slate-500">{authMode === 'signup' ? (state.settings.language === 'fa' ? "حساب دارید؟" : "Already have an account?") : (state.settings.language === 'fa' ? "حساب ندارید؟" : "Don't have an account?")}</span>
                <button 
                    onClick={toggleSignup}
                    className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    {authMode === 'signup' ? (state.settings.language === 'fa' ? "ورود" : "Sign In") : (state.settings.language === 'fa' ? "ثبت نام" : "Sign Up")}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
