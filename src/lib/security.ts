// Security utilities for validation and protection.
// NOTE: client-side "encryption" was removed — a key compiled into the public JS
// bundle provides zero confidentiality. Never store secrets in the browser.
import CryptoJS from 'crypto-js';

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential XSS
    .replace(/['"]/g, '') // Remove quotes
    .trim();
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special character');
  
  return { isValid: errors.length === 0, errors };
};

// Phone number validation
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
};

/**
 * @deprecated Client-side encryption with a bundled key is NOT secure.
 * These helpers are kept as no-op pass-throughs for backwards compatibility.
 * Do real encryption server-side in an edge function using Deno.env secrets.
 */
export const encryptData = (data: string): string => data;

/** @deprecated See encryptData. */
export const decryptData = (encryptedData: string): string => encryptedData;

// Rate limiting for client-side protection
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Secure session management
export const secureSession = {
  set: (key: string, data: any, expiryHours: number = 24): void => {
    const item = {
      data: encryptData(JSON.stringify(data)),
      expiry: Date.now() + (expiryHours * 60 * 60 * 1000)
    };
    sessionStorage.setItem(`secure_${key}`, JSON.stringify(item));
  },
  
  get: (key: string): any => {
    try {
      const item = sessionStorage.getItem(`secure_${key}`);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expiry) {
        sessionStorage.removeItem(`secure_${key}`);
        return null;
      }
      
      return JSON.parse(decryptData(parsed.data));
    } catch {
      return null;
    }
  },
  
  remove: (key: string): void => {
    sessionStorage.removeItem(`secure_${key}`);
  },
  
  clear: (): void => {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('secure_')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

// CSRF protection token
export const generateCSRFToken = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

// File validation
export const validateFile = (file: File, allowedTypes: string[], maxSizeMB: number = 10): { isValid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' };
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }
  
  return { isValid: true };
};

// Content Security Policy headers (for when we add SSR)
export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};