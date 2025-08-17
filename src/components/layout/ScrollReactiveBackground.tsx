
"use client";

// This component is currently not used to achieve the cleaner Devias UI look,
// but is kept in case the scroll-reactive background is desired again in the future.
// The effect has been disabled in globals.css.

import { useEffect, useCallback } from 'react';

const ScrollReactiveBackground = () => {
  const handleScroll = useCallback(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.documentElement) {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (scrollHeight <= clientHeight) {
        document.documentElement.style.setProperty('--scroll-bg-pos-x', '0%');
        return;
      }

      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
      
      const bgPosX = scrollPercentage * 100; 
      document.documentElement.style.setProperty('--scroll-bg-pos-x', `${bgPosX}%`);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      handleScroll(); 
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [handleScroll]);

  return null;
};

export default ScrollReactiveBackground;
