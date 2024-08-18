"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TonConnectButton } from "@tonconnect/ui-react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertCircle } from "lucide-react";
import { EnhancedBalanceCard } from "@/components/EnhancedBalanceCard";
import EnhancedAmountInput from "@/components/EnhancedAmountInput";
import { TransactionProgress } from "@/components/TransactionProgress";
import { useTonWallet } from "@/hooks/useTonWallet";
import MinimalistBackground from "./MinimalistBackground";
import Image from "next/image";

export function BatchSender() {
  const [useSameAmount, setUseSameAmount] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [addresses, setAddresses] = useState<string>("");
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "sending" | "confirming" | "success"
  >("idle");
  const [transactionBoc, setTransactionBoc] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const {
    account,
    balance,
    previousBalance,
    isRefreshing,
    handleRefreshBalance,
    executeBatchTransfer,
    checkTransactionStatus,
    isSending,
    error,
  } = useTonWallet();

  useEffect(() => {
    const calculateTotal = () => {
      let total = 0;
      if (useSameAmount) {
        const numAddresses = addresses
          .split("\n")
          .filter((line) => line.trim()).length;
        total = parseFloat(amount) * numAddresses;
      } else {
        total = addresses
          .split("\n")
          .filter((line) => line.trim())
          .reduce((sum, line) => {
            const [, amt] = line.split(",").map((item) => item.trim());
            return sum + (parseFloat(amt) || 0);
          }, 0);
      }
      setTotalAmount(total);
    };

    calculateTotal();
  }, [useSameAmount, amount, addresses]);

  const handleSendBatch = async () => {
    setTransactionStatus("sending");
    const boc = await executeBatchTransfer(useSameAmount, amount, addresses);
    if (boc) {
      setTransactionBoc(boc);
      setTransactionStatus("confirming");
    } else {
      setTransactionStatus("idle");
    }
  };

  const checkStatus = useCallback(async () => {
    if (transactionBoc) {
      const { confirmed, hash } = await checkTransactionStatus();
      if (confirmed) {
        setTransactionStatus("success");
        setTransactionHash(hash);
        handleRefreshBalance();
        return true;
      }
    }
    return false;
  }, [transactionBoc, checkTransactionStatus, handleRefreshBalance]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (transactionStatus === "confirming" && transactionBoc) {
      intervalId = setInterval(async () => {
        const isConfirmed = await checkStatus();
        if (isConfirmed) {
          clearInterval(intervalId);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [transactionStatus, transactionBoc, checkStatus]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] relative p-4">
      <MinimalistBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg shadow-2xl rounded-3xl w-full max-w-2xl p-8 space-y-6 relative z-30 overflow-y-auto max-h-[calc(100vh-8rem)]"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/ton.png"
              alt="TON"
              width={48}
              height={48}
              className="mr-4"
            />
            <h1 className="text-3xl font-bold text-gray-800">
              TON Batch Sender
            </h1>
          </div>

          <TonConnectButton />
        </div>

        {account && (
          <EnhancedBalanceCard
            balance={balance}
            previousBalance={previousBalance}
            onRefresh={handleRefreshBalance}
            isRefreshing={isRefreshing}
          />
        )}

        <div className="space-y-4">
          <EnhancedAmountInput
            amount={amount}
            setAmount={setAmount}
            useSameAmount={useSameAmount}
            setUseSameAmount={setUseSameAmount}
          />

          <div className="relative">
            <textarea
              value={addresses}
              onChange={(e) => setAddresses(e.target.value)}
              placeholder={
                useSameAmount
                  ? "Enter addresses (one per line)"
                  : "Enter addresses and amounts (one pair per line, comma-separated)"
              }
              className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 resize-none bg-opacity-70 backdrop-filter backdrop-blur-sm"
            />
            <motion.div
              className="absolute bottom-4 right-4 text-gray-500 text-sm"
              animate={{ opacity: addresses ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {addresses.split("\n").filter((line) => line.trim()).length}{" "}
              addresses
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-red-500 text-sm mt-2 bg-red-50 border border-red-200 rounded-lg p-3"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {transactionStatus !== "idle" && (
            <TransactionProgress
              status={transactionStatus}
              transactionHash={transactionHash || undefined}
            />
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">
              Total Amount:{" "}
              {totalAmount === 0 || Number.isNaN(totalAmount)
                ? "0"
                : totalAmount.toFixed(6)}{" "}
              TON
            </span>
            <div className="relative group">
              <AlertCircle size={16} className="text-blue-500 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                A 0.3% fee will be charged
              </div>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-800 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center space-x-2"
          onClick={handleSendBatch}
          disabled={
            isSending ||
            !account ||
            transactionStatus !== "idle" ||
            totalAmount === 0
          }
        >
          <Send size={20} />
          <span>{isSending ? "Sending..." : "Send Batch"}</span>
        </motion.button>
      </motion.div>
    </div>
  );
}

export default BatchSender;
