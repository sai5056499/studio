
"use client";

import React from 'react';
import { Search } from 'lucide-react';

interface FaviconProps {
  url: string;
  className?: string;
}

export function Favicon({ url, className }: FaviconProps) {
  try {
    const domain = new URL(url).hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    
    return (
      <img 
        src={faviconUrl} 
        alt={`${domain} favicon`}
        className={className}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    );
  } catch {
    return <Search className={className} />;
  }
}
