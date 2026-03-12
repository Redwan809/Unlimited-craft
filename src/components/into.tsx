import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface IntoProps {
  onComplete: () => void;
}

export const Into: React.FC<IntoProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 4500); // Increased delay: 2.5s (initial) + 2s = 4.5s
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950"
    >
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-4xl md:text-6xl font-bold tracking-tighter italic serif text-white"
      >
        Unfinite Craft
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-4 text-zinc-500 font-mono text-sm uppercase tracking-widest"
      >
        by Redwan
      </motion.p>
    </motion.div>
  );
};
