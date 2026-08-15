import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  RefreshCcw,
} from 'lucide-react';
import apiService from '../services/api';

interface DepositAddress {
  address: string;
  asset: string;
  network: string;
  displayNetwork?: string;
  qrPayload?: string;
  minConfirmations?: number;
  status?: string;
  assignedAt?: string | null;
}

const ASSET = 'USDT';
const NETWORKS = [
  { id: 'TRON', label: 'TRON (TRC-20)' },
  { id: 'BSC', label: 'BNB Chain (BEP-20)' },
];

const buildQrUrl = (data: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(data)}`;

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const maybe = error as { response?: { status?: number; data?: { detail?: string } } };
    if (maybe.response?.status === 503) {
      return 'No deposit address is currently available. Please try again later or contact Support.';
    }
    if (maybe.response?.data?.detail) return maybe.response.data.detail;
  }
  return 'Unable to load the deposit address. Please try again.';
};

export const DepositPage = ({ onSetView }: { onSetView: (v: any) => void }) => {
  const [selectedNetwork, setSelectedNetwork] = useState('TRON');
  const [deposit, setDeposit] = useState<DepositAddress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const loadAddress = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getDepositAddress({ asset: ASSET, network: selectedNetwork });
      setDeposit(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setDeposit(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddress();
  }, [selectedNetwork]);

  const handleCopy = async () => {
    if (!deposit?.address) return;
    try {
      await navigator.clipboard.writeText(deposit.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Unable to copy the address. Please copy it manually.');
    }
  };

  const handleSyncDeposits = async () => {
    if (!deposit?.address) return;
    setIsSyncing(true);
    setSyncMessage(null);
    setError(null);
    try {
      const result = await apiService.syncTestnetDeposits({ asset: ASSET, network: selectedNetwork });
      if (result.credited > 0) {
        setSyncMessage(`${result.credited} testnet deposit${result.credited === 1 ? '' : 's'} credited to your wallet.`);
      } else if (result.observed > 0) {
        setSyncMessage('No new deposits to credit. Previously observed testnet transfers are already recorded.');
      } else {
        setSyncMessage('No matching testnet USDT deposit has been detected yet.');
      }
    } catch (err: unknown) {
      setSyncMessage(getErrorMessage(err));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-10 lg:pt-32 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onSetView('wallet')}
          className="w-11 h-11 rounded-2xl glass-panel border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all"
          aria-label="Back to Wallet"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif font-black text-white uppercase italic tracking-tight">
            Deposit USDT
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mt-1">
            On-Chain · USDT Deposit
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-white/5 p-6 sm:p-8 space-y-5">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Network</h2>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            Select the network first. Your assigned address is shown only after the network is selected.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {NETWORKS.map((network) => (
            <button
              key={network.id}
              type="button"
              onClick={() => setSelectedNetwork(network.id)}
              className={`rounded-2xl border px-5 py-4 text-left transition-all ${
                selectedNetwork === network.id
                  ? 'border-luxury-gold/50 bg-luxury-gold/10 text-white'
                  : 'border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25'
              }`}
            >
              <span className="block text-[10px] font-black uppercase tracking-[0.25em]">{network.id}</span>
              <span className="mt-1 block text-sm font-bold">{network.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="glass-panel rounded-3xl border border-white/5 p-16 flex flex-col items-center justify-center gap-4 shadow-2xl">
          <Loader2 size={36} className="text-luxury-gold animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Loading assigned deposit address...
          </p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="glass-panel rounded-3xl border border-red-500/30 p-10 space-y-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Address unavailable</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">{error}</p>
            </div>
          </div>
          <button
            onClick={loadAddress}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all"
          >
            <RefreshCcw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Address card */}
      {!isLoading && !error && deposit && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl border border-white/5 p-8 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-40 pointer-events-none" />

          <div className="relative z-10 space-y-8">
            {/* Asset / network badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-widest">
                {deposit.asset}
              </span>
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[10px] font-black uppercase tracking-widest">
                {deposit.displayNetwork || `${deposit.network} Network`}
              </span>
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[10px] font-black uppercase tracking-widest">
                {deposit.status || 'ACTIVE'}
              </span>
            </div>

            {/* QR + address */}
            <div className="flex flex-col items-center gap-6">
              <div className="bg-white p-4 rounded-2xl shadow-xl">
                <img
                  src={buildQrUrl(deposit.qrPayload || deposit.address)}
                  alt={`${deposit.asset} ${deposit.displayNetwork || deposit.network} deposit address QR code`}
                  width={240}
                  height={240}
                  className="block w-[200px] h-[200px] sm:w-[240px] sm:h-[240px]"
                />
              </div>

              <div className="w-full space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 text-center">
                  Assigned {deposit.asset} Deposit Address
                </p>
                <div className="flex items-stretch gap-3">
                  <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 font-mono text-sm text-white break-all">
                    {deposit.address}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`shrink-0 px-5 rounded-2xl border flex items-center justify-center transition-all ${
                      copied
                        ? 'bg-green-500/15 border-green-500/40 text-green-400'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:border-white/30'
                    }`}
                    aria-label="Copy deposit address"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
                {deposit.assignedAt && (
                  <p className="text-[10px] text-gray-600 text-center tracking-wide">
                    Assigned at · {new Date(deposit.assignedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Network guidance */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleSyncDeposits}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-luxury-gold text-black text-[10px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                Refresh Testnet Deposits
              </button>
              {syncMessage && (
                <div className="rounded-2xl bg-green-500/10 border border-green-500/25 px-5 py-4 text-xs text-green-200 leading-relaxed">
                  {syncMessage}
                </div>
              )}
              <div className="flex items-start gap-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 px-5 py-4">
                <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Testnet mode: send only test <span className="font-black">{deposit.asset}</span> on{' '}
                  <span className="font-black">{deposit.displayNetwork || deposit.network}</span> to this address.
                  Funds sent on a different network or asset may not be recoverable.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-white/[0.03] border border-white/10 px-5 py-4">
                <ShieldCheck size={18} className="text-green-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  Deposits are credited to your Withdrawal Balance. Packages are purchased separately.
                  Confirmation requirement: <span className="text-gray-200 font-bold">{deposit.minConfirmations || 1}</span>.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-white/[0.03] border border-white/10 px-5 py-4">
                <ShieldCheck size={18} className="text-luxury-gold shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  Exchanges located in service-restricted jurisdictions may be restricted from deposits and withdrawals.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DepositPage;
