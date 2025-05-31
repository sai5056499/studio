
"use client";

import { useEffect, useCallback } from 'react';

const ScrollReactiveBackground = () => {
  const handleScroll = useCallback(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (scrollHeight <= clientHeight) { // No scrollbar or content doesn't overflow
        document.documentElement.style.setProperty('--scroll-bg-pos-x', '0%');
        return;
      }

      // Calculate scroll percentage from 0 to 1
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
      
      // Map scroll percentage (0-1) to a background-position-x percentage (0% to 100%)
      // This will be interpreted by CSS's background-position logic.
      // With a background-size of 600%, this allows panning across the oversized gradient.
      const bgPosX = scrollPercentage * 100; 
      document.documentElement.style.setProperty('--scroll-bg-pos-x', `${bgPosX}%`);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial call to set position based on initial scroll (e.g. on refresh)

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  return null; // This component does not render anything itself
};

export default ScrollReactiveBackground;
