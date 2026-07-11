import React from 'react';
import { motion } from 'framer-motion';

export const PageHeader = ({ title, description, actions }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-8 border-b border-white/5 relative"
    >
      <div className="absolute bottom-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-primary/50 to-transparent" />
      
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 drop-shadow-sm">{title}</h1>
        {description && <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">{description}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </motion.div>
  );
};