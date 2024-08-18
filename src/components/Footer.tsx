"use client";

import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="w-full flex justify-center p-4 h-16">
      <motion.a
        href="https://x.com/0xGusboy"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.2, rotate: 360 }}
        whileTap={{ scale: 0.8 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 text-blue-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </motion.svg>
      </motion.a>
    </footer>
  );
};

export default Footer;
