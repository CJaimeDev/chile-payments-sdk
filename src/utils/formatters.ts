// Formatear monto a entero (las APIs chilenas usan montos sin decimales)
export function formatAmount(amount: number): number {
  return Math.round(amount);
}

// Formatear fecha a ISO string
export function formatDate(date: Date): string {
  return date.toISOString();
}

// Parsear fecha desde string
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

// Generar ID único simple
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Limpiar objeto de valores undefined/null
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
}