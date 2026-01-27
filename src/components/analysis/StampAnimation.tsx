import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StampAnimationProps {
  show: boolean;
  date: Date;
  onComplete?: () => void;
}

export const StampAnimation = ({ show, date, onComplete }: StampAnimationProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 3, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: -8, opacity: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 15,
          }}
          onAnimationComplete={onComplete}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <div className="relative">
            {/* Stamp Outer Border */}
            <div className="border-4 border-primary rounded-lg p-4 bg-card/90 backdrop-blur-sm shadow-2xl">
              {/* Stamp Inner Content */}
              <div className="border-2 border-primary border-dashed p-3 text-center">
                <p className="text-primary font-bold text-lg tracking-widest uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Registrado
                </p>
                <div className="my-2 border-t border-primary/50" />
                <p className="text-primary text-sm font-semibold">
                  {format(date, 'dd MMM yyyy', { locale: ptBR })}
                </p>
                <p className="text-primary/70 text-xs mt-1">
                  X1 FINANCE
                </p>
              </div>
            </div>
            
            {/* Ink splatter effect */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary/20 rounded-full blur-sm"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
