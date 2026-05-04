import { useEffect } from 'react';

export const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) return;

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalPadding = window.getComputedStyle(document.body).paddingRight;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollBarWidth}px`;

    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.paddingRight = originalPadding;
    };
  }, [isLocked]);
};
