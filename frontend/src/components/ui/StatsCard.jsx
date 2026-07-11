import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './Card';
import { motion } from 'framer-motion';

export const StatsCard = ({ title, value, icon: Icon, description, trend }) => {
  // Simple count up effect
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }
    
    let start = 0;
    const end = parseInt(value, 10);
    if (start === end) return;
    
    let totalDuration = 1000;
    let incrementTime = (totalDuration / end);
    
    let timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start === end) clearInterval(timer);
    }, incrementTime > 50 ? 50 : incrementTime);
    
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="overflow-hidden relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl z-0 pointer-events-none" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between space-y-0 pb-4">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground uppercase">{title}</h3>
            {Icon && (
              <div className="p-2 rounded-full bg-white/5 text-primary">
                <Icon className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              {typeof value === 'number' ? displayValue : value}
            </div>
            {trend && (
              <span className={`text-xs font-semibold ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
};