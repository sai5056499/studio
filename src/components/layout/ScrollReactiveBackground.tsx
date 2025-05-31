
"use client";

import { useEffect, useCallback } from 'react';

const ScrollReactiveBackground = () => {
  const handleScroll = useCallback(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.documentElement) {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // If content height is less than or equal to viewport height, no scrollbar, so set to 0%
      if (scrollHeight <= clientHeight) {
        document.documentElement.style.setProperty('--scroll-bg-pos-x', '0%');
        return;
      }

      // Calculate scroll percentage from 0 to 1
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
      
      // Map scroll percentage (0-1) to a background-position-x percentage (0% to 100%)
      const bgPosX = scrollPercentage * 100; 
      document.documentElement.style.setProperty('--scroll-bg-pos-x', `${bgPosX}%`);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initial call to set position based on initial scroll (e.g. on refresh or if already scrolled)
      handleScroll(); 
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      // Also listen for resize, as scrollHeight might change
      window.addEventListener('resize', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [handleScroll]);

  return null; // This component does not render anything itself
};

export default ScrollReactiveBackground;
