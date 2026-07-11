import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Modal = ({ isOpen, onClose, title, description, children, footer }) => {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AnimatePresence>
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
                animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
                exit={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-white/10 bg-card p-6 shadow-2xl sm:rounded-2xl"
              >
                <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                  <div className="flex justify-between items-center">
                    <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight text-foreground">
                      {title}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Close asChild>
                      <button className="rounded-full p-1.5 opacity-70 transition-colors hover:opacity-100 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                      </button>
                    </DialogPrimitive.Close>
                  </div>
                  {description && (
                    <DialogPrimitive.Description className="text-sm text-muted-foreground">
                      {description}
                    </DialogPrimitive.Description>
                  )}
                </div>
                <div className="py-2">{children}</div>
                {footer && (
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                    {footer}
                  </div>
                )}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
};