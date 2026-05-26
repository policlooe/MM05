import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { setAnalyticsConsent, getAnalyticsConsent } from '@/lib/analytics';

/**
 * Cookie Consent Banner for GDPR compliance
 * Shows banner if user hasn't made a choice yet
 */
export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = localStorage.getItem('analytics_consent');
    if (!hasConsent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setAnalyticsConsent(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    setAnalyticsConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-surface/95 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="container-x">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Мы используем cookies</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Мы используем аналитические cookies для улучшения работы сайта. 
                Ваши данные анонимизированы и используются только для статистики.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDecline}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-accent/5 transition-colors"
            >
              Отклонить
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors"
            >
              Принять
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
