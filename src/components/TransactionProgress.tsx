import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, ExternalLink } from 'lucide-react';

interface TransactionProgressProps {
  status: 'sending' | 'confirming' | 'success';
  transactionHash?: string;
}

export const TransactionProgress: React.FC<TransactionProgressProps> = ({ status, transactionHash }) => {
  const statusColors = {
    sending: 'text-blue-500',
    confirming: 'text-yellow-500',
    success: 'text-green-500'
  };

  const statusMessages = {
    sending: 'Sending...',
    confirming: 'Confirming...',
    success: 'Confirmed'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center space-x-2 p-2 rounded-lg ${status === 'success' ? 'bg-green-50' : 'bg-gray-50'}`}
    >
      {status === 'success' ? (
        <CheckCircle className={`w-5 h-5 ${statusColors[status]}`} />
      ) : (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className={`w-5 h-5 ${statusColors[status]}`} />
        </motion.div>
      )}
      <span className={`text-sm font-medium ${statusColors[status]}`}>
        {statusMessages[status]}
      </span>
      {status === 'success' && transactionHash && (
        <a
          href={`https://tonviewer.com/transaction/${transactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 transition-colors duration-200 inline-flex items-center"
        >
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      )}
    </motion.div>
  );
};