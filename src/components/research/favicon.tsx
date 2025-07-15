
"use client";

import { Globe } from 'lucide-react';
import Image from 'next/image';

const domainToIconMap: Record<string, string> = {
  'github.com': '/icons/github.svg',
  'reddit.com': '/icons/reddit.svg',
  'medium.com': '/icons/medium.svg',
  'youtube.com': '/icons/youtube.svg',
  'linkedin.com': '/icons/linkedin.svg',
  'wikipedia.org': '/icons/wikipedia.svg',
  'default': '/icons/default.svg'
};

const getDomainIcon = (domain: string): string => {
  for (const key in domainToIconMap) {
    if (domain.includes(key)) {
      return domainToIconMap[key];
    }
  }
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
};

const Favicon = ({ domain }: { domain: string }) => {
  const iconSrc = getDomainIcon(domain);

  return (
     <Image
        src={iconSrc}
        alt={`${domain} favicon`}
        width={16}
        height={16}
        className="h-4 w-4"
        unoptimized // Necessary for external favicon services
        onError={(e) => {
          // Fallback if the Google favicon service fails or returns an error
          e.currentTarget.src = domainToIconMap['default'];
          e.currentTarget.onerror = null;
        }}
    />
  );
};

export default Favicon;
