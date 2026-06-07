'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const INACTIVITY_WARNING = 20 * 60 * 1000; // 20 minutes before timeout

interface SessionData {
  lastActivity: number;
  warningShown: boolean;
}

export const useSessionTimeout = () => {
  const router = useRouter();

  const updateLastActivity = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const sessionData: SessionData = {
      lastActivity: Date.now(),
      warningShown: false,
    };
    sessionStorage.setItem('sessionData', JSON.stringify(sessionData));
  }, []);

  const handleLogout = useCallback(() => {
    // Clear session storage
    sessionStorage.removeItem('sessionData');
    sessionStorage.removeItem('user');
    
    // Call logout API
    fetch('/api/auth/logout', { method: 'POST' })
      .then(() => {
        router.push('/');
      })
      .catch(() => {
        router.push('/');
      });
  }, [router]);

  const checkSessionTimeout = useCallback(() => {
    if (typeof window === 'undefined') return;

    const sessionDataStr = sessionStorage.getItem('sessionData');
    if (!sessionDataStr) {
      updateLastActivity();
      return;
    }

    try {
      const sessionData: SessionData = JSON.parse(sessionDataStr);
      const timeSinceLastActivity = Date.now() - sessionData.lastActivity;

      // Check if session has completely timed out (24 hours)
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        handleLogout();
        return;
      }

      // Warn user before timeout (after 20 minutes of inactivity)
      if (timeSinceLastActivity > INACTIVITY_WARNING && !sessionData.warningShown) {
        sessionData.warningShown = true;
        sessionStorage.setItem('sessionData', JSON.stringify(sessionData));
        
        // Emit event that can be caught by components
        window.dispatchEvent(
          new CustomEvent('sessionWarning', {
            detail: { timeRemaining: SESSION_TIMEOUT - timeSinceLastActivity },
          })
        );
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  }, [updateLastActivity, handleLogout]);

  useEffect(() => {
    // Check session on mount
    checkSessionTimeout();

    // Set up event listeners for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateLastActivity();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Check session timeout periodically
    const timeoutInterval = setInterval(checkSessionTimeout, 60000); // Check every minute

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(timeoutInterval);
    };
  }, [updateLastActivity, checkSessionTimeout]);

  return { handleLogout };
};
