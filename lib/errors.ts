// Error lanzado por validaciones de entrada para manejarse como error 400 en lugar de un fallo 500 del servidor.
export class ValidationError extends Error {}