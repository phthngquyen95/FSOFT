import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// localStorage utility with event notification
export const localStorageWithEvents = {
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
    // Dispatch custom event to notify listeners in same tab
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key, value } }));
  },

  getItem: (key: string) => {
    return localStorage.getItem(key);
  },

  removeItem: (key: string) => {
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key, value: null } }));
  },
};
