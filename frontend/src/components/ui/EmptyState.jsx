import React from 'react';
import { motion } from 'framer-motion';

export const EmptyState = ({ title, description, icon: Icon, action }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 p-12 text-center bg-card/40 backdrop-blur-xl shadow-sm"
    >
      {Icon && (
        <motion.div 
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6 text-primary shadow-[0_0_20px_rgba(139,92,246,0.15)]"
        >
          <Icon className="h-8 w-8" />
        </motion.div>
      )}
      <h3 className="mt-2 text-xl font-bold text-foreground">{title}</h3>
      <p className="mb-6 mt-3 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
};