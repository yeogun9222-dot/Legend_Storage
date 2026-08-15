import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Users, 
  Network, 
  Target, 
  Flame, 
  CheckCircle2, 
  Download, 
  Plus, 
  Minus,
  Sparkles,
  Search,
  Filter,
  ArrowUpRight,
  UserCheck,
  History,
  LayoutGrid,
  Percent,
  PlusCircle,
  MinusCircle,
  FileText,
  Gem,
  Shield,
  ShieldCheck,
  Award,
  Lock,
  Unlock,
  Key,
  AlertTriangle,
  Maximize2
} from 'lucide-react';
import { isTradingPasswordVerified, markTradingPasswordVerified } from '../utils/tradingPasswordSession';

type RewardsTab = 'honor' | 'team' | 'tree' | 'ranks';

// --- Trading Password Gate Component ---
const TradingPasswordGate = ({
  onSuccess,
  onVerify,
}: {
  onSuccess: () => void;
  onVerify: (password: string) => Promise<boolean>;
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length !== 4) {
      setError('Enter the 4-digit Trading PIN');
      return;
    }
    const verified = await onVerify(password).catch(() => false);
    if (verified) {
      onSuccess();
    } else {
      setError('Invalid Identity Passkey');
      setPassword('');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto mt-20 p-10 glass-panel rounded-2xl border border-luxury-gold/30 flex flex-col items-center text-center space-y-8"
    >
      <div className="w-20 h-20 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold border border-luxury-gold/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
        <Lock size={32} />
      </div>
      
      <div className="space-y-3">
        <h2 className="text-2xl font-serif font-black text-white uppercase tracking-widest">Authentication Required</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Please enter your Trading Password to access sensitive team data.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="relative">
          <input 
            type="password" 
            inputMode="numeric"
            maxLength={4}
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={`w-full bg-black/60 border ${error ? 'border-red-500' : 'border-white/10'} rounded-2xl py-5 px-6 pt-8 text-white text-center text-2xl font-mono tracking-[1em] focus:border-luxury-gold transition-all outline-none`}
            placeholder="••••"
          />
          <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[8px] font-black text-gray-600 uppercase tracking-widest">Secure Entry</span>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-[10px] font-black uppercase tracking-widest"
          >
            {error}
          </motion.p>
        )}

        <button 
          type="submit"
          disabled={password.length !== 4}
          className="w-full py-5 bg-luxury-gold text-black rounded-2xl font-black text-[11px] tracking-[0.3em] uppercase hover:scale-105 transition-all shadow-[0_15px_40px_rgba(234,179,8,0.2)]"
        >
          Verify Identity
        </button>
      </form>

      <div className="flex flex-col gap-2 pt-4">
        <button className="text-[9px] text-luxury-gold font-bold uppercase tracking-widest hover:underline">Forgot password?</button>
      </div>
    </motion.div>
  );
};

// --- Trading Password Required Notice ---
const TradingPasswordRequiredPrompt = ({ onSetView }: { onSetView: (v: any) => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto mt-20 p-10 glass-panel rounded-2xl border border-red-500/30 flex flex-col items-center text-center space-y-8"
    >
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
        <AlertTriangle size={32} />
      </div>
      
      <div className="space-y-3">
        <h2 className="text-2xl font-serif font-black text-white uppercase tracking-widest text-red-500">Action Required</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
           To view organizational data and team details, you must first configure your <span className="text-white">Trading Password</span> (4-digit numeric PIN) in your profile.
        </p>
      </div>

      <button 
        onClick={() => onSetView('profile')}
        className="w-full py-5 bg-luxury-gold text-black rounded-2xl font-black text-[11px] tracking-[0.3em] uppercase hover:scale-105 transition-all shadow-[0_15px_40px_rgba(234,179,8,0.2)] flex items-center justify-center gap-3"
      >
        <UserCheck size={18} /> Configure Security PIN
      </button>
    </motion.div>
  );
};

const EmptyRewardsState = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-500">{title}</p>
    <p className="mt-3 text-sm text-gray-600">{description}</p>
  </div>
);

export const RewardsPage = ({
  user,
  isLoggedIn,
  onRequireLogin,
  onSetView,
  rewardsData,
  onVerifyTradingPassword,
}: {
  user: any;
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
  onSetView: (v: any) => void;
  rewardsData?: any;
  onVerifyTradingPassword?: (password: string) => Promise<boolean>;
}) => {
  const [activeTab, setActiveTab] = useState<RewardsTab>('honor');
  // 세션에 유효한 거래비밀번호 인증이 남아 있으면 재입력 없이 인증 상태로 복원한다.
  const [isVerified, setIsVerified] = useState(() => isTradingPasswordVerified());

  // Verification helper based on global user state
  const hasSetPassword = Boolean(isLoggedIn && user.hasSetTradingPassword);

  // 거래비밀번호 인증은 세션(1시간)에 유지되어 페이지 이동/재방문 시에도 재입력이 필요 없다.
  const handleVerifiedSuccess = () => {
    markTradingPasswordVerified();
    setIsVerified(true);
  };

  const tabs = [
    { id: 'honor', label: 'HONOR', icon: Crown },
    { id: 'team', label: 'TEAM', icon: Users },
    { id: 'tree', label: 'TREE', icon: Network },
    { id: 'ranks', label: 'RANKS', icon: Target },
  ];

  const sovereignHall = rewardsData?.honorLeaders || [];

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-20 min-h-screen">
      {/* Top 3 Honor Cards (Always visible at the top of Rewards) */}
      <div className="space-y-16">
        <div className="text-center space-y-4">
          <p className="text-[10px] font-black text-luxury-gold tracking-[0.4em] uppercase">The Highest Achievement</p>
          <h2 className="text-5xl lg:text-8xl font-serif font-black text-white">The Sovereign Hall</h2>
        </div>

        {sovereignHall.length === 0 ? (
          <EmptyRewardsState title="No honor rankings yet" description="Honor rankings will appear when live leaderboard data is available." />
        ) : (
        <div className="grid grid-cols-3 gap-2 lg:gap-8 px-2 lg:px-4 items-center">
          {sovereignHall.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-panel p-3 lg:p-10 rounded-2xl border-2 flex flex-col items-center text-center space-y-3 lg:space-y-8 relative overflow-hidden group transition-all duration-700
                ${s.type === 'black' 
                  ? 'scale-105 lg:scale-110 z-10 bg-gradient-to-br from-[#1a0505] to-[#000] border-luxury-gold shadow-[0_0_100px_rgba(0,0,0,0.8),0_0_40px_rgba(234,179,8,0.2)]' 
                  : 'scale-95 bg-gradient-to-br from-[#4a0808]/80 to-[#2d0505]/95 border-luxury-gold/30 shadow-[0_0_50px_rgba(220,38,38,0.25)] hover:shadow-[0_0_70px_rgba(234,179,8,0.3)] hover:border-luxury-gold/60'}
              `}
            >
              {/* Type-specific glow backgrounds */}
              {s.type === 'black' && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.05)_0%,transparent_70%)] animate-pulse" />
              )}

              <div className={`w-20 h-20 lg:w-28 lg:h-28 rounded-full bg-black/60 border-2 flex items-center justify-center p-4 relative group-hover:scale-110 transition-transform
                ${s.type === 'black' ? 'border-luxury-gold shadow-[0_0_40px_rgba(234,179,8,0.4)]' : 'border-red-500/40 shadow-[0_0_30px_rgba(220,38,38,0.3)]'}
              `}>
                <Crown className={`w-8 lg:w-12 h-8 lg:h-12 ${s.type === 'black' ? 'text-luxury-gold' : 'text-red-500'}`} />
                {s.type === 'black' && <div className="absolute inset-0 rounded-full border-4 border-luxury-gold/60 animate-[pulse_2s_infinite]"></div>}
              </div>
              
              <div className="space-y-2 lg:space-y-4 relative z-10">
                <h3 className="text-sm lg:text-lg font-serif font-black text-white">{s.name}</h3>
                <div className={`h-px w-12 mx-auto ${s.type === 'black' ? 'bg-luxury-gold/30' : 'bg-red-500/30'}`}></div>
                <p className={`text-[8px] lg:text-[10px] font-bold uppercase tracking-[0.3em] ${s.type === 'black' ? 'text-luxury-gold' : 'text-red-400'}`}>{s.role}</p>
              </div>

              <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-2 lg:p-4 flex justify-between items-center group-hover:bg-white/5 transition-colors relative z-10">
                <p className="text-[8px] lg:text-[9px] text-gray-500 font-black uppercase tracking-widest">{s.country || '-'}</p>
                <p className="text-sm lg:text-base font-mono font-black text-white">{s.vol || '0 Vol'}</p>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </div>

      {/* Re-positioned Sub-Nav: below honor cards, above tab content */}
      <div className="flex flex-col items-center space-y-12">
        <div className="flex flex-wrap justify-center gap-2 lg:gap-4 p-2 bg-black/60 rounded-2xl border border-white/10 w-fit backdrop-blur-xl shadow-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (!isLoggedIn && tab.id !== 'honor') {
                  onRequireLogin?.();
                  return;
                }
                setActiveTab(tab.id as RewardsTab);
              }}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[11px] font-black tracking-widest transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-luxury-gold text-black shadow-[0_10px_30px_rgba(234,179,8,0.4)] scale-105' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Render */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            {activeTab === 'honor' ? (
              <HonorTab leaders={rewardsData?.vanguardLeaders || []} />
            ) : !hasSetPassword ? (
              <TradingPasswordRequiredPrompt onSetView={onSetView} />
            ) : isVerified ? (
              <>
                {activeTab === 'team' && <TeamTab teamMembers={rewardsData?.teamMembers || []} summary={rewardsData?.summary} />}
                {activeTab === 'tree' && <TreeTab user={user} teamMembers={rewardsData?.teamMembers || []} summary={rewardsData?.summary} />}
                {activeTab === 'ranks' && <RanksTab user={user} summary={rewardsData?.summary} />}
              </>
            ) : (
              <TradingPasswordGate onVerify={(password) => onVerifyTradingPassword ? onVerifyTradingPassword(password) : Promise.resolve(false)} onSuccess={handleVerifiedSuccess} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Sub-Tab Components ---

const HonorTab = ({ leaders }: { leaders: any[] }) => {
  return (
    <div className="space-y-24 w-full">
      <div className="p-8 lg:p-16 rounded-2xl border-2 border-luxury-gold/30 space-y-16 shadow-[0_30px_70px_rgba(0,0,0,0.6)]" style={{ background: 'linear-gradient(165deg, rgba(160, 20, 20, 0.5) 0%, rgba(80, 10, 10, 0.7) 50%, rgba(30, 5, 5, 0.9) 100%)', backdropFilter: 'blur(30px)' }}>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black text-luxury-gold tracking-[0.4em] uppercase">Extended Leadership</p>
          <h2 className="text-4xl lg:text-6xl font-serif font-black text-white">Imperial Vanguard</h2>
        </div>

        {leaders.length === 0 ? (
          <EmptyRewardsState title="No vanguard records yet" description="Extended leadership records will appear here when published by the platform." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-12 gap-x-8">
          {leaders.map((v, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center space-y-4 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-luxury-gold/30 flex items-center justify-center group-hover:border-luxury-gold transition-colors shadow-[0_5px_20px_rgba(239,68,68,0.2)]">
                <Flame className="text-red-500 group-hover:text-luxury-gold transition-colors" size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white tracking-widest">{v.name || v.nickname}</p>
                <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest">{v.rank}</p>
              </div>
            </motion.div>
          ))}
          </div>
        )}
      </div>

      <div className="text-center max-w-3xl mx-auto space-y-6 opacity-60">
        <div className="h-px w-24 bg-luxury-gold/50 mx-auto"></div>
        <p className="text-lg font-serif text-gray-400 leading-relaxed">
          "Honor is not given, it is architected. These leaders represent the pinnacle of strategic wealth synthesis within the Longrise ecosystem."
        </p>
        <p className="text-[10px] font-black text-luxury-gold uppercase tracking-[0.6em]">The Council of Sovereigns</p>
      </div>
    </div>
  );
};

const TeamTab = ({ teamMembers, summary }: { teamMembers: any[]; summary?: any }) => {
  const directMembers = teamMembers.filter((member) => Number(member.generation || 1) === 1);
  const memberInvestment = (member: any) => Number(member.investmentUSDT || member.initialInvestment || 0);
  const directVolumeFallback = directMembers.reduce((total, member) => total + memberInvestment(member), 0);
  const teamVolumeFallback = teamMembers.reduce((total, member) => total + memberInvestment(member), 0);
  const activeMembersFallback = teamMembers.filter((member) => memberInvestment(member) > 0).length;
  const metricCards = [
    {
      label: 'Direct Referrals',
      value: Number(summary?.directReferralCount ?? directMembers.length).toLocaleString(),
      unit: 'L1',
      icon: Users,
    },
    {
      label: 'Active Members',
      value: Number(summary?.activeMemberCount ?? activeMembersFallback).toLocaleString(),
      unit: 'Packages',
      icon: UserCheck,
    },
    {
      label: 'Direct Volume',
      value: Number(summary?.directVolume ?? directVolumeFallback).toLocaleString(),
      unit: 'USDT',
      icon: Target,
    },
    {
      label: 'Team Total Volume',
      value: Number(summary?.teamTotalVolume ?? summary?.teamVolume ?? teamVolumeFallback).toLocaleString(),
      unit: 'USDT',
      icon: Network,
    },
  ];
  const referrals = directMembers.map((member, index) => ({
    id: String(index + 1).padStart(2, '0'),
    user: member.nickname,
    rank: member.rank,
    pkg: member.package || '-',
    amount: `${memberInvestment(member).toLocaleString()} USDT`,
    date: member.joinedAt ? member.joinedAt.slice(0, 10) : '-',
    status: memberInvestment(member) > 0 ? 'ACTIVE' : 'INACTIVE',
  }));

  return (
    <div className="glass-panel p-6 lg:p-16 rounded-2xl border border-white/10 space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-2">
          <h2 className="text-2xl lg:text-3xl font-serif font-black text-white uppercase">Organization Volume</h2>
          <p className="text-[10px] text-gray-500 font-black tracking-[0.4em] uppercase">Direct Referral Network</p>
        </div>
        
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 lg:max-w-3xl">
          {metricCards.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-luxury-gold/20 bg-black/40 p-5 shadow-[0_15px_40px_rgba(0,0,0,0.35)]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <metric.icon size={18} className="text-luxury-gold" />
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">
                  {metric.unit}
                </span>
              </div>
              <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">
                {metric.label}
              </p>
              <p className="text-2xl font-mono font-black text-luxury-gold">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {referrals.length === 0 ? (
        <EmptyRewardsState title="No direct referrals yet" description="Direct referral records will appear here after members join under your account." />
      ) : (
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-4 min-w-[800px]">
          <thead>
            <tr className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] px-8">
              <th className="pb-4 pl-10 w-24">No</th>
              <th className="pb-4">User ID / Package</th>
              <th className="pb-4">Investment</th>
              <th className="pb-4">Reg Date</th>
              <th className="pb-4 text-right pr-10">Status</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((r, i) => (
              <tr key={i} className="group cursor-pointer">
                <td className="bg-white/[0.03] border-l border-y border-white/5 py-4 pl-10 rounded-l-[2rem] group-hover:bg-luxury-gold/5 transition-colors">
                  <span className="text-xs font-mono font-black text-gray-700">{r.id}</span>
                </td>
                <td className="bg-white/[0.03] border-y border-white/5 py-4 group-hover:bg-luxury-gold/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-lg font-serif font-black text-white group-hover:text-luxury-gold transition-colors">{r.user}</p>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{r.rank} <span className="mx-1 opacity-30">•</span> {r.pkg}</p>
                    </div>
                  </div>
                </td>
                <td className="bg-white/[0.03] border-y border-white/5 py-4 group-hover:bg-luxury-gold/5 transition-colors">
                  <p className="text-2xl font-mono font-black text-white">{r.amount}</p>
                </td>
                <td className="bg-white/[0.03] border-y border-white/5 py-4 group-hover:bg-luxury-gold/5 transition-colors">
                  <p className="text-xs font-mono font-bold text-gray-500">{r.date}</p>
                </td>
                <td className="bg-white/[0.03] border-r border-y border-white/5 py-4 pr-10 rounded-r-[2rem] text-right group-hover:bg-luxury-gold/5 transition-colors">
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                    r.status === 'ACTIVE'
                      ? 'border-green-500/30 text-green-500 bg-green-500/5'
                      : 'border-gray-500/30 text-gray-400 bg-gray-500/5'
                  }`}>
                    <div className={`w-1 h-1 rounded-full ${r.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <div className="text-center pt-8">
        <p className="text-[10px] text-gray-600 font-black tracking-[0.4em] uppercase">Showing Live Direct Referral Records</p>
      </div>
    </div>
  );
};

type TreeMemberNode = {
  id: string;
  nickname: string;
  rank: string;
  package?: string;
  generation: number;
  sponsorNickname?: string | null;
  balanceUSDT: number;
  investmentUSDT: number;
  teamSize: number;
  teamVolume: number;
  bodyValue: number;
  isSelf?: boolean;
};

type TreeLayoutItem = {
  node: TreeMemberNode;
  depth: number;
  x: number;
  y: number;
};

type TreeConnectorLine = {
  id: string;
  path: string;
};

const TREE_ZOOM_MIN = 0.18;
const TREE_ZOOM_MAX = 1.35;
const TREE_NODE_WIDTH = 288;
const TREE_NODE_HEIGHT = 320;
const TREE_SIBLING_GAP = 48;
const TREE_LEVEL_GAP = 96;

const rankAccentColor = (rank: string) => {
  if (rank === 'White Dragon') return '#F5F0E8';
  if (rank === 'Blue Dragon') return '#60A5FA';
  if (rank === 'Purple Dragon') return '#C084FC';
  if (rank === 'Red Dragon') return '#F87171';
  if (rank === 'Black Dragon') return '#94A3B8';
  return '#64748B';
};

const TreeTab = ({ user, teamMembers, summary }: { user: any; teamMembers: any[]; summary?: any }) => {
  const selfNickname = user.nickname || 'ME';
  const treeViewportRef = useRef<HTMLDivElement | null>(null);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const isPanningRef = useRef(false);
  const didPanRef = useRef(false);
  const [rootNickname, setRootNickname] = useState(selfNickname);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [fitRequest, setFitRequest] = useState(0);

  const requestFitAll = () => {
    setFitRequest((value) => value + 1);
  };

  const centerTreeViewport = (nextZoom = zoom, layoutWidth?: number) => {
    const viewport = treeViewportRef.current;
    if (!viewport) return;
    const width = layoutWidth || treeLayout.width;
    setPan({
      x: Math.max(32, (viewport.clientWidth - width * nextZoom) / 2),
      y: 40,
    });
  };

  const fitTreeToViewport = () => {
    const viewport = treeViewportRef.current;
    if (!viewport) return;

    const horizontalPadding = 64;
    const verticalPadding = 64;
    const widthRatio = (viewport.clientWidth - horizontalPadding) / Math.max(treeLayout.width, 1);
    const heightRatio = (viewport.clientHeight - verticalPadding) / Math.max(treeLayout.height, 1);
    const nextZoom = Math.min(1, Math.max(TREE_ZOOM_MIN, Math.floor(Math.min(widthRatio, heightRatio) * 100) / 100));
    setZoom(nextZoom);
    centerTreeViewport(nextZoom, treeLayout.width);
  };

  useEffect(() => {
    setRootNickname(selfNickname);
    setShowAll(false);
  }, [selfNickname]);

  const { nodesByNickname, childrenByNickname } = useMemo(() => {
    const selfNode: TreeMemberNode = {
      id: user.id || selfNickname,
      nickname: selfNickname,
      rank: user.rank || summary?.rank || 'Investor',
      package: user.package || '-',
      generation: 0,
      sponsorNickname: null,
      balanceUSDT: Number(user.balanceUSDT || 0),
      investmentUSDT: Number(user.initialInvestment || 0),
      teamSize: Number(summary?.teamSize || user.teamSize || 0),
      teamVolume: Number(summary?.teamVolume || user.teamVolume || 0),
      bodyValue: Number(summary?.bodyValue || user.bodyValue || 0),
      isSelf: true,
    };
    const allNodes = [
      selfNode,
      ...teamMembers.map((member, index) => ({
        id: member.id || `${member.nickname}-${index}`,
        nickname: member.nickname,
        rank: member.rank || 'Investor',
        package: member.package || '-',
        generation: Number(member.generation || 0),
        sponsorNickname: member.sponsorNickname || (Number(member.generation || 0) === 1 ? selfNickname : null),
        balanceUSDT: Number(member.balanceUSDT || 0),
        investmentUSDT: Number(member.investmentUSDT || member.initialInvestment || 0),
        teamSize: Number(member.teamSize || 0),
        teamVolume: Number(member.teamVolume || 0),
        bodyValue: Number(member.bodyValue || 0),
      })),
    ].filter((node) => node.nickname);

    const byNickname = new Map<string, TreeMemberNode>();
    const byParent = new Map<string, TreeMemberNode[]>();
    allNodes.forEach((node) => byNickname.set(node.nickname, node));
    allNodes.forEach((node) => {
      if (!node.sponsorNickname) return;
      const siblings = byParent.get(node.sponsorNickname) || [];
      siblings.push(node);
      byParent.set(node.sponsorNickname, siblings);
    });
    byParent.forEach((siblings) => {
      siblings.sort((a, b) => a.nickname.localeCompare(b.nickname));
    });

    return { nodesByNickname: byNickname, childrenByNickname: byParent };
  }, [selfNickname, summary, teamMembers, user]);

  const rootNode = nodesByNickname.get(rootNickname) || nodesByNickname.get(selfNickname);
  const rootKey = rootNode?.nickname || selfNickname;

  const maxVisibleDepth = showAll ? 10 : 2;

  const treeLayout = useMemo(() => {
    if (!rootNode) return { width: TREE_NODE_WIDTH, height: TREE_NODE_HEIGHT, items: [] as TreeLayoutItem[], lines: [] as TreeConnectorLine[] };

    type DraftLayout = {
      node: TreeMemberNode;
      depth: number;
      width: number;
      x: number;
      y: number;
      children: DraftLayout[];
    };

    const buildDraft = (node: TreeMemberNode, depth: number): DraftLayout => {
      const children = depth < maxVisibleDepth ? (childrenByNickname.get(node.nickname) || []) : [];
      const childDrafts = children.map((child) => buildDraft(child, depth + 1));
      const childrenWidth = childDrafts.reduce((total, child, index) => total + child.width + (index > 0 ? TREE_SIBLING_GAP : 0), 0);
      return {
        node,
        depth,
        width: Math.max(TREE_NODE_WIDTH, childrenWidth),
        x: 0,
        y: depth * (TREE_NODE_HEIGHT + TREE_LEVEL_GAP),
        children: childDrafts,
      };
    };

    const rootDraft = buildDraft(rootNode, 0);

    const assign = (draft: DraftLayout, offsetX: number) => {
      draft.x = offsetX + (draft.width - TREE_NODE_WIDTH) / 2;
      if (draft.children.length === 0) return;

      const childrenWidth = draft.children.reduce((total, child, index) => total + child.width + (index > 0 ? TREE_SIBLING_GAP : 0), 0);
      let childX = offsetX + (draft.width - childrenWidth) / 2;
      draft.children.forEach((child) => {
        assign(child, childX);
        childX += child.width + TREE_SIBLING_GAP;
      });
    };

    assign(rootDraft, 0);

    const items: TreeLayoutItem[] = [];
    const lines: TreeConnectorLine[] = [];
    const collect = (draft: DraftLayout) => {
      items.push({ node: draft.node, depth: draft.depth, x: draft.x, y: draft.y });
      draft.children.forEach((child) => {
        const parentX = draft.x + TREE_NODE_WIDTH / 2;
        const parentY = draft.y + TREE_NODE_HEIGHT;
        const childX = child.x + TREE_NODE_WIDTH / 2;
        const childY = child.y;
        const midY = parentY + TREE_LEVEL_GAP / 2;
        lines.push({
          id: `${draft.node.nickname}-${child.node.nickname}`,
          path: `M ${parentX} ${parentY} V ${midY} H ${childX} V ${childY}`,
        });
        collect(child);
      });
    };
    collect(rootDraft);

    const maxY = Math.max(...items.map((item) => item.y + TREE_NODE_HEIGHT));
    return { width: rootDraft.width, height: maxY, items, lines };
  }, [childrenByNickname, maxVisibleDepth, rootNode]);

  const visibleNodeCount = useMemo(() => {
    if (!rootNode) return 0;
    const countNodes = (node: TreeMemberNode, depth: number): number => {
      if (depth >= maxVisibleDepth) return 1;
      return 1 + (childrenByNickname.get(node.nickname) || []).reduce((total, child) => total + countNodes(child, depth + 1), 0);
    };
    return countNodes(rootNode, 0);
  }, [childrenByNickname, maxVisibleDepth, rootNode]);

  useEffect(() => {
    if (!showAll) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(fitTreeToViewport);
    });
  }, [showAll, rootKey, visibleNodeCount]);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(fitTreeToViewport);
    });
  }, [fitRequest, rootKey, visibleNodeCount]);

  const hierarchy = useMemo(() => {
    if (!rootNode) return [];
    const lineage: TreeMemberNode[] = [];
    let current: TreeMemberNode | undefined = rootNode;
    const visited = new Set<string>();
    while (current && !visited.has(current.nickname)) {
      lineage.unshift(current);
      visited.add(current.nickname);
      current = current.sponsorNickname ? nodesByNickname.get(current.sponsorNickname) : undefined;
    }
    return lineage;
  }, [nodesByNickname, rootNode]);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return Array.from(nodesByNickname.values())
      .filter((node) => node.nickname.toLowerCase().includes(query))
      .slice(0, 8);
  }, [nodesByNickname, search]);

  const setRoot = (nickname: string) => {
    setRootNickname(nickname);
    setShowAll(false);
    setSearch('');
    requestFitAll();
  };

  const resetToTop = () => {
    setRootNickname(selfNickname);
    setShowAll(false);
    setSearch('');
    requestFitAll();
  };

  const toggleViewAll = () => {
    const nextShowAll = !showAll;
    setShowAll(nextShowAll);
    if (nextShowAll) {
      setRootNickname(selfNickname);
      requestFitAll();
    } else {
      resetToTop();
    }
  };

  const handlePanStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    didPanRef.current = false;
    isPanningRef.current = true;
    setIsPanning(true);
  };

  const handlePanMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanningRef.current) return;
    const deltaX = event.clientX - panStartRef.current.x;
    const deltaY = event.clientY - panStartRef.current.y;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      didPanRef.current = true;
    }
    setPan({
      x: panStartRef.current.panX + deltaX,
      y: panStartRef.current.panY + deltaY,
    });
  };

  const handlePanEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    isPanningRef.current = false;
    setIsPanning(false);
    window.setTimeout(() => {
      didPanRef.current = false;
    }, 0);
  };

  const handleNodeSelect = (nickname: string) => {
    if (didPanRef.current) return;
    setRoot(nickname);
  };

  const handleWheelZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const viewport = treeViewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const direction = event.deltaY > 0 ? -1 : 1;
    const nextZoom = Math.min(TREE_ZOOM_MAX, Math.max(TREE_ZOOM_MIN, Number((zoom + direction * 0.05).toFixed(2))));
    if (nextZoom === zoom) return;

    const contentX = (pointerX - pan.x) / zoom;
    const contentY = (pointerY - pan.y) / zoom;
    setZoom(nextZoom);
    setPan({
      x: pointerX - contentX * nextZoom,
      y: pointerY - contentY * nextZoom,
    });
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/10 h-[1000px] relative overflow-hidden flex flex-col">
      <div className="p-6 lg:p-8 border-b border-white/10 flex flex-col gap-6 relative z-20 bg-black/70">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl lg:text-3xl font-serif font-black text-white uppercase">Organization Structure</h2>
            <p className="text-[10px] text-gray-500 font-black tracking-[0.4em] uppercase">Three Generation Referral View</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-black/60 border border-white/10 rounded-2xl px-5 py-3">
              <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Total Org</p>
              <p className="text-lg font-mono font-black text-white">{Number(summary?.teamSize || teamMembers.length || 0).toLocaleString()}</p>
            </div>
            <div className="bg-black/60 border border-white/10 rounded-2xl px-5 py-3">
              <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Visible Nodes</p>
              <p className="text-lg font-mono font-black text-luxury-gold">{visibleNodeCount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={toggleViewAll}
                className={`h-11 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all ${
                  showAll
                    ? 'bg-emerald-400 text-black shadow-[0_10px_24px_rgba(52,211,153,0.25)]'
                    : 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40'
                }`}
              >
                VIEW ALL {showAll ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                onClick={resetToTop}
                className="h-11 px-5 rounded-xl bg-luxury-gold text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
              >
                To Top
              </button>
              <div className="relative w-full sm:w-80">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ID Search"
                  className="h-11 w-full rounded-xl bg-black/70 border border-white/10 pl-4 pr-12 text-sm font-mono text-white outline-none focus:border-luxury-gold"
                />
                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-gold" />
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-12 z-30 rounded-xl border border-luxury-gold/30 bg-black/95 shadow-2xl overflow-hidden">
                    {searchResults.map((node) => (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setRoot(node.nickname)}
                        className="w-full px-4 py-3 text-left hover:bg-luxury-gold/10 border-b border-white/5 last:border-b-0"
                      >
                        <span className="block text-xs font-black text-white">{node.nickname}{node.isSelf ? ' (me)' : ''}</span>
                        <span className="block text-[9px] font-bold uppercase tracking-widest text-gray-500">{node.rank}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              {hierarchy.map((node, index) => (
                <React.Fragment key={node.nickname}>
                  {index > 0 && <span className="mx-2 text-gray-700">&gt;</span>}
                  <button
                    type="button"
                    onClick={() => setRoot(node.nickname)}
                    className={node.nickname === rootKey ? 'text-luxury-gold' : 'text-gray-400 hover:text-white'}
                  >
                    {node.nickname}{node.isSelf ? '(me)' : ''}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fitTreeToViewport}
              className="h-11 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all bg-black/60 text-white border-white/10 hover:border-luxury-gold/50"
            >
              <Maximize2 size={15} />
              Fit All
            </button>
            <div className="flex items-center rounded-xl border border-white/10 bg-black/60 overflow-hidden">
              <button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(TREE_ZOOM_MIN, Number((value - 0.1).toFixed(2))))} className="h-11 w-11 flex items-center justify-center text-white hover:bg-white/10">
                <Minus size={16} />
              </button>
              <div aria-label="Tree zoom" className="h-11 min-w-20 px-3 flex items-center justify-center border-x border-white/10 text-[10px] font-black uppercase tracking-widest text-luxury-gold">
                {Math.round(zoom * 100)}%
              </div>
              <button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(TREE_ZOOM_MAX, Number((value + 0.1).toFixed(2))))} className="h-11 w-11 flex items-center justify-center text-white hover:bg-white/10">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {!rootNode ? (
        <div className="flex-1 p-8 flex items-center">
          <EmptyRewardsState title="No organization tree yet" description="Your organization tree will appear after referral relationships exist in the database." />
        </div>
      ) : (
        <div
          ref={treeViewportRef}
          role="region"
          aria-label="Organization tree canvas"
          data-pan={`${Math.round(pan.x)},${Math.round(pan.y)}`}
          onPointerDown={handlePanStart}
          onPointerMove={handlePanMove}
          onPointerUp={handlePanEnd}
          onPointerCancel={handlePanEnd}
          onWheel={handleWheelZoom}
          className={`relative flex-1 overflow-hidden overscroll-contain select-none bg-[radial-gradient(circle_at_top,rgba(234,179,8,0.08),transparent_35%)] ${
            isPanning ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <div
            className="absolute left-0 top-0 transition-transform duration-100"
            style={{
              width: treeLayout.width,
              height: treeLayout.height,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            <svg
              className="pointer-events-none absolute inset-0 z-0 overflow-visible"
              width={treeLayout.width}
              height={treeLayout.height}
              aria-hidden="true"
            >
              {treeLayout.lines.map((line) => (
                <path
                  key={line.id}
                  d={line.path}
                  fill="none"
                  stroke="#b98b18"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            {treeLayout.items.map((item) => (
              <TreeNode
                key={item.node.id}
                node={item.node}
                relativeGeneration={item.depth}
                childCount={(childrenByNickname.get(item.node.nickname) || []).length}
                isRoot={item.node.nickname === rootKey}
                onSelect={() => handleNodeSelect(item.node.nickname)}
                style={{ left: item.x, top: item.y }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TreeNode = ({
  node,
  relativeGeneration,
  childCount,
  isRoot,
  onSelect,
  style,
}: {
  node: TreeMemberNode;
  relativeGeneration: number;
  childCount: number;
  isRoot: boolean;
  onSelect: () => void;
  style: React.CSSProperties;
}) => {
  const isInactive = Number(node.investmentUSDT || 0) <= 0;
  const accentColor = isInactive ? '#475569' : rankAccentColor(node.rank);

  return (
  <button
    type="button"
    onPointerDown={(event) => event.stopPropagation()}
    onClick={onSelect}
    style={{ ...style, borderColor: isInactive ? '#475569' : accentColor }}
    className={`absolute z-10 h-80 w-72 border-2 rounded-2xl p-5 text-center space-y-4 shadow-2xl group transition-all duration-300 ${
      isInactive
        ? 'bg-slate-950/55 border-dashed opacity-60 hover:opacity-75'
        : 'bg-black/75 hover:scale-105'
    } ${isRoot ? 'ring-2 ring-luxury-gold/60 shadow-[0_0_40px_rgba(234,179,8,0.22)]' : ''}`}
  >
    <div className="absolute top-3 right-4 text-[8px] font-black tracking-widest text-gray-600 uppercase">
      GEN.{relativeGeneration}
    </div>
    <div
      className="mx-auto w-fit max-w-[240px] px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest uppercase border bg-black truncate"
      style={{ borderColor: accentColor, color: accentColor }}
    >
      {isInactive ? 'INACTIVE' : node.rank || 'UNRANKED'}
    </div>
    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
      {node.rank === 'Black Dragon' ? <Crown style={{ color: accentColor }} size={24} /> : <Users style={{ color: accentColor }} size={24} />}
    </div>
    <div>
      <h4 className="text-lg lg:text-xl font-serif font-black text-white break-words leading-tight">{node.nickname}{node.isSelf ? ' (me)' : ''}</h4>
      <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-gray-500">Personal Investment</p>
      <p className="mt-1 text-sm font-mono font-black" style={{ color: accentColor }}>
        {Number(node.investmentUSDT || 0) > 0 ? `$${Number(node.investmentUSDT).toLocaleString()}` : '$0'}
      </p>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
        <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest mb-1">Team Vol</p>
        <p className="text-[10px] font-mono font-black text-luxury-gold">{Number(node.teamVolume || 0).toLocaleString()} USDT</p>
      </div>
      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
        <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest mb-1">Direct</p>
        <p className="text-lg font-mono font-black text-white">{childCount}</p>
      </div>
    </div>
  </button>
  );
};

const RanksTab = ({ user, summary }: { user: any; summary?: any }) => {
  const normalizedCurrentRank = String(summary?.rank || user.rank || 'Investor').trim().toLowerCase();
  const currentRank = {
    name: summary?.rank || user.rank || 'Investor',
    level: 'CURRENT ACCOUNT RANK',
    activeSince: user.joinDate || user.createdAt || '-',
    val: `${Number(summary?.bodyValue || user.bodyValue || 0).toLocaleString()} USDT`,
    sales: `${Number(summary?.teamVolume || user.teamVolume || 0).toLocaleString()} USDT`,
  };
  
  const targets = [
    { label: 'BODY VALUE (PERSONAL)', value: Number(summary?.bodyValue || user.bodyValue || 0), color: 'bg-white' },
    { label: 'TEAM SIZE', value: Number(summary?.teamSize || user.teamSize || 0), color: 'bg-blue-400' },
    { label: 'TEAM SALES VOL', value: Number(summary?.teamVolume || user.teamVolume || 0), color: 'bg-luxury-gold' },
    { label: 'TOTAL COMMISSION', value: Number(summary?.totalCommission || user.totalCommission || 0), color: 'bg-purple-500' },
  ];

  const rankCards = [
    {
      id: 'white',
      name: 'WHITE DRAGON',
      qual: 'Basic Package ($200+) • Direct Referrals 0 • Team Body None • Team Sales $0 • No Rollup',
      benefitLabel: 'Active Benefit',
      benefit: '10% DIRECT REFERRAL',
      active: true,
    },
    {
      id: 'blue',
      name: 'BLUE DRAGON',
      qual: 'Body $500 / Team $3k • 3x Lower Rank Subs',
      benefitLabel: 'Active Benefit',
      benefit: '3-TIER ROLLUP',
      active: true,
    },
    {
      id: 'purple',
      name: 'PURPLE DRAGON',
      qual: 'Body $1k / Team $10k • 3x Lower Rank Subs',
      benefitLabel: 'Elite Benefit',
      benefit: '7-TIER ROLLUP',
      active: false,
    },
    {
      id: 'red',
      name: 'RED DRAGON',
      qual: 'Body $5k / Team $100k • 3x Lower Rank Subs',
      benefitLabel: 'Elite Benefit',
      benefit: '15-TIER + 1% POOL',
      active: false,
    },
    {
      id: 'black',
      name: 'BLACK DRAGON',
      qual: 'Body $10k / Team $1M • 3x Lower Rank Subs',
      benefitLabel: 'Elite Benefit',
      benefit: '25-TIER + 1% POOL',
      active: false,
    },
  ];

  const isCurrentRankCard = (rankId: string) => {
    if (rankId === 'white') return normalizedCurrentRank === 'white dragon';
    if (rankId === 'blue') return normalizedCurrentRank === 'blue dragon';
    if (rankId === 'purple') return normalizedCurrentRank === 'purple dragon';
    if (rankId === 'red') return normalizedCurrentRank === 'red dragon';
    if (rankId === 'black') return normalizedCurrentRank === 'black dragon';
    return false;
  };

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 lg:p-16 rounded-2xl border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6 lg:p-10 opacity-5">
           <Crown size={200} className="text-luxury-gold" />
        </div>
        
        <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-10 text-center sm:text-left">
            <div className="relative">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-2 border-white/10 flex items-center justify-center bg-black/40 shadow-2xl">
                <Users size={48} className="text-white/40" />
              </div>
              <div className="absolute -bottom-2 lg:-bottom-4 left-1/2 -translate-x-1/2 px-3 lg:px-4 py-1 lg:py-1.5 rounded-full bg-white text-black text-[7px] lg:text-[8px] font-black uppercase tracking-widest shadow-xl whitespace-nowrap">
                 BASIC MEMBER
              </div>
            </div>
            <div className="space-y-2 lg:space-y-4">
              <p className="text-[8px] lg:text-[10px] text-luxury-gold font-black uppercase tracking-[0.4em]">Current Identity Status</p>
              <h1 className="text-4xl lg:text-7xl font-serif font-black text-white">{currentRank.name}</h1>
              <p className="text-[10px] lg:text-sm font-bold text-gray-500 uppercase tracking-widest">{currentRank.level} — ACTIVE SINCE {currentRank.activeSince}</p>
            </div>
          </div>

          <div className="flex gap-3 lg:gap-4">
             <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8 text-center min-w-[120px] lg:min-w-[140px] shadow-2xl">
               <p className="text-[7px] lg:text-[8px] text-gray-500 font-black uppercase tracking-widest mb-2 lg:mb-3">Body Value</p>
               <p className="text-2xl lg:text-3xl font-mono font-black text-white">{currentRank.val}</p>
             </div>
             <div className="bg-luxury-gold/5 border border-luxury-gold/30 rounded-2xl p-6 lg:p-8 text-center min-w-[120px] lg:min-w-[140px] shadow-2xl">
               <p className="text-[7px] lg:text-[8px] text-luxury-gold font-black uppercase tracking-widest mb-2 lg:mb-3">Team Sales</p>
               <p className="text-2xl lg:text-3xl font-mono font-black text-luxury-gold">{currentRank.sales}</p>
             </div>
          </div>
        </div>
      </motion.div>

      <div className="glass-panel p-8 lg:p-16 rounded-2xl border border-white/5 space-y-12 lg:space-y-16">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl lg:text-3xl font-serif font-black text-white uppercase">Target Achievement</h2>
            <p className="text-[8px] lg:text-[10px] text-luxury-gold font-black tracking-[0.4em] uppercase">Live account metrics from database</p>
          </div>
          <div className="flex items-center gap-3 px-4 lg:px-6 py-2 lg:py-3 rounded-2xl bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold text-[8px] lg:text-[10px] font-black tracking-widest uppercase">
            <Flame size={16} /> Live Metrics
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {targets.map((t, i) => (
            <div key={i} className="space-y-4 lg:space-y-6">
              <div className="flex justify-between items-center text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 text-center">
                <span>{t.label}</span>
                <span className="text-white">{Number(t.value).toLocaleString()}</span>
              </div>
              <div className="h-1.5 lg:h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: t.value > 0 ? '100%' : '0%' }}
                  className={`h-full ${t.color} rounded-full relative shadow-[0_0_15px_rgba(255,255,255,0.3)]`}
                >
                  <div className="absolute inset-0 bg-white/30 animate-[pulse_2s_infinite]"></div>
                </motion.div>
              </div>
              <div className="flex justify-between items-center px-1">
                <p className="text-[8px] lg:text-[9px] font-mono font-black text-gray-700">CURRENT</p>
                <p className="text-[8px] lg:text-[9px] font-black text-luxury-gold uppercase tracking-widest"><span className="text-white">{Number(t.value).toLocaleString()}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {rankCards.map((r, i) => {
          const isCurrent = isCurrentRankCard(r.id);
          return (
            <motion.div 
              key={i} 
              whileHover={{ y: -5 }}
              className={`glass-panel p-6 lg:p-10 rounded-2xl border text-center flex flex-col items-center gap-4 lg:gap-8 group cursor-pointer transition-all ${
                isCurrent
                  ? 'border-luxury-gold shadow-[0_0_32px_rgba(234,179,8,0.22)]'
                  : 'border-white/5'
              }`}
            >
              <div className={`w-12 h-12 lg:w-20 lg:h-20 rounded-full border-2 flex items-center justify-center p-3 lg:p-5 bg-black/40 group-hover:scale-110 transition-transform ${
                isCurrent ? 'border-luxury-gold/60' : 'border-white/10'
              }`}>
                {r.id === 'white' && <ShieldCheck size={24} className={isCurrent ? 'text-luxury-gold' : 'text-gray-100'} />}
                {r.id === 'blue' && <Shield size={24} className={isCurrent ? 'text-luxury-gold' : 'text-blue-400'} />}
                {r.id === 'purple' && <Sparkles size={24} className={isCurrent ? 'text-luxury-gold' : 'text-purple-400'} />}
                {r.id === 'red' && <Flame size={24} className={isCurrent ? 'text-luxury-gold' : 'text-red-500'} />}
                {r.id === 'black' && <Crown size={24} className="text-luxury-gold" />}
              </div>
              
              <div className="space-y-2 lg:space-y-4">
                <h4 className="text-sm lg:text-2xl font-serif font-black text-white">{r.name}</h4>
                <div className="space-y-1">
                  <p className="text-[7px] text-gray-500 font-bold uppercase tracking-widest">Qualification</p>
                  <p className="text-[8px] lg:text-[10px] text-gray-400 leading-relaxed font-black">{r.qual}</p>
                </div>
              </div>

              <div className="w-full pt-4 lg:pt-6 border-t border-white/10 mt-auto">
                <p className="text-[7px] text-luxury-gold font-bold uppercase tracking-widest mb-1">{r.benefitLabel}</p>
                <p className="text-[10px] lg:text-sm font-serif font-black gold-gradient-text">{r.benefit}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
