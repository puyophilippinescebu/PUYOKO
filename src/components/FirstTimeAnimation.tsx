import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const FirstTimeAnimation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('puyoko_has_visited');
    if (hasVisited) {
      setIsFirstVisit(false);
    } else {
      sessionStorage.setItem('puyoko_has_visited', 'true');
      const timer = setTimeout(() => {
        setIsFirstVisit(false);
      }, 2000); // 2-second animation
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {isFirstVisit && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white flex-col gap-6"
          >
            <motion.img 
              src="/Puyoko Animated Logo.svg" 
              alt="PUYOKO" 
              className="w-32 h-32 md:w-48 md:h-48"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              onError={(e) => {
                // Fallback if SVG is missing (and prevent infinite loop)
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/puyoko-logo.png";
              }}
            />
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="text-primary font-display text-2xl tracking-[0.3em] uppercase font-light"
            >
              PUYOKO
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={isFirstVisit ? "opacity-0" : "opacity-100 transition-opacity duration-1000"}>
        {children}
      </div>
    </>
  );
};
