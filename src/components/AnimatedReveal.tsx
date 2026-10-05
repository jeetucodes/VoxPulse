import React, { useEffect, useRef, useState } from 'react';

interface AnimatedRevealProps {
  children: React.ReactNode;
  className?: string;
  delayClass?: 'stagger-1' | 'stagger-2' | 'stagger-3' | 'stagger-4' | 'stagger-5' | 'stagger-6' | '';
  threshold?: number;
  triggerOnce?: boolean;
}

export const AnimatedReveal: React.FC<AnimatedRevealProps> = ({
  children,
  className = '',
  delayClass = '',
  threshold = 0.12,
  triggerOnce = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If IntersectionObserver not supported, show immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce && domRef.current) {
              observer.unobserve(domRef.current);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    const currentEl = domRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [threshold, triggerOnce]);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-300 ${
        isVisible
          ? `animate-card-open ${delayClass} opacity-100`
          : 'opacity-0 translate-y-6 pointer-events-none'
      } ${className}`}
    >
      {children}
    </div>
  );
};
