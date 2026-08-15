import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  ShoppingCart,
  Gift,
  Wallet,
  User,
  Menu,
  X,
  Bell,
  LogOut,
  ShieldCheck,
  MessageCircle,
  Newspaper,
  Cpu,
  ArrowDown,
  ArrowUp,
  RefreshCcw,
  Crown,
  Star,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Timer,
  LogIn,
  Mail,
  Check,
  UserCheck,
  Rocket,
  Key,
  Globe,
  Link as LinkIcon
} from 'lucide-react';

import { NetworkOverlay } from './components/VisualEffects';
import { getPerformanceConfig } from './utils/performanceFlags';
import { clearTradingPasswordVerified } from './utils/tradingPasswordSession';
import {
  calculateMonthlyCnytReward,
  calculateMonthlyUsdtReward,
} from './utils/packageRewards';

// --- Page Components ---
import { HomePage } from './components/HomePage';
import { CryptoAIPage } from './components/CryptoAIPage';
import { RewardsPage } from './components/RewardsPage';
import { WalletPage } from './components/WalletPage';
import { DepositPage } from './components/DepositPage';
import { ProfilePage } from './components/ProfilePage';
import { SecurityPage } from './components/SecurityPage';
import { SupportPage } from './components/SupportPage';
import { NoticesPage } from './components/NoticesPage';
import { DocumentationPage } from './components/DocumentationPage';
import { PackageSection } from './components/PackageSection';
import { PackagesPage } from './components/PackagesPage';
import { AboutLongrisePage } from './components/AboutLongrisePage';
import { VIPEntranceModal } from './components/VIPEntranceModal';
import { ReferralProgramPage } from './components/ReferralProgramPage';
import { USDTOnboardingPage } from './components/USDTOnboardingPage';
import { USDTFraudReportPage } from './components/USDTFraudReportPage';
import { LegalPage } from './components/LegalPages';
import { FloatingSupportActions } from './components/FloatingSupportActions';
import apiService from './services/api';

// --- Shared Types ---
import { UserData } from './shared/types';

// --- Types ---
const LANGUAGES = [
  { name: 'Macanese', flag: '🇲🇴', code: 'MO' },
  { name: 'Filipino', flag: '🇵🇭', code: 'PH' },
  { name: 'Vietnamese', flag: '🇻🇳', code: 'VN' },
  { name: 'Georgian', flag: '🇬🇪', code: 'GE' },
  { name: 'USA', flag: '🇺🇸', code: 'EN' },
  { name: 'Chinese', flag: '🇨🇳', code: 'CN' },
  { name: 'Korean', flag: '🇰🇷', code: 'KR' },
];

type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  time: string;
  read: boolean;
  type: 'wallet' | 'reward' | 'security' | 'system' | 'support';
  targetView?: View | 'support-chat';
  targetId?: string;
};

type View = 'home' | 'crypto-ai' | 'packages' | 'rewards' | 'wallet' | 'deposit' | 'profile' | 'security' | 'support' | 'notices' | 'activity' | 'cnyt-market' | 'about' | 'documentation' | 'referral-program' | 'usdt-onboarding' | 'usdt-fraud-report' | 'terms' | 'privacy-policy' | 'risk-notice';

// --- Constants ---

const PACKAGE_POLICY = {
  flexible: {
    usdt: 4,
    cnyt: 0,
    penalty: [{ label: 'Within 12 Months', fee: 0 }],
    maturity: 'Immediate',
    min: 100,
  },
  basic: {
    usdt: 7,
    cnyt: 2,
    penalty: [
      { label: 'Within 3 Months', fee: 30 },
      { label: 'Within 6 Months', fee: 20 },
      { label: 'Within 9 Months', fee: 15 },
      { label: 'Within 12 Months', fee: 10 },
    ],
    maturity: '12 Months',
    min: 200,
  },
  standard: {
    usdt: 9,
    cnyt: 4,
    penalty: [
      { label: 'Within 3 Months', fee: 30 },
      { label: 'Within 6 Months', fee: 20 },
      { label: 'Within 9 Months', fee: 15 },
      { label: 'Within 12 Months', fee: 10 },
    ],
    maturity: '12 Months',
    min: 500,
  },
  premium: {
    usdt: 11,
    cnyt: 6,
    penalty: [
      { label: 'Within 3 Months', fee: 30 },
      { label: 'Within 6 Months', fee: 20 },
      { label: 'Within 9 Months', fee: 15 },
      { label: 'Within 12 Months', fee: 10 },
    ],
    maturity: '12 Months',
    min: 1000,
  },
  vip: {
    usdt: 18,
    cnyt: 10,
    penalty: [
      { label: 'Within 3 Months', fee: 30 },
      { label: 'Within 6 Months', fee: 20 },
      { label: 'Within 9 Months', fee: 15 },
      { label: 'Within 12 Months', fee: 10 },
    ],
    maturity: '12 Months',
    min: 5000,
  },
};

const createGuestUser = (): UserData => ({
  id: '',
  nickname: '',
  name: '',
  email: '',
  phone: '',
  rank: '',
  status: 'inactive',
  joinDate: '',
  balanceUSDT: 0,
  lockedUSDT: 0,
  balanceCNYT: 0,
  totalAssets: 0,
  package: '',
  initialInvestment: 0,
  investmentDate: '',
  sponsorId: '',
  teamSize: 0,
  teamVol: 0,
  bodyValue: 0,
  referralCode: '',
  referredByCode: '',
  kycLevel: 0,
  kycStatus: 'pending',
  pageface: false,
  mobileBinding: false,
  hasSetTradingPassword: false,
  isTradingPasswordVerified: false,
  otp: false,
  otpConfigured: false,
  lastLoginAt: '',
  distributorStatus: 'none',
  distributorCode: null,
  createdAt: '',
  updatedAt: '',
});

const MARKET_BLOCKED_PATHS = new Set(['/market', '/cnyt-market', '/market/cnyt', '/p2p-market']);
const LEGAL_PATH_VIEWS: Record<string, View> = {
  '/terms': 'terms',
  '/privacy-policy': 'privacy-policy',
  '/risk-notice': 'risk-notice',
};

const getInitialView = (): View => {
  const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (MARKET_BLOCKED_PATHS.has(pathname)) {
    return 'cnyt-market';
  }
  if (LEGAL_PATH_VIEWS[pathname]) {
    return LEGAL_PATH_VIEWS[pathname];
  }
  return 'home';
};

const getApiErrorMessage = (error: any, fallback: string) => {
  const detail = error?.response?.data?.detail;
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

const normalizePackageLookupKey = (value: unknown) =>
  String(value || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/-package$/, '');

const getPackagePolicy = (pkgId: string) =>
  PACKAGE_POLICY[normalizePackageLookupKey(pkgId) as keyof typeof PACKAGE_POLICY];

const parseUsdtAmount = (value: unknown) => {
  const amount = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

const getPackagePurchaseAmount = (pkg: any) =>
  parseUsdtAmount(pkg?.price ?? pkg?.amount ?? pkg?.min_amount ?? pkg?.minimum_amount ?? pkg?.minInvestment ?? pkg?.min_investment);

const formatUsdtAmount = (amount: number) =>
  amount.toLocaleString(undefined, { maximumFractionDigits: 2 });

const formatNotificationTime = (value?: string | null) => {
  if (!value) return 'Just now';
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 'Just now';
  const diff = Date.now() - timestamp;
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(value).toLocaleDateString();
};

const notificationTypeFromCategory = (category?: string): NotificationItem['type'] => {
  if (category === 'support' || category === 'chat') return 'support';
  if (category === 'wallet') return 'wallet';
  if (category === 'reward' || category === 'rank') return 'reward';
  if (category === 'security') return 'security';
  return 'system';
};

const getPackagePurchaseBalance = (portalData: any, user: UserData) => {
  const withdrawalBalance = portalData?.wallet?.withdrawalBalance;
  const depositBalance = parseUsdtAmount(withdrawalBalance?.depositBalanceUsdt);
  const bonusUsdt = parseUsdtAmount(portalData?.wallet?.bonusUsdt?.totalBonusUsdt);
  const earningsBalance = parseUsdtAmount(withdrawalBalance?.earningsBalanceUsdt);
  const hasStructuredWalletBalance = Boolean(withdrawalBalance || portalData?.wallet?.bonusUsdt);
  const total = depositBalance + bonusUsdt + earningsBalance;

  if (hasStructuredWalletBalance) {
    return {
      total,
      depositBalance,
      bonusUsdt,
      earningsBalance,
    };
  }

  return {
    total: Number(user.balanceUSDT || 0),
    depositBalance: Number(user.balanceUSDT || 0),
    bonusUsdt: 0,
    earningsBalance: 0,
  };
};

const mapApiUserToShared = (apiUser: any): UserData => ({
  id: apiUser.id,
  nickname: apiUser.nickname,
  name: apiUser.name || apiUser.nickname,
  email: apiUser.email,
  phone: apiUser.phone || '',
  rank: apiUser.rank,
  status: apiUser.status,
  joinDate: apiUser.join_date || '',
  balanceUSDT: Number(apiUser.balance_usdt || 0),
  lockedUSDT: Number(apiUser.locked_usdt || 0),
  balanceCNYT: Number(apiUser.balance_cnyt || 0),
  totalAssets: Number(apiUser.total_assets || 0),
  package: apiUser.package || '',
  initialInvestment: Number(apiUser.initial_investment || 0),
  investmentDate: apiUser.investment_date || '',
  sponsorId: apiUser.sponsor_id || '',
  teamSize: Number(apiUser.team_size || 0),
  teamVol: Number(apiUser.team_vol || 0),
  bodyValue: Number(apiUser.body_value || 0),
  referralCode: apiUser.referral_code || '',
  referredByCode: apiUser.referred_by_code || '',
  canSetReferralCode: Boolean(apiUser.can_set_referral_code),
  kycLevel: Number(apiUser.kyc_level || 0),
  kycStatus: apiUser.kyc_status,
  pageface: Boolean(apiUser.pageface),
  mobileBinding: Boolean(apiUser.mobile_binding),
  hasSetTradingPassword: Boolean(apiUser.has_set_trading_password),
  isTradingPasswordVerified: Boolean(apiUser.is_trading_password_verified),
  otp: Boolean(apiUser.otp_enabled),
  otpConfigured: Boolean(apiUser.otp_configured || apiUser.otp_enabled),
  lastLoginAt: apiUser.last_login_at || '',
  distributorStatus: apiUser.distributor_status || 'none',
  distributorCode: apiUser.distributor_code,
  createdAt: apiUser.created_at || '',
  updatedAt: apiUser.updated_at || '',
});

// --- Components ---

const InvestmentModal = ({
  pkgId,
  onClose,
  onConfirm,
  isSubmitting,
  errorMessage,
  availableUsdt,
}: {
  pkgId: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
  errorMessage: string;
  availableUsdt: number;
}) => {
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const policy = getPackagePolicy(pkgId) || PACKAGE_POLICY.flexible;
  
  const monthlyUsdt = calculateMonthlyUsdtReward(policy.min, policy.usdt);
  const monthlyCnyt = calculateMonthlyCnytReward(monthlyUsdt, policy.cnyt);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-md relative z-10 border border-luxury-gold/30 p-8 rounded-2xl"
      >
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-serif font-black text-white uppercase tracking-widest">{pkgId} PACKAGE</h2>
              <div className="text-luxury-gold text-[10px] font-bold tracking-[0.3em] mt-1">INVESTMENT SUMMARY</div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs font-bold uppercase">Initial Deposit</span>
                <span className="text-2xl font-mono font-black text-white">${policy.min}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs font-bold uppercase">Available USDT</span>
                <span className="text-lg font-mono font-black text-luxury-gold">{availableUsdt.toLocaleString()} USDT</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs font-bold uppercase">Monthly USDT</span>
                <span className="text-xl font-mono font-black text-green-400">+${monthlyUsdt.toLocaleString()}</span>
              </div>
              {policy.cnyt > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-bold uppercase">Monthly CNYT</span>
                  <span className="text-xl font-mono font-black text-luxury-gold">+{monthlyCnyt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 text-xs text-center justify-center">
                <Timer size={14} className="text-luxury-gold" />
                <span>Contract Period: {policy.maturity}</span>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-xl bg-luxury-gold text-black font-black text-xs tracking-[0.3em] hover:scale-105 transition-all"
            >
              INVEST NOW
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <AlertCircle size={40} className="mx-auto text-red-500 mb-2" />
              <h3 className="text-xl font-black text-white">Cancellation Policy</h3>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 space-y-3">
              <div className="text-[10px] font-black text-red-400 tracking-widest uppercase mb-2">Early Withdrawal Penalty</div>
              {policy.penalty.map(({ label, fee }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-red-400 font-bold">{fee}% Penalty</span>
                </div>
              ))}
              <div className="pt-2 border-t border-white/5 flex justify-between text-xs">
                <span className="text-gray-300">At Maturity (12 Months)</span>
                <span className="text-green-400 font-bold">Safe (0% Fee)</span>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer p-2 translate-x-[-8px]">
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 accent-luxury-gold"
              />
              <span className="text-[11px] text-gray-400 leading-snug">
                I understand that early withdrawal is subject to penalty fees, and that invested principal cannot be refunded before the contract period ends.
              </span>
            </label>
            {errorMessage && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[11px] font-bold leading-relaxed text-red-200">
                {errorMessage}
              </div>
            )}
            <p className="text-center text-[11px] font-semibold leading-relaxed text-gray-500">
              By completing your payment, you agree to our{' '}
              <a href="/terms" target="_blank" rel="noreferrer" className="font-black text-luxury-gold underline underline-offset-4 hover:text-white">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy-policy" target="_blank" rel="noreferrer" className="font-black text-luxury-gold underline underline-offset-4 hover:text-white">
                Privacy Policy
              </a>
              .
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="flex-1 py-4 rounded-xl bg-white/5 text-gray-400 font-bold text-[10px] tracking-widest"
              >
                BACK
              </button>
              <button 
                disabled={!agreed || isSubmitting}
                onClick={onConfirm}
                className={`flex-1 py-4 rounded-xl font-black text-[10px] tracking-widest transition-all ${
                  agreed && !isSubmitting ? 'bg-luxury-gold text-black' : 'bg-gray-800 text-gray-600'
                }`}
              >
                {isSubmitting ? 'PROCESSING...' : 'CONFIRM'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const InsufficientBalanceModal = ({
  message,
  onDeposit,
  onClose,
}: {
  message: string;
  onDeposit: () => void;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      onClick={onClose}
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      role="dialog"
      aria-modal="true"
      aria-label="Insufficient balance"
      className="glass-panel relative z-10 w-full max-w-sm rounded-2xl border border-red-500/30 p-7 text-center"
    >
      <button
        type="button"
        aria-label="Close insufficient balance"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/5 p-2 text-gray-400 hover:bg-white/10 hover:text-white"
      >
        <X size={16} />
      </button>
      <AlertCircle size={44} className="mx-auto mb-4 text-red-400" />
      <h3 className="text-lg font-black uppercase tracking-widest text-white">Insufficient Balance</h3>
      <p className="mt-3 text-sm font-bold leading-relaxed text-gray-300">{message}</p>
      <button
        type="button"
        onClick={onDeposit}
        className="mt-6 w-full rounded-xl bg-luxury-gold py-4 text-[11px] font-black uppercase tracking-[0.25em] text-black transition-transform hover:scale-[1.02]"
      >
        OK
      </button>
    </motion.div>
  </div>
);

const AuthRequiredNoticeModal = () => (
  <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 px-6 backdrop-blur-md">
    <motion.div
      role="alertdialog"
      aria-modal="true"
      aria-label="Login required"
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 16 }}
      className="w-full max-w-sm rounded-2xl border border-luxury-gold/30 bg-[#120303]/95 p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
    >
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-luxury-gold/20 bg-luxury-gold/10 text-luxury-gold">
        <ShieldCheck size={26} />
      </div>
      <h3 className="text-lg font-black uppercase tracking-widest text-white">
        Login Required
      </h3>
      <p className="mt-3 text-sm font-bold leading-relaxed text-gray-300">
        Please log in to access Wallet.
      </p>
    </motion.div>
  </div>
);

const Navbar = ({ currentView, setCurrentView, user, isLoggedIn, onLoginClick, onLogout, notifications, unreadCount, hasNewNotification, onNotificationClick, onMarkAllNotificationsRead, onViewAllActivity }: {
  currentView: View, 
  setCurrentView: (v: View) => void, 
  user: UserData, 
  isLoggedIn: boolean,
  onLoginClick: () => void,
  onLogout: () => void,
  notifications: NotificationItem[],
  unreadCount: number,
  hasNewNotification: boolean,
  onNotificationClick: (notification: NotificationItem) => void,
  onMarkAllNotificationsRead: () => void,
  onViewAllActivity: () => void,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'crypto-ai', label: 'CRYPTO AI', icon: Zap },
    { id: 'packages', label: 'PACKAGES', icon: ShoppingCart },
    { id: 'rewards', label: 'REWARDS', icon: Gift },
    { id: 'wallet', label: 'WALLET', icon: Wallet },
    { id: 'notices', label: 'NEWS & UPDATES', icon: Newspaper },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 flex items-center justify-between px-6 lg:px-10 h-20 lg:h-24 ${
      isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/5 shadow-2xl' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      {/* Left: Branding */}
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentView('home')}>
        <div className="w-10 h-10 lg:w-11 lg:h-11 bg-gradient-to-br from-luxury-gold to-yellow-800 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.4)] group-hover:scale-105 transition-transform">
          <Cpu className="text-black w-6 h-6 lg:w-7 lg:h-7" />
        </div>
        <span className="font-serif text-xl lg:text-2xl font-bold text-luxury-gold tracking-widest hidden sm:block">LONGRISE</span>
      </div>

      {/* Center: Main Navigation */}
      <div className="hidden lg:flex items-center gap-1 xl:gap-3">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => setCurrentView(item.id as View)}
            className={`px-3 xl:px-4 py-2.5 rounded-lg text-[11px] xl:text-[12px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 border-[1.5px] ${
              currentView === item.id 
                ? 'bg-red-600/10 text-white border-red-600/60 shadow-[0_0_15px_rgba(220,38,38,0.2)]' 
                : 'bg-transparent text-gray-300 border-red-900/40 hover:text-white hover:border-red-600/60'
            }`}
          >
            <item.icon size={16} className="text-white" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="hidden lg:flex items-center gap-4 xl:gap-6">
        <div className="flex items-center gap-4 p-1 bg-black/40 border border-white/5 rounded-xl">
           {/* Connect Web3 */}
           <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all group">
             <LinkIcon size={16} className="text-gray-400 group-hover:text-white" />
             <span className="text-[11px] font-bold text-gray-400 group-hover:text-white uppercase tracking-widest">Connect Web3</span>
           </button>

           <div className="h-4 w-[1px] bg-white/10"></div>

           {/* User Profile / Login */}
           {!isLoggedIn ? (
             <button
               onClick={onLoginClick}
               className="px-6 py-2 rounded-lg text-[12px] font-black tracking-widest bg-gradient-to-r from-[#f12711] to-[#f5af19] text-white hover:scale-105 shadow-lg transition-all flex items-center gap-2"
             >
               <LogIn size={18} className="rotate-0"/> LOGIN
             </button>
           ) : (
             <div className="relative">
               <button 
                 onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
                 aria-label="Account menu"
                 className="flex items-center gap-3 px-2 group"
               >
                  <div className="text-right">
                    <p className="text-[9px] text-luxury-gold font-bold tracking-tighter uppercase">{user.rank}</p>
                    <p className="text-[12px] font-black text-white leading-none whitespace-nowrap">{user.name}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-luxury-gold to-yellow-300 p-[1px] group-hover:scale-110 transition-transform">
                     <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                       <User size={16} className="text-luxury-gold" />
                     </div>
                  </div>
               </button>

               {/* Profile Dropdown Menu */}
               <AnimatePresence>
                 {activeDropdown === 'profile' && (
                   <>
                    <div className="fixed inset-0 z-[55]" onClick={() => setActiveDropdown(null)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-64 bg-[#1a0505] border border-luxury-gold/30 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[60] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent pointer-events-none" />
                      
                      <div className="space-y-1 relative z-10">
                        {[
                          { id: 'profile', label: 'My Profile', icon: User },
                          { id: 'security', label: 'Security Center', icon: ShieldCheck },
                          { id: 'support', label: 'Support Tickets', icon: MessageCircle },
                          { id: 'documentation', label: 'Documentation', icon: Newspaper },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setCurrentView(item.id as View);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-black/40 border border-luxury-gold/10 flex items-center justify-center group-hover:border-luxury-gold/40 transition-colors">
                              <item.icon size={18} className="text-luxury-gold" />
                            </div>
                            <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
                          </button>
                        ))}
                        
                        <div className="my-2 h-px bg-white/5 mx-2" />
                        
                        <button
                          onClick={() => {
                            onLogout();
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-red-900/10 border border-red-900/20 flex items-center justify-center group-hover:border-red-500/40 transition-colors">
                            <LogOut size={18} className="text-red-500" />
                          </div>
                          <span className="text-[13px] font-bold tracking-tight">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                   </>
                 )}
               </AnimatePresence>
             </div>
           )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'notifications' ? null : 'notifications')}
              aria-label="Notifications"
              className={`relative p-2 transition-colors ${activeDropdown === 'notifications' ? 'text-white' : 'text-gray-400 hover:text-white'} ${hasNewNotification ? 'animate-pulse' : ''}`}
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 top-0 flex min-w-5 items-center justify-center rounded-full border border-black bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {activeDropdown === 'notifications' && (
                <>
                  <div className="fixed inset-0 z-[55]" onClick={() => setActiveDropdown(null)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 bg-[#1a0505] border border-luxury-gold/30 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[60]"
                  >
                    <div className="flex justify-between items-center mb-4 px-2">
                       <h3 className="text-white font-black text-sm uppercase tracking-widest">Messages</h3>
                       <button onClick={onMarkAllNotificationsRead} className="text-[10px] text-luxury-gold font-bold hover:underline">Mark all as read</button>
                    </div>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                      {notifications.length === 0 && (
                        <div className="p-6 rounded-xl border border-dashed border-white/10 text-center">
                          <p className="text-sm font-bold text-white">No notifications</p>
                          <p className="text-[11px] text-gray-500 mt-2">Notifications will appear here.</p>
                        </div>
                      )}
                      {notifications.slice(0, 10).map((notif) => (
                        <button key={notif.id} onClick={() => { setActiveDropdown(null); onNotificationClick(notif); }} className={`w-full p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer group text-left ${!notif.read ? 'bg-white/[0.02]' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                              notif.type === 'wallet' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                              notif.type === 'reward' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                              notif.type === 'support' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                              'bg-blue-500/10 border-blue-500/20 text-blue-500'
                            }`}>
                               <Bell size={14} />
                            </div>
                            <div className="flex-1">
                              <p className={`text-[12px] font-bold ${!notif.read ? 'text-white' : 'text-gray-400'} group-hover:text-luxury-gold transition-colors`}>{notif.title}</p>
                              {notif.body && <p className="mt-1 max-w-[210px] truncate text-[10px] text-gray-500">{notif.body}</p>}
                              <p className="text-[10px] text-gray-500 mt-1">{notif.time}</p>
                            </div>
                            {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5" />}
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setActiveDropdown(null);
                        onViewAllActivity();
                      }}
                      className="w-full mt-4 py-3 rounded-xl bg-white/5 text-[11px] font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest"
                    >
                      View All Activity
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'language' ? null : 'language')}
              className={`p-2 transition-colors flex items-center gap-2 group ${activeDropdown === 'language' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{selectedLang.flag}</span>
              <Globe size={18} />
              <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === 'language' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'language' && (
                <>
                  <div className="fixed inset-0 z-[55]" onClick={() => setActiveDropdown(null)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-16 bg-black border border-luxury-gold/50 rounded-2xl py-3 px-1 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[60]"
                  >
                    <div className="flex flex-col items-center gap-2">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSelectedLang(lang);
                            setActiveDropdown(null);
                          }}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-white/10 group ${
                            selectedLang.code === lang.code ? 'bg-white/5 border border-luxury-gold/30' : ''
                          }`}
                          title={lang.name}
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">{lang.flag}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Menu Trigger */}
      <button aria-label="Open navigation menu" className="lg:hidden text-luxury-gold p-2" onClick={() => setActiveDropdown('mobile')}>
        <Menu size={28} />
      </button>

      {/* Mobile Drawer (simplified for this task) */}
      <AnimatePresence>
        {activeDropdown === 'mobile' && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDropdown(null)}
              className="fixed inset-0 bg-black/95 z-[100] backdrop-blur-xl"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-[300px] bg-black border-l border-white/10 z-[101] p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-10">
                <span className="font-serif text-xl font-bold text-luxury-gold">LONGRISE</span>
                <button aria-label="Close navigation menu" onClick={() => setActiveDropdown(null)} className="text-white"><X size={28} /></button>
              </div>
              <div className="flex flex-col gap-4">
                {navItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => { setCurrentView(item.id as View); setActiveDropdown(null); }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-white/5 text-gray-300 font-bold uppercase tracking-widest text-sm"
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-6 border-t border-white/10">
                 {!isLoggedIn ? (
                   <button 
                    onClick={() => { onLoginClick(); setActiveDropdown(null); }}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#f12711] to-[#f5af19] text-white font-black tracking-widest uppercase"
                   >
                     LOGIN
                   </button>
                 ) : (
                   <button onClick={onLogout} className="w-full py-4 border border-red-600/30 text-red-500 font-bold rounded-xl uppercase">Logout</button>
                 )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

const MarketComingSoonPage = () => (
  <motion.section
    key="market-coming-soon"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="min-h-screen px-6 pt-32 pb-24 lg:px-10"
  >
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
      <div className="w-full max-w-3xl rounded-2xl border border-luxury-gold/20 bg-black/40 px-8 py-14 text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:px-14">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-luxury-gold/30 bg-luxury-gold/10">
          <Timer size={28} className="text-luxury-gold" />
        </div>
        <p className="mb-4 text-[11px] font-black uppercase tracking-[0.5em] text-luxury-gold">Market</p>
        <h1 className="font-serif text-3xl font-black italic text-white lg:text-5xl">Coming Soon</h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-300 lg:text-lg">
          This feature is currently under development. Please check back soon.
        </p>
      </div>
    </div>
  </motion.section>
);

const BottomTabBar = ({ currentView, setCurrentView }: { currentView: View, setCurrentView: (v: View) => void }) => {
  const items = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'packages', label: 'INVEST', icon: ShoppingCart },
    { id: 'wallet', label: 'WALLET', icon: Wallet },
    { id: 'rewards', label: 'TEAM', icon: Users },
    { id: 'profile', label: 'MY', icon: User },
  ];

  function Home(props: any) { return <Cpu {...props} />; }
  function Users(props: any) { return <Gift {...props} />; }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-luxury-red-dark/95 backdrop-blur-xl border-t border-luxury-gold/20 flex justify-around items-center z-50 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {items.map((item) => (
        <button 
          key={item.id}
          onClick={() => setCurrentView(item.id as View)}
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all ${
            currentView === item.id ? 'text-luxury-gold' : 'text-gray-500'
          }`}
        >
          <item.icon size={24} className={currentView === item.id ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]' : ''}/>
          <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

const NotificationActivityPage = ({
  notifications,
  onNotificationClick,
}: {
  notifications: NotificationItem[];
  onNotificationClick: (notification: NotificationItem) => void;
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(notifications.length / pageSize));
  const rows = notifications.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [notifications.length]);

  return (
    <motion.section
      key="activity"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen px-6 pt-32 pb-28 lg:px-10"
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-luxury-gold">Activity</p>
          <h1 className="mt-3 font-serif text-4xl font-black text-white lg:text-6xl">Notification History</h1>
        </div>

        <div className="overflow-hidden rounded-2xl border border-luxury-gold/15 bg-black/35 backdrop-blur-xl">
          {rows.length === 0 ? (
            <div className="p-10 text-center text-sm font-bold text-gray-500">No notifications yet.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {rows.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNotificationClick(item)}
                  className="grid w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] md:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!item.read && <span className="h-2 w-2 rounded-full bg-red-500" />}
                      <p className={`truncate text-sm font-black ${item.read ? 'text-gray-400' : 'text-white'}`}>{item.title}</p>
                    </div>
                    {item.body && <p className="mt-1 truncate text-xs font-semibold text-gray-500">{item.body}</p>}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{item.time}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500">Recent {notifications.length} notifications</p>
          <div className="flex items-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-400 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-xs font-black text-white">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-400 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default function App() {
  // Force logged-in state for testing - Initialize localStorage with mock token
  if (!localStorage.getItem('longrise_token')) {
    localStorage.setItem('longrise_token', 'mock_token_kim_dragon88_test');
    localStorage.setItem('mock_user', JSON.stringify({
      id: 'user_kim_dragon88',
      email: 'kim_dragon88@test.com',
      password: 'dragon88',
      name: 'Kim Dragon',
      nickname: 'Kim_Dragon88',
      rank: 'BLUE DRAGON'
    }));
  }

  const [currentView, setCurrentView] = useState<View>(() => getInitialView());
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState<UserData>(() => ({
    id: 'user_kim_dragon88',
    nickname: 'Kim_Dragon88',
    name: 'Kim Dragon',
    email: 'kim_dragon88@test.com',
    phone: '010-1234-5678',
    rank: 'BLUE DRAGON',
    status: 'active',
    joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    balanceUSDT: 50000,
    lockedUSDT: 25000,
    balanceCNYT: 15000,
    totalAssets: 90000,
    package: 'premium',
    initialInvestment: 10000,
    investmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    sponsorId: 'sponsor_001',
    teamSize: 45,
    teamVol: 500000,
    bodyValue: 100000,
    referralCode: 'KD88BLUE',
    referredByCode: '',
    kycLevel: 3,
    kycStatus: 'verified',
    pageface: true,
    mobileBinding: true,
    hasSetTradingPassword: true,
    isTradingPasswordVerified: false,
    otp: true,
    otpConfigured: true,
    lastLoginAt: new Date().toISOString(),
    distributorStatus: 'active',
    distributorCode: 'DIST_KD88',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  const [portalData, setPortalData] = useState<any>({
    overview: {
      totalRoi: 12500,
      monthlyEarnings: 1042,
    },
    wallet: {
      withdrawalBalance: {
        depositBalanceUsdt: 50000,
        earningsBalanceUsdt: 5000,
      },
      bonusUsdt: {
        totalBonusUsdt: 2500,
      },
      activities: [],
    },
    news: [],
  });
  const [packages, setPackages] = useState<any[]>([
    { id: 'flexible', name: 'Flexible', price: 100, returnRate: 4, description: 'Entry Level' },
    { id: 'basic', name: 'Basic', price: 200, returnRate: 7, description: 'Popular' },
    { id: 'standard', name: 'Standard', price: 500, returnRate: 9, description: 'Recommended' },
    { id: 'premium', name: 'Premium', price: 1000, returnRate: 11, description: 'High Returns' },
    { id: 'vip', name: 'VIP', price: 5000, returnRate: 18, description: 'Maximum Returns' },
  ]);
  const [investments, setInvestments] = useState<any[]>([]);

  const performanceConfig = getPerformanceConfig();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInitialTab, setLoginInitialTab] = useState<'login' | 'signup'>('login');
  const [pendingAuthenticatedView, setPendingAuthenticatedView] = useState<View | null>(null);
  const [pendingReferralCode, setPendingReferralCode] = useState('');
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [isInvestmentSubmitting, setIsInvestmentSubmitting] = useState(false);
  const [investmentError, setInvestmentError] = useState('');
  const [investmentNotice, setInvestmentNotice] = useState('');
  const [insufficientBalanceMessage, setInsufficientBalanceMessage] = useState('');
  const [authRequiredNotice, setAuthRequiredNotice] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [targetTicketId, setTargetTicketId] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [supportChatOpenRequest, setSupportChatOpenRequest] = useState(0);

  useEffect(() => {
    if (!investmentNotice) return undefined;
    const timer = window.setTimeout(() => setInvestmentNotice(''), 5000);
    return () => window.clearTimeout(timer);
  }, [investmentNotice]);

  useEffect(() => {
    if (!authRequiredNotice) return undefined;
    const timer = window.setTimeout(() => setAuthRequiredNotice(false), 1000);
    return () => window.clearTimeout(timer);
  }, [authRequiredNotice]);

  const loadNotifications = async (options: { refreshDataOnNew?: boolean } = {}) => {
    if (!apiService.isAuthenticated()) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }
    const response = await apiService.getNotifications();
    const nextNotifications = (response.data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      time: formatNotificationTime(item.createdAt),
      read: Boolean(item.read),
      type: notificationTypeFromCategory(item.category),
      targetView: item.targetView,
      targetId: item.targetId,
    })) as NotificationItem[];
    setNotifications((previous) => {
      const previousUnreadIds = new Set(previous.filter((item) => !item.read).map((item) => item.id));
      const hasFreshUnread = nextNotifications.some((item) => !item.read && !previousUnreadIds.has(item.id));
      if (hasFreshUnread) {
        setHasNewNotification(true);
        window.setTimeout(() => setHasNewNotification(false), 3000);
        if (options.refreshDataOnNew) {
          void loadAuthenticatedState({ includeNotifications: false });
        }
      }
      return nextNotifications;
    });
    setUnreadNotificationCount(response.unread || 0);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return undefined;
    }
    void loadNotifications();
    const timer = window.setInterval(() => void loadNotifications({ refreshDataOnNew: true }), 5000);
    let socket: WebSocket | null = null;
    apiService.createRealtimeSession()
      .then((session) => {
        socket = new WebSocket(session.websocketUrl);
        socket.onopen = () => setIsRealtimeConnected(true);
        socket.onmessage = () => void loadNotifications({ refreshDataOnNew: true });
        socket.onclose = () => setIsRealtimeConnected(false);
        socket.onerror = () => setIsRealtimeConnected(false);
      })
      .catch(() => undefined);
    return () => {
      window.clearInterval(timer);
      setIsRealtimeConnected(false);
      socket?.close();
    };
  }, [isLoggedIn]);

  const loadAuthenticatedState = async (options: { includeNotifications?: boolean } = {}) => {
    const includeNotifications = options.includeNotifications ?? true;
    const apiUser = await apiService.getCurrentUser();
    setUser(mapApiUserToShared(apiUser));
    setIsLoggedIn(true);

    const [dashboardData, packageData, investments, transactions, withdrawals, news, faq, supportTickets, walletSummary, withdrawalPolicy, transferHistory, earnRewardHistory] = await Promise.all([
      apiService.getUserDashboard(),
      apiService.getInvestmentPackages(),
      apiService.getMyInvestments(),
      apiService.getMyTransactions(100),
      apiService.getMyWithdrawals(),
      apiService.getNews(8),
      apiService.getSupportFaq(20),
      apiService.getMySupportTickets(),
      apiService.getWalletSummary().catch(() => null),
      apiService.getWithdrawalPolicy().catch(() => null),
      apiService.getWalletTransferHistory().catch(() => []),
      apiService.getWalletEarnRewardHistory().catch(() => []),
    ]);

    setPackages(packageData);
    setInvestments(investments);
    setPortalData({
      ...dashboardData,
      wallet: {
        ...(dashboardData?.wallet || {}),
        ...(walletSummary || {}),
        withdrawalPolicy,
        packageHistory: investments,
        earnRewardHistory: Array.isArray(earnRewardHistory) ? earnRewardHistory : [],
        activities: Array.isArray(earnRewardHistory) && earnRewardHistory.length > 0 ? earnRewardHistory : transactions,
        transferHistory: Array.isArray(transferHistory) && transferHistory.length > 0 ? transferHistory : transactions
          .filter((item: any) => ['swap', 'adjustment'].includes(item.type))
          .map((item: any) => ({
            id: item.id,
            counterparty: 'Platform',
            amount: item.amount,
            date: item.date,
            status: item.status,
            type: item.type,
          })),
        withdrawals: (Array.isArray(withdrawals) ? withdrawals : []).map((item: any) => ({
          id: item.withdrawal_id,
          amount: item.amount,
          finalAmount: item.final_amount,
          feeAmount: item.fee_amount,
          asset: item.asset,
          network: item.network,
          walletAddress: item.wallet_address,
          status: item.status,
          rejectionReason: item.rejection_reason,
          requestTime: item.request_time || item.created_at,
          processedAt: item.processed_at,
        })),
      },
      support: {
        faq,
        tickets: supportTickets,
      },
      news,
    });
    if (includeNotifications) {
      await loadNotifications({ refreshDataOnNew: false });
    }
  };

  useEffect(() => {
    const restore = async () => {
      try {
        const [packageData, news] = await Promise.all([
          apiService.getInvestmentPackages(),
          apiService.getNews(8),
        ]);
        setPackages(packageData);
        setPortalData((current: any) => ({
          ...(current || {}),
          news,
        }));
        if (apiService.isAuthenticated()) {
          await loadAuthenticatedState();
        }
      } catch (error) {
        // Don't clear auth on error - just log it
        console.log('Restore error (non-fatal):', error);
        // Keep the session alive even if API calls fail
        if (apiService.isAuthenticated()) {
          try {
            await loadAuthenticatedState();
          } catch (e) {
            console.log('loadAuthenticatedState error:', e);
          }
        }
      }
    };
    void restore();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawReferralCode = params.get('ref') || params.get('referral') || params.get('referral_code');
    const referralCode = rawReferralCode?.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || '';
    if (!referralCode) return;
    setPendingReferralCode(referralCode);
    setLoginInitialTab('signup');
    setIsLoginModalOpen(true);
  }, []);

  useEffect(() => {
    if (currentView !== 'cnyt-market' && MARKET_BLOCKED_PATHS.has(window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/')) {
      window.history.replaceState({}, '', '/');
    }
  }, [currentView]);

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
      await apiService.login({ email, password });
      await loadAuthenticatedState();
      setIsLoginModalOpen(false);
      setCurrentView(pendingAuthenticatedView || 'home');
      setPendingAuthenticatedView(null);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: getApiErrorMessage(error, 'Login failed') };
    }
  };

  const handleSignupComplete = async ({ email, password, referralCode }: { email: string; password: string; referralCode: string }) => {
    try {
      const normalizedReferralCode = referralCode.trim().toUpperCase();
      await apiService.completeSignup({
        email,
        password,
        ...(normalizedReferralCode ? { referral_code: normalizedReferralCode } : {}),
      });
      await loadAuthenticatedState();
      setIsLoginModalOpen(false);
      setPendingReferralCode('');
      setCurrentView(pendingAuthenticatedView || 'home');
      setPendingAuthenticatedView(null);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: getApiErrorMessage(error, 'Signup failed') };
    }
  };

  const handleUpdateUser = (updatedUser: UserData) => {
    setUser(updatedUser);
  };

  const requireLoginForView = (view: View) => {
    setPendingAuthenticatedView(view);
    setLoginInitialTab('login');
    setIsLoginModalOpen(true);
  };

  const navigateToView = (view: View) => {
    if (view === 'wallet' && !isLoggedIn) {
      setCurrentView('home');
      setAuthRequiredNotice(true);
      return;
    }
    setCurrentView(view);
  };

  const handleUpdateProfile = async (payload: Partial<UserData>) => {
    await apiService.updateUser({
      nickname: payload.nickname,
      name: payload.name,
      phone: payload.phone,
      mobile_binding: payload.mobileBinding,
    });
    await loadAuthenticatedState();
  };

  const handleSetReferralCode = async (referralCode: string) => {
    await apiService.setReferralCode({ referral_code: referralCode.trim().toUpperCase() });
    await loadAuthenticatedState();
  };

  const handleSetTradingPassword = async (password: string, confirmPassword: string, otpCode?: string, currentPassword?: string) => {
    await apiService.setTradingPassword({
      password,
      confirm_password: confirmPassword,
      current_password: currentPassword || undefined,
      otp_code: otpCode || undefined,
    });
    await loadAuthenticatedState();
  };

  const handleVerifyTradingPassword = async (password: string) => {
    const response = await apiService.verifyTradingPassword({ password });
    return response.verified;
  };

  const handleSetupOtp = async (currentOtpCode?: string) => {
    return apiService.setupOtp({ current_otp_code: currentOtpCode || undefined });
  };

  const handleVerifyOtpSetup = async (code: string) => {
    const response = await apiService.verifyOtpSetup({ verification_code: code });
    await loadAuthenticatedState();
    return response;
  };

  const handleEnableOtp = async (code: string) => {
    const response = await apiService.enableOtp({ verification_code: code });
    await loadAuthenticatedState();
    return response;
  };

  const handleDisableOtp = async (code: string, password: string) => {
    await apiService.disableOtp({ verification_code: code, password });
    await loadAuthenticatedState();
  };

  const handleCreateWithdrawal = async (payload: { amount: number; wallet_address: string; asset: 'USDT' | 'CNYT'; network: string; trading_password: string; otp_code?: string }) => {
    await apiService.createWalletWithdrawal({
      network: payload.network,
      address: payload.wallet_address,
      amountUsdt: payload.amount,
      trading_password: payload.trading_password,
      otp_code: payload.otp_code,
    });
    await loadAuthenticatedState();
  };

  const handleCreateTransfer = async (payload: { recipient: string; amount: number; asset: string; trading_password: string }) => {
    await apiService.createWalletTransfer(payload);
    await loadAuthenticatedState();
  };

  const handleCreateDepositRequest = async (payload: {
    leader_id: string;
    leader_name: string;
    bank_account?: string;
    deposit_amount?: number;
    notes?: string;
  }) => {
    const response = await apiService.createDepositRequest(payload);
    await loadAuthenticatedState();
    return response;
  };

  const handleConvertToCNYT = async (amount: number, expectedPriceUsd: number, tradingPassword: string) => {
    const response = await apiService.convertToCNYT({
      amount,
      expected_price_usd: expectedPriceUsd,
      trading_password: tradingPassword,
    });
    await loadAuthenticatedState();
    return response;
  };

  const handleCreateSupportTicket = async (payload: {
    title: string;
    description: string;
    category: string;
    priority?: string;
    attachments?: string[];
  }) => {
    const response = await apiService.createSupportTicket(payload);
    await loadAuthenticatedState();
    return response;
  };

  const handleCreateEmailInquiry = async (payload: {
    name: string;
    email: string;
    title: string;
    content: string;
    attachments?: string[];
  }) => {
    const response = await apiService.createEmailInquiry(payload);
    await loadAuthenticatedState();
    return response;
  };

  const handleCreateFraudReport = async (payload: {
    fraudster_uid: string;
    fraud_reason: string;
    description: string;
    evidence: string[];
  }) => {
    const response = await apiService.createFraudReport(payload);
    await loadAuthenticatedState();
    return response;
  };

  const handleTerminateInvestment = async (investmentId: string) => {
    await apiService.terminateInvestment(investmentId);
    await loadAuthenticatedState();
  };

  const handleLogout = async () => {
    await apiService.logout().catch(() => undefined);
    clearTradingPasswordVerified();
    setIsLoggedIn(false);
    setCurrentView('home');
    setSelectedPkg(null);
    setUser(createGuestUser());
    setPortalData(null);
    setInvestments([]);
    setNotifications([]);
    setUnreadNotificationCount(0);
    setTargetTicketId(null);
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    await apiService.markNotificationRead(notification.id).catch(() => undefined);
    if (notification.targetView === 'support-chat') {
      setSupportChatOpenRequest((value) => value + 1);
      await loadNotifications();
    } else if (notification.targetView === 'support' && notification.targetId) {
      setTargetTicketId(notification.targetId);
      setCurrentView('support');
      await loadAuthenticatedState();
    } else if (notification.targetView === 'notices') {
      setCurrentView('notices');
    } else if (notification.targetView) {
      setCurrentView(notification.targetView as View);
    }
    await loadNotifications();
  };

  const handleMarkAllNotificationsRead = async () => {
    await apiService.markAllNotificationsRead();
    await loadNotifications();
  };

  const handlePackageSelect = (pkgId: string) => {
    if (!isLoggedIn) {
      setLoginInitialTab('login');
      setIsLoginModalOpen(true);
    } else {
      setInvestmentError('');
      setInvestmentNotice('');
      setSelectedPkg(pkgId);
    }
  };

  const handleInvestmentConfirm = async () => {
    if (!selectedPkg || isInvestmentSubmitting) return;

    setInvestmentError('');
    setInvestmentNotice('');
    const selectedPackage = packages.find((pkg) => {
      const selectedKey = normalizePackageLookupKey(selectedPkg);
      return normalizePackageLookupKey(pkg.id) === selectedKey || normalizePackageLookupKey(pkg.name) === selectedKey;
    });
    const purchaseAmount = getPackagePurchaseAmount(selectedPackage) || getPackagePolicy(selectedPkg)?.min || 0;
    const purchaseBalance = getPackagePurchaseBalance(portalData, user);
    if (purchaseAmount > 0 && purchaseBalance.total < purchaseAmount) {
      setSelectedPkg(null);
      setInsufficientBalanceMessage(
        `Insufficient balance. Please deposit USDT to proceed. Required: ${formatUsdtAmount(purchaseAmount)} USDT / Available: ${formatUsdtAmount(purchaseBalance.total)} USDT. Purchase balance is calculated as Deposit ${formatUsdtAmount(purchaseBalance.depositBalance)} + Bonus ${formatUsdtAmount(purchaseBalance.bonusUsdt)} + Earnings ${formatUsdtAmount(purchaseBalance.earningsBalance)} USDT.`,
      );
      return;
    }

    setIsInvestmentSubmitting(true);
    try {
      await apiService.purchaseInvestment({ package_id: selectedPkg });
      if (apiService.isAuthenticated()) {
        await loadAuthenticatedState();
      }
      setSelectedPkg(null);
      setCurrentView('wallet');
      setInvestmentNotice('Package purchase completed successfully.');
    } catch (error: any) {
      const message = getApiErrorMessage(error, 'Package purchase failed.');
      if (message.toLowerCase().includes('insufficient')) {
        setSelectedPkg(null);
        setInsufficientBalanceMessage('Insufficient balance. Please deposit USDT to proceed.');
      } else {
        setInvestmentError(message);
      }
    } finally {
      setIsInvestmentSubmitting(false);
    }
  };

  const handleDepositAfterInsufficientBalance = () => {
    setInsufficientBalanceMessage('');
    setCurrentView('deposit');
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const navigateFromFooter = (view: View) => {
    setCurrentView(view);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const handleCreateP2POrder = async (payload: { amount: number; price_per_unit: number; trade_type: 'buy' | 'sell' }) => {
    if (!payload.amount || !payload.price_per_unit) return;
    await apiService.createP2POrder({
      asset: 'CNYT',
      trade_type: payload.trade_type,
      amount: payload.amount,
      price_per_unit: payload.price_per_unit,
      currency: 'USDT',
    });
    await loadAuthenticatedState();
  };

  const handleCreateUsdtP2POrder = async (payload: { amount: number; price_per_unit: number; trade_type: 'buy' | 'sell' }) => {
    if (!payload.amount || !payload.price_per_unit) return;
    await apiService.createP2POrder({
      asset: 'USDT',
      trade_type: payload.trade_type,
      amount: payload.amount,
      price_per_unit: payload.price_per_unit,
      currency: 'USDT',
    });
    await loadAuthenticatedState();
  };

  const handleCancelP2POrder = async (tradeId: string) => {
    await apiService.cancelP2POrder(tradeId);
    await loadAuthenticatedState();
  };

  const handleCompleteP2POrder = async (tradeId: string) => {
    await apiService.completeP2POrder(tradeId);
    await loadAuthenticatedState();
  };

  const handleFillP2POrder = async (tradeId: string, amount: number) => {
    await apiService.fillP2POrder(tradeId, { amount });
    await loadAuthenticatedState();
  };

  return (
    <div className={`min-h-screen relative ${!performanceConfig.enableCSSAnimations ? 'performance-mode' : ''}`}>
      <NetworkOverlay intensity={0.5} speed={0.3} />
      <Navbar 
        currentView={currentView} 
        setCurrentView={navigateToView}
        user={user} 
        isLoggedIn={isLoggedIn}
        onLoginClick={() => {
          setLoginInitialTab('login');
          setIsLoginModalOpen(true);
        }}
        onLogout={handleLogout}
        notifications={notifications}
        unreadCount={unreadNotificationCount}
        hasNewNotification={hasNewNotification}
        onNotificationClick={handleNotificationClick}
    onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onViewAllActivity={() => setCurrentView('activity')}
      />

      <main className="pb-24 lg:pb-0">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
             <HomePage
               onLoginClick={() => {
                 setLoginInitialTab('login');
                 setIsLoginModalOpen(true);
               }}
               onSelectPackage={handlePackageSelect}
               onAboutClick={() => setCurrentView('documentation')}
               packages={packages}
               portalData={portalData}
               isLoggedIn={isLoggedIn}
             />
          )}

          {currentView === 'about' && (
            <AboutLongrisePage onBack={() => setCurrentView('home')} />
          )}

          {currentView === 'packages' && (
            <motion.div 
              key="packages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PackagesPage onInvestClick={handlePackageSelect} packages={packages} />
            </motion.div>
          )}

          {currentView === 'crypto-ai' && <CryptoAIPage onUpgrade={() => setCurrentView('packages')} portalData={portalData} onTerminateInvestment={handleTerminateInvestment} />}
          {currentView === 'rewards' && (
            <RewardsPage
              user={user}
              isLoggedIn={isLoggedIn}
              onRequireLogin={() => requireLoginForView('rewards')}
              onSetView={setCurrentView}
              rewardsData={portalData?.rewards}
              onVerifyTradingPassword={handleVerifyTradingPassword}
            />
          )}
          {currentView === 'wallet' && <WalletPage user={user} onSetView={setCurrentView} portalData={portalData} onCreateWithdrawal={handleCreateWithdrawal} onCreateTransfer={handleCreateTransfer} onConvertToCNYT={handleConvertToCNYT} />}
          {currentView === 'deposit' && <DepositPage onSetView={setCurrentView} />}
          {currentView === 'profile' && <ProfilePage user={user} onLogout={handleLogout} onSaveProfile={handleUpdateProfile} onSetReferralCode={handleSetReferralCode} onSetTradingPassword={handleSetTradingPassword} onSetupOtp={handleSetupOtp} onVerifyOtpSetup={handleVerifyOtpSetup} notificationsEnabled={isRealtimeConnected} />}
          {currentView === 'security' && <SecurityPage user={user} securityData={portalData?.security} onSetTradingPassword={handleSetTradingPassword} onSetupOtp={handleSetupOtp} onVerifyOtpSetup={handleVerifyOtpSetup} onEnableOtp={handleEnableOtp} onDisableOtp={handleDisableOtp} />}
          {currentView === 'support' && <SupportPage portalData={portalData} onCreateTicket={handleCreateSupportTicket} onCreateEmailInquiry={handleCreateEmailInquiry} onSetView={(view: string) => setCurrentView(view as View)} targetTicketId={targetTicketId} onTargetTicketConsumed={() => setTargetTicketId(null)} />}
          {currentView === 'documentation' && <DocumentationPage />}
          {currentView === 'referral-program' && <ReferralProgramPage />}
          {currentView === 'notices' && <NoticesPage portalData={portalData} />}
          {currentView === 'activity' && <NotificationActivityPage notifications={notifications} onNotificationClick={handleNotificationClick} />}
          {currentView === 'cnyt-market' && <MarketComingSoonPage />}
          {currentView === 'usdt-onboarding' && <USDTOnboardingPage onSetView={(view: string) => setCurrentView(view as View)} onCreateDepositRequest={handleCreateDepositRequest} />}
          {currentView === 'usdt-fraud-report' && <USDTFraudReportPage onSetView={(view: string) => setCurrentView(view as View)} onSubmitReport={handleCreateFraudReport} />}
          {currentView === 'terms' && <LegalPage type="terms" onBack={() => setCurrentView('home')} />}
          {currentView === 'privacy-policy' && <LegalPage type="privacy-policy" onBack={() => setCurrentView('home')} />}
          {currentView === 'risk-notice' && <LegalPage type="risk-notice" onBack={() => setCurrentView('home')} />}
        </AnimatePresence>
      </main>

      <BottomTabBar currentView={currentView} setCurrentView={navigateToView} />

      <FloatingSupportActions
        isLoggedIn={isLoggedIn}
        onRequireLogin={() => setAuthRequiredNotice(true)}
        openRequestKey={supportChatOpenRequest}
      />

      <AnimatePresence>
        {authRequiredNotice && <AuthRequiredNoticeModal />}
      </AnimatePresence>

      <AnimatePresence>
        {investmentNotice && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed right-4 top-24 z-[115] max-w-sm rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-sm font-bold text-green-100 shadow-[0_20px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <Check size={18} className="text-green-300" />
              <span>{investmentNotice}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPkg && (
          <InvestmentModal 
            pkgId={selectedPkg} 
            onClose={() => setSelectedPkg(null)} 
            onConfirm={handleInvestmentConfirm}
            isSubmitting={isInvestmentSubmitting}
            errorMessage={investmentError}
            availableUsdt={getPackagePurchaseBalance(portalData, user).total}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {insufficientBalanceMessage && (
          <InsufficientBalanceModal
            message={insufficientBalanceMessage}
            onClose={() => setInsufficientBalanceMessage('')}
            onDeposit={handleDepositAfterInsufficientBalance}
          />
        )}
      </AnimatePresence>

      <footer className="border-t border-luxury-gold/10 bg-[#020202] px-6 pt-[70px] pb-32 lg:pb-[70px]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <button onClick={() => navigateFromFooter('home')} className="font-serif text-2xl font-black tracking-[0.28em] text-white">
              LONG<span className="text-luxury-gold">RISE</span>
            </button>
            <p className="mt-4 max-w-[420px] text-sm leading-7 text-[#8b8f98]">
              AI powered gaming and futures strategy platform. Users choose a product plan, AI runs automated strategies, and returns are tracked through the system.
            </p>
          </div>

          <div>
            <h5 className="text-[10px] font-black uppercase tracking-[0.24em] text-white">Risk Info</h5>
            <div className="mt-4 space-y-3.5">
              <button className="block text-left text-xs font-extrabold uppercase tracking-[0.12em] text-[#858891] transition-colors hover:text-luxury-gold" onClick={() => navigateFromFooter('terms')}>Terms</button>
              <button className="block text-left text-xs font-extrabold uppercase tracking-[0.12em] text-[#858891] transition-colors hover:text-luxury-gold" onClick={() => navigateFromFooter('privacy-policy')}>Privacy Policy</button>
              <button className="block text-left text-xs font-extrabold uppercase tracking-[0.12em] text-[#858891] transition-colors hover:text-luxury-gold" onClick={() => navigateFromFooter('risk-notice')}>Risk Notice</button>
            </div>
          </div>

          <div>
            <h5 className="text-[10px] font-black uppercase tracking-[0.24em] text-white">Contact</h5>
            <div className="mt-4 space-y-3.5">
              <a className="block text-xs font-extrabold uppercase tracking-[0.12em] text-[#858891] transition-colors hover:text-luxury-gold" href="https://t.me/longrise_ai" target="_blank" rel="noreferrer">Telegram</a>
              <button className="block text-left text-xs font-extrabold uppercase tracking-[0.12em] text-[#858891] transition-colors hover:text-luxury-gold">Email</button>
              <button className="block text-left text-xs font-extrabold uppercase tracking-[0.12em] text-[#858891] transition-colors hover:text-luxury-gold" onClick={() => navigateFromFooter('support')}>Support Center</button>
              <button className="block text-left text-xs font-extrabold uppercase tracking-[0.12em] text-[#858891] transition-colors hover:text-luxury-gold">Business Inquiry</button>
            </div>
          </div>

          <div>
            <h5 className="text-[10px] font-black uppercase tracking-[0.24em] text-white">Partners</h5>
            <div className="mt-4 space-y-3.5">
              <button className="block text-left text-xs font-extrabold uppercase tracking-[0.12em] text-[#858891] transition-colors hover:text-luxury-gold">CNYT Foundation ↗</button>
              <button className="block text-left text-xs font-extrabold uppercase tracking-[0.12em] text-[#858891] transition-colors hover:text-luxury-gold">Gaming Partners ↗</button>
              <button className="block text-left text-xs font-extrabold uppercase tracking-[0.12em] text-[#858891] transition-colors hover:text-luxury-gold">Strategic Alliance ↗</button>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-[46px] max-w-7xl border-t border-white/10 pt-7 text-[11px] leading-5 text-[#555]">
          © 2026 LONGRISE GLOBAL FOUNDATION. AI Powered Gaming &amp; Futures Strategy Systems.
          <br /><br />
          LEGAL NOTICE: This platform involves high-risk automated casino betting and futures trading strategies. Results are not guaranteed. Users participate voluntarily and must understand all risks before depositing funds.
        </div>
      </footer>

      {/* Premium VIP Entrance Modal */}
      <VIPEntranceModal
        isOpen={isLoginModalOpen}
        initialTab={loginInitialTab}
        referralCode={pendingReferralCode}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        onSignupComplete={handleSignupComplete}
      />
    </div>
  );
}
