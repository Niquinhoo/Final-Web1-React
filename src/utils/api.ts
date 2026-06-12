// utils/api.ts
// Funciones auxiliares para consumir la API REST del backend

export const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Realiza una petición fetch a la API del backend
 * @param endpoint Ruta del endpoint (ej: '/products')
 * @param options Opciones adicionales para fetch (método, body, headers)
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Error en la petición API: ${response.status} ${response.statusText}`);
  }

  // Si la respuesta es de eliminación y no tiene cuerpo, evitar llamar a response.json()
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
