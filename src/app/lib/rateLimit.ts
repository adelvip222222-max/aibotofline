import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

export const checkRateLimit = (
  identifier: string,
  maxAttempts: number = MAX_ATTEMPTS,
  windowSize: number = WINDOW_SIZE
): { allowed: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowSize,
    });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetTime: now + windowSize,
    };
  }

  if (entry.count < maxAttempts) {
    entry.count++;
    return {
      allowed: true,
      remaining: maxAttempts - entry.count,
      resetTime: entry.resetTime,
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetTime: entry.resetTime,
  };
};

export const createRateLimitResponse = (resetTime: number) => {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  return NextResponse.json(
    {
      error: 'محاولات تسجيل دخول كثيرة. يرجى المحاولة لاحقاً.',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
      },
    }
  );
};

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute
