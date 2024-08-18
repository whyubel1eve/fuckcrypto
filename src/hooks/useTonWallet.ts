"use client";

import { useCallback, useState, useEffect } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, Address, fromNano, toNano } from "@ton/ton";

const FEE_PERCENTAGE = 0.003; // 0.3%
const FEE_ADDRESS = "UQBsuD9uBtcLFtXtAfAB_3QbKOc-1TdamPXx0c4rt1jrMFte";

export function useTonWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [previousBalance, setPreviousBalance] = useState<string | null>(null);
  const [previousTx, setPreviousTx] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tonConnectUI] = useTonConnectUI();

  const fetchBalance = useCallback(async (address: string) => {
    try {
      setIsRefreshing(true);
      const endpoint = await getHttpEndpoint();
      const client = new TonClient({ endpoint });
      const newBalance = fromNano(
        await client.getBalance(Address.parse(address))
      );

      setBalance((prevBalance) => {
        setPreviousBalance(prevBalance);
        return newBalance;
      });
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleRefreshBalance = useCallback(() => {
    if (account) {
      fetchBalance(account);
    }
  }, [account, fetchBalance]);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (tonConnectUI.account) {
        const rawAddress = tonConnectUI.account.address;
        setAccount(rawAddress);
        await fetchBalance(rawAddress);
      } else {
        setAccount(null);
        setBalance(null);
        setPreviousBalance(null);
      }
    };

    fetchAccountData();
    const unsubscribe = tonConnectUI.onStatusChange(fetchAccountData);
    return () => unsubscribe();
  }, [fetchBalance, tonConnectUI]);

  const executeBatchTransfer = useCallback(
    async (useSameAmount: boolean, amount: string, addresses: string) => {
      setIsSending(true);
      setError(null);

      try {
        const endpoint = await getHttpEndpoint();
        const client = new TonClient({ endpoint });

        const transactions = await client.getTransactions(
          Address.parse(account!),
          { limit: 1 }
        );
        const preTx = transactions[0].hash().toString("hex");
        setPreviousTx(preTx);

        const transfers = useSameAmount
          ? addresses
              .split("\n")
              .map((address) => ({ address: address.trim(), amount }))
          : addresses.split("\n").map((line) => {
              const [address, amt] = line.split(",").map((item) => item.trim());
              return { address, amount: amt };
            });

        for (const transfer of transfers) {
          try {
            Address.parse(transfer.address);
          } catch {
            throw new Error(`Invalid address: ${transfer.address}`);
          }

          if (isNaN(Number(transfer.amount)) || Number(transfer.amount) <= 0) {
            throw new Error(
              `Invalid amount for address ${transfer.address}: ${transfer.amount}`
            );
          }
        }

        const totalAmount = transfers.reduce(
          (sum, transfer) => sum + Number(transfer.amount),
          0
        );

        const feeAmount = totalAmount * FEE_PERCENTAGE;
        const totalWithFee = totalAmount + feeAmount;

        if (balance && Number(balance) < totalWithFee) {
          throw new Error("Insufficient balance for the transfers and fee");
        }

        const messages = [
          ...transfers.map((transfer) => ({
            address: transfer.address,
            amount: toNano(transfer.amount).toString(),
            payload: "",
          })),
          {
            address: FEE_ADDRESS,
            amount: toNano(feeAmount.toFixed(9)).toString(),
            payload: "",
          },
        ];

        const result = await tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 300,
          messages: messages,
        });

        console.log("Transfer initiated:", result);
        return result.boc;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setIsSending(false);
      }
    },
    [account, balance, tonConnectUI]
  );

  const checkTransactionStatus = useCallback(async () => {
    try {
      const endpoint = await getHttpEndpoint();
      const client = new TonClient({ endpoint });

      const transactions = await client.getTransactions(
        Address.parse(account!),
        { limit: 1 }
      );

      for (const tx of transactions) {
        console.log("pre Tx: ", previousTx);
        console.log("Checking new transaction:", tx.hash().toString("hex"));
        const newTxPrev = tx.prevTransactionHash.toString(16);
        console.log("newTxPrev: ", newTxPrev);

        if (tx.description.type === "generic" && newTxPrev === previousTx) {
          console.log("Found matching transaction");
          const { computePhase } = tx.description;
          if (
            computePhase.type === "vm" &&
            (computePhase.exitCode === 0 || computePhase.exitCode === 1)
          ) {
            console.log("Transaction confirmed successfully");
            return { confirmed: true, hash: tx.hash().toString("hex") };
          } else {
            console.log("Transaction failed or skipped:", computePhase);
          }
        }
      }

      console.log("No matching transaction found");
      return { confirmed: false, hash: null };
    } catch (err) {
      console.error("Error checking transaction status:", err);
      return { confirmed: false, hash: null };
    }
  }, [account, previousTx]);

  return {
    account,
    balance,
    previousBalance,
    isRefreshing,
    isSending,
    error,
    handleRefreshBalance,
    executeBatchTransfer,
    checkTransactionStatus,
  };
}
