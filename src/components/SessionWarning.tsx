'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, LogOut } from 'lucide-react';

interface SessionWarningProps {
  timeRemaining: number;
  onLogout: () => void;
  onExtend: () => void;
}

export function SessionWarning({ timeRemaining, onLogout, onExtend }: SessionWarningProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [minutes, setMinutes] = useState(Math.ceil(timeRemaining / 60000));

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutes((prev) => Math.max(0, prev - 1));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleExtend = () => {
    setIsVisible(false);
    onExtend();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 dark:bg-yellow-900/20 border-b-2 border-yellow-400 dark:border-yellow-600 p-4"
          dir="rtl"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-200">
                  تنبيه انتهاء الجلسة
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  ستنتهي جلستك خلال {minutes} دقيقة من عدم النشاط
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExtend}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                متابعة الجلسة
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut size={18} />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
