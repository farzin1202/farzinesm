
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { TRANSLATIONS, GOOGLE_CLIENT_ID } from '../constants';
import { ShieldCheck, User, Mail, ArrowRight, Lock, AlertCircle, Loader2, Check, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storageService';

export const Auth: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
    
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const t = TRANSLATIONS[state.settings.language];

  // --- Real & Mock OAuth Logic ---

  // 1. Handle OAuth Redirect Callback (Works for both Real Google & Mock Redirect)
  useEffect(() => {
    const handleOAuthCallback = async () => {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
            setIsGoogleLoading(true);
            try {
                // Extract token
                const params = new URLSearchParams(hash.substring(1));
                const accessToken = params.get('access_token');
                
                if (!accessToken) throw new Error("No access token found");

                // Clear hash to clean up URL
                window.history.replaceState(null, '', window.location.pathname);

                let googleUser;

                // CHECK: Is this a Real token or a Mock token?
                if (accessToken === 'mock_demo_token') {
                    // --- MOCK FLOW (Simulated) ---
                    await new Promise(r => setTimeout(r, 800)); // Simulate network fetch
                    googleUser = {
                        id: `google-demo-user`,
                        name: 'Demo Google User',
                        email: 'demo@gmail.com',
                        avatarUrl: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff', 
                        authProvider: 'google' as const
                    };
                } else {
                    // --- REAL FLOW (Google API) ---
                    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    
                    if (!response.ok) throw new Error("Failed to fetch user info");
                    
                    const googleData = await response.json();
                    
                    googleUser = {
                        id: `google-${googleData.sub}`,
                        name: googleData.name,
                        email: googleData.email,
                        avatarUrl: googleData.picture,
                        authProvider: 'google' as const
                    };
                }

                // Register or Login Logic
                const registry = storageService.getRegistry();
                const existing = registry.find(u => u.email === googleUser.email);
                
                if (!existing) {
                    storageService.registerUser(googleUser);
                }

                // Load State
                const userId = existing ? existing.id : googleUser.id;
                const userState = storageService.loadUserState(userId);
                
                // Ensure correct user object is set
                if (!existing) {
                   userState.user = { ...googleUser, rememberMe: true };
                } else {
                   // Update avatar/name if changed on Google side
                   userState.user = { 
                       ...existing, 
                       name: googleUser.name, 
                       avatarUrl: googleUser.avatarUrl, 
                       rememberMe: true 
                   };
                   // Update registry with latest info
                   storageService.updateUserRegistry(existing.id, { 
                       name: googleUser.name, 
                       avatarUrl: googleUser.avatarUrl 
                   });
                }

                dispatch({ type: 'LOAD_STATE', payload: userState });

            } catch (err) {
                console.error("OAuth Error:", err);
                setErrorMsg("Google Sign-In failed. Please try again.");
            } finally {
                setIsGoogleLoading(false);
            }
        }
    };

    handleOAuthCallback();
  }, [dispatch]);

  // 2. Initiate OAuth Redirect
  const handleGoogleAuth = () => {
      setErrorMsg('');
      setIsGoogleLoading(true);

      // --- HYBRID CHECK ---
      // If no Client ID is provided in constants.ts, use the Mock Redirect flow
      // so the user can still test the "Experience" of OAuth.
      if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.trim() === '') {
          console.warn("FxAnalytics: No GOOGLE_CLIENT_ID found. Using Mock OAuth Redirect Flow.");
          
          setTimeout(() => {
              // Simulate a redirect by reloading page with a mock token hash
              // This triggers the useEffect above just like a real Google redirect would.
              window.location.hash = '#access_token=mock_demo_token&token_type=Bearer&expires_in=3600';
          }, 1000);
          return;
      }

      // --- REAL REDIRECT FLOW ---
      const redirectUri = window.location.origin;
      const scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
      const responseType = 'token'; // Implicit flow
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}`;

      // Redirect to Google
      window.location.href = authUrl;
  };

  // --- Manual Auth Logic ---

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail || !manualPassword) return;

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Simulate Network Delay for local auth
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
                avatarUrl: `https://ui-avatars.com/api/?name=${manualName || manualEmail}&background=random`,
                authProvider: 'local' as const
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

        {/* Google Auth Button */}
        <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading || isLoading}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium flex items-center justify-center gap-3 mb-4 group relative overflow-hidden"
        >
             {isGoogleLoading ? <Loader2 className="animate-spin w-5 h-5 text-indigo-500" /> : (
                <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    <span>{state.settings.language === 'fa' ? "ورود با گوگل" : "Sign in with Google"}</span>
                </>
             )}
        </button>

        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">Or continue with</span>
            </div>
        </div>

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
                disabled={isLoading || isGoogleLoading}
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
