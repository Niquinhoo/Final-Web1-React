import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  ShoppingCart,
  User as UserIcon,
  Search,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Folder,
  LogOut,
  History,
  CheckCircle,
  HelpCircle,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import {
  addProductToCart,
  clearCart,
  createOrderFromCart,
  ensureStore,
  getAllCategories,
  getAllProducts,
  getCartDetail,
  getCurrentUser,
  getProductsByCategory,
  getProductsSortedByPrice,
  getRelatedProducts,
  getSuggestedProducts,
  getTopOrderedProducts,
  getUserOrders,
  homeBanners,
  loginUser,
  logoutUser,
  registerUser,
  removeProductFromCart,
  searchProductsByName,
  updateProductQuantity,
} from './utils/store';
import type { CartDetail, Order, OrderDiscount, Product, RegisterErrors, User, Category } from './utils/store';
import { apiFetch } from './utils/api';
import { useTheme } from './components/_md3/hooks';

// Admin dashboard component imports
import { DialogProvider } from './components/molecules/Dialog/DialogProvider';
import { SnackbarProvider } from './components/molecules/Snackbar/Snackbar';
import { CircularProgress } from './components/atoms';
import Home from './pages/Home/Home';
import ProductsList from './pages/Products/ProductsList/ProductsList';
import ProductView from './pages/Products/ProductView/ProductView';
import CategoriesList from './pages/Categories/CategoriesList/CategoriesList';
import CategoryView from './pages/Categories/CategoryView/CategoryView';
import OrdersKanban from './pages/Orders/OrdersKanban/OrdersKanban';
import UsersList from './pages/Users/UsersList/UsersList';
import UserView from './pages/Users/UserView/UserView';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound/NotFound';
import Sidebar from './components/organisms/Sidebar/Sidebar';
import Header from './components/organisms/Header/Header';
import Cubes from './components/Cubes';
import CircularText from './components/CircularText';
import DotCursor from './components/DotCursor';
import ClickSpark from './components/ClickSpark';
import BorderGlow from './components/BorderGlow';
import StaggeredMenu from './components/StaggeredMenu';
import { ImageZoomModal } from './components/molecules';
import './App.css';

interface AppState {
  cart: CartDetail;
  user: User | null;
  refresh: () => void;
}

const AppStateContext = createContext<AppState | null>(null);

function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('AppStateContext no inicializado');
  return value;
}

function useStoredDiscount() {
  const [discount, setDiscount] = useState<StoredDiscount | null>(() => {
    try {
      const saved = localStorage.getItem(ORDER_DISCOUNT_KEY);
      return saved ? JSON.parse(saved) as StoredDiscount : null;
    } catch {
      return null;
    }
  });

  function saveDiscount(nextDiscount: StoredDiscount | null) {
    setDiscount(nextDiscount);
    if (nextDiscount) localStorage.setItem(ORDER_DISCOUNT_KEY, JSON.stringify(nextDiscount));
    else localStorage.removeItem(ORDER_DISCOUNT_KEY);
  }

  return { discount, saveDiscount };
}

function formatPrice(value: number): string {
  return `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function categoryPath(name: string): string {
  return `/category/${encodeURIComponent(name)}`;
}

const ORDER_DISCOUNT_KEY = 'pediloo_order_discount';
const DISCOUNT_CODES = {
  descuento10: { code: 'DESCUENTO10', percent: 10 },
};

type StoredDiscount = typeof DISCOUNT_CODES.descuento10;

function calculateDiscountAmount(cart: CartDetail, discount: StoredDiscount | null): number {
  return discount ? (cart.summary.subtotal * discount.percent) / 100 : 0;
}

function highlightMatch(text: string, query: string) {
  const index = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (index === -1) return text;

  const end = index + query.trim().length;
  return (
    <>
      {text.slice(0, index)}
      <strong>{text.slice(index, end)}</strong>
      {text.slice(end)}
    </>
  );
}

function StoreProvider({ children }: { children: ReactNode }) {
  const [, setVersion] = useState(0);
  const refresh = () => setVersion((current) => current + 1);
  const value = {
    cart: getCartDetail(),
    user: getCurrentUser(),
    refresh,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

// Framer motion page transition wrapper
const PageWrapper = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
    className="page-wrapper"
  >
    {children}
  </motion.div>
);

// STOREFRONT LAYOUT AND WRAPPER
function Layout() {
  const { cart, user } = useAppState();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [isHovered, setIsHovered] = useState(false);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const prevTotalItemsRef = useRef(cart.summary.totalItems);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cart.summary.totalItems > prevTotalItemsRef.current) {
      setShowCartPreview(true);
      const timer = setTimeout(() => {
        setShowCartPreview(false);
      }, 3000);
      prevTotalItemsRef.current = cart.summary.totalItems;
      return () => clearTimeout(timer);
    }
    prevTotalItemsRef.current = cart.summary.totalItems;
  }, [cart.summary.totalItems]);

  const isOpen = showCartPreview || isHovered;
  const trimmedQuery = query.trim();
  const showSearchResults = searchExpanded && searchFocused && trimmedQuery.length > 0;
  const showMobileSearchResults = searchFocused && trimmedQuery.length > 0;

  useEffect(() => {
    if (!trimmedQuery) return;

    const timer = setTimeout(async () => {
      try {
        const data = await apiFetch<Product[]>(`/products?q=${encodeURIComponent(trimmedQuery)}`);
        setSearchResults(data.slice(0, 5));
      } catch (error) {
        console.error('Error al buscar productos:', error);
        setSearchResults(searchProductsByName(trimmedQuery).slice(0, 5));
      } finally {
        setSearchLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [trimmedQuery]);

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setQuery(value);
    setSearchLoading(Boolean(value.trim()));
    if (!value.trim()) setSearchResults([]);
  }

  function openSearch() {
    setSearchExpanded(true);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }

  function closeSearch() {
    setSearchExpanded(false);
    setSearchFocused(false);
    setQuery('');
    setSearchResults([]);
    setSearchLoading(false);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!searchExpanded) {
      openSearch();
      return;
    }

    if (trimmedQuery) {
      setSearchFocused(false);
      setSearchExpanded(false);
      navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
    }
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <main className="store-main no-layout">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </AnimatePresence>
      </main>
    );
  }

  return (
    <div className="store-shell">
      <header className="store-header">
        <button
          type="button"
          className="store-mobile-menu-btn"
          onClick={() => setIsMobileNavOpen(true)}
          aria-label="Abrir navegación"
          aria-expanded={isMobileNavOpen}
          aria-controls="store-mobile-navigation"
        >
          <span>Menú</span>
          <span className="store-mobile-menu-icon" aria-hidden="true" />
        </button>

        <Link to="/home" className="brand-link">
          <CircularText
            text="Pediloo*Web-1-Final*"
            onHover="goBonkers"
            spinDuration={20}
            className="brand-logo-circular"
          />
          <span>pediloo</span>
        </Link>

        <nav className="store-nav" aria-label="Navegacion principal">
          <NavLink to="/home">Inicio</NavLink>
          <NavLink to="/products">Productos</NavLink>
          <NavLink to="/categories">Categorias</NavLink>
        </nav>

        <form
          className={`header-search${searchExpanded ? ' is-expanded' : ''}`}
          onSubmit={handleSearch}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null) && !trimmedQuery) {
              setSearchExpanded(false);
              setSearchFocused(false);
            }
          }}
        >
          <button
            type={searchExpanded ? 'submit' : 'button'}
            className="search-icon-button"
            onClick={() => {
              if (!searchExpanded) openSearch();
            }}
            aria-label={searchExpanded ? 'Buscar productos' : 'Abrir búsqueda'}
          >
            <Search size={18} className="search-icon" />
          </button>
          <input
            ref={searchInputRef}
            tabIndex={searchExpanded ? 0 : -1}
            value={query}
            onChange={handleQueryChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
          />
          {searchExpanded && (
            <button
              type="button"
              className="search-close-button"
              onClick={(e) => {
                e.stopPropagation();
                closeSearch();
              }}
              aria-label="Cerrar búsqueda"
            >
              <X size={18} />
            </button>
          )}
          {showSearchResults && (
            <div className="search-results-dropdown">
              {searchLoading ? (
                <p>Buscando...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="search-result-item"
                    onClick={closeSearch}
                  >
                    <img src={product.src} alt={product.title} />
                    <span>{highlightMatch(product.title, trimmedQuery)}</span>
                    <small>{formatPrice(product.price)}</small>
                  </Link>
                ))
              ) : (
                <p>No hay coincidencias.</p>
              )}
            </div>
          )}
        </form>

        <div className="header-actions">
          <button 
            type="button" 
            className="icon-link theme-toggle-btn" 
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
            style={{ border: 0, background: 'transparent', cursor: 'pointer', display: 'inline-flex' }}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <Link to={user ? '/account' : '/login'} className="icon-link" aria-label={user ? 'Ver cuenta' : 'Iniciar sesion'}>
            <UserIcon size={22} />
          </Link>
          <div 
            className="cart-preview-wrapper"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Link to="/cart" className="cart-link" aria-label="Ver carrito">
              <ShoppingCart size={22} />
              {cart.summary.totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="cart-badge"
                >
                  {cart.summary.totalItems}
                </motion.span>
              )}
            </Link>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="cart-preview-dropdown"
                >
                  {cart.items.length === 0 ? (
                    <div className="cart-preview-empty">
                      <p>Tu carrito está vacío</p>
                    </div>
                  ) : (
                    <>
                      <div className="cart-preview-items">
                        {cart.items.map((item) => (
                          <div key={item.productId} className="cart-preview-item">
                            <img src={item.src} alt={item.title} />
                            <div className="cart-preview-item-info">
                              <span className="cart-preview-item-title">{item.title}</span>
                              <span className="cart-preview-item-meta">
                                {item.quantity} x {formatPrice(item.unitPrice)}
                              </span>
                            </div>
                            <span className="cart-preview-item-subtotal">
                              {formatPrice(item.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="cart-preview-footer">
                        <div className="cart-preview-total">
                          <span>Subtotal:</span>
                          <strong>{formatPrice(cart.summary.subtotal)}</strong>
                        </div>
                        <div className="cart-preview-actions">
                          <Link to="/cart" className="preview-cart-btn" onClick={() => setIsHovered(false)}>
                            Ver Carrito
                          </Link>
                          <Link to="/checkout" className="preview-checkout-btn" onClick={() => setIsHovered(false)}>
                            Comprar
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {user?.adminFlag && (
            <Link to="/admin/dashboard" className="admin-shortcut-btn" title="Panel Administrador">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>dashboard</span>
              Admin
            </Link>
          )}
        </div>
      </header>
      
      <StaggeredMenu open={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)}>
              <div className="drawer-header">
                <div className="staggered-menu-reveal-wrap">
                  <Link to="/home" className="brand-link staggered-menu-reveal" onClick={() => setIsMobileNavOpen(false)}>
                    <CircularText
                      text="Pediloo*Web-1-Final*"
                      onHover="goBonkers"
                      spinDuration={20}
                      className="brand-logo-circular"
                    />
                    <span>pediloo</span>
                  </Link>
                </div>
              </div>

              <div className="drawer-search-wrapper">
                <form
                  className="drawer-search"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (trimmedQuery) {
                      closeSearch();
                      setIsMobileNavOpen(false);
                      navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
                    }
                  }}
                >
                  <Search size={18} className="search-icon" />
                  <input
                    value={query}
                    onChange={handleQueryChange}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    placeholder="Buscar productos..."
                    aria-label="Buscar productos"
                  />
                </form>
                {showMobileSearchResults && (
                  <div className="search-results-dropdown mobile-search-dropdown">
                    {searchLoading ? (
                      <p>Buscando...</p>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((product) => (
                        <Link
                          key={product.id}
                          to={`/products/${product.id}`}
                          className="search-result-item"
                          onClick={() => {
                            closeSearch();
                            setIsMobileNavOpen(false);
                          }}
                        >
                          <img src={product.src} alt={product.title} />
                          <span>{highlightMatch(product.title, trimmedQuery)}</span>
                          <small>{formatPrice(product.price)}</small>
                        </Link>
                      ))
                    ) : (
                      <p>No hay coincidencias.</p>
                    )}
                  </div>
                )}
              </div>

              <nav className="drawer-nav">
                <div className="staggered-menu-reveal-wrap"><NavLink className="staggered-menu-reveal" to="/home" onClick={() => setIsMobileNavOpen(false)}>Inicio</NavLink></div>
                <div className="staggered-menu-reveal-wrap"><NavLink className="staggered-menu-reveal" to="/products" onClick={() => setIsMobileNavOpen(false)}>Productos</NavLink></div>
                <div className="staggered-menu-reveal-wrap"><NavLink className="staggered-menu-reveal" to="/categories" onClick={() => setIsMobileNavOpen(false)}>Categorías</NavLink></div>
              </nav>

              <div className="drawer-footer">
                <div className="drawer-theme-toggle">
                  <span>Tema</span>
                  <button 
                    type="button" 
                    className="icon-link theme-toggle-btn" 
                    onClick={toggleTheme}
                    style={{ border: 0, background: 'transparent', cursor: 'pointer', display: 'inline-flex' }}
                  >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                </div>
                {user ? (
                  <div className="drawer-user-info">
                    <p>Usuario: <strong>{user.name}</strong></p>
                    <div className="drawer-actions-row">
                      <Link to="/account" className="drawer-btn" onClick={() => setIsMobileNavOpen(false)}>
                        Mi Cuenta
                      </Link>
                      {user.adminFlag && (
                        <Link to="/admin/dashboard" className="drawer-btn admin-btn" onClick={() => setIsMobileNavOpen(false)}>
                          Admin
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="drawer-auth-actions">
                    <Link to="/login" className="drawer-btn primary" onClick={() => setIsMobileNavOpen(false)}>
                      Iniciar Sesión
                    </Link>
                  </div>
                )}
              </div>
      </StaggeredMenu>

      <main className="store-main">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/producto/:id" element={<ProductDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/category/:name" element={<CategoryPage />} />
            <Route path="/categories/:name" element={<CategoryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/profile" element={<Navigate to="/account" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

// STOREFRONT HOME PAGE
function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [topOrderedProducts, setTopOrderedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const mainBanner = homeBanners[0];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, products] = await Promise.all([
          apiFetch<Category[]>('/categories'),
          apiFetch<Product[]>('/products'),
        ]);

        setCategories(cats);
        // "Los mas pedidos": top sellers first, then random
        const topSellers = products.filter((p) => p.isTopSeller);
        const rest = products.filter((p) => !p.isTopSeller);
        setTopOrderedProducts([...topSellers, ...rest].slice(0, 10));

        // "Sugeridos para vos": first few items
        setSuggestedProducts(products.slice(0, 5));
      } catch (error) {
        console.error('Error al cargar datos en la Home:', error);
        // Fallback to local mock data
        setCategories(getAllCategories());
        setSuggestedProducts(getSuggestedProducts(5));
        setTopOrderedProducts(getTopOrderedProducts(10));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="store-loading-screen">
        <CircularProgress size={48} />
        <p style={{ marginTop: '16px', color: '#59655f' }}>Cargando tienda...</p>
      </div>
    );
  }

  return (
    <PageWrapper>
      <section className="hero-section" style={{ backgroundImage: `linear-gradient(90deg, rgba(16, 24, 40, .84), rgba(16, 24, 40, .18)), url(${mainBanner.image})` }}>
        <div className="hero-copy">
          <span className="eyebrow">Delivery simple, comida real</span>
          <h1>{mainBanner.title}</h1>
          <p>{mainBanner.description}</p>
          <Link to="/products" className="primary-btn">
            {mainBanner.buttonText}
          </Link>
        </div>
      </section>

      <CategoryStrip categories={categories} />

      <ProductSection title="Más pedidos" products={topOrderedProducts} />
      <BannerGrid />
      <ProductSection title="Sugeridos para vos" products={suggestedProducts} />
    </PageWrapper>
  );
}

function CategoryStrip({ categories }: { categories: Category[] }) {
  const [expanded, setExpanded] = useState(false);
  const mainCategories = categories.filter((c) => c.type === 'main' || !c.type);
  const otherCategories = categories.filter((c) => c.type === 'other');
  
  const displayed = expanded ? categories : mainCategories;

  return (
    <section className="category-strip-container">
      <div className="category-strip" aria-label="Categorias">
        {displayed.map((category) => (
          <Link key={category.id} to={categoryPath(category.name)} className="category-pill">
            <span className="category-pill-icon">{category.icon || '🍔'}</span>
            <span className="category-pill-name">{category.name}</span>
          </Link>
        ))}
        {otherCategories.length > 0 && (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="category-pill toggle-pill"
          >
            <span className="category-pill-icon">{expanded ? '-' : '+'}</span>
            <span className="category-pill-name">{expanded ? 'Ver menos' : 'Ver más'}</span>
          </button>
        )}
      </div>
    </section>
  );
}

function BannerGrid() {
  return (
    <section className="banner-grid" aria-label="Promociones">
      {homeBanners.map((banner) => (
        <article key={banner.title} className="promo-banner" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.66), rgba(0,0,0,.08)), url(${banner.image})` }}>
          <h2>{banner.title}</h2>
          <p>{banner.description}</p>
          <Link to="/products">{banner.buttonText}</Link>
        </article>
      ))}
    </section>
  );
}

function ProductSection({ title, products }: { title: string; products: Product[] }) {
  return (
    <section className="page-section">
      <div className="section-heading">
        <h2>{title}</h2>
        <Link to="/products" className="view-all-link">
          Ver todos <ArrowRight size={16} />
        </Link>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { refresh } = useAppState();
  const { theme } = useTheme();
  const disabled = product.stock <= 0;
  const isDarkMode = theme === 'dark';

  function handleAdd() {
    if (addProductToCart(product.id)) refresh();
  }

  const cardContent = (
    <>
      <Link to={`/products/${product.id}`} className="product-image-link">
        <img src={product.src} alt={product.title} loading="lazy" />
        {product.isTopSeller && <span className="badge">Top ventas</span>}
      </Link>
      <div className="product-card-body">
        <Link to={`/products/${product.id}`} className="product-title">
          {product.title}
        </Link>
        <p className="product-desc">{product.description}</p>
        <div className="product-meta">
          <span className="category-tag">{product.category}</span>
          <strong className="product-price-label">{formatPrice(product.price)}</strong>
        </div>
        <button className="secondary-btn" onClick={handleAdd} disabled={disabled}>
          <Plus size={16} />
          {disabled ? 'Sin stock' : 'Agregar'}
        </button>
      </div>
    </>
  );

  return (
    <motion.article 
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`product-card ${isDarkMode ? 'glow-active' : ''}`}
    >
      {isDarkMode ? (
        <BorderGlow
          edgeSensitivity={30}
          glowColor="160 80 50"
          backgroundColor="#1a1e1c"
          borderRadius={12}
          glowRadius={40}
          glowIntensity={1.0}
          coneSpread={25}
          animated={false}
          colors={['#3bb393', '#2a6053', '#c75d3a']}
        >
          {cardContent}
        </BorderGlow>
      ) : (
        cardContent
      )}
    </motion.article>
  );
}

// STOREFRONT PRODUCTS PAGE
function ProductsPage() {
  const [searchParams] = useSearchParams();
  const sort = searchParams.get('sort');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const queryParam = sort ? `?sort=${sort}` : '';
        const data = await apiFetch<Product[]>(`/products${queryParam}`);
        setProducts(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setProducts(getProductsSortedByPrice(sort));
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [sort]);

  return (
    <PageWrapper>
      <section className="page-section">
        <div className="products-toolbar">
          <div>
            <span className="eyebrow">Catálogo</span>
            <h1>Productos</h1>
          </div>
          <div className="sort-actions" aria-label="Ordenar productos">
            <Link className={!sort ? 'active' : ''} to="/products">
              Sin orden
            </Link>
            <Link className={sort === 'asc' ? 'active' : ''} to="/products?sort=asc">
              Precio menor
            </Link>
            <Link className={sort === 'desc' ? 'active' : ''} to="/products?sort=desc">
              Precio mayor
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="store-loading-spinner">
            <CircularProgress size={36} />
            <p>Cargando productos...</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </PageWrapper>
  );
}

// STOREFRONT PRODUCT DETAIL
function ProductDetailPage() {
  const { id } = useParams();
  const { refresh } = useAppState();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    async function loadProductDetail() {
      try {
        setLoading(true);
        const data = await apiFetch<Product>(`/products/${id}`);
        setProduct(data);
        const allProducts = await apiFetch<Product[]>('/products');
        const relatedItems = allProducts.filter(
          (p) => p.category === data.category && String(p.id) !== String(data.id)
        );
        setRelated(relatedItems.slice(0, 4));
      } catch (error) {
        console.error('Error al cargar detalle de producto:', error);
        const localProduct = getAllProducts().find((item) => String(item.id) === String(id));
        if (localProduct) {
          setProduct(localProduct);
          setRelated(getRelatedProducts(localProduct));
        }
      } finally {
        setLoading(false);
      }
    }
    loadProductDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="store-loading-spinner">
        <CircularProgress size={36} />
        <p>Cargando detalle del producto...</p>
      </div>
    );
  }

  if (!product) return <ProductNotFoundPage />;

  const disabled = product.stock <= 0;

  function handleAdd() {
    if (addProductToCart(product!.id)) {
      refresh();
    }
  }

  return (
    <PageWrapper>
      <section className="product-detail">
        <div className="product-gallery clickable-gallery" onClick={() => setIsZoomOpen(true)}>
          <img src={product.src} alt={product.title} />
          <div className="gallery-hover-overlay">
            <span className="material-symbols-outlined">zoom_in</span>
            <span>Click para ampliar</span>
          </div>
        </div>
        <div className="product-info">
          <Link to="/products" className="back-link">
            <ArrowLeft size={16} />
            Volver a productos
          </Link>
          <span className="eyebrow">{product.category}</span>
          <h1>{product.title}</h1>
          <p>{product.description}</p>
          <strong className="detail-price">{formatPrice(product.price)}</strong>
          <div className={`stock-label ${disabled ? 'danger' : ''}`}>
            {product.status} · {product.stock} disponibles
          </div>
          <button className="primary-btn" onClick={handleAdd} disabled={disabled}>
            <ShoppingCart size={18} />
            {disabled ? 'Producto sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      </section>

      {related.length > 0 && <ProductSection title="Productos relacionados" products={related} />}

      <ImageZoomModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        src={product.src}
        alt={product.title}
      />
    </PageWrapper>
  );
}

function ProductNotFoundPage() {
  return (
    <section className="page-section empty-state">
      <HelpCircle size={48} className="empty-state-icon" />
      <h1>Producto no encontrado</h1>
      <p>No pudimos encontrar el producto solicitado. Puedes seguir buscando otros deliciosos platos.</p>
      <Link to="/products" className="primary-btn">
        Ver catálogo
      </Link>
    </section>
  );
}

// STOREFRONT CATEGORIES PAGE
function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const data = await apiFetch<Category[]>('/categories');
        setCategories(data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        setCategories(getAllCategories());
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <PageWrapper>
      <section className="page-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Departamentos</span>
            <h1>Categorías</h1>
          </div>
        </div>
        
        {loading ? (
          <div className="store-loading-spinner">
            <CircularProgress size={36} />
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <Link key={category.id} to={categoryPath(category.name)} className="category-card">
                <span className="category-icon">{category.icon || '🍔'}</span>
                <strong>{category.name}</strong>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageWrapper>
  );
}

// STOREFRONT CATEGORY DETAIL PAGE
function CategoryPage() {
  const { name } = useParams();
  const categoryName = decodeURIComponent(name || '').replace(/[-_]+/g, ' ').trim();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryProducts() {
      try {
        setLoading(true);
        const allProducts = await apiFetch<Product[]>('/products');
        const filtered = allProducts.filter(
          (p) => p.category.toLowerCase() === categoryName.toLowerCase()
        );
        setProducts(filtered);
      } catch (error) {
        console.error('Error al cargar productos de categoría:', error);
        setProducts(getProductsByCategory(categoryName));
      } finally {
        setLoading(false);
      }
    }
    loadCategoryProducts();
  }, [categoryName]);

  return (
    <PageWrapper>
      <section className="page-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Categoría</span>
            <h1>{categoryName || 'Categoría'}</h1>
          </div>
          <Link to="/categories">Ver categorías</Link>
        </div>
        
        {loading ? (
          <div className="store-loading-spinner">
            <CircularProgress size={36} />
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState title="No hay productos en esta categoría" text="Probá con otra categoría o volvé al catálogo completo." />
        )}
      </section>
    </PageWrapper>
  );
}

// STOREFRONT SEARCH RESULT
function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSearchResults() {
      try {
        setLoading(true);
        const queryParam = query ? `?q=${encodeURIComponent(query)}` : '';
        const data = await apiFetch<Product[]>(`/products${queryParam}`);
        setProducts(data);
      } catch (error) {
        console.error('Error al buscar productos:', error);
        setProducts(searchProductsByName(query));
      } finally {
        setLoading(false);
      }
    }
    loadSearchResults();
  }, [query]);

  return (
    <PageWrapper>
      <section className="page-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Búsqueda</span>
            <h1>Resultados para "{query}"</h1>
          </div>
        </div>
        
        {loading ? (
          <div className="store-loading-spinner">
            <CircularProgress size={36} />
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState title="Sin resultados" text="No hay productos que coincidan con esa búsqueda." />
        )}
      </section>
    </PageWrapper>
  );
}

// STOREFRONT CART PAGE
function CartPage() {
  const { cart, refresh } = useAppState();
  const { discount, saveDiscount } = useStoredDiscount();

  function clear() {
    clearCart();
    saveDiscount(null);
    refresh();
  }

  return (
    <PageWrapper>
      <section className="cart-layout">
        <div className="cart-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Tu pedido</span>
              <h1>Carrito</h1>
            </div>
            {cart.items.length > 0 && (
              <button className="link-button danger" onClick={clear}>
                <Trash2 size={16} />
                Vaciar carrito
              </button>
            )}
          </div>

          {cart.items.length === 0 ? (
            <EmptyState title="El carrito está vacío" text="Agregá productos para iniciar tu pedido." />
          ) : (
            <div className="cart-list">
              <AnimatePresence>
                {cart.items.map((item) => (
                  <motion.article 
                    key={item.productId} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="cart-item"
                  >
                    <img src={item.src} alt={item.title} />
                    <div className="cart-item-info">
                      <Link to={`/products/${item.productId}`} className="cart-item-title">{item.title}</Link>
                      <p className="cart-item-category">{item.category}</p>
                      <strong className="cart-item-price">{formatPrice(item.unitPrice)}</strong>
                    </div>
                    <div className="quantity-control">
                      <button onClick={() => { updateProductQuantity(item.productId, -1); refresh(); }} aria-label={`Quitar ${item.title}`}>
                        <Minus size={12} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => { updateProductQuantity(item.productId, 1); refresh(); }} aria-label={`Agregar ${item.title}`}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <strong className="cart-item-subtotal">{formatPrice(item.subtotal)}</strong>
                    <button className="icon-link danger-action" onClick={() => { removeProductFromCart(item.productId); refresh(); }} aria-label={`Eliminar ${item.title}`}>
                      <Trash2 size={18} />
                    </button>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <OrderSummary cart={cart} discount={discount} onDiscountChange={saveDiscount} />
      </section>
    </PageWrapper>
  );
}

function OrderSummary({
  cart,
  discount,
  onDiscountChange,
}: {
  cart: CartDetail;
  discount: StoredDiscount | null;
  onDiscountChange: (discount: StoredDiscount | null) => void;
}) {
  const [coupon, setCoupon] = useState(discount?.code || '');

  function applyDiscount(e: FormEvent) {
    e.preventDefault();
    const nextDiscount = DISCOUNT_CODES[coupon.trim().toLowerCase() as keyof typeof DISCOUNT_CODES];
    if (nextDiscount) {
      onDiscountChange(nextDiscount);
      setCoupon(nextDiscount.code);
    } else {
      alert('Cupón inválido. Prueba con "descuento10".');
    }
  }

  const discountAmount = calculateDiscountAmount(cart, discount);
  const finalTotal = cart.summary.total - discountAmount;

  return (
    <aside className="order-summary">
      <h2>Resumen de cuenta</h2>
      <div className="summary-badge">
        <span>{cart.summary.totalItems} producto(s)</span>
      </div>
      
      {cart.summary.totalItems > 0 && (
        <form onSubmit={applyDiscount} className="discount-form">
          <input 
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)} 
            placeholder="Código de descuento" 
            className="discount-input"
          />
          <button type="submit" className="apply-discount-btn">Aplicar</button>
        </form>
      )}

      <div className="summary-totals">
        <div className="summary-row">
          <span>Subtotal</span>
          <strong>{formatPrice(cart.summary.subtotal)}</strong>
        </div>
        {discount && (
          <div className="summary-row discount-row">
            <span>{discount.code} ({discount.percent}%)</span>
            <strong>-{formatPrice(discountAmount)}</strong>
            <button type="button" className="discount-clear-btn" onClick={() => onDiscountChange(null)}>
              Quitar
            </button>
          </div>
        )}
        <div className="summary-row">
          <span>Envío</span>
          <strong>Gratis</strong>
        </div>
        <div className="summary-divider"></div>
        <div className="summary-row total">
          <span>Total</span>
          <strong>{formatPrice(finalTotal)}</strong>
        </div>
      </div>
      
      <div className="summary-actions">
        <Link className={`primary-btn ${cart.items.length === 0 ? 'disabled' : ''}`} to={cart.items.length === 0 ? '/products' : '/checkout'}>
          {cart.items.length === 0 ? 'Ver productos' : 'Continuar Compra'}
        </Link>
      </div>
    </aside>
  );
}

// STOREFRONT CHECKOUT PAGE
function CheckoutPage() {
  const { cart, user, refresh } = useAppState();
  const [order, setOrder] = useState<Order | null>(null);
  const { discount, saveDiscount } = useStoredDiscount();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const orderDiscount: OrderDiscount | null = discount ? {
      ...discount,
      amount: calculateDiscountAmount(cart, discount),
    } : null;
    const createdOrder = createOrderFromCart(user?.id || null, orderDiscount);
    if (createdOrder) {
      setOrder(createdOrder);
      saveDiscount(null);
      refresh();
    }
  }

  if (order) {
    return (
      <section className="page-section empty-state">
        <CheckCircle size={56} className="success-icon" />
        <h1>Pedido confirmado</h1>
        <p>Orden #{order.id} registrada con éxito por {formatPrice(order.total)}.</p>
        <Link to="/products" className="primary-btn">
          Seguir comprando
        </Link>
      </section>
    );
  }

  return (
    <PageWrapper>
      <section className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <span className="eyebrow">Checkout</span>
          <h1>Datos de entrega</h1>
          <label>
            Nombre completo
            <input required defaultValue={user?.name || ''} />
          </label>
          <label>
            Email
            <input required type="email" defaultValue={user?.email || ''} />
          </label>
          <label>
            Dirección
            <input required placeholder="Calle, número, piso" />
          </label>
          <label>
            Notas
            <textarea rows={4} placeholder="Indicaciones para la entrega" />
          </label>
          <button className="primary-btn" disabled={cart.items.length === 0}>
            Confirmar pedido
          </button>
        </form>
        <OrderSummary cart={cart} discount={discount} onDiscountChange={saveDiscount} />
      </section>
    </PageWrapper>
  );
}

function AuthVisualPanel() {
  return (
    <section className="auth-visual hidden md:block md:w-[60%] relative overflow-hidden">
      <div className="auth-cubes-stage absolute inset-0" aria-hidden="true">
        <Cubes
          gridSize={9}
          maxAngle={75}
          radius={3}
          cellGap={4}
          borderStyle="1px solid rgba(205, 232, 220, 0.58)"
          faceColor="#18211e"
          shadow="0 0 8px rgba(0, 0, 0, 0.18)"
          autoAnimate
          rippleOnClick
          rippleColor="#d7efe4"
          rippleSpeed={1.8}
        />
      </div>

      <div className="absolute inset-0 flex flex-col justify-center px-margin-desktop pointer-events-none">
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CircularText
            text="Pediloo*Web-1-Final*"
            onHover="goBonkers"
            spinDuration={20}
            className="auth-logo-circular"
          />
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary-fixed text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
            <h1 className="font-headline-lg text-headline-lg text-white">Pediloo</h1>
          </div>
          <p className="font-headline-md text-headline-md text-white/90 max-w-md leading-tight">
            Comida deliciosa al alcance de tus dedos.
          </p>
          <div className="mt-12 h-1 w-24 bg-primary-fixed rounded-full"></div>
        </div>
      </div>
    </section>
  );
}

// STOREFRONT AUTHENTICATION
function LoginPage() {
  const { refresh } = useAppState();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');

    if (!(await loginUser(email, password))) {
      setError('Email o contraseña incorrectos.');
      return;
    }

    refresh();
    navigate('/account');
  }

  return (
    <PageWrapper>
      <main className="auth-page-layout flex-grow flex flex-col md:flex-row w-full bg-surface text-on-surface">
        <AuthVisualPanel />

        {/* Right Side: Login Form (40%) */}
        <section className="w-full md:w-[40%] bg-surface flex flex-col justify-center items-center px-margin-mobile md:px-margin-desktop py-12 relative z-10 shadow-[-20px_0px_60px_rgba(0,0,0,0.05)]">
          {/* Mobile Logo */}
          <div className="md:hidden mb-12 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
            <span className="font-headline-md text-headline-md text-primary font-semibold">Pediloo</span>
          </div>

          <div className="w-full max-w-md animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <header className="mb-10">
              <h2 className="font-headline-md text-headline-md text-primary mb-2">Iniciar sesión</h2>
              <p className="font-body-lg text-body-lg text-secondary">Accede a tu cuenta pediloo para disfrutar de lo mejor.</p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <p className="text-error font-body-sm mb-4" style={{ color: 'var(--md-sys-color-error)' }}>{error}</p>}
              
              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="email">Email</label>
                <input 
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body-lg text-body-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" 
                  id="email" 
                  name="email" 
                  placeholder="tu@email.com" 
                  type="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="password">Contraseña</label>
                  <a className="font-label-sm text-label-sm text-primary hover:underline transition-all" href="#">¿Olvidaste tu contraseña?</a>
                </div>
                <input 
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body-lg text-body-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type="password"
                  required
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" id="remember" type="checkbox"/>
                <label className="font-body-sm text-body-sm text-on-surface-variant" htmlFor="remember">Recordarme en este dispositivo</label>
              </div>

              <button className="w-full py-4 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all transform hover:-translate-y-0.5 active:translate-y-0" type="submit">
                Entrar
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-outline-variant text-center">
              <p className="font-body-sm text-body-sm text-secondary">
                ¿No tienes cuenta? 
                <Link className="font-label-md text-label-md text-primary hover:underline ml-1" to="/register"> Regístrate</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}

function RegisterPage() {
  const { refresh } = useAppState();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<RegisterErrors>({});

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await registerUser(values);
    if (result.errors) {
      setErrors(result.errors);
      return;
    }
    refresh();
    navigate('/account');
  }

  return (
    <PageWrapper>
      <main className="auth-page-layout flex-grow flex flex-col md:flex-row w-full bg-surface text-on-surface">
        <AuthVisualPanel />

        <section className="w-full md:w-[40%] bg-surface flex flex-col justify-center items-center px-margin-mobile md:px-margin-desktop py-12 relative z-10 shadow-[-20px_0px_60px_rgba(0,0,0,0.05)]">
          <div className="md:hidden mb-12 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
            <span className="font-headline-md text-headline-md text-primary font-semibold">Pediloo</span>
          </div>

          <div className="w-full max-w-md animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <header className="mb-10">
              <h2 className="font-headline-md text-headline-md text-primary mb-2">Crear cuenta</h2>
              <p className="font-body-lg text-body-lg text-secondary">Regístrate para guardar tus pedidos.</p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <Field name="firstName" label="Nombre" value={values.firstName} error={errors.firstName} onChange={handleChange} placeholder="Nombre" />
              <Field name="lastName" label="Apellido" value={values.lastName} error={errors.lastName} onChange={handleChange} placeholder="Apellido" />
              <Field name="email" label="Email" type="email" value={values.email} error={errors.email} onChange={handleChange} placeholder="nombre@correo.com" />
              <Field name="password" label="Contraseña" type="password" value={values.password} error={errors.password} onChange={handleChange} placeholder="Al menos 8 caracteres" />
              <Field name="confirmPassword" label="Repetir contraseña" type="password" value={values.confirmPassword} error={errors.confirmPassword} onChange={handleChange} placeholder="Repetir contraseña" />
              <button className="w-full py-4 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-lg transition-all transform" type="submit">
                Crear cuenta
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-outline-variant text-center">
              <p className="font-body-sm text-body-sm text-secondary">
                ¿Ya tienes cuenta?
                <Link className="font-label-md text-label-md text-primary hover:underline ml-1" to="/login"> Inicia sesión</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </PageWrapper>
  );
}

function Field({
  name,
  label,
  type = 'text',
  value,
  error,
  onChange,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor={name}>{label}</label>
      <input
        className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body-lg text-body-lg transition-all outline-none"
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        required
      />
      {error && <small id={`${name}-error`} className="form-error">{error}</small>}
    </div>
  );
}

// STOREFRONT ACCOUNT PAGE
function AccountPage() {
  const { user, refresh } = useAppState();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!user) {
    return (
      <section className="page-section empty-state">
        <UserIcon size={48} className="empty-state-icon" />
        <h1>Tu cuenta</h1>
        <p>Iniciá sesión o registrate para ver tus compras.</p>
        <div className="inline-actions">
          <Link className="primary-btn" to="/login">
            Iniciar sesión
          </Link>
          <Link className="secondary-btn" to="/register">
            Crear cuenta
          </Link>
        </div>
      </section>
    );
  }

  const orders = getUserOrders(user.id);

  function logout() {
    logoutUser();
    refresh();
    navigate('/home');
  }

  return (
    <PageWrapper>
      <section className="account-page">
        <div className="account-hero">
          <img src="/assets/user-icon.png" alt="User Icon" />
          <div className="account-hero-details">
            <span className="eyebrow">Cuenta</span>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
          <button className="secondary-btn logout-btn" onClick={logout}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>

        <div className="account-grid">
          <article className="stat-box">
            <History size={24} />
            <strong>{orders.length}</strong>
            <p>Pedidos registrados</p>
          </article>
          <article className="stat-box">
            <ShoppingBag size={24} />
            <strong>{formatPrice(orders.reduce((total, orderItem) => total + orderItem.total, 0))}</strong>
            <p>Total comprado</p>
          </article>
        </div>

        <div className="orders-list">
          <h2>Historial de pedidos</h2>
          {orders.length === 0 ? (
            <p className="no-orders-text">No hay pedidos registrados todavía.</p>
          ) : (
            <div className="orders-table">
              {orders.map((orderItem) => (
                <button key={orderItem.id} type="button" className="order-row" onClick={() => setSelectedOrder(orderItem)}>
                  <div className="order-number-date">
                    <strong>Orden #{orderItem.id}</strong>
                    <span>{new Date(orderItem.createdAt).toLocaleString('es-AR')}</span>
                  </div>
                  <span className="order-items-count">{orderItem.items.length} productos</span>
                  <strong className="order-total">{formatPrice(orderItem.total)}</strong>
                </button>
              ))}
            </div>
          )}
        </div>
        <AnimatePresence>
          {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </AnimatePresence>
      </section>
    </PageWrapper>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const products = getAllProducts();
  const subtotal = order.subtotal ?? order.items.reduce((total, item) => total + item.price * item.quantity, 0);
  const discountAmount = order.discountAmount ?? 0;

  return (
    <motion.div className="order-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.article
        className="order-modal"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        <div className="order-modal-header">
          <div>
            <span className="eyebrow">Pedido tomado</span>
            <h2 id="order-modal-title">Orden #{order.id}</h2>
            <p>{new Date(order.createdAt).toLocaleString('es-AR')}</p>
          </div>
          <button type="button" className="icon-link" onClick={onClose} aria-label="Cerrar detalle">
            <X size={20} />
          </button>
        </div>

        <div className="order-modal-items">
          {order.items.map((item) => {
            const product = products.find((current) => current.id === item.productId);
            const title = product?.title || `Producto #${item.productId}`;
            return (
              <div key={item.productId} className="order-modal-item">
                <img src={product?.src || '/assets/productos/proximamente.png'} alt={title} />
                <div>
                  <strong>{title}</strong>
                  <span>{item.quantity} x {formatPrice(item.price)}</span>
                </div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </div>
            );
          })}
        </div>

        <div className="order-modal-totals">
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          {order.discountCode && (
            <div className="summary-row discount-row">
              <span>{order.discountCode} ({order.discountPercent}%)</span>
              <strong>-{formatPrice(discountAmount)}</strong>
            </div>
          )}
          <div className="summary-row">
            <span>Envío</span>
            <strong>Gratis</strong>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <Folder size={48} className="empty-state-icon" />
      <h2>{title}</h2>
      <p>{text}</p>
      <Link to="/products" className="secondary-btn">
        Ver catálogo
      </Link>
    </div>
  );
}

function RouteCursor() {
  const { pathname } = useLocation();
  const showCursor = !pathname.startsWith('/admin');
  if (!showCursor) return null;

  return (
    <>
      <DotCursor
        dotSize={8}
        hoverScale={2.5}
      />
      <ClickSpark
        sparkColor="#48f7c6"
        sparkSize={6}
        sparkRadius={20}
        sparkCount={15}
        duration={400}
      />
    </>
  );
}

// STOREFRONT FOOTER
function Footer() {
  return (
    <footer className="store-footer">
      <div className="footer-left">
        <Link to="/home" className="footer-brand">
          <CircularText
            text="Pediloo*Web-1-Final*"
            onHover="goBonkers"
            spinDuration={20}
            className="brand-logo-circular"
          />
          <span>pediloo</span>
        </Link>
        <p className="footer-text">Comida deliciosa al alcance de tus dedos.</p>
      </div>
      <nav className="footer-socials" aria-label="Redes sociales">
        <a href="https://www.instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">
          <img src="/assets/socialmedia/instagramicon.png" alt="Instagram" />
        </a>
        <a href="https://www.facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
          <img src="/assets/socialmedia/facebookicon.png" alt="Facebook" />
        </a>
        <a href="https://www.whatsapp.com" aria-label="WhatsApp" target="_blank" rel="noreferrer">
          <img src="/assets/socialmedia/whatsappicon.png" alt="WhatsApp" />
        </a>
      </nav>
    </footer>
  );
}

// DASHBOARD NESTED LAYOUT WRAPPER
function AdminLayout() {
  const { user } = useAppState();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;
  if (!user.adminFlag) return <Navigate to="/home" replace />;

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Drawer Overlay backdrop */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      ></div>

      {/* Sidebar Navigation Drawer */}
      <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />

      {/* Main Content Area */}
      <div className="main-area">
        <Header toggleSidebar={toggleSidebar} />
        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Home />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="products/new" element={<ProductView />} />
            <Route path="products/:id" element={<ProductView />} />
            <Route path="categories" element={<CategoriesList />} />
            <Route path="categories/new" element={<CategoryView />} />
            <Route path="categories/:id" element={<CategoryView />} />
            <Route path="orders" element={<OrdersKanban />} />
            <Route path="users" element={<UsersList />} />
            <Route path="users/new" element={<UserView />} />
            <Route path="users/:id" element={<UserView />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// MAIN APP COMPONENT
export default function App() {
  ensureStore();

  return (
    <DialogProvider>
      <SnackbarProvider>
        <StoreProvider>
          <BrowserRouter>
            <RouteCursor />
            <Routes>
              {/* Dashboard Layout */}
              <Route path="/admin/*" element={<AdminLayout />} />
              {/* Storefront Layout */}
              <Route path="/*" element={<Layout />} />
            </Routes>
          </BrowserRouter>
        </StoreProvider>
      </SnackbarProvider>
    </DialogProvider>
  );
}
