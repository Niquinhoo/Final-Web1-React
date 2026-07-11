import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AreaSeries,
  ColorType,
  HistogramSeries,
  createChart,
} from 'lightweight-charts';
import type { AreaData, HistogramData, Time } from 'lightweight-charts';
import { apiFetch } from '../../utils/api';
import type { Order, Product } from '../../utils/store';
import './Finances.css';

type Period = 'today' | '7days' | 'month' | 'year' | 'custom';
type ChartKind = 'area' | 'histogram';
type ChartPoint = AreaData<Time> | HistogramData<Time>;

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

function chartTimeKey(time: Time): string {
  if (typeof time === 'string' || typeof time === 'number') return String(time);
  return `${time.year}-${String(time.month).padStart(2, '0')}-${String(time.day).padStart(2, '0')}`;
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

function FinanceChart({ kind, data, labels = {} }: { kind: ChartKind; data: ChartPoint[]; labels?: Record<string, string> }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const styles = getComputedStyle(document.documentElement);
    const textColor = styles.getPropertyValue('--md-sys-color-on-surface-variant').trim();
    const outlineColor = styles.getPropertyValue('--md-sys-color-outline-variant').trim();
    const gridColor = outlineColor.length === 7 ? `${outlineColor}66` : outlineColor;
    const chart = createChart(container, {
      autoSize: true,
      height: 280,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor, fontFamily: 'Plus Jakarta Sans, sans-serif', attributionLogo: false },
      grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
      localization: { locale: 'es-AR', priceFormatter: formatCurrency },
      rightPriceScale: { borderVisible: false },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
        ...(Object.keys(labels).length ? { tickMarkFormatter: (time: Time) => labels[chartTimeKey(time)] ?? '' } : {}),
      },
    });

    if (kind === 'area') {
      const series = chart.addSeries(AreaSeries, {
        lineColor: '#0b57d0',
        topColor: 'rgba(11, 87, 208, 0.32)',
        bottomColor: 'rgba(11, 87, 208, 0.02)',
        lineWidth: 3,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      series.setData(data as AreaData<Time>[]);
    } else {
      const series = chart.addSeries(HistogramSeries, { priceFormat: { type: 'volume' }, lastValueVisible: false, priceLineVisible: false });
      series.setData(data as HistogramData<Time>[]);
    }

    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [data, kind, labels]);

  return <div ref={containerRef} className="finance-chart" />;
}

if (import.meta.env.DEV) {
  const today = new Date(2026, 6, 10, 12);
  console.assert(dateKey(getDateRange('7days', '', '', today).start) === '2026-07-04', 'El filtro de 7 días debe incluir hoy y seis días anteriores.');
}

export default function Finances() {
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
  const categoryChart = useMemo(() => {
    const labels: Record<string, string> = {};
    const data = stats.categories.map(([category, value], index) => {
      const time = `2020-01-${String(index + 1).padStart(2, '0')}`;
      labels[time] = category;
      return { time, value, color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] } as HistogramData<Time>;
    });
    return { data, labels };
  }, [stats.categories]);

  const cards = [
    { label: 'Pedidos realizados', value: stats.orderCount.toLocaleString('es-AR'), icon: 'receipt_long', tone: 'blue' },
    { label: 'Dinero facturado', value: formatCurrency(stats.revenue), icon: 'payments', tone: 'green' },
    { label: 'Ticket promedio', value: formatCurrency(stats.averageTicket), icon: 'shopping_bag', tone: 'purple' },
    { label: 'Ganancia estimada', value: formatCurrency(stats.profit), detail: `${stats.profitMargin.toFixed(0)}% de margen`, icon: 'trending_up', tone: 'orange' },
    { label: 'Productos vendidos', value: stats.productsSold.toLocaleString('es-AR'), icon: 'inventory_2', tone: 'teal' },
    { label: 'Pedidos cancelados', value: stats.cancelledOrders.toLocaleString('es-AR'), icon: 'cancel', tone: 'red' },
  ];

  return (
    <div className="finances-page">
      <header className="finances-header">
        <div>
          <span className="finances-eyebrow">Resumen del negocio</span>
          <h2>Finanzas</h2>
          <p>Facturación, rentabilidad y rendimiento de tus productos.</p>
        </div>
        <div className="period-filter" aria-label="Filtrar estadísticas por período">
          {PERIODS.map((option) => (
            <button key={option.value} type="button" className={period === option.value ? 'active' : ''} aria-pressed={period === option.value} onClick={() => setPeriod(option.value)}>
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {period === 'custom' && (
        <div className="custom-range">
          <label>Desde<input type="date" value={customStart} max={customEnd} onChange={(event) => setCustomStart(event.target.value)} /></label>
          <span aria-hidden="true">→</span>
          <label>Hasta<input type="date" value={customEnd} min={customStart} max={today} onChange={(event) => setCustomEnd(event.target.value)} /></label>
        </div>
      )}

      {loading ? (
        <div className="finances-state">Cargando estadísticas…</div>
      ) : error ? (
        <div className="finances-state error">No pudimos cargar las estadísticas.</div>
      ) : (
        <>
          <section className="finance-kpis" aria-label="Indicadores principales">
            {cards.map((card) => (
              <article className="finance-kpi" key={card.label}>
                <div className={`kpi-icon ${card.tone}`}><span className="material-symbols-outlined">{card.icon}</span></div>
                <div><span>{card.label}</span><strong>{card.value}</strong>{card.detail ? <small>{card.detail}</small> : null}</div>
              </article>
            ))}
          </section>

          <p className="profit-note"><span className="material-symbols-outlined">info</span>La ganancia es estimada usando costos equivalentes al 65% de la facturación.</p>

          <section className="finance-charts">
            <article className="finance-panel revenue-panel">
              <div className="panel-heading"><div><span>Rendimiento</span><h3>Facturación por día</h3></div><strong>{formatCurrency(stats.revenue)}</strong></div>
              {revenueData.length ? <FinanceChart kind="area" data={revenueData} /> : <div className="chart-empty">No hay ventas en este período.</div>}
            </article>
            <article className="finance-panel">
              <div className="panel-heading"><div><span>Distribución</span><h3>Ventas por categoría</h3></div></div>
              {categoryChart.data.length ? <FinanceChart kind="histogram" data={categoryChart.data} labels={categoryChart.labels} /> : <div className="chart-empty">No hay categorías con ventas.</div>}
              <div className="category-legend">
                {stats.categories.map(([category, value], index) => (
                  <div key={category}><i style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} /><span>{category}</span><strong>{stats.revenue ? `${Math.round((value / stats.revenue) * 100)}%` : '0%'}</strong></div>
                ))}
              </div>
            </article>
          </section>

          <section className="finance-tables">
            <article className="finance-panel">
              <div className="panel-heading"><div><span>Catálogo</span><h3>Productos más vendidos</h3></div></div>
              <div className="finance-table-wrap">
                <table className="finance-table">
                  <thead><tr><th>Producto</th><th>Unidades</th><th>Facturación</th></tr></thead>
                  <tbody>
                    {stats.topProducts.length ? stats.topProducts.map((product, index) => (
                      <tr key={product.title}><td><b>{index + 1}</b>{product.title}</td><td>{product.units}</td><td>{formatCurrency(product.revenue)}</td></tr>
                    )) : <tr><td colSpan={3} className="empty-cell">No hay productos vendidos en este período.</td></tr>}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="finance-panel">
              <div className="panel-heading"><div><span>Actividad</span><h3>Últimos pedidos</h3></div></div>
              <div className="finance-table-wrap">
                <table className="finance-table orders-table">
                  <thead><tr><th>Pedido</th><th>Fecha</th><th>Estado</th><th>Total</th></tr></thead>
                  <tbody>
                    {stats.latestOrders.length ? stats.latestOrders.map((order) => (
                      <tr key={order.id}><td><strong>#{order.id}</strong></td><td>{new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</td><td><span className="order-status">{order.status}</span></td><td>{formatCurrency(order.total)}</td></tr>
                    )) : <tr><td colSpan={4} className="empty-cell">No hay pedidos en este período.</td></tr>}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <footer className="tradingview-credit">Gráficos: <a href="https://www.tradingview.com/" target="_blank" rel="noreferrer">TradingView Lightweight Charts™ por TradingView</a></footer>
        </>
      )}
    </div>
  );
}
