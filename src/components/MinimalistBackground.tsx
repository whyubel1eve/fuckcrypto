import React from "react";
import { motion } from "framer-motion";

const MinimalistBackground: React.FC = () => {
  // Helper function to generate initial positions
  const generatePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 0.4 + Math.random() * 0.2; // 40% to 60% of the way from center to edge
    return {
      x: 50 + 50 * radius * Math.cos(angle),
      y: 50 + 50 * radius * Math.sin(angle),
    };
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          zIndex: -2,
        }}
      />
      {[...Array(10)].map((_, index) => {
        const { x, y } = generatePosition(index, 10);
        return (
          <motion.div
            key={index}
            style={{
              position: "fixed",
              borderRadius: "50%",
              background:
                index % 2 === 0
                  ? "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)"
                  : "radial-gradient(circle, rgba(195,207,226,0.8) 0%, rgba(195,207,226,0) 70%)",
              zIndex: -1,
            }}
            animate={{
              scale: [1, 1.2, 1],
              x: [`${x}%`, `${x + (Math.random() * 10 - 5)}%`],
              y: [`${y}%`, `${y + (Math.random() * 10 - 5)}%`],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
            initial={{
              top: `${y}%`,
              left: `${x}%`,
              width: `${30 + Math.random() * 20}%`,
              height: `${30 + Math.random() * 20}%`,
            }}
          />
        );
      })}
    </>
  );
};

export default MinimalistBackground;
