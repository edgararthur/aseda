import { toast } from 'sonner';
import { PostgrestError } from '@supabase/supabase-js';

// Enhanced error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Error codes
export const ERROR_CODES = {
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD: 'DUPLICATE_RECORD',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_RANGE: 'INVALID_RANGE',
  
  // Business logic errors
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  DUPLICATE_INVOICE_NUMBER: 'DUPLICATE_INVOICE_NUMBER',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  BALANCE_MISMATCH: 'BALANCE_MISMATCH',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

// Error messages
const ERROR_MESSAGES = {
  [ERROR_CODES.DATABASE_ERROR]: 'A database error occurred. Please try again.',
  [ERROR_CODES.PERMISSION_DENIED]: 'You do not have permission to perform this action.',
  [ERROR_CODES.RECORD_NOT_FOUND]: 'The requested record was not found.',
  [ERROR_CODES.DUPLICATE_RECORD]: 'A record with this information already exists.',
  [ERROR_CODES.CONSTRAINT_VIOLATION]: 'This action violates data constraints.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check the form data and try again.',
  [ERROR_CODES.REQUIRED_FIELD]: 'This field is required.',
  [ERROR_CODES.INVALID_FORMAT]: 'The format of this field is invalid.',
  [ERROR_CODES.INVALID_RANGE]: 'The value is outside the allowed range.',
  [ERROR_CODES.INSUFFICIENT_STOCK]: 'Insufficient stock available.',
  [ERROR_CODES.DUPLICATE_INVOICE_NUMBER]: 'An invoice with this number already exists.',
  [ERROR_CODES.INVALID_DATE_RANGE]: 'Invalid date range selected.',
  [ERROR_CODES.BALANCE_MISMATCH]: 'Debits and credits must be equal.',
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection error. Please check your internet connection.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  [ERROR_CODES.UNAUTHORIZED]: 'You must be logged in to perform this action.',
  [ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
};

// Error handler class
export class ErrorHandler {
  static createError(code: string, message?: string, details?: any): AppError {
    return {
      code,
      message: message || ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
      details,
      timestamp: new Date()
    };
  }

  static handleSupabaseError(error: PostgrestError): AppError {
    console.error('Supabase error:', error);

    // Map common Supabase errors to our error codes
    switch (error.code) {
      case '23505': // unique_violation
        return this.createError(ERROR_CODES.DUPLICATE_RECORD, 'This record already exists.');
      case '23503': // foreign_key_violation
        return this.createError(ERROR_CODES.CONSTRAINT_VIOLATION, 'This action violates referential integrity.');
      case '42501': // insufficient_privilege
        return this.createError(ERROR_CODES.PERMISSION_DENIED);
      case 'PGRST116': // no rows returned
        return this.createError(ERROR_CODES.RECORD_NOT_FOUND);
      default:
        return this.createError(ERROR_CODES.DATABASE_ERROR, error.message, error);
    }
  }

  static handleNetworkError(error: any): AppError {
    if (error.name === 'AbortError') {
      return this.createError(ERROR_CODES.TIMEOUT_ERROR);
    }
    if (error.message?.includes('Failed to fetch')) {
      return this.createError(ERROR_CODES.NETWORK_ERROR);
    }
    return this.createError(ERROR_CODES.NETWORK_ERROR, error.message);
  }

  static handleError(error: any): AppError {
    if (error.code && error.message) {
      // Already an AppError
      return error;
    }

    if (error.code && typeof error.code === 'string') {
      // Supabase PostgrestError
      return this.handleSupabaseError(error);
    }

    if (error.name === 'TypeError' || error.name === 'NetworkError') {
      return this.handleNetworkError(error);
    }

    // Generic error
    return this.createError(ERROR_CODES.UNKNOWN_ERROR, error.message || 'An unexpected error occurred', error);
  }

  static showError(error: AppError | any, customMessage?: string) {
    const appError = error.code ? error : this.handleError(error);
    const message = customMessage || appError.message;
    
    toast.error(message, {
      description: appError.details?.hint || undefined,
      duration: 5000
    });

    // Log error for debugging
    console.error('Application Error:', {
      code: appError.code,
      message: appError.message,
      details: appError.details,
      timestamp: appError.timestamp
    });
  }

  static showSuccess(message: string, description?: string) {
    toast.success(message, {
      description,
      duration: 3000
    });
  }

  static showWarning(message: string, description?: string) {
    toast.warning(message, {
      description,
      duration: 4000
    });
  }

  static showInfo(message: string, description?: string) {
    toast.info(message, {
      description,
      duration: 3000
    });
  }
}

// Validation utilities
export class Validator {
  static required(value: any, fieldName: string): AppError | null {
    if (value === null || value === undefined || value === '') {
      return ErrorHandler.createError(ERROR_CODES.REQUIRED_FIELD, `${fieldName} is required.`);
    }
    return null;
  }

  static email(value: string, fieldName: string = 'Email'): AppError | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return ErrorHandler.createError(ERROR_CODES.INVALID_FORMAT, `${fieldName} must be a valid email address.`);
    }
    return null;
  }

  static minLength(value: string, min: number, fieldName: string): AppError | null {
    if (value && value.length < min) {
      return ErrorHandler.createError(ERROR_CODES.INVALID_RANGE, `${fieldName} must be at least ${min} characters long.`);
    }
    return null;
  }

  static maxLength(value: string, max: number, fieldName: string): AppError | null {
    if (value && value.length > max) {
      return ErrorHandler.createError(ERROR_CODES.INVALID_RANGE, `${fieldName} must be no more than ${max} characters long.`);
    }
    return null;
  }

  static number(value: any, fieldName: string): AppError | null {
    if (value !== null && value !== undefined && value !== '' && (isNaN(value) || isNaN(parseFloat(value)))) {
      return ErrorHandler.createError(ERROR_CODES.INVALID_FORMAT, `${fieldName} must be a valid number.`);
    }
    return null;
  }

  static positiveNumber(value: number, fieldName: string): AppError | null {
    const numberError = this.number(value, fieldName);
    if (numberError) return numberError;
    
    if (value !== null && value !== undefined && parseFloat(value.toString()) < 0) {
      return ErrorHandler.createError(ERROR_CODES.INVALID_RANGE, `${fieldName} must be a positive number.`);
    }
    return null;
  }

  static dateRange(startDate: Date, endDate: Date): AppError | null {
    if (startDate && endDate && startDate > endDate) {
      return ErrorHandler.createError(ERROR_CODES.INVALID_DATE_RANGE, 'Start date must be before end date.');
    }
    return null;
  }

  static validateForm(validations: Array<() => AppError | null>): AppError[] {
    const errors: AppError[] = [];
    validations.forEach(validation => {
      const error = validation();
      if (error) errors.push(error);
    });
    return errors;
  }
}

// Transaction wrapper for error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const appError = ErrorHandler.handleError(error);
    if (context) {
      console.error(`Error in ${context}:`, appError);
    }
    return { data: null, error: appError };
  }
}