import {
  createCategory,
  createUser,
  createProduct,
  deleteCategory,
  deleteProduct,
  deleteUser,
  ensureStore,
  getAllCategories,
  getAllUsers,
  getProductById,
  getProductsSortedByPrice,
  searchProductsByName,
  updateCategory,
  updateProduct,
  getCategoryById,
  getUserById,
  getUserOrders,
  updateOrderStatus,
  updateUser,
} from './store';
import type { Category, Product, UserPayload } from './store';

export const API_BASE_URL = 'local://pediloo';

type JsonRecord = Record<string, unknown>;

function readBody(options?: RequestInit): JsonRecord {
  if (!options?.body || typeof options.body !== 'string') return {};

  try {
    return JSON.parse(options.body) as JsonRecord;
  } catch {
    return {};
  }
}

function notFound(resource: string): never {
  throw new Error(`${resource} no encontrado.`);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function uploadImage(options?: RequestInit): Promise<{ url: string }> {
  if (!(options?.body instanceof FormData)) return { url: '' };

  const file = options.body.get('image');
  if (!(file instanceof File)) return { url: '' };

  return { url: await fileToDataUrl(file) };
}

function getProducts(url: URL): Product[] {
  const query = url.searchParams.get('q');
  const sort = url.searchParams.get('sort');

  if (query && query.trim()) return searchProductsByName(query);
  return getProductsSortedByPrice(sort);
}

function normalizeProductPayload(body: JsonRecord): Partial<Product> {
  const src = typeof body.src === 'string' ? body.src : typeof body.image === 'string' ? body.image : undefined;

  return {
    title: typeof body.title === 'string' ? body.title : undefined,
    description: typeof body.description === 'string' ? body.description : undefined,
    price: body.price !== undefined ? Number(body.price) : undefined,
    src,
    category: typeof body.category === 'string' ? body.category : undefined,
    isTopSeller: Boolean(body.isTopSeller),
    stock: body.stock !== undefined ? Number(body.stock) : undefined,
    status: typeof body.status === 'string' ? body.status as Product['status'] : undefined,
  };
}

function normalizeCategoryPayload(body: JsonRecord): Partial<Category> {
  return {
    name: typeof body.name === 'string' ? body.name : undefined,
    icon: typeof body.icon === 'string' ? body.icon : undefined,
    type: body.type === 'main' || body.type === 'other' ? body.type : undefined,
  };
}

function normalizeUserPayload(body: JsonRecord): UserPayload {
  return {
    firstName: typeof body.firstName === 'string' ? body.firstName : undefined,
    lastName: typeof body.lastName === 'string' ? body.lastName : undefined,
    email: typeof body.email === 'string' ? body.email : undefined,
    password: typeof body.password === 'string' ? body.password : undefined,
    confirmPassword: typeof body.confirmPassword === 'string' ? body.confirmPassword : undefined,
    adminFlag: typeof body.adminFlag === 'boolean' ? body.adminFlag : undefined,
  };
}

/**
 * Adapter local con la misma forma que la API REST original.
 * Mantiene tienda y dashboard persistiendo dentro del navegador.
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  ensureStore();

  const method = (options?.method || 'GET').toUpperCase();
  const url = new URL(endpoint, 'http://local');
  const [, resource, id] = url.pathname.split('/');

  if (resource === 'upload' && method === 'POST') {
    return uploadImage(options) as Promise<T>;
  }

  if (resource === 'products') {
    if (method === 'GET' && !id) return getProducts(url) as T;
    if (method === 'GET' && id) return (getProductById(id) || notFound('Producto')) as T;
    if (method === 'POST') return createProduct(normalizeProductPayload(readBody(options))) as T;
    if (method === 'PUT' && id) return (updateProduct(id, normalizeProductPayload(readBody(options))) || notFound('Producto')) as T;
    if (method === 'DELETE' && id) {
      if (!deleteProduct(id)) notFound('Producto');
      return {} as T;
    }
  }

  if (resource === 'categories') {
    if (method === 'GET' && !id) return getAllCategories() as T;
    if (method === 'GET' && id) return (getCategoryById(id) || notFound('Categoría')) as T;
    if (method === 'POST') return createCategory(normalizeCategoryPayload(readBody(options))) as T;
    if (method === 'PUT' && id) return (updateCategory(id, normalizeCategoryPayload(readBody(options))) || notFound('Categoría')) as T;
    if (method === 'DELETE' && id) {
      if (!deleteCategory(id)) notFound('Categoría');
      return {} as T;
    }
  }

  if (resource === 'users') {
    if (method === 'GET' && !id) return getAllUsers() as T;
    if (method === 'GET' && id) return (getUserById(id) || notFound('Usuario')) as T;
    if (method === 'POST') return await createUser(normalizeUserPayload(readBody(options))) as T;
    if (method === 'PUT' && id) return (await updateUser(id, normalizeUserPayload(readBody(options))) || notFound('Usuario')) as T;
    if (method === 'DELETE' && id) {
      if (!deleteUser(id)) notFound('Usuario');
      return {} as T;
    }
  }

  if (resource === 'orders') {
    if (method === 'GET' && !id) return getUserOrders() as T;
    if (method === 'PUT' && id) return (updateOrderStatus(id, readBody(options).status) || notFound('Orden')) as T;
  }

  throw new Error(`Endpoint local no implementado: ${method} ${endpoint}`);
}
