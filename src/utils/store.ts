export type ProductStatus = 'Activo' | 'Stock Bajo' | 'Sin Stock';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  src: string;
  category: string;
  isTopSeller: boolean;
  stock: number;
  status: ProductStatus;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  type: 'main' | 'other';
}

export interface CartItem {
  productId: string;
  title: string;
  description: string;
  category: string;
  src: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CartDetail {
  items: CartItem[];
  summary: {
    subtotal: number;
    total: number;
    totalItems: number;
  };
}

export interface User {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  adminFlag: boolean;
  createdAt: string;
}

export interface Order {
  id: number;
  userId: number | null;
  total: number;
  createdAt: string;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
}

export interface RegisterValues {
  firstName: string;
  lastName: string;
  email: string;
}

export type RegisterErrors = Partial<Record<'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword', string>>;
export type UserPayload = Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'adminFlag'>> & {
  password?: string;
  confirmPassword?: string;
};

const PRODUCT_IMAGE_FALLBACK = '/assets/productos/proximamente.png';
const SITE_NAME = 'pediloo';
const FORBIDDEN_PASSWORD_PARTS = ['password', '1234', 'qwerty'];

const keys = {
  products: 'pediloo_products',
  categories: 'pediloo_categories',
  cart: 'pediloo_cart',
  users: 'pediloo_users',
  orders: 'pediloo_orders',
  currentUserId: 'pediloo_current_user_id',
  sessionToken: 'pediloo_session_token',
};

const seedAdminUser: User = {
  id: 1,
  name: 'Administrador Pediloo',
  firstName: 'Administrador',
  lastName: 'Pediloo',
  email: 'admin@pediloo.local',
  passwordHash: 'sha256:seed-admin-v1:fab4e98bda2d921f7b0d2644ac532eb6f20aab52f91d69b9934c4287f303c95b',
  adminFlag: true,
  createdAt: '2026-07-02T00:00:00.000Z',
};

const seedProducts: Product[] = [
  {
    id: 1,
    title: 'Burger Smash XL',
    description: 'Doble medallon de 120g de carne seleccionada, queso cheddar derretido, panceta crocante y nuestra salsa secreta en pan brioche artesanal.',
    price: 1200,
    src: '/assets/productos/hamburguesasmash.png',
    category: 'Alimentos',
    isTopSeller: true,
    stock: 50,
    status: 'Activo',
  },
  {
    id: 2,
    title: 'Pizza Napolitana',
    description: 'Masa madre de fermentacion lenta, salsa de tomates italianos, muzzarella fior di latte, ajo, y hojas de albahaca fresca.',
    price: 1500,
    src: '/assets/productos/pizzanapo.png',
    category: 'Alimentos',
    isTopSeller: true,
    stock: 30,
    status: 'Activo',
  },
  {
    id: 3,
    title: 'Combo Coca-Cola',
    description: 'Lleva 2 Coca-Colas de litro y medio bien heladas. Ideal para compartir.',
    price: 800,
    src: '/assets/productos/cocacolas.png',
    category: 'Bebidas',
    isTopSeller: false,
    stock: 10,
    status: 'Stock Bajo',
  },
  {
    id: 4,
    title: 'Chocotorta Tradicional',
    description: 'El clasico argentino. Capas de galletitas de chocolate humedecidas en cafe, intercaladas con la mas suave mezcla de dulce de leche y queso crema.',
    price: 600,
    src: '/assets/productos/chocotorta.png',
    category: 'Alimentos',
    isTopSeller: true,
    stock: 0,
    status: 'Sin Stock',
  },
  {
    id: 5,
    title: 'Whiskey Premium',
    description: 'Whiskey de malta escoces con 12 anos de anejamiento. Notas de roble, vainilla y un final suavemente ahumado.',
    price: 4500,
    src: '/assets/productos/whiskey.png',
    category: 'Bebidas',
    isTopSeller: false,
    stock: 15,
    status: 'Activo',
  },
];

const seedCategories: Category[] = [
  { id: 1, name: 'Electronica', icon: '💻', type: 'main' },
  { id: 2, name: 'Alimentos', icon: '🍔', type: 'main' },
  { id: 3, name: 'Bebidas', icon: '🥤', type: 'main' },
  { id: 4, name: 'Indumentaria', icon: '👕', type: 'main' },
  { id: 5, name: 'Juegos', icon: '🎮', type: 'other' },
  { id: 6, name: 'Automotor', icon: '🚗', type: 'other' },
  { id: 7, name: 'Hogar', icon: '🏠', type: 'other' },
  { id: 8, name: 'Otros', icon: '📦', type: 'other' },
  { id: 9, name: 'Proximamente', icon: '❓', type: 'other' },
];

export const homeBanners = [
  {
    title: 'Sabado de Hamburguesas',
    description: '2x1 en toda la linea Smash hasta las 22hs.',
    image: '/assets/banners/banner1.png',
    buttonText: 'Pedir Ahora',
  },
  {
    title: 'Noches de Pizza',
    description: 'Envio gratis en todas tus pizzas favoritas.',
    image: '/assets/banners/banner2.png',
    buttonText: 'Ver Locales',
  },
];

interface CartLine {
  productId: string;
  quantity: number;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function ensureStore() {
  // ponytail: local browser tables for the React-only delivery.
  if (!localStorage.getItem(keys.products)) writeJson(keys.products, seedProducts);
  if (!localStorage.getItem(keys.categories)) writeJson(keys.categories, seedCategories);
  if (!localStorage.getItem(keys.cart)) writeJson(keys.cart, []);
  if (!localStorage.getItem(keys.users)) {
    writeJson(keys.users, [seedAdminUser]);
  } else {
    const users = readJson<User[]>(keys.users, []).map((user) => ({
      ...user,
      adminFlag: Boolean(user.adminFlag),
    }));
    const hasAdmin = users.some((user) => user.email.toLowerCase() === seedAdminUser.email);
    const normalizedUsers = users.map((user) => (
      user.email.toLowerCase() === seedAdminUser.email
        ? { ...seedAdminUser, id: user.id, createdAt: user.createdAt || seedAdminUser.createdAt }
        : user
    ));
    writeJson(keys.users, hasAdmin ? normalizedUsers : [{ ...seedAdminUser, id: nextId(users) }, ...normalizedUsers]);
  }
  if (!localStorage.getItem(keys.orders)) writeJson(keys.orders, []);
}

function statusFromStock(stock: number): ProductStatus {
  if (stock === 0) return 'Sin Stock';
  if (stock <= 12) return 'Stock Bajo';
  return 'Activo';
}

function withFallbackImage(product: Product): Product {
  return {
    ...product,
    src: product.src || PRODUCT_IMAGE_FALLBACK,
    isTopSeller: Boolean(product.isTopSeller),
    stock: Number(product.stock ?? 20),
    status: product.status || statusFromStock(Number(product.stock ?? 20)),
  };
}

function normalizeText(value: unknown): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function nextId(items: Array<{ id: number }>): number {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

export function getAllProducts(): Product[] {
  ensureStore();
  return readJson<Product[]>(keys.products, seedProducts).map(withFallbackImage);
}

function saveProducts(products: Product[]) {
  writeJson(keys.products, products);
}

export function getSuggestedProducts(limit = 5): Product[] {
  return getAllProducts().slice(0, limit);
}

export function getTopOrderedProducts(limit = 10): Product[] {
  const products = getAllProducts();
  const topSellers = products.filter((product) => product.isTopSeller);
  const rest = products.filter((product) => !product.isTopSeller).sort(() => Math.random() - 0.5);
  return [...topSellers, ...rest].slice(0, limit);
}

export function getProductById(productId: unknown): Product | undefined {
  const id = Number(productId);
  if (!Number.isInteger(id) || id <= 0) return undefined;
  return getAllProducts().find((product) => product.id === id);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return getAllProducts()
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, limit);
}

export function getRandomProducts(limit = 4): Product[] {
  return [...getAllProducts()].sort(() => Math.random() - 0.5).slice(0, limit);
}

export function getProductsByCategory(category: unknown): Product[] {
  const normalizedCategory = normalizeText(category);
  if (!normalizedCategory) return [];
  return getAllProducts().filter((item) => normalizeText(item.category) === normalizedCategory);
}

export function getProductsSortedByPrice(sort: string | null): Product[] {
  const products = getAllProducts();
  if (sort === 'asc') return products.sort((a, b) => a.price - b.price);
  if (sort === 'desc') return products.sort((a, b) => b.price - a.price);
  return products;
}

export function searchProductsByName(query: unknown): Product[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];
  return getAllProducts().filter((product) => normalizeText(product.title).includes(normalizedQuery));
}

export function createProduct(payload: Partial<Product>): Product {
  if (!payload.title || payload.price === undefined) {
    throw new Error('Los campos "title" y "price" son obligatorios.');
  }

  const products = getAllProducts();
  const stock = payload.stock !== undefined ? Number(payload.stock) : 20;
  const product: Product = {
    id: nextId(products),
    title: String(payload.title).trim(),
    description: payload.description || '',
    price: Number(payload.price),
    src: payload.src || PRODUCT_IMAGE_FALLBACK,
    category: payload.category || 'Otros',
    isTopSeller: Boolean(payload.isTopSeller),
    stock,
    status: payload.status || statusFromStock(stock),
  };

  saveProducts([...products, product]);
  return product;
}

export function updateProduct(id: unknown, payload: Partial<Product>): Product | undefined {
  const product = getProductById(id);
  if (!product) return undefined;

  const stock = payload.stock !== undefined ? Number(payload.stock) : product.stock;
  const updated: Product = {
    ...product,
    ...payload,
    id: product.id,
    title: payload.title !== undefined ? String(payload.title).trim() : product.title,
    price: payload.price !== undefined ? Number(payload.price) : product.price,
    stock,
    status: payload.status || (payload.stock !== undefined ? statusFromStock(stock) : product.status),
    isTopSeller: payload.isTopSeller !== undefined ? Boolean(payload.isTopSeller) : product.isTopSeller,
    src: payload.src || product.src || PRODUCT_IMAGE_FALLBACK,
  };

  saveProducts(getAllProducts().map((item) => (item.id === product.id ? updated : item)));
  return updated;
}

export function deleteProduct(id: unknown): boolean {
  const product = getProductById(id);
  if (!product) return false;
  saveProducts(getAllProducts().filter((item) => item.id !== product.id));
  saveCartLines(getCartLines().filter((line) => line.productId !== String(product.id)));
  return true;
}

export function getAllCategories(): Category[] {
  ensureStore();
  return readJson<Category[]>(keys.categories, seedCategories).sort((a, b) => a.id - b.id);
}

function saveCategories(categories: Category[]) {
  writeJson(keys.categories, categories);
}

export function getCategoryById(id: unknown): Category | undefined {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) return undefined;
  return getAllCategories().find((category) => category.id === numId);
}

export function createCategory(payload: Partial<Category>): Category {
  if (!payload.name || String(payload.name).trim() === '') {
    throw new Error('El campo "name" es obligatorio.');
  }

  const categories = getAllCategories();
  const category: Category = {
    id: nextId(categories),
    name: String(payload.name).trim(),
    icon: payload.icon || '📦',
    type: payload.type || 'other',
  };

  saveCategories([...categories, category]);
  return category;
}

export function updateCategory(id: unknown, payload: Partial<Category>): Category | undefined {
  const category = getCategoryById(id);
  if (!category) return undefined;

  const updated: Category = {
    ...category,
    ...payload,
    id: category.id,
    name: payload.name !== undefined ? String(payload.name).trim() : category.name,
    icon: payload.icon !== undefined ? payload.icon : category.icon,
    type: payload.type !== undefined ? payload.type : category.type,
  };

  saveCategories(getAllCategories().map((item) => (item.id === category.id ? updated : item)));
  return updated;
}

export function deleteCategory(id: unknown): boolean {
  const category = getCategoryById(id);
  if (!category) return false;
  saveCategories(getAllCategories().filter((item) => item.id !== category.id));
  return true;
}

function getCartLines(): CartLine[] {
  ensureStore();
  return readJson<CartLine[]>(keys.cart, []);
}

function saveCartLines(lines: CartLine[]) {
  writeJson(keys.cart, lines);
}

function buildCartItem(line: CartLine): CartItem | null {
  const product = getProductById(line.productId);
  if (!product) return null;

  const quantity = Number(line.quantity) || 0;
  const unitPrice = product.price;

  return {
    productId: String(product.id),
    title: product.title,
    description: product.description,
    category: product.category,
    src: product.src,
    quantity,
    unitPrice,
    subtotal: unitPrice * quantity,
  };
}

export function getCartDetail(): CartDetail {
  const items = getCartLines().map(buildCartItem).filter((item): item is CartItem => Boolean(item));
  const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return {
    items,
    summary: {
      subtotal,
      total: subtotal,
      totalItems,
    },
  };
}

export function addProductToCart(productId: unknown): boolean {
  const product = getProductById(productId);
  if (!product || product.stock <= 0) return false;

  const cart = getCartLines();
  const id = String(product.id);
  const existing = cart.find((item) => item.productId === id);

  if (existing) existing.quantity += 1;
  else cart.push({ productId: id, quantity: 1 });

  saveCartLines(cart);
  return true;
}

export function updateProductQuantity(productId: unknown, delta: number): boolean {
  const cart = getCartLines();
  const id = String(productId);
  const index = cart.findIndex((item) => item.productId === id);
  if (index === -1) return false;

  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);

  saveCartLines(cart);
  return true;
}

export function removeProductFromCart(productId: unknown) {
  saveCartLines(getCartLines().filter((item) => item.productId !== String(productId)));
}

export function clearCart() {
  saveCartLines([]);
}

function getUsers(): User[] {
  ensureStore();
  return readJson<User[]>(keys.users, []);
}

function saveUsers(users: User[]) {
  writeJson(keys.users, users);
}

function getOrders(): Order[] {
  ensureStore();
  return readJson<Order[]>(keys.orders, []);
}

function saveOrders(orders: Order[]) {
  writeJson(keys.orders, orders);
}

function legacyHashPassword(value: string): string {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return String(hash >>> 0);
}

function randomToken(): string {
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) return legacyHashPassword(value);

  const encoded = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(value: string, salt = randomToken()): Promise<string> {
  return `sha256:${salt}:${await sha256(`${salt}:${value}`)}`;
}

async function passwordMatches(user: User, password: string): Promise<boolean> {
  const [algorithm, salt, digest] = user.passwordHash.split(':');

  if (algorithm === 'sha256' && salt && digest) {
    return await sha256(`${salt}:${password}`) === digest;
  }

  return user.passwordHash === legacyHashPassword(password);
}

function startSession(userId: number) {
  localStorage.setItem(keys.currentUserId, String(userId));
  localStorage.setItem(keys.sessionToken, randomToken());
}

function hasTrimmedSpaces(value: string): boolean {
  return value !== value.trim();
}

export function validateRegisterForm(formData: {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}): { isValid: boolean; errors: RegisterErrors; values: RegisterValues } {
  const rawValues = {
    firstName: formData.firstName || '',
    lastName: formData.lastName || '',
    email: formData.email || '',
    password: formData.password || '',
    confirmPassword: formData.confirmPassword || '',
  };

  const values = {
    firstName: rawValues.firstName.trim(),
    lastName: rawValues.lastName.trim(),
    email: rawValues.email.trim(),
  };
  const errors: RegisterErrors = {};

  if (!rawValues.firstName.trim()) errors.firstName = 'Ingresa tu nombre.';
  else if (hasTrimmedSpaces(rawValues.firstName)) errors.firstName = 'El nombre no puede empezar ni terminar con espacios.';

  if (!rawValues.lastName.trim()) errors.lastName = 'Ingresa tu apellido.';
  else if (hasTrimmedSpaces(rawValues.lastName)) errors.lastName = 'El apellido no puede empezar ni terminar con espacios.';

  if (!rawValues.email.trim()) errors.email = 'Ingresa tu email.';
  else if (hasTrimmedSpaces(rawValues.email)) errors.email = 'El email no puede empezar ni terminar con espacios.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Ingresa un email valido.';

  if (!rawValues.password) errors.password = 'Ingresa una contrasena.';
  else if (hasTrimmedSpaces(rawValues.password)) errors.password = 'La contrasena no puede empezar ni terminar con espacios.';
  else if (rawValues.password.length < 8) errors.password = 'La contrasena debe tener al menos 8 caracteres.';
  else if (!/[A-Za-z]/.test(rawValues.password)) errors.password = 'La contrasena debe incluir al menos una letra.';
  else if (!/\d/.test(rawValues.password)) errors.password = 'La contrasena debe incluir al menos un numero.';
  else if (!/[!@#$%^&*(),.?":{}|<>_-]/.test(rawValues.password)) errors.password = 'La contrasena debe incluir al menos un caracter especial.';
  else {
    const normalizedPassword = rawValues.password.toLowerCase();
    const forbiddenParts = [
      ...FORBIDDEN_PASSWORD_PARTS,
      SITE_NAME,
      values.firstName.toLowerCase(),
      values.lastName.toLowerCase(),
      values.email.toLowerCase(),
    ].filter(Boolean);

    if (forbiddenParts.some((part) => normalizedPassword.includes(part))) {
      errors.password = 'La contrasena contiene una cadena no permitida.';
    }
  }

  if (!rawValues.confirmPassword) errors.confirmPassword = 'Repite tu contrasena.';
  else if (rawValues.confirmPassword !== rawValues.password) errors.confirmPassword = 'Las contrasenas no coinciden.';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values,
  };
}

export async function registerUser(formData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<{ user?: User; errors?: RegisterErrors }> {
  const validation = validateRegisterForm(formData);
  if (!validation.isValid) return { errors: validation.errors };

  const users = getUsers();
  if (users.some((user) => user.email.toLowerCase() === validation.values.email.toLowerCase())) {
    return { errors: { email: 'Ya existe un usuario con este email.' } };
  }

  const user: User = {
    id: nextId(users),
    name: `${validation.values.firstName} ${validation.values.lastName}`,
    firstName: validation.values.firstName,
    lastName: validation.values.lastName,
    email: validation.values.email,
    passwordHash: await hashPassword(formData.password),
    adminFlag: false,
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, user]);
  startSession(user.id);
  return { user };
}

export async function loginUser(email: string, password: string): Promise<boolean> {
  const user = getUsers().find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !(await passwordMatches(user, password))) return false;

  if (!user.passwordHash.startsWith('sha256:')) {
    const migratedHash = await hashPassword(password);
    saveUsers(getUsers().map((item) => (
      item.id === user.id ? { ...item, passwordHash: migratedHash } : item
    )));
  }

  startSession(user.id);
  return true;
}

export function getCurrentUser(): User | null {
  const currentUserId = Number(localStorage.getItem(keys.currentUserId));
  if (!Number.isInteger(currentUserId)) return null;
  const user = getUsers().find((item) => item.id === currentUserId) || null;
  if (user && !localStorage.getItem(keys.sessionToken)) startSession(user.id);
  return user;
}

export function logoutUser() {
  localStorage.removeItem(keys.currentUserId);
  localStorage.removeItem(keys.sessionToken);
}

export function getAllUsers(): User[] {
  return getUsers().sort((a, b) => a.id - b.id);
}

export function getUserById(id: unknown): User | undefined {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) return undefined;
  return getUsers().find((user) => user.id === numId);
}

function validateAdminUserPayload(payload: UserPayload, currentUserId?: number) {
  const users = getUsers();
  const firstName = String(payload.firstName || '').trim();
  const lastName = String(payload.lastName || '').trim();
  const email = String(payload.email || '').trim();

  if (!firstName) throw new Error('El nombre es obligatorio.');
  if (!lastName) throw new Error('El apellido es obligatorio.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('El email es inválido.');
  if (users.some((user) => user.id !== currentUserId && user.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Ya existe un usuario con ese email.');
  }

  if (payload.password || payload.confirmPassword) {
    if ((payload.password || '').length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
    if (payload.password !== payload.confirmPassword) throw new Error('Las contraseñas no coinciden.');
  }

  return { firstName, lastName, email };
}

export async function createUser(payload: UserPayload): Promise<User> {
  if (!payload.password) throw new Error('La contraseña es obligatoria.');

  const values = validateAdminUserPayload(payload);
  const users = getUsers();
  const user: User = {
    id: nextId(users),
    name: `${values.firstName} ${values.lastName}`,
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    passwordHash: await hashPassword(payload.password),
    adminFlag: Boolean(payload.adminFlag),
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, user]);
  return user;
}

export async function updateUser(id: unknown, payload: UserPayload): Promise<User | undefined> {
  const user = getUserById(id);
  if (!user) return undefined;

  const values = validateAdminUserPayload(
    {
      firstName: payload.firstName ?? user.firstName,
      lastName: payload.lastName ?? user.lastName,
      email: payload.email ?? user.email,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
    },
    user.id,
  );
  const adminFlag = payload.adminFlag ?? user.adminFlag;

  if (user.adminFlag && !adminFlag && getUsers().filter((item) => item.adminFlag).length <= 1) {
    throw new Error('Debe quedar al menos un administrador.');
  }

  const updated: User = {
    ...user,
    name: `${values.firstName} ${values.lastName}`,
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    adminFlag,
    passwordHash: payload.password ? await hashPassword(payload.password) : user.passwordHash,
  };

  saveUsers(getUsers().map((item) => (item.id === user.id ? updated : item)));
  return updated;
}

export function deleteUser(id: unknown): boolean {
  const user = getUserById(id);
  if (!user) return false;
  if (user.adminFlag && getUsers().filter((item) => item.adminFlag).length <= 1) return false;

  saveUsers(getUsers().filter((item) => item.id !== user.id));

  if (localStorage.getItem(keys.currentUserId) === String(user.id)) {
    logoutUser();
  }

  return true;
}

export function getUserOrders(userId?: number): Order[] {
  const orders = getOrders();
  return userId ? orders.filter((order) => order.userId === userId) : orders;
}

export function createOrderFromCart(userId: number | null): Order | undefined {
  const cart = getCartDetail();
  if (cart.items.length === 0) return undefined;

  const orders = getOrders();
  const order: Order = {
    id: nextId(orders),
    userId,
    total: cart.summary.total,
    createdAt: new Date().toISOString(),
    items: cart.items.map((item) => ({
      productId: Number(item.productId),
      quantity: item.quantity,
      price: item.unitPrice,
    })),
  };

  saveOrders([...orders, order]);
  clearCart();
  return order;
}

export function resetLocalData() {
  writeJson(keys.products, seedProducts);
  writeJson(keys.categories, seedCategories);
  writeJson(keys.cart, []);
  writeJson(keys.users, [seedAdminUser]);
  writeJson(keys.orders, []);
}
