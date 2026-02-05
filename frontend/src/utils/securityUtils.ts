/**
 * Security Utilities for XSS Prevention and Input Sanitization
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param text - The text to escape
 * @returns Escaped text safe for HTML rendering
 */
export const escapeHtml = (text: string): string => {
  if (!text) return "";

  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Removes HTML tags from a string
 * @param html - The HTML string to strip
 * @returns Plain text without HTML tags
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return "";

  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

/**
 * Sanitizes user input by removing potentially dangerous characters
 * Use this for form inputs, search queries, etc.
 * @param input - The user input to sanitize
 * @returns Sanitized input
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return "";

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframe tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove event handlers (onclick, onerror, etc.)
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .trim();
};

/**
 * Validates and sanitizes a URL
 * @param url - The URL to validate
 * @returns Sanitized URL or empty string if invalid
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return "";

  const trimmed = url.trim();

  // Only allow http, https, and relative URLs
  const validProtocols = ["http:", "https:", ""];

  try {
    // Handle relative URLs
    if (trimmed.startsWith("/")) {
      return trimmed;
    }

    const parsedUrl = new URL(trimmed);

    if (!validProtocols.includes(parsedUrl.protocol)) {
      return "";
    }

    return parsedUrl.href;
  } catch (error) {
    // If URL parsing fails, check if it's a relative URL
    if (trimmed.startsWith("/")) {
      return trimmed;
    }
    return "";
  }
};

/**
 * Validates an email address
 * @param email - The email to validate
 * @returns True if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Sanitizes a file name to prevent path traversal attacks
 * @param fileName - The file name to sanitize
 * @returns Sanitized file name
 */
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName) return "";

  return fileName
    .replace(/[<>:"/\\|?*]/g, "") // Remove invalid characters
    .replace(/\.\./g, "") // Remove parent directory references
    .trim();
};

/**
 * Validates file size
 * @param fileSize - Size in bytes
 * @param maxSizeMB - Maximum allowed size in MB (default: 10MB)
 * @returns True if file size is within limit
 */
export const isValidFileSize = (fileSize: number, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
};

/**
 * Validates file type by extension
 * @param fileName - The file name
 * @param allowedExtensions - Array of allowed extensions (e.g., ['jpg', 'png', 'pdf'])
 * @returns True if file type is allowed
 */
export const isValidFileType = (fileName: string, allowedExtensions: string[]): boolean => {
  if (!fileName || !allowedExtensions || allowedExtensions.length === 0) {
    return false;
  }

  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) return false;

  return allowedExtensions.map(ext => ext.toLowerCase()).includes(extension);
};

/**
 * Sanitizes a number input (prevents NaN, Infinity, etc.)
 * @param value - The value to sanitize
 * @param defaultValue - Default value if input is invalid (default: 0)
 * @returns Sanitized number
 */
export const sanitizeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);

  if (isNaN(num) || !isFinite(num)) {
    return defaultValue;
  }

  return num;
};

/**
 * Sanitizes a string to prevent SQL injection in queries
 * Note: This is a basic sanitizer. Always use parameterized queries on the backend!
 * @param input - The input to sanitize
 * @returns Sanitized string
 */
export const sanitizeSqlInput = (input: string): string => {
  if (!input) return "";

  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/--/g, "") // Remove SQL comments
    .replace(/;/g, "") // Remove statement terminators
    .trim();
};

/**
 * Validates that a string only contains alphanumeric characters and specified special chars
 * @param input - The input to validate
 * @param allowedSpecialChars - String of allowed special characters (default: "-_")
 * @returns True if valid
 */
export const isAlphanumeric = (input: string, allowedSpecialChars: string = "-_"): boolean => {
  if (!input) return false;

  const escapedSpecialChars = allowedSpecialChars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^[a-zA-Z0-9${escapedSpecialChars}]+$`);

  return regex.test(input);
};

/**
 * Truncates a string to a maximum length
 * @param text - The text to truncate
 * @param maxLength - Maximum length (default: 255)
 * @param suffix - Suffix to add when truncated (default: "...")
 * @returns Truncated text
 */
export const truncateString = (text: string, maxLength: number = 255, suffix: string = "..."): string => {
  if (!text) return "";

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Sanitizes object properties recursively
 * Useful for sanitizing API request/response data
 * @param obj - The object to sanitize
 * @returns Sanitized object
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  const sanitized: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (typeof value === "string") {
        sanitized[key] = sanitizeInput(value);
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized as T;
};

/**
 * Creates a Content Security Policy compliant inline style
 * @param styles - CSS styles object
 * @returns Sanitized style object
 */
export const sanitizeInlineStyles = (styles: React.CSSProperties): React.CSSProperties => {
  const sanitized: React.CSSProperties = {};

  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === "string") {
      // Remove javascript: and other dangerous protocols
      const sanitizedValue = value.replace(/javascript:/gi, "").replace(/data:/gi, "");
      sanitized[key as keyof React.CSSProperties] = sanitizedValue as any;
    } else {
      sanitized[key as keyof React.CSSProperties] = value as any;
    }
  }

  return sanitized;
};
