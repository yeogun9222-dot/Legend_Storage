import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wallet,
  Lock,
  Gem,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCcw,
  ChevronRight,
  Filter,
  Zap,
  Crown,
  AlertCircle,
  X,
  UserCheck,
  Send,
  Target,
  History,
  CheckCircle2,
  DollarSign,
  Package,
  Calendar,
  ShoppingCart,
  Banknote,
  Layers,
  Clock,
} from "lucide-react";

type HistoryTab = "package" | "earn" | "transfer";
type TransferFlowStep = "form" | "review" | "result";
type TransferResultState = "success" | "insufficient" | "failed" | "";
const MANAGED_LEDGER_PREFIX_RE = /^\[managed-ledger:[^\]]+\]\s*/i;

const formatAmountInput = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "0.00";
  return value.toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits: 8,
  });
};

const stripManagedLedgerPrefix = (value: unknown) =>
  String(value || "")
    .replace(MANAGED_LEDGER_PREFIX_RE, "")
    .trim();

const WITHDRAWAL_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Withdraw Pending",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  approved: {
    label: "Withdraw Processing",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  completed: {
    label: "Withdraw Completed",
    className: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  rejected: {
    label: "Withdraw Rejected",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  cancelled: {
    label: "Withdraw Rejected",
    className: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  },
};

const getWithdrawalStatusMeta = (status: string) =>
  WITHDRAWAL_STATUS_META[status] || WITHDRAWAL_STATUS_META.pending;

export const WalletPage = ({
  user,
  onSetView,
  portalData,
  onCreateWithdrawal,
  onCreateTransfer,
  onConvertToCNYT,
}: {
  user: any;
  onSetView: (v: any) => void;
  portalData?: any;
  onCreateWithdrawal?: (payload: {
    amount: number;
    wallet_address: string;
    asset: "USDT" | "CNYT";
    network: string;
    trading_password: string;
    otp_code?: string;
  }) => Promise<void>;
  onCreateTransfer?: (payload: {
    recipient: string;
    amount: number;
    asset: string;
    trading_password: string;
  }) => Promise<void>;
  onConvertToCNYT?: (
    amount: number,
    expectedPriceUsd: number,
    tradingPassword: string,
  ) => Promise<any>;
}) => {
  const [payAmount, setPayAmount] = useState("0.00");
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientWallet, setRecipientWallet] = useState("");
  const [transferPassword, setTransferPassword] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawTradingPassword, setWithdrawTradingPassword] = useState("");
  const [withdrawOtpCode, setWithdrawOtpCode] = useState("");
  const [selectedWithdrawNetwork, setSelectedWithdrawNetwork] =
    useState("TRON");
  const [showWithdrawConfirmation, setShowWithdrawConfirmation] =
    useState(false);
  const [walletMessage, setWalletMessage] = useState("");
  const [conversionMessage, setConversionMessage] = useState("");
  const [conversionMessageType, setConversionMessageType] = useState<
    "success" | "error" | ""
  >("");
  const [isConverting, setIsConverting] = useState(false);
  const [showConvertConfirmation, setShowConvertConfirmation] =
    useState(false);
  const [showConvertPasswordModal, setShowConvertPasswordModal] =
    useState(false);
  const [conversionTradingPassword, setConversionTradingPassword] =
    useState("");
  const [transferStep, setTransferStep] = useState<TransferFlowStep>("form");
  const [transferResultState, setTransferResultState] =
    useState<TransferResultState>("");
  const [transferResultMessage, setTransferResultMessage] = useState("");
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] =
    useState<HistoryTab>("package");
  const [isSwapFocused, setIsSwapFocused] = useState(false);
  const [isWithdrawFocused, setIsWithdrawFocused] = useState(false);
  const withdrawPanelRef = useRef<HTMLDivElement | null>(null);
  const withdrawAddressInputRef = useRef<HTMLInputElement | null>(null);
  const swapPanelRef = useRef<HTMLDivElement | null>(null);
  const payAmountInputRef = useRef<HTMLInputElement | null>(null);
  const walletAssets = Array.isArray(portalData?.wallet?.assets)
    ? portalData.wallet.assets
    : [];
  const withdrawalBalance = portalData?.wallet?.withdrawalBalance || null;
  const availableUsdtAsset = walletAssets.find(
    (asset: any) =>
      asset.unit === "USDT" &&
      String(asset.label || "")
        .toUpperCase()
        .includes("WITHDRAWAL"),
  );
  const availableUsdt = Number(
    withdrawalBalance?.totalUsdt ??
      availableUsdtAsset?.value ??
      user.balanceUSDT ??
      user.balance_usdt ??
      0,
  );
  const depositBalanceUsdt = Number(withdrawalBalance?.depositBalanceUsdt ?? 0);
  const earningsBalanceUsdt = Number(
    withdrawalBalance?.earningsBalanceUsdt ?? 0,
  );
  const pendingWithdrawalUsdt = Number(
    portalData?.wallet?.pendingWithdrawalUsdt ?? 0,
  );
  const withdrawalPolicy = portalData?.wallet?.withdrawalPolicy || null;
  const withdrawalNetworks = withdrawalPolicy?.networks?.length
    ? withdrawalPolicy.networks
    : [
        {
          network: "TRON",
          apiNetwork: "TRC-20",
          displayNetwork: "TRON (TRC-20)",
          feeUsdt: "2",
          addressPattern: "^T[A-Za-z0-9]{33}$",
        },
        {
          network: "BSC",
          apiNetwork: "BSC",
          displayNetwork: "BNB Chain (BEP-20)",
          feeUsdt: "0.5",
          addressPattern: "^0x[a-fA-F0-9]{40}$",
        },
      ];
  const selectedNetworkPolicy =
    withdrawalNetworks.find(
      (item: any) => item.network === selectedWithdrawNetwork,
    ) || withdrawalNetworks[0];
  const withdrawalFeeUsdt = Number(selectedNetworkPolicy?.feeUsdt || 0);
  const minWithdrawalUsdt = Number(withdrawalPolicy?.minWithdrawalUsdt || 10);
  const numericWithdrawAmount = Number(withdrawAmount || 0);
  const estimatedReceiveUsdt = Math.max(
    numericWithdrawAmount - withdrawalFeeUsdt,
    0,
  );
  const withdrawAddressPattern = selectedNetworkPolicy?.addressPattern
    ? new RegExp(selectedNetworkPolicy.addressPattern)
    : null;
  const isWithdrawAddressValid = Boolean(
    withdrawAddressPattern?.test(withdrawAddress.trim()),
  );
  const isWithdrawAmountValid =
    Number.isFinite(numericWithdrawAmount) &&
    numericWithdrawAmount >= minWithdrawalUsdt &&
    numericWithdrawAmount <= availableUsdt &&
    estimatedReceiveUsdt > 0;
  const rawCnytIndexPrice = portalData?.market?.cnyt?.stats?.indexPrice;
  const cnytIndexPrice =
    rawCnytIndexPrice === undefined || rawCnytIndexPrice === null
      ? null
      : Number(rawCnytIndexPrice);
  const cnytPriceUsd =
    cnytIndexPrice !== null &&
    Number.isFinite(cnytIndexPrice) &&
    cnytIndexPrice > 0
      ? cnytIndexPrice
      : null;
  const cnytPerUsdt = cnytPriceUsd ? 1 / cnytPriceUsd : null;
  const numericPayAmount = Number(payAmount);
  const validPayAmount =
    Number.isFinite(numericPayAmount) && numericPayAmount > 0
      ? numericPayAmount
      : 0;
  const receiveCnyt = cnytPerUsdt ? validPayAmount * cnytPerUsdt : null;
  const cnytPerUsdtLabel = cnytPerUsdt
    ? cnytPerUsdt.toLocaleString(undefined, { maximumFractionDigits: 8 })
    : "Unavailable";
  const receiveCnytLabel =
    receiveCnyt === null
      ? "Unavailable"
      : receiveCnyt.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 8,
        });
  const numericTransferAmount = Number(transferAmount || 0);
  const trimmedRecipientWallet = recipientWallet.trim();
  const isTransferAmountValid =
    Number.isFinite(numericTransferAmount) &&
    numericTransferAmount > 0 &&
    numericTransferAmount <= availableUsdt;
  const isTransferFormValid =
    trimmedRecipientWallet.length > 0 &&
    isTransferAmountValid &&
    transferPassword.length === 4;

  const resetTransferFlow = (clearForm = false) => {
    setTransferStep("form");
    setTransferResultState("");
    setTransferResultMessage("");
    setIsSubmittingTransfer(false);
    if (!clearForm) return;
    setTransferAmount("");
    setRecipientWallet("");
    setTransferPassword("");
  };

  const closeTransferModal = () => {
    setIsTransferModalOpen(false);
    resetTransferFlow(true);
  };

  const handleWithdrawClick = () => {
    if (!user.hasSetTradingPassword) {
      setIsRequirementModalOpen(true);
      return;
    }
    setIsWithdrawFocused(true);
    withdrawPanelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    window.setTimeout(() => {
      withdrawAddressInputRef.current?.focus();
    }, 350);
    window.setTimeout(() => {
      setIsWithdrawFocused(false);
    }, 1400);
  };

  const handleTransferClick = () => {
    if (!user.hasSetTradingPassword) {
      setIsRequirementModalOpen(true);
    } else {
      resetTransferFlow(true);
      setIsTransferModalOpen(true);
    }
  };

  const handleSwapClick = () => {
    setIsSwapFocused(true);
    swapPanelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    window.setTimeout(() => {
      payAmountInputRef.current?.focus();
    }, 350);
    window.setTimeout(() => {
      setIsSwapFocused(false);
    }, 1400);
  };

  const handleMaxConvertAmount = () => {
    setPayAmount(formatAmountInput(availableUsdt));
    window.setTimeout(() => {
      payAmountInputRef.current?.focus();
    }, 0);
  };

  const handleMaxTransferAmount = () => {
    setTransferAmount(formatAmountInput(availableUsdt));
  };

  const handleTransferReview = () => {
    if (!isTransferFormValid) return;
    setTransferStep("review");
  };

  const handleTransferSubmit = async () => {
    setIsSubmittingTransfer(true);
    try {
      await onCreateTransfer?.({
        recipient: trimmedRecipientWallet,
        amount: numericTransferAmount,
        asset: "USDT",
        trading_password: transferPassword,
      });
      setTransferResultState("success");
      setTransferResultMessage(
        `${numericTransferAmount.toLocaleString()} USDT sent to ${trimmedRecipientWallet}.`,
      );
      setTransferStep("result");
    } catch (err: any) {
      const detail = err?.response?.data?.detail || "Transfer failed.";
      setTransferResultState(
        /insufficient/i.test(detail) && /balance/i.test(detail)
          ? "insufficient"
          : "failed",
      );
      setTransferResultMessage(detail);
      setTransferStep("result");
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const handleWithdrawalSubmit = async () => {
    try {
      await onCreateWithdrawal?.({
        amount: Number(withdrawAmount),
        wallet_address: withdrawAddress,
        asset: "USDT",
        network:
          selectedNetworkPolicy?.apiNetwork ||
          selectedNetworkPolicy?.network ||
          selectedWithdrawNetwork,
        trading_password: withdrawTradingPassword,
        otp_code: withdrawOtpCode || undefined,
      });
      setWalletMessage("Withdrawal request submitted.");
      setShowWithdrawConfirmation(false);
      setWithdrawAmount("");
      setWithdrawAddress("");
      setWithdrawTradingPassword("");
      setWithdrawOtpCode("");
    } catch (err: any) {
      setWalletMessage(
        err?.response?.data?.detail || "Withdrawal request failed.",
      );
    }
  };

  const validateConvertIntent = () => {
    setConversionMessage("");
    setConversionMessageType("");
    if (!cnytPriceUsd) {
      setConversionMessage("CNYT price is not available from the server.");
      setConversionMessageType("error");
      return false;
    }
    if (!validPayAmount) {
      setConversionMessage("Enter a USDT amount greater than zero.");
      setConversionMessageType("error");
      return false;
    }
    if (!user.hasSetTradingPassword) {
      setIsRequirementModalOpen(true);
      return false;
    }
    return true;
  };

  const handleConvertClick = () => {
    if (!validateConvertIntent()) return;
    setShowConvertConfirmation(true);
  };

  const handleConvertConfirmation = () => {
    setShowConvertConfirmation(false);
    setConversionTradingPassword("");
    setShowConvertPasswordModal(true);
  };

  const handleConvert = async () => {
    if (!validateConvertIntent()) return;
    if (conversionTradingPassword.length !== 4) {
      setConversionMessage("Enter the 4-digit Trading PIN.");
      setConversionMessageType("error");
      return;
    }
    try {
      setIsConverting(true);
      const result = await onConvertToCNYT?.(
        validPayAmount,
        cnytPriceUsd,
        conversionTradingPassword,
      );
      const convertedAmount = Number(
        result?.cnytAmount || validPayAmount * (cnytPerUsdt || 0),
      );
      const convertedLabel = convertedAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      });
      setConversionMessage(
        `${validPayAmount.toLocaleString()} USDT converted to ${convertedLabel} CNYT.`,
      );
      setConversionMessageType("success");
      setWalletMessage("USDT was converted to CNYT.");
      setPayAmount("0.00");
      setShowConvertPasswordModal(false);
      setConversionTradingPassword("");
    } catch (err: any) {
      setConversionMessage(err?.response?.data?.detail || "Conversion failed.");
      setConversionMessageType("error");
    } finally {
      setIsConverting(false);
    }
  };

  const assetIcons = [Wallet, Banknote, Package, Gem];
  const assetColors = [
    "from-luxury-red-light",
    "from-[#3d0a0a]",
    "from-[#1a0505]",
    "from-[#2a0505]",
  ];
  const assets = walletAssets.length
    ? walletAssets.map((asset: any, index: number) => ({
        label: asset.label,
        value: Number(asset.value).toLocaleString(),
        unit: asset.unit,
        icon: assetIcons[index] || Wallet,
        tag: asset.tag,
        color: assetColors[index] || "from-[#1a0505]",
        description: asset.description,
        details: Array.isArray(asset.details) ? asset.details : [],
      }))
    : [];
  const getAssetValueFontSize = (value: string, unit: string) => {
    const totalLength = `${value} ${unit}`.length;
    if (totalLength >= 16) return "clamp(1.15rem, 1.08vw, 1.45rem)";
    if (totalLength >= 13) return "clamp(1.35rem, 1.35vw, 1.75rem)";
    return "clamp(1.75rem, 1.85vw, 1.875rem)";
  };

  const packageHistory = portalData?.wallet?.packageHistory?.length
    ? portalData.wallet.packageHistory.map((item: any) => ({
        name: item.name,
        date: item.date?.slice(0, 10) || "",
        amount: Number(item.amount).toLocaleString(),
        status: String(item.status || "").toUpperCase(),
        returns: `+${Number(item.returns || 0).toLocaleString()}`,
        icon: Crown,
      }))
    : [];

  const withdrawalStatusById: Record<string, string> = {};
  (Array.isArray(portalData?.wallet?.withdrawals)
    ? portalData.wallet.withdrawals
    : []
  ).forEach((w: any) => {
    if (w?.id)
      withdrawalStatusById[String(w.id)] = String(w.status || "").toLowerCase();
  });

  const earnRewardHistory = (portalData?.wallet?.earnRewardHistory?.length
    ? portalData.wallet.earnRewardHistory
    : portalData?.wallet?.activities
  )?.length
    ? (portalData?.wallet?.earnRewardHistory?.length
        ? portalData.wallet.earnRewardHistory
        : portalData.wallet.activities
      ).map((item: any) => {
        const isWithdrawal =
          String(item.type || "").toLowerCase() === "withdrawal";
        const withdrawalStatus =
          isWithdrawal && item.reference
            ? withdrawalStatusById[String(item.reference)]
            : undefined;
        return {
          label: stripManagedLedgerPrefix(item.label),
          date: item.date,
          value: `${item.direction === "credit" ? "+" : "-"}${Number(item.value || item.amount || 0).toLocaleString()}`,
          type: String(item.type || "").toUpperCase(),
          icon: item.direction === "credit" ? Zap : ArrowUpCircle,
          iconColor:
            item.direction === "credit" ? "text-green-500" : "text-luxury-gold",
          withdrawalStatus,
        };
      })
    : [];

  const transferHistory = portalData?.wallet?.transferHistory?.length
    ? portalData.wallet.transferHistory.map((item: any) => ({
        title: item.type || "Transfer",
        to: item.addressOrUser || item.counterparty || "Platform",
        from: item.addressOrUser || item.counterparty || "Platform",
        amount: Number(item.amount).toLocaleString(),
        date: item.date,
        status: String(item.displayStatus || item.status || "").toUpperCase(),
        txId: item.txid || item.id,
        type:
          item.direction === "debit" || item.type === "swap"
            ? "SENT"
            : "RECEIVED",
        asset: item.asset || "USDT",
        network: item.network || "",
        feeUsdt: item.feeUsdt,
        estimatedReceiveUsdt: item.estimatedReceiveUsdt,
      }))
    : [];

  const visiblePackageHistory = packageHistory;
  const visibleEarnRewardHistory = earnRewardHistory;
  const visibleTransferHistory = transferHistory;
  const activeHistoryTotal =
    activeHistoryTab === "package"
      ? packageHistory.length
      : activeHistoryTab === "earn"
        ? earnRewardHistory.length
        : transferHistory.length;

  const historyTabs: Array<{ id: HistoryTab; label: string; icon: any }> = [
    { id: "package", label: "PACKAGE", icon: ShoppingCart },
    { id: "earn", label: "EARN & REWARD", icon: Filter },
    { id: "transfer", label: "TRANSFER", icon: History },
  ];
  const transferResultMeta =
    transferResultState === "success"
      ? {
          title: "Send Complete",
          message:
            transferResultMessage || "Your USDT transfer has been completed.",
          accentClass: "bg-green-500/20 border-green-500 text-green-500",
          buttonLabel: "VIEW TRANSFER HISTORY",
          icon: CheckCircle2,
        }
      : transferResultState === "insufficient"
        ? {
            title: "Insufficient Balance",
            message:
              transferResultMessage ||
              "Your available USDT balance is not enough for this send.",
            accentClass: "bg-yellow-500/20 border-yellow-500 text-yellow-400",
            buttonLabel: "BACK TO SEND",
            icon: AlertCircle,
          }
        : {
            title: "Send Failed",
            message: transferResultMessage || "Transfer failed.",
            accentClass: "bg-red-500/20 border-red-500 text-red-400",
            buttonLabel: "BACK TO SEND",
            icon: AlertCircle,
          };
  const TransferResultIcon = transferResultMeta.icon;

  return (
    <div className="pt-32 pb-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <p className="text-luxury-gold text-[10px] font-black tracking-[0.6em] uppercase">
            Assets
          </p>
          <h1 className="text-5xl lg:text-7xl font-serif font-black text-white italic">
            Wallet
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-right space-y-1"
        >
          <p className="text-gray-500 text-[10px] font-black tracking-[0.4em] uppercase">
            Total Assets
          </p>
          <p className="text-4xl lg:text-6xl font-mono font-black text-luxury-gold tracking-tighter">
            $
            {Number(
              portalData?.wallet?.totalAssets ?? user.totalAssets ?? 0,
            ).toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-5">
        {assets.length === 0 && (
          <div className="glass-panel rounded-2xl border border-white/5 p-10 text-center md:col-span-2 lg:col-span-5">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-500">
              No wallet assets loaded
            </p>
          </div>
        )}
        {assets.map((asset, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-panel p-8 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-luxury-gold/30 transition-all shadow-2xl`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${asset.color} to-transparent opacity-30`}
            ></div>
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform">
                  <asset.icon size={28} />
                </div>
                <span className="px-4 py-2 rounded-full bg-black/60 border border-white/10 text-[9px] font-black tracking-[0.2em] uppercase text-gray-400 group-hover:text-luxury-gold transition-colors">
                  {asset.tag}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 font-black tracking-[0.28em] uppercase leading-relaxed">
                  {asset.label}
                </p>
                <div className="flex min-w-0 items-baseline gap-2">
                  <h2
                    className="min-w-0 whitespace-nowrap font-mono font-black text-white"
                    style={{
                      fontSize: getAssetValueFontSize(asset.value, asset.unit),
                    }}
                  >
                    {asset.value}
                  </h2>
                  <span className="shrink-0 text-[11px] font-mono font-black text-luxury-gold">
                    {asset.unit}
                  </span>
                </div>
                {asset.details.length > 0 && (
                  <div className="space-y-1 pt-2">
                    {asset.details.map((detail: any) => (
                      <div
                        key={detail.label}
                        className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.14em]"
                      >
                        <span
                          className={
                            detail.label === "Earnings Balance" ||
                            detail.label === "Staked"
                              ? "text-luxury-gold"
                              : "text-gray-500"
                          }
                        >
                          {detail.label}
                        </span>
                        <span
                          className={
                            detail.label === "Earnings Balance" ||
                            detail.label === "Staked"
                              ? "text-luxury-gold"
                              : "text-gray-300"
                          }
                        >
                          {Number(detail.value || 0).toLocaleString()}{" "}
                          {detail.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {asset.description && (
                  <p className="min-h-8 text-[9px] font-bold uppercase tracking-[0.16em] leading-relaxed text-gray-500">
                    {asset.description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pending Withdrawal Hold Notice */}
      {pendingWithdrawalUsdt > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel flex flex-col gap-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.04] p-6 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">
                Pending Withdrawal · Held
              </p>
              <p className="mt-1 text-xs text-gray-400 leading-relaxed max-w-xl">
                Already deducted from your{" "}
                <span className="text-gray-200 font-bold">
                  Withdrawal Balance
                </span>{" "}
                and held while review is pending. It will be restored if the
                request is rejected or failed.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-mono font-black text-yellow-500 tracking-tighter">
              -
              {pendingWithdrawalUsdt.toLocaleString(undefined, {
                maximumFractionDigits: 8,
              })}
            </p>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">
              USDT Held
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Actions & Convert */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSetView("deposit")}
              className="glass-panel py-10 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4 group hover:bg-green-500/5 hover:border-green-500/30 transition-all font-black text-[10px] tracking-widest uppercase text-white shadow-xl"
            >
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                <ArrowDownCircle size={32} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span>DEPOSIT</span>
                <span className="text-[9px] text-gray-500 font-bold tracking-widest">
                  On Chain
                </span>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWithdrawClick}
              className="glass-panel py-10 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4 group hover:bg-red-500/5 hover:border-red-500/30 transition-all font-black text-[10px] tracking-widest uppercase text-white shadow-xl"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <ArrowUpCircle size={32} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span>WITHDRAW</span>
                <span className="text-[9px] text-gray-500 font-bold tracking-widest">
                  On Chain
                </span>
              </div>
            </motion.button>
          </div>

          <div
            id="withdraw-section"
            ref={withdrawPanelRef}
            className={`glass-panel rounded-2xl border p-8 shadow-2xl space-y-6 transition-all duration-300 ${
              isWithdrawFocused
                ? "border-red-500/70 shadow-[0_0_40px_rgba(239,68,68,0.22)]"
                : "border-white/5"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-500">
                <ArrowUpCircle size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">
                  Withdraw
                </h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed">
                  Submit a managed-ledger settlement request
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-500">
                Available Withdrawal Balance
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <p className="font-mono text-2xl font-black tracking-tighter text-white">
                  {availableUsdt.toLocaleString(undefined, {
                    maximumFractionDigits: 8,
                  })}{" "}
                  USDT
                </p>
                {pendingWithdrawalUsdt > 0 && (
                  <p className="font-mono text-sm font-black text-yellow-500">
                    {pendingWithdrawalUsdt.toLocaleString(undefined, {
                      maximumFractionDigits: 8,
                    })}{" "}
                    held
                  </p>
                )}
              </div>
              <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-gray-600">
                Deposit {depositBalanceUsdt.toLocaleString()} · Earnings{" "}
                {earningsBalanceUsdt.toLocaleString()}
              </p>
            </div>

            <p className="text-[10px] text-gray-500 leading-relaxed">
              The requested amount is held until review is complete. Rejected or
              failed requests are restored to your Withdrawal Balance.
            </p>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-red-400 uppercase tracking-[0.2em]">
                Network
              </label>
              <div className="grid grid-cols-1 gap-3">
                {withdrawalNetworks.map((network: any) => (
                  <button
                    key={network.network}
                    type="button"
                    onClick={() => setSelectedWithdrawNetwork(network.network)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                      selectedWithdrawNetwork === network.network
                        ? "border-red-500/50 bg-red-500/10 text-white"
                        : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25"
                    }`}
                  >
                    <span className="block text-[10px] font-black uppercase tracking-widest">
                      {network.network}
                    </span>
                    <span className="mt-1 block text-xs font-bold">
                      {network.displayNetwork}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-red-400 uppercase tracking-[0.2em]">
                Withdrawal Address
              </label>
              <input
                ref={withdrawAddressInputRef}
                name="settlement_destination"
                autoComplete="off"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder={
                  selectedWithdrawNetwork === "BSC" ? "0x..." : "T..."
                }
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white placeholder:text-gray-500 focus:border-red-500/50 focus:outline-none"
              />
              <p className="text-[10px] text-gray-500 leading-relaxed">
                {withdrawAddress && !isWithdrawAddressValid
                  ? `Enter a valid ${selectedNetworkPolicy?.displayNetwork || selectedWithdrawNetwork} address.`
                  : "External wallet withdrawal only. Use Send for internal LONGRISE transfers."}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-red-400 uppercase tracking-[0.2em]">
                Amount (USDT)
              </label>
              <input
                name="withdraw_amount"
                inputMode="decimal"
                autoComplete="off"
                value={withdrawAmount}
                onChange={(e) =>
                  setWithdrawAmount(e.target.value.replace(/[^0-9.]/g, ""))
                }
                placeholder="0.00"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white placeholder:text-gray-500 focus:border-red-500/50 focus:outline-none"
              />
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Minimum {minWithdrawalUsdt.toLocaleString()} USDT. Fee{" "}
                {withdrawalFeeUsdt.toLocaleString()} USDT. Estimated receive{" "}
                {estimatedReceiveUsdt.toLocaleString(undefined, {
                  maximumFractionDigits: 8,
                })}{" "}
                USDT.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-luxury-gold"
              />
              <p className="text-xs leading-relaxed text-gray-400">
                {withdrawalPolicy?.serviceRestrictedNotice ||
                  "Exchanges located in service-restricted jurisdictions may be restricted from deposits and withdrawals."}
              </p>
            </div>

            <input
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={4}
              value={withdrawTradingPassword}
              onChange={(e) =>
                setWithdrawTradingPassword(
                  e.target.value.replace(/\D/g, "").slice(0, 4),
                )
              }
              placeholder="4-digit Trading PIN"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white placeholder:text-gray-500 focus:border-red-500/50 focus:outline-none"
            />
            {user.otp && (
              <input
                value={withdrawOtpCode}
                maxLength={6}
                autoComplete="one-time-code"
                onChange={(e) =>
                  setWithdrawOtpCode(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="Google OTP code"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white placeholder:text-gray-500 focus:border-red-500/50 focus:outline-none"
              />
            )}

            <button
              type="button"
              onClick={() => setShowWithdrawConfirmation(true)}
              disabled={
                !isWithdrawAddressValid ||
                !isWithdrawAmountValid ||
                withdrawTradingPassword.length !== 4 ||
                (user.otp && withdrawOtpCode.length !== 6)
              }
              className="w-full rounded-2xl bg-red-500 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-red-600 disabled:bg-gray-600 disabled:opacity-50"
            >
              SUBMIT WITHDRAWAL
            </button>
          </div>

          <motion.button
            whileHover={{ x: 5 }}
            onClick={handleTransferClick}
            className="w-full glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all text-left shadow-xl"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Send size={28} />
              </div>
              <div>
                <h3 className="text-[11px] font-black text-white tracking-widest uppercase">
                  SEND USDT
                </h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Internal Transfer
                </p>
              </div>
            </div>
            <ChevronRight
              size={20}
              className="text-gray-700 group-hover:text-blue-500 group-hover:translate-x-2 transition-all"
            />
          </motion.button>

          <motion.button
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSwapClick}
            aria-controls="swap-rewards-panel"
            className="w-full glass-panel p-8 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-luxury-gold/30 transition-all text-left shadow-xl"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold group-hover:rotate-180 transition-transform duration-700">
                <RefreshCcw size={28} />
              </div>
              <div>
                <h3 className="text-[11px] font-black text-white tracking-widest uppercase">
                  SWAP REWARDS
                </h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Internal Transfer
                </p>
              </div>
            </div>
            <ChevronRight
              size={20}
              className="text-gray-700 group-hover:text-luxury-gold group-hover:translate-x-2 transition-all"
            />
          </motion.button>

          <div
            id="swap-rewards-panel"
            ref={swapPanelRef}
            className={`glass-panel p-10 rounded-2xl border space-y-10 shadow-2xl relative overflow-hidden group transition-all duration-300 ${
              isSwapFocused
                ? "border-luxury-gold/70 shadow-[0_0_40px_rgba(234,179,8,0.22)]"
                : "border-white/5"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-luxury-red/10 to-transparent opacity-30"></div>
            <div className="relative z-10 space-y-8">
              <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">
                Convert to CNYT
              </h2>

              <div className="relative">
                <div className="bg-black/40 border border-white/5 rounded-t-3xl rounded-b-none p-8 pb-10 space-y-3 relative group/input focus-within:border-luxury-gold/30 transition-all">
                  <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase text-gray-500">
                    <span>PAY USDT</span>
                    <button
                      type="button"
                      onClick={handleMaxConvertAmount}
                      className="text-luxury-gold hover:text-white transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                  <input
                    ref={payAmountInputRef}
                    type="text"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-transparent text-3xl font-mono font-black text-white focus:outline-none placeholder:text-gray-800"
                    placeholder="0.00"
                  />
                </div>

                <div className="relative z-20 h-0">
                  <div className="absolute left-1/2 top-0 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#120303] bg-luxury-gold text-black shadow-lg">
                    <ArrowDownCircle size={24} />
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 border-t-0 rounded-b-3xl rounded-t-none p-8 pt-10 space-y-3">
                  <div className="text-[10px] font-black tracking-widest uppercase text-luxury-gold">
                    RECEIVE CNYT (1 USDT = {cnytPerUsdtLabel} CNYT)
                  </div>
                  <p className="text-3xl font-mono font-black text-gray-600">
                    {receiveCnytLabel}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-5">
                <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed text-yellow-500">
                  Notice: Conversion is permanent and cannot be reversed.
                </p>
              </div>

              {conversionMessage && (
                <div
                  className={`rounded-2xl border px-5 py-4 text-[11px] font-black uppercase tracking-widest leading-relaxed ${
                    conversionMessageType === "success"
                      ? "border-green-500/25 bg-green-500/10 text-green-400"
                      : "border-red-500/25 bg-red-500/10 text-red-400"
                  }`}
                >
                  {conversionMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleConvertClick}
                disabled={!cnytPriceUsd || !validPayAmount || isConverting}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-luxury-gold via-yellow-600 to-yellow-800 text-black font-black text-xs tracking-[0.4em] uppercase shadow-[0_15px_40px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isConverting ? "CONVERTING..." : "CONFIRM CONVERSION"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Package History & Activity */}
        <div className="lg:col-span-3 space-y-8">
          <div className="glass-panel p-3 rounded-2xl border border-white/5 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {historyTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveHistoryTab(tab.id)}
                  className={`flex min-h-14 items-center justify-center gap-2 rounded-xl px-3 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeHistoryTab === tab.id
                      ? "bg-luxury-gold text-black shadow-[0_10px_30px_rgba(234,179,8,0.22)]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Package History */}
          {activeHistoryTab === "package" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-8 lg:p-12 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden h-[1000px] flex flex-col gap-10"
            >
              <div className="flex justify-between items-center relative z-10">
                <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">
                  PACKAGE
                </h2>
                <span className="flex items-center gap-2 text-[10px] font-black text-luxury-gold tracking-widest uppercase">
                  <ShoppingCart size={16} /> All Records
                </span>
              </div>

              <div className="relative z-10 -mt-6 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.28em] text-gray-500">
                <span>Package Records</span>
                <span>{activeHistoryTotal} records</span>
              </div>

              <div className="space-y-4 relative z-10 min-h-0 flex-1 overflow-y-auto pr-2">
                {visiblePackageHistory.length === 0 && (
                  <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-500">
                      No package history yet
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      Your package purchases will appear here.
                    </p>
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {visiblePackageHistory.map((pkg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: i * 0.05 }}
                      className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-3xl p-6 lg:p-8 flex items-center justify-between transition-all cursor-pointer overflow-hidden relative"
                    >
                      <div className="flex items-center gap-6 lg:gap-8">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-luxury-gold transition-all group-hover:scale-110">
                          <pkg.icon size={28} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm lg:text-lg font-serif font-black text-white group-hover:text-luxury-gold transition-colors">
                            {pkg.name}
                          </h4>
                          <div className="flex items-center gap-4">
                            <p className="text-[10px] text-gray-500 font-mono tracking-widest">
                              {pkg.date}
                            </p>
                            <span
                              className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase ${
                                pkg.status === "ACTIVE"
                                  ? "bg-green-500/20 text-green-500"
                                  : "bg-gray-500/20 text-gray-500"
                              }`}
                            >
                              {pkg.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-2xl font-mono font-black text-white tracking-tighter">
                          {pkg.amount} USDT
                        </p>
                        <p className="text-[9px] text-green-500 font-black uppercase tracking-widest">
                          {pkg.returns} Returns
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Earn & Reward History */}
          {activeHistoryTab === "earn" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-8 lg:p-12 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden h-[1000px] flex flex-col gap-10"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>

              <div className="flex justify-between items-center relative z-10">
                <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">
                  EARN & REWARD
                </h2>
              </div>

              <div className="space-y-4 relative z-10 min-h-0 flex-1 overflow-y-auto pr-2">
                {visibleEarnRewardHistory.length === 0 && (
                  <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-500">
                      No earn or reward history yet
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      USDT earnings, CNYT rewards, and bonus grants will appear
                      here.
                    </p>
                  </div>
                )}
                {visibleEarnRewardHistory.map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-3xl p-6 lg:p-8 flex items-center justify-between transition-all cursor-pointer overflow-hidden relative"
                  >
                    <div className="flex items-center gap-6 lg:gap-8">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                        <activity.icon
                          size={28}
                          className={activity.iconColor}
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm lg:text-lg font-serif font-black text-white group-hover:text-luxury-gold transition-colors">
                          {activity.label}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-mono tracking-widest">
                          {activity.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1 flex flex-col items-end">
                      <p
                        className={`text-2xl font-mono font-black ${activity.value.startsWith("+") ? "text-green-500" : "text-red-500"} tracking-tighter`}
                      >
                        {activity.value}
                      </p>
                      {activity.withdrawalStatus ? (
                        <span
                          className={`inline-block px-3 py-1 rounded-full border text-[8px] font-black tracking-widest uppercase ${getWithdrawalStatusMeta(activity.withdrawalStatus).className}`}
                        >
                          {activity.type} ·{" "}
                          {
                            getWithdrawalStatusMeta(activity.withdrawalStatus)
                              .label
                          }
                        </span>
                      ) : (
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">
                          {activity.type}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Transfer History */}
          {activeHistoryTab === "transfer" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-8 lg:p-12 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden h-[1000px] flex flex-col gap-10"
            >
              <div className="flex justify-between items-center relative z-10">
                <h2 className="text-2xl font-serif font-black text-white uppercase italic tracking-tight">
                  TRANSFER
                </h2>
              </div>

              <div className="space-y-4 relative z-10 min-h-0 flex-1 overflow-y-auto pr-2">
                {visibleTransferHistory.length === 0 && (
                  <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-500">
                      No transfer history yet
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      Deposits, withdrawals, and internal sends will appear
                      here.
                    </p>
                  </div>
                )}
                {visibleTransferHistory.map((transfer, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-3xl p-6 lg:p-8 flex items-center justify-between transition-all cursor-pointer overflow-hidden relative"
                  >
                    <div className="flex items-center gap-6 lg:gap-8">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center transition-all group-hover:scale-110 ${
                          transfer.type === "SENT"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {transfer.type === "SENT" ? (
                          <ArrowUpCircle size={28} />
                        ) : (
                          <ArrowDownCircle size={28} />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm lg:text-lg font-serif font-black text-white group-hover:text-luxury-gold transition-colors">
                          {transfer.title} · {transfer.asset}
                        </h4>
                        <div className="flex items-center gap-4">
                          <p className="text-[10px] text-gray-500 font-mono tracking-widest">
                            {transfer.date}
                          </p>
                          <p className="text-[8px] text-gray-600 font-mono tracking-widest">
                            {transfer.txId}
                          </p>
                        </div>
                        {(transfer.to || transfer.network) && (
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">
                            {[
                              transfer.network,
                              transfer.type === "SENT"
                                ? transfer.to
                                : transfer.from,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p
                        className={`text-2xl font-mono font-black tracking-tighter ${
                          transfer.type === "SENT"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {transfer.type === "SENT" ? "-" : "+"}
                        {transfer.amount}
                      </p>
                      <p className="text-[9px] text-green-500 font-black uppercase tracking-widest">
                        {transfer.status}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {walletMessage && (
        <div className="fixed top-24 right-6 z-[120] rounded-2xl border border-luxury-gold/20 bg-black/80 px-4 py-3 text-sm text-white shadow-2xl">
          {walletMessage}
        </div>
      )}

      <AnimatePresence>
        {showWithdrawConfirmation && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWithdrawConfirmation(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="relative w-full max-w-md glass-panel rounded-2xl border border-red-500/30 p-8 space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-serif font-black text-white uppercase italic">
                    Confirm Withdrawal
                  </h3>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Review the request before submission
                  </p>
                </div>
                <button
                  onClick={() => setShowWithdrawConfirmation(false)}
                  className="text-gray-600 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Network</span>
                  <span className="font-bold text-white">
                    {selectedNetworkPolicy?.displayNetwork}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-mono font-black text-white">
                    {numericWithdrawAmount.toLocaleString()} USDT
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Fee</span>
                  <span className="font-mono font-black text-luxury-gold">
                    {withdrawalFeeUsdt.toLocaleString()} USDT
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Estimated Receive</span>
                  <span className="font-mono font-black text-green-400">
                    {estimatedReceiveUsdt.toLocaleString(undefined, {
                      maximumFractionDigits: 8,
                    })}{" "}
                    USDT
                  </span>
                </div>
                <div className="pt-2 text-[10px] font-mono leading-relaxed text-gray-500 break-all">
                  {withdrawAddress}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawConfirmation(false)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleWithdrawalSubmit}
                  className="flex-1 rounded-2xl bg-red-500 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-600"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConvertConfirmation && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConvertConfirmation(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="relative w-full max-w-md glass-panel rounded-2xl border border-luxury-gold/30 p-8 space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-serif font-black text-white uppercase italic">
                    Confirm Conversion
                  </h3>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Review the irreversible exchange
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConvertConfirmation(false)}
                  className="text-gray-600 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 text-xs font-bold leading-relaxed text-yellow-500">
                Are you sure you want to convert? This conversion is permanent
                and cannot be reversed.
              </p>
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Pay</span>
                  <span className="font-mono font-black text-white">
                    {validPayAmount.toLocaleString()} USDT
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Receive</span>
                  <span className="font-mono font-black text-luxury-gold">
                    {receiveCnytLabel} CNYT
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConvertConfirmation(false)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConvertConfirmation}
                  className="flex-1 rounded-2xl bg-luxury-gold py-4 text-[10px] font-black uppercase tracking-widest text-black hover:bg-yellow-400"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConvertPasswordModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isConverting) setShowConvertPasswordModal(false);
              }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="relative w-full max-w-md glass-panel rounded-2xl border border-luxury-gold/30 p-8 space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-serif font-black text-white uppercase italic">
                    Trading Password
                  </h3>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Enter your 4-digit PIN to execute
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConvertPasswordModal(false)}
                  disabled={isConverting}
                  className="text-gray-600 hover:text-white transition-colors disabled:opacity-40"
                >
                  <X size={20} />
                </button>
              </div>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                maxLength={4}
                value={conversionTradingPassword}
                onChange={(e) =>
                  setConversionTradingPassword(
                    e.target.value.replace(/\D/g, "").slice(0, 4),
                  )
                }
                placeholder="4-digit Trading PIN"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center font-mono text-2xl tracking-[0.5em] text-white placeholder:text-gray-500 focus:border-luxury-gold/50 focus:outline-none"
              />
              {conversionMessage && conversionMessageType === "error" && (
                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-[11px] font-black uppercase tracking-widest leading-relaxed text-red-400">
                  {conversionMessage}
                </div>
              )}
              <button
                type="button"
                onClick={handleConvert}
                disabled={conversionTradingPassword.length !== 4 || isConverting}
                className="w-full rounded-2xl bg-luxury-gold py-5 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-yellow-400 disabled:bg-gray-600 disabled:text-white disabled:opacity-50"
              >
                {isConverting ? "CONVERTING..." : "VERIFY & CONVERT"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USDT Transfer Modal */}
      <AnimatePresence>
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeTransferModal}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-panel p-10 rounded-2xl border border-blue-500/30 space-y-8"
            >
              {transferStep === "form" ? (
                <>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                        <Send size={32} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-serif font-black text-white uppercase italic">
                          Send USDT
                        </h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                          Internal Transfer
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeTransferModal}
                      className="text-gray-600 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] ml-2">
                        Recipient Wallet
                      </label>
                      <input
                        type="email"
                        value={recipientWallet}
                        onChange={(e) => setRecipientWallet(e.target.value)}
                        placeholder="Enter email or wallet address"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] ml-2">
                        Amount (USDT)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 pr-20"
                        />
                        <button
                          type="button"
                          onClick={handleMaxTransferAmount}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white"
                        >
                          MAX
                        </button>
                      </div>
                      {!isTransferAmountValid && transferAmount && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                          Enter a valid amount within your available withdrawal
                          balance.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] ml-2">
                        Trading Password
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={transferPassword}
                        onChange={(e) =>
                          setTransferPassword(
                            e.target.value.replace(/\D/g, "").slice(0, 4),
                          )
                        }
                        placeholder="4-digit Trading PIN"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                      <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">
                        ⚠ Transfers are irreversible. Verify recipient details
                        carefully.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleTransferReview}
                    disabled={!isTransferFormValid}
                    className="w-full py-5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all"
                  >
                    REVIEW TRANSFER
                  </button>
                </>
              ) : transferStep === "review" ? (
                <>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                        <Target size={32} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-serif font-black text-white uppercase italic">
                          Confirm Send
                        </h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                          Review before executing the transfer
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeTransferModal}
                      className="text-gray-600 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Recipient</span>
                      <span className="font-bold text-white">
                        {trimmedRecipientWallet}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-mono font-black text-white">
                        {numericTransferAmount.toLocaleString()} USDT
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Available</span>
                      <span className="font-mono font-black text-luxury-gold">
                        {availableUsdt.toLocaleString(undefined, {
                          maximumFractionDigits: 8,
                        })}{" "}
                        USDT
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Network</span>
                      <span className="font-bold text-white">
                        LONGRISE INTERNAL
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setTransferStep("form")}
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleTransferSubmit}
                      disabled={isSubmittingTransfer}
                      className="flex-1 rounded-2xl bg-blue-500 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50"
                    >
                      {isSubmittingTransfer ? "SENDING..." : "SEND NOW"}
                    </button>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-6"
                >
                  <div
                    className={`w-20 h-20 rounded-full border-4 flex items-center justify-center mx-auto ${transferResultMeta.accentClass}`}
                  >
                    <TransferResultIcon size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-black text-white mb-2">
                      {transferResultMeta.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {transferResultMeta.message}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (transferResultState === "success") {
                        setActiveHistoryTab("transfer");
                        closeTransferModal();
                        return;
                      }
                      resetTransferFlow(false);
                    }}
                    className="w-full rounded-2xl bg-blue-500 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-600"
                  >
                    {transferResultMeta.buttonLabel}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Security Requirement Modal */}
      <AnimatePresence>
        {isRequirementModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequirementModalOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-panel p-10 rounded-2xl border border-luxury-gold/30 text-center space-y-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold mx-auto">
                <AlertCircle size={32} />
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-black text-white uppercase italic">
                  Security Requirement
                </h2>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                  To authorize asset withdrawals and transfers, you must
                  configure your{" "}
                  <span className="text-luxury-gold">Trading Password</span>{" "}
                  (4-digit numeric PIN) in your Profile settings.
                </p>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button
                  onClick={() => onSetView("profile")}
                  className="w-full py-5 bg-luxury-gold text-black rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase hover:scale-105 transition-all flex items-center justify-center gap-3"
                >
                  <UserCheck size={18} /> GO TO PROFILE SETTINGS
                </button>
                <button
                  onClick={() => setIsRequirementModalOpen(false)}
                  className="text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-all"
                >
                  REMAIN IN WALLET
                </button>
              </div>

              <button
                onClick={() => setIsRequirementModalOpen(false)}
                className="absolute top-6 right-6 text-gray-600 hover:text-white"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
