import React, { useCallback, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";

interface BalanceCardProps {
  balance: string | null;
  previousBalance: string | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

function AnimatedBalance({ balance }: { balance: string }) {
  return (
    <motion.span
      key={balance}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="text-xl font-bold text-blue-600"
    >
      {balance}
    </motion.span>
  );
}

function BalanceChangeTooltip({ previousBalance, currentBalance, position }: { 
  previousBalance: string; 
  currentBalance: string;
  position: { x: number; y: number };
}) {
  const prev = parseFloat(previousBalance);
  const current = parseFloat(currentBalance);
  const difference = current - prev;
  const percentageChange = ((difference / prev) * 100).toFixed(2);

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
      className="p-4 rounded-lg bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg shadow-lg border border-gray-200"
    >
      <div className="text-sm font-medium text-gray-600">Balance Change</div>
      <div className="mt-1 flex items-center space-x-2">
        <span className="text-gray-500">Before:</span>
        <span className="font-semibold text-gray-800">{previousBalance} TON</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-500">Now:</span>
        <span className="font-semibold text-gray-800">{currentBalance} TON</span>
      </div>
      <div className="mt-2 flex items-center space-x-2">
        <span className="text-gray-500">Difference:</span>
        <span className={`font-semibold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {difference >= 0 ? '+' : ''}{difference.toFixed(4)} TON
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-500">Change:</span>
        <span className={`font-semibold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {difference >= 0 ? '+' : ''}{percentageChange}%
        </span>
      </div>
    </motion.div>,
    document.body
  );
}

export function EnhancedBalanceCard({ balance, previousBalance, onRefresh, isRefreshing }: BalanceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [balanceChangeDirection, setBalanceChangeDirection] = useState<'up' | 'down' | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (balance !== null && previousBalance !== null) {
      const current = parseFloat(balance);
      const previous = parseFloat(previousBalance);
      if (current > previous) {
        setBalanceChangeDirection('up');
      } else if (current < previous) {
        setBalanceChangeDirection('down');
      } else {
        setBalanceChangeDirection(null);
      }
    }
  }, [balance, previousBalance]);

  const getBalanceChangeIcon = useCallback(() => {
    if (balanceChangeDirection === 'up') return <TrendingUp className="text-green-500 ml-2" />;
    if (balanceChangeDirection === 'down') return <TrendingDown className="text-red-500 ml-2" />;
    return null;
  }, [balanceChangeDirection]);

  const handleIconMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPosition({ x: rect.left, y: rect.bottom + window.scrollY });
    }
    setShowTooltip(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl shadow-md relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CreditCard size={24} className="text-blue-600" />
          <span className="text-lg font-semibold text-gray-700">Balance:</span>
          <AnimatePresence mode="wait">
            {balance !== null && (
              <div className="flex items-center">
                <AnimatedBalance balance={`${balance} TON`} />
                {balanceChangeDirection && (
                  <motion.div
                    ref={iconRef}
                    onMouseEnter={handleIconMouseEnter}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="relative cursor-pointer"
                  >
                    <motion.div
                      key={balanceChangeDirection}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {getBalanceChangeIcon()}
                    </motion.div>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRefresh}
          className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={isRefreshing}
        >
          <RefreshCw
            size={18}
            className={`text-blue-600 transition-all duration-300 ${
              isRefreshing ? "animate-spin" : isHovered ? "rotate-180" : ""
            }`}
          />
        </motion.button>
      </div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: isRefreshing ? "100%" : 0 }}
        transition={{ duration: 0.5 }}
        className="absolute bottom-0 left-0 h-1 bg-blue-500"
      />
      <AnimatePresence>
        {showTooltip && previousBalance && balance && (
          <BalanceChangeTooltip
            previousBalance={previousBalance}
            currentBalance={balance}
            position={tooltipPosition}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}