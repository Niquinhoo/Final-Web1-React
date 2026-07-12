import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AreaSeries,
  ColorType,
  createChart,
} from 'lightweight-charts';
import type { AreaData, Time } from 'lightweight-charts';
import { apiFetch } from '../../utils/api';
import type { Order, Product } from '../../utils/store';
import { Card } from '../../components/atoms';
import { useTheme } from '../../components/_md3/hooks';
import { motion } from 'framer-motion';
import './Finances.css';

type Period = 'today' | '7days' | 'month' | 'year' | 'custom';

const ESTIMATED_COST_RATE = 0.65;
const PERIODS: Array<{ value: Period; label: string }> = [
  { value: 'today', label: 'Hoy' },
  { value: '7days', label: 'Últimos 7 días' },
  { value: 'month', label: 'Este mes' },
  { value: 'year', label: 'Este año' },
  { value: 'custom', label: 'Rango personalizado' },
];
const CATEGORY_COLORS = ['#0b57d0', '#00a896', '#f4a261', '#9b5de5', '#e76f51'];

function dateKey(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function getDateRange(period: Period, customStart: string, customEnd: string, now = new Date()) {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === '7days') start.setDate(start.getDate() - 6);
  if (period === 'month') start = new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === 'year') start = new Date(now.getFullYear(), 0, 1);
  if (period === 'custom') {
    const first = customStart ? parseLocalDate(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
    const last = customEnd ? parseLocalDate(customEnd) : end;
    start = first <= last ? first : last;
    const selectedEnd = first <= last ? last : first;
    end.setTime(selectedEnd.setHours(23, 59, 59, 999));
  }

  return { start, end };
}

function formatCurrency(value: number): string {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
}

function calculateFinances(orders: Order[], products: Product[]) {
  const productById = new Map(products.map((product) => [product.id, product]));
  const validOrders = orders.filter((order) => String(order.status).toLowerCase() !== 'cancelado');
  const cancelledOrders = orders.length - validOrders.length;
  const revenue = validOrders.reduce((sum, order) => sum + order.total, 0);
  const productSales = new Map<number, { title: string; units: number; revenue: number; category: string }>();
  const categorySales = new Map<string, number>();
  const dailyRevenue = new Map<string, number>();
  let productsSold = 0;

  for (const order of validOrders) {
    const day = dateKey(new Date(order.createdAt));
    dailyRevenue.set(day, (dailyRevenue.get(day) ?? 0) + order.total);
    const discountFactor = order.subtotal > 0 ? order.total / order.subtotal : 1;

    for (const item of order.items) {
      const product = productById.get(item.productId);
      const itemRevenue = item.price * item.quantity * discountFactor;
      const previous = productSales.get(item.productId);
      productsSold += item.quantity;
      productSales.set(item.productId, {
        title: product?.title ?? `Producto #${item.productId}`,
        category: product?.category ?? 'Sin categoría',
        units: (previous?.units ?? 0) + item.quantity,
        revenue: (previous?.revenue ?? 0) + itemRevenue,
      });
      const category = product?.category ?? 'Sin categoría';
      categorySales.set(category, (categorySales.get(category) ?? 0) + itemRevenue);
    }
  }

  const profit = revenue - revenue * ESTIMATED_COST_RATE;

  return {
    orderCount: validOrders.length,
    cancelledOrders,
    revenue,
    averageTicket: validOrders.length ? revenue / validOrders.length : 0,
    profit,
    profitMargin: revenue ? (profit / revenue) * 100 : 0,
    productsSold,
    topProducts: [...productSales.values()].sort((a, b) => b.units - a.units || b.revenue - a.revenue).slice(0, 5),
    categories: [...categorySales.entries()].sort((a, b) => b[1] - a[1]),
    dailyRevenue: [...dailyRevenue.entries()].sort(([a], [b]) => a.localeCompare(b)),
    latestOrders: [...orders].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 5),
  };
}

interface FinanceChartProps {
  data: AreaData<Time>[];
  theme: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

function FinanceChart({ data, theme }: FinanceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const styles = getComputedStyle(document.documentElement);
    const textColor = styles.getPropertyValue('--md-sys-color-on-surface-variant').trim() || '#44474f';
    const primaryColor = styles.getPropertyValue('--md-sys-color-primary').trim() || '#0b57d0';
    const outlineColor = styles.getPropertyValue('--md-sys-color-outline-variant').trim() || '#c4c6cf';
    const gridColor = outlineColor.includes('rgba') ? outlineColor : `${outlineColor}22`;

    const chart = createChart(container, {
      autoSize: true,
      height: 280,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      },
      grid: {
        vertLines: { color: gridColor, style: 2 },
        horzLines: { color: gridColor, style: 2 },
      },
      localization: { locale: 'es-AR', priceFormatter: formatCurrency },
      rightPriceScale: { borderVisible: false },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: primaryColor,
      topColor: hexToRgba(primaryColor, 0.24),
      bottomColor: hexToRgba(primaryColor, 0.01),
      lineWidth: 3,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    series.setData(data);
    chart.timeScale().fitContent();

    const tooltip = document.createElement('div');
    tooltip.className = 'finance-chart-tooltip';
    tooltip.style.display = 'none';
    container.appendChild(tooltip);

    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
      ) {
        tooltip.style.display = 'none';
        return;
      }

      const date = param.time;
      const dataPoint = param.seriesData.get(series);
      if (!dataPoint) {
        tooltip.style.display = 'none';
        return;
      }

      const value = (dataPoint as any).value ?? 0;
      let dateStr = '';
      if (typeof date === 'string') {
        const parts = date.split('-');
        if (parts.length === 3) {
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          dateStr = d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
        } else {
          dateStr = date;
        }
      } else {
        dateStr = String(date);
      }

      tooltip.style.display = 'block';
      tooltip.innerHTML = `
        <div class="tooltip-date">${dateStr}</div>
        <div class="tooltip-value">${formatCurrency(value)}</div>
      `;

      const tooltipWidth = 120;
      const tooltipHeight = 50;
      const x = param.point.x;
      const y = param.point.y;

      let left = x + 15;
      if (left + tooltipWidth > container.clientWidth) {
        left = x - tooltipWidth - 15;
      }

      let top = y - tooltipHeight - 15;
      if (top < 0) {
        top = y + 15;
      }

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    });

    return () => {
      chart.remove();
      tooltip.remove();
    };
  }, [data, theme]);

  return <div ref={containerRef} className="finance-chart" style={{ position: 'relative' }} />;
}

interface CategoryDonutChartProps {
  categories: [string, number][];
  totalRevenue: number;
}

function CategoryDonutChart({ categories, totalRevenue }: CategoryDonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = useMemo(() => categories.reduce((sum, [, val]) => sum + val, 0), [categories]);

  const size = 180;
  const strokeWidth = 16;
  const radius = 65;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const slices = categories.map(([category, value], index) => {
    const percent = total > 0 ? value / total : 0;
    const strokeLength = percent * circumference;
    const strokeOffset = circumference - strokeLength;
    const angle = accumulatedPercent * 360 - 90;
    accumulatedPercent += percent;

    return {
      category,
      value,
      percent,
      strokeLength,
      strokeOffset,
      angle,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    };
  });

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="donut-chart-container">
      <div className="donut-chart-svg-wrap">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="var(--md-sys-color-surface-container-high)"
            strokeWidth={strokeWidth - 2}
          />
          {slices.map((slice, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <circle
                key={slice.category}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${slice.strokeLength} ${circumference}`}
                strokeDashoffset={0}
                transform={`rotate(${slice.angle} ${center} ${center})`}
                style={{
                  transformOrigin: 'center',
                  transition: 'stroke-width 0.25s var(--md-sys-motion-easing-standard), opacity 0.25s',
                  cursor: 'pointer',
                  opacity: hoveredIndex === null || isHovered ? 1 : 0.65,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>
        <div className="donut-chart-center">
          <span className="donut-center-label">
            {activeSlice ? activeSlice.category : 'Ventas Totales'}
          </span>
          <strong className="donut-center-value">
            {formatCurrency(activeSlice ? activeSlice.value : totalRevenue)}
          </strong>
          {activeSlice && (
            <span className="donut-center-sub">
              {Math.round(activeSlice.percent * 100)}% del total
            </span>
          )}
        </div>
      </div>

      <div className="donut-legend">
        {slices.map((slice, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={slice.category}
              className={`donut-legend-item ${isHovered ? 'active' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <i style={{ backgroundColor: slice.color }} />
              <span className="legend-category">{slice.category}</span>
              <span className="legend-percent">{Math.round(slice.percent * 100)}%</span>
              <strong className="legend-value">{formatCurrency(slice.value)}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

if (import.meta.env.DEV) {
  const today = new Date(2026, 6, 10, 12);
  console.assert(dateKey(getDateRange('7days', '', '', today).start) === '2026-07-04', 'El filtro de 7 días debe incluir hoy y seis días anteriores.');
}

export default function Finances() {
  const { theme } = useTheme();
  const today = dateKey(new Date());
  const [period, setPeriod] = useState<Period>('month');
  const [customStart, setCustomStart] = useState(today.slice(0, 8) + '01');
  const [customEnd, setCustomEnd] = useState(today);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([apiFetch<Order[]>('/orders'), apiFetch<Product[]>('/products')])
      .then(([orderList, productList]) => {
        setOrders(orderList);
        setProducts(productList);
      })
      .catch((loadError) => {
        console.error('No se pudieron cargar las estadísticas:', loadError);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const range = useMemo(() => getDateRange(period, customStart, customEnd), [period, customStart, customEnd]);
  const filteredOrders = useMemo(
    () => orders.filter((order) => {
      const createdAt = new Date(order.createdAt);
      return createdAt >= range.start && createdAt <= range.end;
    }),
    [orders, range],
  );
  const stats = useMemo(() => calculateFinances(filteredOrders, products), [filteredOrders, products]);
  const revenueData = useMemo<AreaData<Time>[]>(
    () => stats.dailyRevenue.map(([time, value]) => ({ time, value })),
    [stats.dailyRevenue],
  );

  const cards = [
    { label: 'Pedidos realizados', value: stats.orderCount.toLocaleString('es-AR'), icon: 'receipt_long', tone: 'blue' },
    { label: 'Dinero facturado', value: formatCurrency(stats.revenue), icon: 'payments', tone: 'green' },
    { label: 'Ticket promedio', value: formatCurrency(stats.averageTicket), icon: 'shopping_bag', tone: 'purple' },
    { label: 'Ganancia estimada', value: formatCurrency(stats.profit), detail: `${stats.profitMargin.toFixed(0)}% de margen`, icon: 'trending_up', tone: 'orange' },
    { label: 'Productos vendidos', value: stats.productsSold.toLocaleString('es-AR'), icon: 'inventory_2', tone: 'teal' },
    { label: 'Pedidos cancelados', value: stats.cancelledOrders.toLocaleString('es-AR'), icon: 'cancel', tone: 'red' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
  };

  return (
    <motion.div 
      className="finances-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <header className="finances-header">
        <div>
          <span className="finances-eyebrow">Resumen del negocio</span>
          <h2 className="headline-lg">Finanzas</h2>
          <p className="body-md text-secondary-color mt-1">Facturación, rentabilidad y rendimiento de tus productos.</p>
        </div>
        <div className="period-filter" aria-label="Filtrar estadísticas por período">
          {PERIODS.map((option) => (
            <button 
              key={option.value} 
              type="button" 
              className={period === option.value ? 'active' : ''} 
              aria-pressed={period === option.value} 
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {period === 'custom' && (
        <motion.div 
          className="custom-range"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="form-field-group">
            <label>Desde</label>
            <input type="date" className="md3-input" value={customStart} max={customEnd} onChange={(event) => setCustomStart(event.target.value)} />
          </div>
          <span className="material-symbols-outlined range-arrow" aria-hidden="true">arrow_forward</span>
          <div className="form-field-group">
            <label>Hasta</label>
            <input type="date" className="md3-input" value={customEnd} min={customStart} max={today} onChange={(event) => setCustomEnd(event.target.value)} />
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="finances-state">
          <span className="material-symbols-outlined spin-icon">sync</span>
          Cargando estadísticas…
        </div>
      ) : error ? (
        <div className="finances-state error">
          <span className="material-symbols-outlined">error</span>
          No pudimos cargar las estadísticas.
        </div>
      ) : (
        <>
          <motion.section 
            className="finance-kpis" 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            aria-label="Indicadores principales"
          >
            {cards.map((card) => (
              <motion.div key={card.label} variants={itemVariants}>
                <Card variant="outlined" className="finance-kpi" interactive>
                  <div className={`kpi-icon ${card.tone}`}>
                    <span className="material-symbols-outlined">{card.icon}</span>
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">{card.label}</span>
                    <strong className="kpi-value">{card.value}</strong>
                    {card.detail ? <small className="kpi-detail">{card.detail}</small> : null}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.section>

          <p className="profit-note">
            <span className="material-symbols-outlined">info</span>
            La ganancia es estimada usando costos equivalentes al 65% de la facturación.
          </p>

          <motion.section 
            className="finance-charts"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemVariants} className="flex-1">
              <Card variant="outlined" noPadding className="finance-panel revenue-panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-eyebrow">Rendimiento</span>
                    <h3 className="headline-sm">Facturación por día</h3>
                  </div>
                  <strong className="panel-header-value">{formatCurrency(stats.revenue)}</strong>
                </div>
                <div className="panel-content">
                  {revenueData.length ? (
                    <FinanceChart data={revenueData} theme={theme} />
                  ) : (
                    <div className="chart-empty">
                      <span className="material-symbols-outlined">bar_chart_off</span>
                      No hay ventas en este período.
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="flex-1">
              <Card variant="outlined" noPadding className="finance-panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-eyebrow">Distribución</span>
                    <h3 className="headline-sm">Ventas por categoría</h3>
                  </div>
                </div>
                <div className="panel-content">
                  {stats.categories.length ? (
                    <CategoryDonutChart categories={stats.categories} totalRevenue={stats.revenue} />
                  ) : (
                    <div className="chart-empty">
                      <span className="material-symbols-outlined">pie_chart_outline</span>
                      No hay categorías con ventas.
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </motion.section>

          <motion.section 
            className="finance-tables"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemVariants} className="flex-1">
              <Card variant="outlined" noPadding className="finance-panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-eyebrow">Catálogo</span>
                    <h3 className="headline-sm">Productos más vendidos</h3>
                  </div>
                </div>
                <div className="finance-table-wrap">
                  <table className="md3-table finance-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th className="text-right">Unidades</th>
                        <th className="text-right">Facturación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topProducts.length ? (
                        stats.topProducts.map((product, index) => (
                          <tr key={product.title}>
                            <td className="product-cell">
                              <span className="product-rank">{index + 1}</span>
                              <span className="product-title">{product.title}</span>
                            </td>
                            <td className="text-right font-medium">{product.units}</td>
                            <td className="text-right font-semibold text-on-surface">
                              {formatCurrency(product.revenue)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="empty-cell">
                            No hay productos vendidos en este período.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="flex-1">
              <Card variant="outlined" noPadding className="finance-panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-eyebrow">Actividad</span>
                    <h3 className="headline-sm">Últimos pedidos</h3>
                  </div>
                </div>
                <div className="finance-table-wrap">
                  <table className="md3-table finance-table">
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.latestOrders.length ? (
                        stats.latestOrders.map((order) => {
                          let badgeClass = 'badge-neutral';
                          if (order.status === 'Recibido') badgeClass = 'badge-neutral';
                          else if (order.status === 'En proceso') badgeClass = 'badge-warning';
                          else if (order.status === 'Listo para entregar') badgeClass = 'badge-success';

                          return (
                            <tr key={order.id}>
                              <td className="order-cell">
                                <span className="material-symbols-outlined order-cell-icon">receipt_long</span>
                                <strong>#{order.id}</strong>
                              </td>
                              <td>
                                {new Date(order.createdAt).toLocaleDateString('es-AR', {
                                  day: '2-digit',
                                  month: 'short',
                                })}
                              </td>
                              <td>
                                <span className={`status-badge ${badgeClass}`}>{order.status}</span>
                              </td>
                              <td className="text-right font-semibold text-on-surface">
                                {formatCurrency(order.total)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="empty-cell">
                            No hay pedidos en este período.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          </motion.section>

          <footer className="tradingview-credit">
            Gráficos: <a href="https://www.tradingview.com/" target="_blank" rel="noreferrer">TradingView Lightweight Charts™ por TradingView</a>
          </footer>
        </>
      )}
    </motion.div>
  );
}
