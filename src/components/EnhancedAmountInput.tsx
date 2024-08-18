import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, AlertCircle } from "lucide-react";

interface EnhancedAmountInputProps {
  amount: string;
  setAmount: (amount: string) => void;
  useSameAmount: boolean;
  setUseSameAmount: (useSameAmount: boolean) => void;
}

const EnhancedAmountInput: React.FC<EnhancedAmountInputProps> = ({
  amount,
  setAmount,
  useSameAmount,
  setUseSameAmount,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-visible border border-gray-100">
      {" "}
      {/* Changed overflow to visible */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={() => setUseSameAmount(!useSameAmount)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg font-medium text-gray-800">
            Same Amount For All
          </span>
          <div className="relative group">
            <AlertCircle size={16} className="text-blue-500 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
              {" "}
              {/* Adjusted positioning and added z-index */}
              When enabled, any amounts entered with addresses will be invalid.
            </div>
          </div>
        </div>
        <div className="relative">
          <input
            type="checkbox"
            checked={useSameAmount}
            onChange={() => setUseSameAmount(!useSameAmount)}
            className="sr-only"
          />
          <div className="w-14 h-7 bg-gray-200 rounded-full shadow-inner">
            <motion.div
              className="absolute w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center"
              animate={{
                x: useSameAmount ? 28 : 0,
                backgroundColor: useSameAmount ? "#3B82F6" : "#FFFFFF",
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <motion.div
                className="w-4 h-4 rounded-full"
                animate={{
                  backgroundColor: useSameAmount ? "#FFFFFF" : "#9CA3AF",
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {useSameAmount && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-5 bg-white">
              <div className="relative">
                <DollarSign
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAmount(e.target.value)
                  }
                  className="w-full py-3 pl-12 pr-16 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-300 text-lg shadow-sm"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold">
                  TON
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedAmountInput;
