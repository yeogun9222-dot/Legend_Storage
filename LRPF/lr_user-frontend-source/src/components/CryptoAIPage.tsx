import { motion } from 'motion/react';

export const CryptoAIPage = ({
  onUpgrade,
  portalData,
  onTerminateInvestment
}: {
  onUpgrade?: () => void;
  portalData?: any;
  onTerminateInvestment?: (id: string) => void;
}) => {
  return (
    <motion.div
      key="crypto-ai"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full min-h-screen"
      style={{ paddingTop: '80px' }}
    >
      <iframe
        src="/earning-dashboard.html"
        style={{
          width: '100%',
          height: 'calc(100vh - 80px)',
          border: 'none',
          background: '#070504',
          display: 'block'
        }}
        title="Crypto AI Dashboard"
      />
    </motion.div>
  );
};
