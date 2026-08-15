import { useEffect, useMemo, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Cpu, Loader2, Lock, LogIn, Mail, RotateCcw, ShieldCheck, Star, UserCheck, X } from 'lucide-react';
import apiService from '../services/api';

interface VIPEntranceModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'signup';
  referralCode?: string;
  onClose: () => void;
  onLogin: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  onSignupComplete: (credentials: { email: string; password: string; referralCode: string }) => Promise<{ success: boolean; error?: string }>;
}

const RESEND_SECONDS = 180;
const QUICK_LOGIN_ACCOUNTS = [
  {
    label: 'Kim_Dragon88',
    caption: 'Blue Dragon / 45 team',
    email: 'kim88@gmail.com',
    password: 'Longrise!2026',
  },
  {
    label: 'Lee_Profit99',
    caption: 'Blue Dragon / Kim L1',
    email: 'lee99@gmail.com',
    password: 'Longrise!2026',
  },
  {
    label: 'Park_Alpha77',
    caption: 'Blue Dragon / Kim L1',
    email: 'park77@gmail.com',
    password: 'Longrise!2026',
  },
  {
    label: 'Choi_Rise12',
    caption: 'White Dragon / 17 team',
    email: 'choi12@gmail.com',
    password: 'Longrise!2026',
  },
];

const isValidPassword = (value: string) =>
  value.length >= 8 &&
  /[a-z]/.test(value) &&
  /[A-Z]/.test(value) &&
  /\d/.test(value) &&
  /[^A-Za-z\d]/.test(value);

const getApiErrorMessage = (err: any, fallback: string) => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item;
        const field = Array.isArray(item?.loc) ? item.loc.filter((part: unknown) => part !== 'body').join('.') : '';
        return field ? `${field}: ${item?.msg || fallback}` : item?.msg || fallback;
      })
      .join(' ');
  }
  if (detail && typeof detail === 'object') {
    return detail.message || detail.msg || fallback;
  }
  return fallback;
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const VIPEntranceModal = ({ isOpen, initialTab = 'login', referralCode = '', onClose, onLogin, onSignupComplete }: VIPEntranceModalProps) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'login' | 'email' | 'send' | 'verify' | 'signup' | null>(null);

  const [isEmailAvailable, setIsEmailAvailable] = useState(false);
  const [hasSentCode, setHasSentCode] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [codeMessage, setCodeMessage] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [signupReferralCode, setSignupReferralCode] = useState(referralCode);
  const [acceptedLegalTerms, setAcceptedLegalTerms] = useState(false);
  const [isReferralConfirmOpen, setIsReferralConfirmOpen] = useState(false);

  const passwordsMatch = signupPassword.length > 0 && signupPassword === signupPasswordConfirm;
  const signupPasswordValid = isValidPassword(signupPassword);
  const normalizedSignupReferralCode = signupReferralCode.trim().toUpperCase();
  const referralCodeValid = normalizedSignupReferralCode.length === 0 || /^[A-Z0-9]{8}$/.test(normalizedSignupReferralCode);
  const canCompleteSignup = isCodeVerified && referralCodeValid && signupPasswordValid && passwordsMatch && acceptedLegalTerms && !isLoading;
  const cooldownProgress = cooldownLeft > 0 ? ((RESEND_SECONDS - cooldownLeft) / RESEND_SECONDS) * 100 : 100;

  const passwordChecks = useMemo(
    () => [
      { label: '8 characters minimum', valid: signupPassword.length >= 8 },
      { label: 'Uppercase and lowercase letters', valid: /[a-z]/.test(signupPassword) && /[A-Z]/.test(signupPassword) },
      { label: 'Number and special character', valid: /\d/.test(signupPassword) && /[^A-Za-z\d]/.test(signupPassword) },
      { label: 'Passwords match', valid: passwordsMatch },
    ],
    [signupPassword, passwordsMatch],
  );

  useEffect(() => {
    if (!cooldownLeft) return;
    const timer = window.setInterval(() => {
      setCooldownLeft((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownLeft]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialTab);
    setSignupReferralCode(referralCode);
  }, [isOpen, initialTab, referralCode]);

  useEffect(() => {
    setIsEmailAvailable(false);
    setHasSentCode(false);
    setCooldownLeft(0);
    setVerificationCode('');
    setIsCodeVerified(false);
    setEmailMessage('');
    setCodeMessage('');
    setSignupPassword('');
    setSignupPasswordConfirm('');
    setAcceptedLegalTerms(false);
    setSuccessMessage('');
    setIsReferralConfirmOpen(false);
  }, [email]);

  const resetForm = () => {
    setActiveTab('login');
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMessage('');
    setIsLoading(false);
    setLoadingAction(null);
    setIsEmailAvailable(false);
    setHasSentCode(false);
    setCooldownLeft(0);
    setVerificationCode('');
    setIsCodeVerified(false);
    setEmailMessage('');
    setCodeMessage('');
    setSignupPassword('');
    setSignupPasswordConfirm('');
    setSignupReferralCode(referralCode);
    setAcceptedLegalTerms(false);
    setIsReferralConfirmOpen(false);
  };

  const closeModal = () => {
    onClose();
    setTimeout(resetForm, 200);
  };

  const submitLogin = async (nextEmail: string, nextPassword: string) => {
    const normalizedEmail = nextEmail.trim().toLowerCase();
    setIsLoading(true);
    setLoadingAction('login');
    setError('');
    setSuccessMessage('');
    setEmail(normalizedEmail);
    const result = await onLogin({ email: normalizedEmail, password: nextPassword });
    if (!result.success) {
      setError(result.error || 'Login failed');
      setIsLoading(false);
      setLoadingAction(null);
      return;
    }
    resetForm();
  };

  const checkEmail = async () => {
    if (!isValidEmail(email)) {
      const message = 'Enter a valid email address.';
      setIsEmailAvailable(false);
      setEmailMessage(message);
      setError(message);
      return;
    }
    setIsLoading(true);
    setLoadingAction('email');
    setError('');
    setSuccessMessage('');
    setEmailMessage('');
    try {
      const result = await apiService.checkSignupEmail(email);
      setIsEmailAvailable(result.available);
      setEmailMessage(result.available ? 'Email is available.' : 'This email is already registered.');
      setSuccessMessage(result.available ? 'Email is available.' : '');
      if (!result.available) setError('This email is already registered.');
    } catch (err: any) {
      setIsEmailAvailable(false);
      const message = getApiErrorMessage(err, 'Failed to check duplicate email.');
      setEmailMessage(message);
      setError(message);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const sendCode = async () => {
    if (!isValidEmail(email)) {
      const message = 'Enter a valid email address.';
      setIsEmailAvailable(false);
      setEmailMessage(message);
      setError(message);
      return;
    }
    setIsLoading(true);
    setLoadingAction('send');
    setError('');
    setSuccessMessage('');
    setEmailMessage('');
    try {
      const result = await apiService.sendSignupCode(email);
      setHasSentCode(true);
      setCooldownLeft(result.cooldown_seconds || RESEND_SECONDS);
      setEmailMessage('Verification code sent. Please check your email.');
      setSuccessMessage('Verification code sent.');
    } catch (err: any) {
      const rawMessage = getApiErrorMessage(err, '');
      const message =
        rawMessage === 'Email delivery is not configured.'
          ? 'Email delivery is not configured, so the verification code cannot be sent.'
          : rawMessage === 'Verification email could not be sent.'
            ? 'Failed to send the verification email. Please try again later.'
            : rawMessage || 'Failed to send verification code.';
      setEmailMessage(message);
      setError(message);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const verifyCode = async () => {
    setIsLoading(true);
    setLoadingAction('verify');
    setError('');
    setSuccessMessage('');
    setCodeMessage('');
    try {
      const result = await apiService.verifySignupCode(email, verificationCode);
      setIsCodeVerified(result.verified);
      setCodeMessage('Verified.');
      setSuccessMessage('Verification successful.');
    } catch (err: any) {
      setIsCodeVerified(false);
      const message = getApiErrorMessage(err, 'Failed to verify code.');
      setCodeMessage(message);
      setError(message);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const completeSignup = async (allowMissingReferral = false) => {
    if (!acceptedLegalTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    const normalizedReferralCode = signupReferralCode.trim().toUpperCase();
    if (!normalizedReferralCode && !allowMissingReferral) {
      setIsReferralConfirmOpen(true);
      return;
    }
    setIsReferralConfirmOpen(false);
    setIsLoading(true);
    setLoadingAction('signup');
    setError('');
    setSuccessMessage('');
    const result = await onSignupComplete({
      email,
      password: signupPassword,
      referralCode: normalizedReferralCode,
    });
    if (!result.success) {
      setError(result.error || 'Signup failed.');
      setIsLoading(false);
      setLoadingAction(null);
      return;
    }
    resetForm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="relative max-h-[92vh] w-full max-w-[520px] overflow-y-auto bg-[#4a0d0d] rounded-[2.5rem] border border-[#d4af37] p-8 sm:p-10 shadow-[0_0_150px_rgba(0,0,0,0.9)]"
          >
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-all group z-10"
              aria-label="Close"
            >
              <X size={20} className="text-[#d4af37] group-hover:rotate-90 transition-transform" />
            </button>

            <div className="flex flex-col items-center mb-7">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-[#fcd34d] blur-3xl opacity-40 animate-pulse"></div>
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-b from-[#fcd34d] to-[#d4af37] flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.4)] border-2 border-white/20">
                  <Cpu size={52} className="text-[#3b1111]" />
                </div>
              </div>
              <h2 className="text-4xl font-serif text-white font-bold mb-1 tracking-tight text-center">VIP Entrance</h2>
              <p className="text-[#d4af37] text-sm font-bold uppercase tracking-wider text-center">Real Account Access</p>
            </div>

            <div className="grid grid-cols-2 rounded-2xl border border-[#d4af37]/25 bg-black/25 p-1 mb-5">
              {(['login', 'signup'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className={`h-12 rounded-xl text-sm font-black uppercase tracking-[0.18em] transition-all ${
                    activeTab === tab ? 'bg-[#d4af37] text-[#2b0909]' : 'text-[#d4af37] hover:bg-white/5'
                  }`}
                >
                  {tab === 'login' ? 'Login' : 'Sign Up'}
                </button>
              ))}
            </div>

            {activeTab === 'login' ? (
              <>
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submitLogin(email, password);
                  }}
                >
                  <AuthInput
                    label="EMAIL"
                    icon={<Mail size={20} />}
                    inputProps={{
                      required: true,
                      type: 'email',
                      value: email,
                      onChange: (e) => setEmail(e.target.value),
                      placeholder: 'you@longrise.ai',
                      disabled: isLoading,
                    }}
                  />

                  <AuthInput
                    label="PASSWORD"
                    icon={<Lock size={20} />}
                    inputProps={{
                      required: true,
                      type: 'password',
                      value: password,
                      onChange: (e) => setPassword(e.target.value),
                      placeholder: 'Enter password',
                      disabled: isLoading,
                    }}
                  />

                  <StatusMessages error={error} success={successMessage} />

                  <div className="rounded-2xl border border-[#d4af37]/20 bg-black/20 p-3">
                    <div className="mb-3 flex items-center gap-2 px-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#d4af37]">
                      <Star size={14} />
                      <span>Key Accounts</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {QUICK_LOGIN_ACCOUNTS.map((account) => (
                        <button
                          key={account.email}
                          type="button"
                          onClick={() => {
                            setEmail(account.email);
                            setPassword(account.password);
                            void submitLogin(account.email, account.password);
                          }}
                          disabled={isLoading}
                          className="min-h-14 rounded-xl border border-[#d4af37]/25 bg-[#5c1a1a]/70 px-3 py-2 text-left transition-all hover:border-[#d4af37] hover:bg-[#6a2020] disabled:cursor-not-allowed disabled:opacity-55"
                        >
                          <span className="block text-sm font-black text-white">{account.label}</span>
                          <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#d4af37]/80">{account.caption}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-16 bg-gradient-to-r from-[#ff512f] to-[#fdd835] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_15px_35px_rgba(255,81,47,0.35)] group mt-8 disabled:opacity-70"
                  >
                    {loadingAction === 'login' ? <Loader2 size={22} className="text-black animate-spin" /> : <LogIn size={22} className="text-black" />}
                    <span className="text-black font-black text-xl">{loadingAction === 'login' ? 'Loading' : 'Access'}</span>
                  </button>
                </form>

              </>
            ) : (
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  void completeSignup();
                }}
              >
                <AuthInput
                  label="EMAIL"
                  icon={<Mail size={20} />}
                  inputProps={{
                    required: true,
                    type: 'email',
                    value: email,
                    onChange: (e) => setEmail(e.target.value),
                    placeholder: 'you@longrise.ai',
                    disabled: isLoading || hasSentCode,
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => void checkEmail()}
                    disabled={isLoading || !email || hasSentCode}
                    className="h-14 rounded-2xl border border-[#d4af37]/40 bg-black/25 px-4 text-sm font-black text-[#d4af37] transition-all hover:bg-black/40 disabled:opacity-45"
                  >
                    {loadingAction === 'email' ? 'Checking...' : isEmailAvailable ? 'Email Available' : 'Check Duplicate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void sendCode()}
                    disabled={isLoading || !isEmailAvailable || cooldownLeft > 0}
                    className="relative h-14 overflow-hidden rounded-2xl border border-[#d4af37]/40 bg-[#d4af37] px-4 text-sm font-black text-[#2b0909] transition-all disabled:opacity-55"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loadingAction === 'send' ? <Loader2 size={16} className="animate-spin" /> : cooldownLeft > 0 ? <CircularTimer progress={cooldownProgress} /> : <RotateCcw size={16} />}
                      {loadingAction === 'send' ? 'Sending...' : hasSentCode ? 'Resend Code' : 'Send Code'}
                    </span>
                  </button>
                </div>

                {emailMessage && (
                  <InlineNotice
                    tone={isEmailAvailable || hasSentCode ? 'success' : 'error'}
                    message={emailMessage}
                  />
                )}

                {cooldownLeft > 0 && (
                  <p className="text-center text-[11px] font-bold text-[#d4af37]">{cooldownLeft}s</p>
                )}

                <AuthInput
                  label="VERIFICATION CODE"
                  icon={<ShieldCheck size={20} />}
                  inputProps={{
                    required: true,
                    inputMode: 'numeric',
                    maxLength: 6,
                    value: verificationCode,
                    onChange: (e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6)),
                    placeholder: '000000',
                    disabled: isLoading || !hasSentCode || isCodeVerified,
                  }}
                />

                <button
                  type="button"
                  onClick={() => void verifyCode()}
                  disabled={isLoading || verificationCode.length !== 6 || isCodeVerified}
                  className="h-14 w-full rounded-2xl border border-[#d4af37]/40 bg-black/25 px-4 text-sm font-black text-[#d4af37] transition-all hover:bg-black/40 disabled:opacity-45"
                >
                  {loadingAction === 'verify' ? 'Verifying...' : isCodeVerified ? 'Verified' : 'Verify Code'}
                </button>

                {codeMessage && (
                  <InlineNotice
                    tone={isCodeVerified ? 'success' : 'error'}
                    message={codeMessage}
                  />
                )}

                <AuthInput
                  label="REFERRAL CODE (OPTIONAL)"
                  icon={<UserCheck size={20} />}
                  inputProps={{
                    minLength: 8,
                    maxLength: 8,
                    value: signupReferralCode,
                    onChange: (e) => setSignupReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)),
                    placeholder: 'Optional',
                    disabled: isLoading,
                  }}
                />

                <AuthInput
                  label="PASSWORD"
                  icon={<Lock size={20} />}
                  inputProps={{
                    required: true,
                    type: 'password',
                    value: signupPassword,
                    onChange: (e) => setSignupPassword(e.target.value),
                    placeholder: 'Create password',
                    disabled: isLoading || !isCodeVerified,
                  }}
                />

                <AuthInput
                  label="CONFIRM PASSWORD"
                  icon={<Lock size={20} />}
                  inputProps={{
                    required: true,
                    type: 'password',
                    value: signupPasswordConfirm,
                    onChange: (e) => setSignupPasswordConfirm(e.target.value),
                    placeholder: 'Confirm password',
                    disabled: isLoading || !isCodeVerified,
                  }}
                />

                <div className="rounded-2xl border border-[#d4af37]/15 bg-black/20 p-4">
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#d4af37]">Password Rules</p>
                  <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                    {passwordChecks.map((check) => (
                      <div key={check.label} className={check.valid ? 'text-emerald-200' : 'text-white/55'}>
                        {check.valid ? '✓' : '·'} {check.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-[#d4af37]/15 bg-black/20 p-4 text-[11px] font-semibold leading-relaxed text-white/65">
                  <input
                    type="checkbox"
                    checked={acceptedLegalTerms}
                    onChange={(e) => setAcceptedLegalTerms(e.target.checked)}
                    disabled={isLoading}
                    aria-label="Agree to the Terms of Service and Privacy Policy"
                    className="mt-1 accent-[#d4af37]"
                  />
                  <span>
                    I agree to the{' '}
                    <a href="/terms" target="_blank" rel="noreferrer" className="font-black text-[#d4af37] underline underline-offset-4 hover:text-white">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy-policy" target="_blank" rel="noreferrer" className="font-black text-[#d4af37] underline underline-offset-4 hover:text-white">
                      Privacy Policy
                    </a>
                    .
                  </span>
                </div>

                <StatusMessages error={error} success={successMessage} />

                <button
                  type="submit"
                  disabled={!canCompleteSignup}
                  className="w-full h-16 bg-gradient-to-r from-[#ff512f] to-[#fdd835] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_15px_35px_rgba(255,81,47,0.35)] mt-8 disabled:opacity-45"
                >
                  {loadingAction === 'signup' ? <Loader2 size={22} className="text-black animate-spin" /> : <CheckCircle2 size={22} className="text-black" />}
                  <span className="text-black font-black text-xl">{loadingAction === 'signup' ? 'Signing Up...' : 'Sign Up'}</span>
                </button>
              </form>
            )}

            <AnimatePresence>
              {isReferralConfirmOpen && (
                <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsReferralConfirmOpen(false)}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 12 }}
                    className="relative w-full max-w-sm rounded-3xl border border-[#d4af37]/45 bg-[#4a0d0d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="missing-referral-title"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4af37]/15 text-[#d4af37]">
                      <AlertCircle size={24} />
                    </div>
                    <h3 id="missing-referral-title" className="mb-3 text-xl font-black text-white">
                      Missing Referral Code
                    </h3>
                    <p className="text-sm leading-6 text-white/75">
                      Are you sure you want to sign up without a referral code?
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsReferralConfirmOpen(false)}
                        className="h-12 rounded-2xl border border-[#d4af37]/35 bg-black/25 text-sm font-black uppercase tracking-[0.14em] text-[#d4af37] transition-all hover:bg-black/40"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => void completeSignup(true)}
                        className="h-12 rounded-2xl bg-[#d4af37] text-sm font-black uppercase tracking-[0.14em] text-[#2b0909] transition-all hover:bg-[#f0c84a]"
                      >
                        Confirm
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AuthInput = ({
  label,
  icon,
  inputProps,
}: {
  label: string;
  icon: ReactNode;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
}) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.2em] ml-2">{label}</label>
    <div className="relative">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#d4af37]">{icon}</div>
      <input
        {...inputProps}
        className="w-full bg-[#5c1a1a] border border-[#d4af37]/30 rounded-2xl py-4.5 pl-14 pr-6 text-white text-base placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] transition-all disabled:cursor-not-allowed disabled:opacity-55"
      />
    </div>
  </div>
);

const CircularTimer = ({ progress }: { progress: number }) => (
  <span
    className="inline-flex h-5 w-5 items-center justify-center rounded-full"
    style={{
      background: `conic-gradient(#2b0909 ${progress}%, rgba(43,9,9,0.25) 0)`,
    }}
  >
    <span className="h-3 w-3 rounded-full bg-[#d4af37]" />
  </span>
);

const InlineNotice = ({ tone, message }: { tone: 'success' | 'error'; message: string }) => (
  <div
    className={`flex min-h-11 items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold ${
      tone === 'success'
        ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-50'
        : 'border-red-500/35 bg-red-500/10 text-red-100'
    }`}
    role="status"
    aria-live="polite"
  >
    {tone === 'success' ? <CheckCircle2 size={17} className="shrink-0 text-emerald-200" /> : <AlertCircle size={17} className="shrink-0 text-red-300" />}
    <span>{message}</span>
  </div>
);

const StatusMessages = ({ error, success }: { error: string; success: string }) => (
  <>
    {error && (
      <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
        <AlertCircle size={18} className="text-red-300 mt-0.5" />
        <p className="text-sm text-red-100">{error}</p>
      </div>
    )}
    {success && (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
        <CheckCircle2 size={18} className="text-emerald-200 mt-0.5" />
        <p className="text-sm text-emerald-50">{success}</p>
      </div>
    )}
  </>
);
