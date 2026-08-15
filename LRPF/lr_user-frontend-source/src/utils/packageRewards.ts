export const CNYT_CURRENT_PRICE_USD = 0.02;

export const PACKAGE_CNYT_RATIOS: Record<string, number> = {
  flexible: 0,
  basic: 2,
  standard: 4,
  premium: 6,
  vip: 10,
};

export const normalizePackageId = (value: unknown) =>
  String(value || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/-package$/, '');

export const calculateMonthlyUsdtReward = (investmentAmount: number, monthlyUsdtRate: number) =>
  (investmentAmount * monthlyUsdtRate) / 100;

export const calculateMonthlyCnytReward = (
  monthlyUsdtReward: number,
  cnytRatio: number,
  cnytPriceUsd = CNYT_CURRENT_PRICE_USD,
) => (monthlyUsdtReward * (cnytRatio / 100)) / cnytPriceUsd;

export const getPackageCnytRatio = (packageId: unknown) => PACKAGE_CNYT_RATIOS[normalizePackageId(packageId)] ?? 0;

