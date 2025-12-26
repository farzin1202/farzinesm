
import React, { useState } from 'react';
import { useApp } from '../store';
import { TRANSLATIONS } from '../constants';
import { ShieldCheck, User, Mail, ArrowRight, Lock, AlertCircle, Loader2, Check, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storageService';

export const Auth: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
    
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

        if (isSignUp) {
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
                avatarUrl: `https://ui-avatars.com/api/?name=${manualName || manualEmail}&background=random`
            };

            // Register creates the User and initializes their isolated DB
            const registered = storageService.registerUser(newUser);
            
            if (registered) {
                // DO NOT LOGIN DIRECTLY - Switch to Login Mode
                setIsSignUp(false);
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

            // Load isolated data for this specific user
            const userState = storageService.loadUserState(existingUser.id);
            
            // Ensure auth flags are correct based on current login choice
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

  const handleModeSwitch = () => {
    setIsSignUp(!isSignUp);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
        
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-indigo-100 dark:ring-indigo-800">
            <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.welcomeTitle}</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Sign in to access your secure trade journal.</p>

        {errorMsg && (
            <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2 animate-in slide-in-from-top-1">
                <AlertCircle size={16} className="shrink-0" />
                <span className="text-left flex-1">{errorMsg}</span>
            </div>
        )}

        {successMsg && (
            <div className="w-full mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2 animate-in slide-in-from-top-1">
                <CheckCircle2 size={16} className="shrink-0" />
                <span className="text-left flex-1">{successMsg}</span>
            </div>
        )}

        {/* Manual Form */}
        <form onSubmit={handleManualAuth} className="w-full space-y-3">
            {isSignUp && (
                <div className="relative animate-in slide-in-from-top-2 fade-in">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder={state.settings.language === 'fa' ? "نام کامل" : "Full Name"}
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-900 dark:text-white"
                        required={isSignUp}
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

            {/* Stay Logged In Checkbox */}
            {!isSignUp && (
                <div className="flex items-center gap-2 py-1 px-1">
                    <button
                        type="button"
                        onClick={() => setStayLoggedIn(!stayLoggedIn)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            stayLoggedIn 
                                ? 'bg-indigo-600 border-indigo-600 text-white' 
                                : 'bg-transparent border-slate-300 dark:border-slate-600'
                        }`}
                    >
                        {stayLoggedIn && <Check size={14} strokeWidth={3} />}
                    </button>
                    <button 
                        type="button"
                        onClick={() => setStayLoggedIn(!stayLoggedIn)}
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        {t.stayLoggedIn}
                    </button>
                </div>
            )}
            
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-500/20 disabled:opacity-70 mt-2"
            >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                    <>
                        <span>{isSignUp ? t.getStarted : (state.settings.language === 'fa' ? "ورود به حساب" : "Sign In")}</span>
                        <ArrowRight size={16} />
                    </>
                )}
            </button>
        </form>

        <div className="mt-8 flex items-center gap-2 text-sm">
            <span className="text-slate-500">{isSignUp ? (state.settings.language === 'fa' ? "حساب دارید؟" : "Already have an account?") : (state.settings.language === 'fa' ? "حساب ندارید؟" : "Don't have an account?")}</span>
            <button 
                onClick={handleModeSwitch}
                className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
                {isSignUp ? (state.settings.language === 'fa' ? "ورود" : "Sign In") : (state.settings.language === 'fa' ? "ثبت نام" : "Sign Up")}
            </button>
        </div>
      </div>
    </div>
  );
};
