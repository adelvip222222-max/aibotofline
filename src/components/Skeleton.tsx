'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = '',
}: SkeletonProps) {
  return (
    <motion.div
      className={`bg-gray-200 dark:bg-gray-700 ${className}`}
      style={{ width, height, borderRadius }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-3">
        <Skeleton width="40px" height="40px" borderRadius="50%" />
        <div className="flex-1 space-y-2">
          <Skeleton width="100px" height="16px" />
          <Skeleton height="60px" />
        </div>
      </div>
    </div>
  );
}

export function SessionListSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height="16px" width="80%" />
          <Skeleton height="12px" width="60%" />
        </div>
      ))}
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height="12px" width="60%" />
          <Skeleton height="24px" width="40%" />
        </div>
      ))}
    </div>
  );
}
