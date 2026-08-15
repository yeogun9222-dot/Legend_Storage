import { motion } from 'motion/react';
import { Shield, Box, Crown, Zap, Star } from 'lucide-react';
import {
  calculateMonthlyCnytReward,
  getPackageCnytRatio,
  normalizePackageId,
} from '../utils/packageRewards';

const isPopularPackage = (pkg: { id?: unknown; name?: unknown }) => {
  const id = normalizePackageId(pkg.id);
  const name = normalizePackageId(pkg.name);
  return id === 'standard' || id === 'premium' || name === 'standard' || name === 'premium';
};

const getPackageIcon = (id: string) => {
  if (id === 'flexible') return Shield;
  if (id === 'basic') return Box;
  if (id === 'standard') return Crown;
  if (id === 'premium') return Zap;
  return Star;
};

export const PackageSection = ({
  onSelect,
  packages,
}: {
  onSelect: (p: string) => void;
  packages?: any[];
}) => {
  const packageList = (packages && packages.length > 0)
    ? packages.map((pkg) => {
        const price = Number(pkg.price);
        const monthlyUsdtRate = Number(pkg.roi) / 12;
        const cnytRatio = getPackageCnytRatio(pkg.id);
        const monthlyCnyt = calculateMonthlyCnytReward((price * monthlyUsdtRate) / 100, cnytRatio);

        return {
          id: pkg.id,
          name: pkg.name,
          price: `$${price.toLocaleString()}`,
          roi: `${Number(pkg.roi).toLocaleString()}%~`,
          period: pkg.period,
          popular: isPopularPackage(pkg),
          cnyt: cnytRatio > 0 ? `+${monthlyCnyt.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'No CNYT',
          icon: getPackageIcon(pkg.id),
        };
      })
    : [];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-luxury-gold font-bold tracking-[0.3em] text-sm uppercase mb-3 text-[10px]">Investment Plans</h2>
        <h3 className="text-4xl lg:text-5xl font-serif font-black text-white">Dragon Wealth Packages</h3>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent mx-auto mt-6 rounded-full"></div>
      </div>

      {packageList.length === 0 && (
        <div className="glass-panel mx-auto max-w-2xl rounded-2xl border border-white/5 p-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-500">No packages available</p>
          <p className="mt-3 text-sm text-gray-600">Published investment packages will appear here after they are loaded from the server.</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        {packageList.map((pkg, index) => {
          const isPopular = Boolean(pkg.popular);

          return (
          <motion.div 
            key={pkg.id}
            whileHover={{ y: -10 }}
            className={`glass-panel p-4 lg:p-6 relative overflow-hidden group cursor-pointer border-2 ${
              isPopular
                  ? 'border-luxury-gold shadow-[0_0_30px_rgba(234,179,8,0.2)]'
                  : 'border-luxury-gold/20'
            }`}
            onClick={() => onSelect(pkg.id)}
          >
            {isPopular && (
              <div className="absolute top-2 right-2 lg:top-4 lg:right-4 bg-luxury-gold text-black text-[8px] lg:text-[10px] font-black px-2 lg:px-3 py-0.5 lg:py-1 rounded-full tracking-widest z-10">
                POPULAR
              </div>
            )}
            
            <div className="mb-4 lg:mb-6">
              <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white/5 flex items-center justify-center mb-2 lg:mb-4 group-hover:scale-110 transition-transform`}>
                <pkg.icon size={20} className="text-luxury-gold lg:w-[28px] lg:h-[28px]" />
              </div>
              <h4 className="text-sm lg:text-xl font-black text-white mb-1 uppercase tracking-tight">{pkg.name}</h4>
              <p className="text-gray-400 text-[8px] lg:text-[10px] uppercase tracking-wider">{pkg.period}</p>
            </div>

            <div className="mb-4 lg:mb-8">
              <p className="text-xl lg:text-3xl font-mono font-black text-white mb-1">{pkg.price}</p>
              <p className="text-luxury-gold font-bold text-[8px] lg:text-[10px] uppercase tracking-widest">Entry Level</p>
            </div>

            <div className="space-y-2 lg:space-y-4 mb-4 lg:mb-8">
              <div className="flex justify-between items-center text-[10px] lg:text-xs">
                <span className="text-gray-400">ROI</span>
                <span className="text-green-400 font-bold">{pkg.roi}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] lg:text-xs">
                <span className="text-gray-400">Monthly CNYT</span>
                <span className="text-luxury-gold font-bold">{pkg.cnyt}</span>
              </div>
              <div className="h-px bg-white/10"></div>
            </div>

            <motion.button
              className={`w-full py-2 lg:py-4 rounded-lg lg:rounded-xl font-black text-[9px] lg:text-[10px] tracking-widest transition-all border-2 ${
                isPopular
                    ? 'border-transparent bg-luxury-gold text-black shadow-[0_10px_20px_rgba(234,179,8,0.3)] hover:scale-105'
                    : 'border-transparent bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              INVEST NOW
            </motion.button>
          </motion.div>
          );
        })}
      </div>
    </section>
  );
};
