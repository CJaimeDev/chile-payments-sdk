import { ValidationError } from '../types/errors';

// Validar que un valor no sea nulo o vacío
export function validateRequired(value: any, fieldName: string): void {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName} is required`);
  }
}

// Validar que un número sea positivo
export function validatePositiveNumber(value: number, fieldName: string): void {
  if (typeof value !== 'number' || value <= 0) {
    throw new ValidationError(`${fieldName} must be a positive number`);
  }
}

// Validar que sea una URL válida
export function validateUrl(url: string, fieldName: string): void {
  try {
    new URL(url);
  } catch {
    throw new ValidationError(`${fieldName} must be a valid URL`);
  }
}

// Validar email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar RUT chileno (formato básico)
export function validateRut(rut: string): boolean {
  const rutRegex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/;
  return rutRegex.test(rut);
}