import { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'puyoko_blocked_dates';

export const useBlockedDates = () => {
  const [blockedDates, setBlockedDates] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        try {
          setBlockedDates(e.newValue ? JSON.parse(e.newValue) : []);
        } catch (err) {
          console.error('Failed to parse blocked dates from storage event', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleDate = (dateStr: string) => {
    setBlockedDates(prev => {
      const next = prev.includes(dateStr)
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save blocked dates to localStorage', e);
      }
      return next;
    });
  };

  const isDateBlocked = (dateStr: string) => {
    return blockedDates.includes(dateStr);
  };

  return {
    blockedDates,
    toggleDate,
    isDateBlocked,
  };
};
